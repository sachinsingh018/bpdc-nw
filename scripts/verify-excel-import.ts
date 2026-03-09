/**
 * Verify that the Excel import was successful by checking a few sample records.
 */

import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(process.cwd(), '.env.local') });

import { createBpdcPostgresClient } from '../lib/db/connection';

async function main() {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    console.error('Missing POSTGRES_URL');
    process.exit(1);
  }

  const client = createBpdcPostgresClient(url);

  try {
    // Check total count
    const countResult = await client`SELECT COUNT(*) as count FROM "User"`;
    console.log(`Total users in database: ${countResult[0]?.count || 0}\n`);

    // Check sample records with initial_password_plain
    const sampleResult = await client`
      SELECT 
        email, 
        name, 
        student_status, 
        role,
        initial_password_plain,
        CASE 
          WHEN password IS NOT NULL THEN 'Hashed' 
          ELSE 'No password' 
        END as password_status,
        "createdAt"
      FROM "User" 
      WHERE initial_password_plain IS NOT NULL
      ORDER BY "createdAt" DESC
      LIMIT 5
    `;

    console.log('Sample of recently imported users:');
    console.log('='.repeat(80));
    sampleResult.forEach((record: any, idx: number) => {
      console.log(`\n${idx + 1}. ${record.email}`);
      console.log(`   Name: ${record.name}`);
      console.log(`   Status: ${record.student_status || 'N/A'}`);
      console.log(`   Role: ${record.role || 'N/A'}`);
      console.log(`   Password: ${record.password_status}`);
      console.log(`   Initial Password (plain): ${record.initial_password_plain ? '✓ Set' : '✗ Missing'}`);
      console.log(`   Created: ${record.createdAt}`);
    });

    // Check for any users without initial_password_plain (should be none for new imports)
    const missingPlainResult = await client`
      SELECT COUNT(*) as count 
      FROM "User" 
      WHERE email LIKE '%@DUBAI.BITS-PILANI.AC.IN%' 
        AND initial_password_plain IS NULL
    `;
    console.log(`\n\nUsers from Excel domain without initial_password_plain: ${missingPlainResult[0]?.count || 0}`);

  } catch (error) {
    console.error('Error verifying data:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

