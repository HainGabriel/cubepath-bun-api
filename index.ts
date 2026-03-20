import { chatRoute } from "./src/routes/chat.route";
import { apiRoutes } from "./src/routes/api.route";
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

        // Register Unified API routes (/api/users, /api/conversations, /api/messages)
        if (url.pathname.startsWith(apiRoutes.pathPrefix)) {
            return await apiRoutes.handler(req);
        }

        return new Response("404!", { status: 404 });
    },
});

console.log(`Listening on http://localhost:${server.port}...`);
