import postgres from 'postgres';

/**
 * Creates a postgres client connected to the bpdc database.
 * This function automatically updates the database name in the connection URL to 'bpdc'.
 * 
 * @param url - The PostgreSQL connection URL (can point to any database)
 * @returns A postgres client connected to the bpdc database
 */
export function createBpdcPostgresClient(url: string) {
    try {
        const urlObj = new URL(url);
        // Update the database name in the path to 'bpdc'
        urlObj.pathname = '/bpdc';
        const connectionUrl = urlObj.toString();
        return postgres(connectionUrl);
    } catch (error) {
        // Fallback: if URL parsing fails, use as-is (shouldn't happen)
        console.warn('Failed to parse POSTGRES_URL, using as-is');
        return postgres(url);
    }
}

/**
 * Gets the postgres client for the bpdc database using POSTGRES_URL from environment.
 * This is the recommended way to get a database connection in the application.
 */
export function getBpdcPostgresClient() {
    if (!process.env.POSTGRES_URL) {
        throw new Error('POSTGRES_URL environment variable is not set');
    }
    return createBpdcPostgresClient(process.env.POSTGRES_URL);
}

