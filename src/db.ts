import { sql } from "bun";

export const db = sql;

// Helper to initialize the table if it doesn't exist (for development/demo purposes)
export async function initDb() {
    try {
        console.log("Checking database connection...");
        // Use a simple query to test connection with a timeout
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Database connection timeout")), 5000));
        await Promise.race([
            db`SELECT 1`,
            timeout
        ]);
        
        await db`
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log("Database initialized (todos table checked/created)");
    } catch (error) {
        console.error("Database initialization skipped or failed:", (error as Error).message);
    }
}
