import { userController } from "../controllers/user.controller";
import { conversationController } from "../controllers/conversation.controller";
import { messageController } from "../controllers/message.controller";

export const apiRoutes = {
    pathPrefix: "/api",
    async handler(req: Request) {
        const url = new URL(req.url);
        const path = url.pathname;
        const method = req.method;

        // Dispatch based on resource
        if (path === "/api/users" || path.startsWith("/api/users/")) {
            return await this.handleResource(req, userController);
        }
        
        if (path === "/api/conversations" || path.startsWith("/api/conversations/")) {
            return await this.handleResource(req, conversationController);
        }

        if (path === "/api/messages" || path.startsWith("/api/messages/")) {
            return await this.handleResource(req, messageController);
        }

        return new Response(JSON.stringify({ error: "API Resource Not Found" }), { 
            status: 404,
            headers: { "Content-Type": "application/json" }
        });
    },

    async handleResource(req: Request, controller: any) {
        const method = req.method;
        const url = new URL(req.url);
        const isIdPath = url.pathname.split("/").length > 3; // e.g., /api/users/1

        if (method === "GET") {
            return isIdPath ? await controller.getById(req) : await controller.getAll(req);
        }
        if (method === "POST") return await controller.create(req);
        if (method === "PUT") return await controller.update(req);
        if (method === "DELETE") return await controller.delete(req);

        return new Response("Method Not Allowed", { status: 405 });
    }
};
