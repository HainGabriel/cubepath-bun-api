import { sql } from "bun";

export const db = sql;

// Helper to initialize the table if it doesn't exist (for development/demo purposes)
export async function initDb() {
    try {
        const url = process.env.DATABASE_URL || "not set";
        const maskedUrl = url.replace(/:([^:@]+)@/, ":****@");
        console.log(`Checking/Ensuring database table exists at: ${maskedUrl}`);
        
        // Ensure the table exists
        await db`
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log("Database table 'todos' is ready.");
    } catch (error) {
        console.error("Auto-initialization failed:", (error as Error).message);
        console.log("Tip: The API will try to re-initialize once the database is reachable.");
    }
}
