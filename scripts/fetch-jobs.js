#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

async function fetchJobs() {
  try {
    console.log('🚀 Starting external job fetch...');
    
    // Use tsx to run TypeScript files directly
    console.log('📊 Fetching tech jobs...');
    execSync('npx tsx lib/jobs/fetchTechJobsToCSV.ts', { stdio: 'inherit' });
    
    console.log('🌍 Fetching remote jobs...');
    execSync('npx tsx lib/jobs/fetchRemoteJobsMENA.ts', { stdio: 'inherit' });
    
    console.log('✅ Successfully fetched all external jobs!');
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    process.exit(1);
  }
}

fetchJobs();
