import { messageModel } from "../models/message.model";

export const messageController = {
    async getAll(req: Request) {
        try {
            const url = new URL(req.url);
            const convId = url.searchParams.get("conversationId");
            
            const messages = convId
                ? await messageModel.getByConversationId(Number(convId))
                : await messageModel.getAll();
                
            return Response.json(messages);
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async getById(req: Request) {
        try {
            const pathParts = new URL(req.url).pathname.split("/");
            const id = Number(pathParts.pop());

            if (isNaN(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });

            const msg = await messageModel.getById(id);
            if (!msg) return Response.json({ error: "Message not found" }, { status: 404 });

            return Response.json(msg);
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async create(req: Request) {
        try {
            const body = await req.json() as any;
            if (!body.conversation_id || !body.role || !body.content) {
                return Response.json({ error: "conversation_id, role, and content are required" }, { status: 400 });
            }

            const msg = await messageModel.create({
                conversation_id: body.conversation_id,
                role: body.role,
                content: body.content
            });

            return Response.json(msg, { status: 201 });
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async delete(req: Request) {
        try {
            const pathParts = new URL(req.url).pathname.split("/");
            const id = Number(pathParts.pop());

            if (isNaN(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });

            await messageModel.delete(id);
            return new Response(null, { status: 204 });
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    }
};
