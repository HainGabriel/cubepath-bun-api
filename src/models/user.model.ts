import { db } from "../db";

export interface User {
    id?: number;
    name: string;
    email: string;
    active: boolean;
    created_at?: Date;
}

export const userModel = {
    async getAll(): Promise<User[]> {
        return await db`SELECT * FROM users ORDER BY created_at DESC` as User[];
    },

    async getById(id: number): Promise<User | null> {
        const results = await db`SELECT * FROM users WHERE id = ${id}` as User[];
        return results.length > 0 ? (results[0] ?? null) : null;
    },

    async create(user: Omit<User, "id" | "created_at">): Promise<User> {
        const results = await db`
            INSERT INTO users (name, email, active)
            VALUES (${user.name}, ${user.email}, ${user.active})
            RETURNING *
        ` as User[];
        const result = results[0];
        if (!result) throw new Error("Failed to create user");
        return result;
    },

    async update(id: number, user: Partial<Omit<User, "id" | "created_at">>): Promise<User | null> {
        const results = await db`
            UPDATE users
            SET 
                name = COALESCE(${user.name}, name),
                email = COALESCE(${user.email}, email),
                active = COALESCE(${user.active}, active)
            WHERE id = ${id}
            RETURNING *
        ` as User[];
        return results.length > 0 ? (results[0] ?? null) : null;
    },

    async delete(id: number): Promise<boolean> {
        await db`DELETE FROM users WHERE id = ${id}`;
        return true;
    }
};
