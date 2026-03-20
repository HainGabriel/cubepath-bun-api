import { userController } from "../controllers/user.controller";

export const userRoutes = {
    pathPrefix: "/users",
    async handler(req: Request) {
        const url = new URL(req.url);
        const method = req.method;

        if (method === "GET") {
            if (url.pathname === "/users") return await userController.getAll(req);
            if (url.pathname.startsWith("/users/")) return await userController.getById(req);
        }

        if (method === "POST" && url.pathname === "/users") return await userController.create(req);
        if (method === "PUT" && url.pathname.startsWith("/users/")) return await userController.update(req);
        if (method === "DELETE" && url.pathname.startsWith("/users/")) return await userController.delete(req);

        return new Response("Not Found", { status: 404 });
    }
};
