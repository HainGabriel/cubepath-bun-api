import { db } from "../db";

export interface Conversation {
    id?: number;
    user_id: number;
    title: string;
    created_at?: Date;
}

export const conversationModel = {
    async getAll(): Promise<Conversation[]> {
        return await db`SELECT * FROM conversations ORDER BY created_at DESC` as Conversation[];
    },

    async getByUserId(userId: number): Promise<Conversation[]> {
        return await db`SELECT * FROM conversations WHERE user_id = ${userId} ORDER BY created_at DESC` as Conversation[];
    },

    async getById(id: number): Promise<Conversation | null> {
        const results = await db`SELECT * FROM conversations WHERE id = ${id}` as Conversation[];
        return results.length > 0 ? (results[0] ?? null) : null;
    },

    async create(conv: Omit<Conversation, "id" | "created_at">): Promise<Conversation> {
        const results = await db`
            INSERT INTO conversations (user_id, title)
            VALUES (${conv.user_id}, ${conv.title})
            RETURNING *
        ` as Conversation[];
        const result = results[0];
        if (!result) throw new Error("Failed to create conversation");
        return result;
    },

    async update(id: number, conv: Partial<Omit<Conversation, "id" | "created_at">>): Promise<Conversation | null> {
        const results = await db`
            UPDATE conversations
            SET title = COALESCE(${conv.title}, title)
            WHERE id = ${id}
            RETURNING *
        ` as Conversation[];
        return results.length > 0 ? (results[0] ?? null) : null;
    },

    async delete(id: number): Promise<boolean> {
        await db`DELETE FROM conversations WHERE id = ${id}`;
        return true;
    }
};
