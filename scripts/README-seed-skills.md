# Seed New Skills Script

This script adds 16 new skill assessments to the database with 15-20 questions each.

## Skills Added

1. Data Science
2. Power BI
3. Cyber Security
4. Data Analytics
5. Business Analytics
6. AI/ML
7. Finance
8. Business Consulting
9. HR
10. Marketing
11. Operations
12. HVAC
13. Quality Control
14. Production Control
15. Matlab
16. Supply Chain & Logistics

## How to Run

Run the following command from the project root:

```bash
pnpm run seed:skills
```

Or directly with tsx:

```bash
tsx scripts/seed-new-skills.ts
```

## What It Does

1. Connects to the PostgreSQL database (bpdc database)
2. Checks if each skill already exists - if it does, uses the existing skill ID
3. For each skill, adds 15-20 questions if they don't already exist
4. Each question has:
   - A question text
   - 4 multiple choice options
   - A correct answer index (0-3)

## Database Connection

The script uses the connection string:
```
postgresql://neondb_owner:npg_Maus8bK6kdvD@ep-cold-forest-a4yns4nq-pooler.us-east-1.aws.neon.tech/bpdc?sslmode=require&channel_binding=require
```

## Notes

- The script is idempotent - you can run it multiple times safely
- It will skip skills that already exist
- It will only add questions if a skill has fewer than 15 questions
- Each skill will have exactly 20 questions after running

