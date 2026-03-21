import { sql } from "bun";

export const db = sql;

// Helper to initialize the table if it doesn't exist (for development/demo purposes)
export async function initDb() {
    try {
        console.log("🔍 Checking database connection...");
        
        // Simple test query to verify connection
        await db`SELECT 1`;
        console.log("✅ Database connection successful.");

        console.log("🏗️ Initializing tables if they don't exist...");
        
        await db`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await db`
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await db`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
                role VARCHAR(20) CHECK (role IN ('user', 'assistant')) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        console.log("✅ Database initialization completed.");
        return true;
    } catch (error) {
        console.error("❌ Database initialization FAILED:", (error as Error).message);
        // Important: Log more detail but carefully
        if ((error as Error).stack) {
            console.error("   Details:", (error as Error).stack?.split('\n')[0]);
        }
        console.log("Tip: The API will try to re-initialize once the database is reachable.");
        return false;
    }
}
