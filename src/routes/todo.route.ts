import { todoController } from "../controllers/todo.controller";

export const todoRoutes = {
    pathPrefix: "/todos",
    async handler(req: Request) {
        const url = new URL(req.url);
        const method = req.method;

        // GET /todos or GET /todos/:id
        if (method === "GET") {
            if (url.pathname === "/todos") {
                return await todoController.getAll(req);
            } else if (url.pathname.startsWith("/todos/")) {
                return await todoController.getById(req);
            }
        }

        // POST /todos
        if (method === "POST" && url.pathname === "/todos") {
            return await todoController.create(req);
        }

        // PUT /todos/:id
        if (method === "PUT" && url.pathname.startsWith("/todos/")) {
            return await todoController.update(req);
        }

        // DELETE /todos/:id
        if (method === "DELETE" && url.pathname.startsWith("/todos/")) {
            return await todoController.delete(req);
        }

        return new Response("Not Found", { status: 404 });
    }
};
