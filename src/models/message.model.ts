import { db } from "../db";

export interface Message {
    id?: number;
    conversation_id: number;
    role: "user" | "assistant";
    content: string;
    created_at?: Date;
}

export const messageModel = {
    async getAll(): Promise<Message[]> {
        return await db`SELECT * FROM messages ORDER BY created_at ASC` as Message[];
    },

    async getByConversationId(convId: number): Promise<Message[]> {
        return await db`SELECT * FROM messages WHERE conversation_id = ${convId} ORDER BY created_at ASC` as Message[];
    },

    async getById(id: number): Promise<Message | null> {
        const results = await db`SELECT * FROM messages WHERE id = ${id}` as Message[];
        return results.length > 0 ? (results[0] ?? null) : null;
    },

    async create(msg: Omit<Message, "id" | "created_at">): Promise<Message> {
        const results = await db`
            INSERT INTO messages (conversation_id, role, content)
            VALUES (${msg.conversation_id}, ${msg.role}, ${msg.content})
            RETURNING *
        ` as Message[];
        const result = results[0];
        if (!result) throw new Error("Failed to create message");
        return result;
    },

    async delete(id: number): Promise<boolean> {
        await db`DELETE FROM messages WHERE id = ${id}`;
        return true;
    }
};
