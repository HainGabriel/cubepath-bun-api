import { sql } from "bun";

export const db = sql;

// Helper to initialize the table if it doesn't exist (for development/demo purposes)
export async function initDb() {
    try {
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
        console.error("Failed to initialize database:", error);
    }
}
