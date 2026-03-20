const server = Bun.serve({
    port: 3001,
    fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === "/health") {
            return new Response("OK");
        }

        return new Response("404!", { status: 404 });
    },
});

console.log(`Listening on http://localhost:${server.port}...`);
