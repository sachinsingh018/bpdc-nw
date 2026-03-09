/**
 * Sync students from lib/Student_Info.csv into the User table (bpdc).
 * - New emails: INSERT with email, name, password, initial_password_plain, role=user, student_status=student, interviewCount=0, dailyMessageCount=0.
 * - Existing emails: UPDATE password (new value), initial_password_plain, name, role, student_status, interviewCount, dailyMessageCount.
 * Never removes or deletes any existing users.
 *
 * Usage: pnpm exec tsx scripts/import-student-accounts.ts
 * Requires: POSTGRES_URL in .env.local (connects to bpdc).
 */

import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local so POSTGRES_URL is set before we touch the DB
config({ path: path.join(process.cwd(), '.env.local') });

import { createBpdcPostgresClient } from '../lib/db/connection';
import { createUser, getUser, updateUserForStudentImport } from '../lib/db/queries';

// CSV path
const CSV_PATH = path.join(process.cwd(), 'lib', 'Student_Info.csv');

/** Parse one CSV row handling quoted fields */
function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || (c === '\r' && !inQuotes)) {
      out.push(cur.trim());
      cur = '';
      if (c === '\r') continue;
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

/** Build name from first + last (handles empty last name) */
function fullName(first: string, last: string): string {
  const s = `${(first || '').trim()} ${(last || '').trim()}`.trim();
  return s || (first || last || '');
}

/** Generate a different password per user (no shared/random-only). */
function generatePassword(email: string, index: number): string {
  const local = (email.split('@')[0] || '').replace(/[^a-zA-Z0-9]/g, '') || 'user';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `Nqy-${local}-${suffix}`;
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
    console.error('Missing POSTGRES_URL in .env.local');
    process.exit(1);
  }

  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV not found:', CSV_PATH);
    process.exit(1);
  }

  console.log('Ensuring initial_password_plain column exists...');
  await ensureInitialPasswordColumn();

  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = raw.split('\n').filter((l) => l.trim());
  const header = lines[0];
  const dataLines = lines.slice(1);

  // Expect: Student Email Id, Student First Name, Student Last Name, ...
  const rows: { email: string; firstName: string; lastName: string }[] = [];
  for (const line of dataLines) {
    const cols = parseCSVLine(line);
    const email = (cols[0] || '').trim();
    const firstName = (cols[1] || '').trim();
    const lastName = (cols[2] || '').trim();
    if (!email || !email.includes('@')) continue;
    rows.push({ email, firstName, lastName });
  }

  console.log(`Parsed ${rows.length} rows from CSV. Syncing (add/update only, no deletes)...\n`);

  let created = 0;
  let updated = 0;
  const credentials: { email: string; name: string; password: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const { email, firstName, lastName } = rows[i];
    const name = fullName(firstName, lastName);
    const password = generatePassword(email, i);

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
        if (updated <= 5) console.log(`  Updated: ${email}`);
      } else {
        await createUser({
          email,
          name,
          password,
          initialPasswordPlain: password,
          role: 'user',
          student_status: 'student',
          createdAt: new Date(),
        });
        created++;
        credentials.push({ email, name, password });
        if (created <= 5) console.log(`  Created: ${email}`);
      }
    } catch (e) {
      console.error(`  Error for ${email}:`, e);
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}.`);

  // Write credentials CSV for distribution (email, name, password)
  const outPath = path.join(process.cwd(), 'lib', 'Student_Info_credentials.csv');
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
