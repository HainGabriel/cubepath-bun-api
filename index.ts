import { chatRoute } from "./src/routes/chat.route";
import { userRoutes } from "./src/routes/user.route";
import { initDb } from "./src/db";

// Initialize the database
await initDb();

const server = Bun.serve({
    port: Number(process.env.PORT) || 3001,
    idleTimeout: 60, // Increase timeout for long-running AI requests
    async fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === "/") {
            return new Response(Bun.file("./src/views/index.html"), {
                headers: { "Content-Type": "text/html" }
            });
        }

        if (url.pathname === "/health") {
            return new Response("OK");
        }

        if (url.pathname === chatRoute.path) {
            return await chatRoute.handler(req);
        }

        // Register User routes (REST API)
        if (url.pathname.startsWith(userRoutes.pathPrefix)) {
            return await userRoutes.handler(req);
        }

        return new Response("404!", { status: 404 });
    },
});

console.log(`Listening on http://localhost:${server.port}...`);
