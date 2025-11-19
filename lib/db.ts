// lib/db.ts
const { Pool } = require('pg');

// Update connection string to use bpdc database
function getBpdcConnectionString() {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) {
        throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not set');
    }
    try {
        const urlObj = new URL(url);
        // Update the database name in the path to 'bpdc'
        urlObj.pathname = '/bpdc';
        return urlObj.toString();
    } catch (error) {
        // Fallback: if URL parsing fails, use as-is
        console.warn('Failed to parse database URL, using as-is');
        return url;
    }
}

export const pool = new Pool({
    connectionString: getBpdcConnectionString(),
});