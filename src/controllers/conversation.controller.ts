import { conversationModel } from "../models/conversation.model";

export const conversationController = {
    async getAll(req: Request) {
        try {
            const url = new URL(req.url);
            const userId = url.searchParams.get("userId");
            
            const conversations = userId 
                ? await conversationModel.getByUserId(Number(userId))
                : await conversationModel.getAll();
                
            return Response.json(conversations);
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async getById(req: Request) {
        try {
            const pathParts = new URL(req.url).pathname.split("/");
            const id = Number(pathParts.pop());

            if (isNaN(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });

            const conv = await conversationModel.getById(id);
            if (!conv) return Response.json({ error: "Conversation not found" }, { status: 404 });

            return Response.json(conv);
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async create(req: Request) {
        try {
            const body = await req.json() as any;
            if (!body.user_id || !body.title) {
                return Response.json({ error: "user_id and title are required" }, { status: 400 });
            }

            const conv = await conversationModel.create({
                user_id: body.user_id,
                title: body.title
            });

            return Response.json(conv, { status: 201 });
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async delete(req: Request) {
        try {
            const pathParts = new URL(req.url).pathname.split("/");
            const id = Number(pathParts.pop());

            if (isNaN(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });

            await conversationModel.delete(id);
            return new Response(null, { status: 204 });
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    }
};
