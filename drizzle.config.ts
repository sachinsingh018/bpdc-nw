import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({
  path: '.env.local',
});

// Helper to update connection URL to use bpdc database
function getConnectionUrl() {
  const url = process.env.POSTGRES_URL!;
  try {
    const urlObj = new URL(url);
    // Update the database name in the path to 'bpdc'
    urlObj.pathname = '/bpdc';
    return urlObj.toString();
  } catch (error) {
    // Fallback: if URL parsing fails, use as-is (shouldn't happen)
    console.warn('Failed to parse POSTGRES_URL, using as-is');
    return url;
  }
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // biome-ignore lint: Forbidden non-null assertion.
    url: getConnectionUrl(),
  },
});
