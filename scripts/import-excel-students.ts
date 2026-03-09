/**
 * Import students from NQY_DataSheet (1) (1).xlsx into the User table (bpdc).
 * - New emails: INSERT with email, name, password, initial_password_plain, role=user, student_status, etc.
 * - Existing emails: UPDATE password (new value), initial_password_plain, name, role, student_status, etc.
 * Never removes or deletes any existing users.
 *
 * Usage: POSTGRES_URL='postgresql://...' pnpm exec tsx scripts/import-excel-students.ts
 * Or set POSTGRES_URL in .env.local
 */

import { config } from 'dotenv';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local so POSTGRES_URL is set before we touch the DB
config({ path: path.join(process.cwd(), '.env.local') });

import { createBpdcPostgresClient } from '../lib/db/connection';
import { createUser, getUser, updateUserForStudentImport } from '../lib/db/queries';

// Excel file path
const EXCEL_PATH = path.join(process.cwd(), 'NQY_DataSheet (1) (1).xlsx');

/** Build name from first + last (handles empty last name) */
function fullName(first: string, last: string): string {
  const s = `${(first || '').trim()} ${(last || '').trim()}`.trim();
  return s || (first || last || '');
}

/** Generate a different password per user (same method as import-student-accounts.ts). */
function generatePassword(email: string, index: number): string {
  const local = (email.split('@')[0] || '').replace(/[^a-zA-Z0-9]/g, '') || 'user';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `Nqy-${local}-${suffix}`;
}

/** Map Excel status to database student_status */
function mapStudentStatus(excelStatus: string): string {
  const status = (excelStatus || '').trim().toLowerCase();
  if (status === 'current') return 'student';
  if (status === 'alumni') return 'alumni';
  return 'student'; // default
}

async function ensureInitialPasswordColumn() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  const client = createBpdcPostgresClient(url);
  try {
    await client`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS initial_password_plain VARCHAR(255)
    `;
  } finally {
    await client.end();
  }
}

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error('Missing POSTGRES_URL. Set it as environment variable or in .env.local');
    process.exit(1);
  }

  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('Excel file not found:', EXCEL_PATH);
    process.exit(1);
  }

  console.log('Ensuring initial_password_plain column exists...');
  await ensureInitialPasswordColumn();

  // Read Excel file
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  if (data.length < 2) {
    console.error('Excel file has no data rows (only header)');
    process.exit(1);
  }

  // Parse header row
  const header = data[0];
  const emailIdx = header.findIndex((h: string) => 
    (h || '').toLowerCase().includes('email')
  );
  const firstNameIdx = header.findIndex((h: string) => 
    (h || '').toLowerCase().includes('first name')
  );
  const lastNameIdx = header.findIndex((h: string) => 
    (h || '').toLowerCase().includes('last name')
  );
  const statusIdx = header.findIndex((h: string) => 
    (h || '').toLowerCase().includes('status')
  );

  if (emailIdx === -1 || firstNameIdx === -1 || lastNameIdx === -1) {
    console.error('Could not find required columns (Email, First Name, Last Name)');
    console.error('Found columns:', header);
    process.exit(1);
  }

  // Parse data rows
  const rows: { 
    email: string; 
    firstName: string; 
    lastName: string;
    status: string;
  }[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const email = (row[emailIdx] || '').trim();
    const firstName = (row[firstNameIdx] || '').trim();
    const lastName = (row[lastNameIdx] || '').trim();
    const status = statusIdx !== -1 ? (row[statusIdx] || '').trim() : 'Current';
    
    if (!email || !email.includes('@')) continue;
    rows.push({ email, firstName, lastName, status });
  }

  console.log(`Parsed ${rows.length} rows from Excel. Syncing (add/update only, no deletes)...\n`);

  let created = 0;
  let updated = 0;
  const credentials: { email: string; name: string; password: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const { email, firstName, lastName, status } = rows[i];
    const name = fullName(firstName, lastName);
    const password = generatePassword(email, i);
    const studentStatus = mapStudentStatus(status);

    try {
      const existing = await getUser(email);
      if (existing.length > 0) {
        await updateUserForStudentImport(email, {
          newPassword: password,
          initialPasswordPlain: password,
          name,
        });
        updated++;
        credentials.push({ email, name, password });
        if (updated <= 5) console.log(`  Updated: ${email} (${name})`);
      } else {
        await createUser({
          email,
          name,
          password,
          initialPasswordPlain: password,
          role: 'user',
          student_status: studentStatus,
          createdAt: new Date(),
        });
        created++;
        credentials.push({ email, name, password });
        if (created <= 5) console.log(`  Created: ${email} (${name})`);
      }
    } catch (e) {
      console.error(`  Error for ${email}:`, e);
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}.`);

  // Write credentials CSV for distribution (email, name, password)
  const outPath = path.join(process.cwd(), 'lib', 'Excel_Student_credentials.csv');
  const headerOut = 'email,name,password';
  const body = credentials.map((r) => `${r.email},${r.name.replace(/,/g, ' ')},${r.password}`).join('\n');
  fs.writeFileSync(outPath, headerOut + '\n' + body, 'utf-8');
  console.log(`Credentials written to: ${outPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

