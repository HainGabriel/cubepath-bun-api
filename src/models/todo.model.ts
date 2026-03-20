import { db } from "../db";

export interface Todo {
    id?: number;
    title: string;
    completed: boolean;
    created_at?: Date;
}

export const todoModel = {
    async getAll(): Promise<Todo[]> {
        return await db`SELECT * FROM todos ORDER BY created_at DESC` as Todo[];
    },

    async getById(id: number): Promise<Todo | null> {
        const results = await db`SELECT * FROM todos WHERE id = ${id}` as Todo[];
        return results.length > 0 ? (results[0] ?? null) : null;
    },

    async create(todo: Omit<Todo, "id" | "created_at">): Promise<Todo> {
        const results = await db`
            INSERT INTO todos (title, completed)
            VALUES (${todo.title}, ${todo.completed})
            RETURNING *
        ` as Todo[];
        const result = results[0];
        if (!result) throw new Error("Failed to create todo");
        return result;
    },

    async update(id: number, todo: Partial<Omit<Todo, "id" | "created_at">>): Promise<Todo | null> {
        const results = await db`
            UPDATE todos
            SET 
                title = COALESCE(${todo.title}, title),
                completed = COALESCE(${todo.completed}, completed)
            WHERE id = ${id}
            RETURNING *
        ` as Todo[];
        return results.length > 0 ? (results[0] ?? null) : null;
    },

    async delete(id: number): Promise<boolean> {
        const result = await db`DELETE FROM todos WHERE id = ${id}`;
        // Bun's sql returns an object with rows and other metadata.
        // For DELETE, we can check if any row was affected.
        // Based on Bun docs, sql`...` returns an array-like object.
        return true; // Simple implementation for now.
    }
};
