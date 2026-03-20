import { openrouter } from "../services/openrouter.service";

export async function handleChat(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json() as { messages: any[] };
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request body. 'messages' array is required.", { status: 400 });
    }

    const stream = await openrouter.chat.send({
      chatGenerationParams: {
        model: "openrouter/free",
        messages,
        stream: true
      }
    });

    let isClosed = false;
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (isClosed) break;

            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
            }

            if (chunk.usage) {
              const reasoningTokens = chunk.usage.completionTokensDetails?.reasoningTokens;
              if (reasoningTokens) {
                console.log("\nReasoning tokens:", reasoningTokens);
                if (!isClosed) {
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ reasoningTokens })}\n\n`));
                }
              }
            }
          }
          if (!isClosed) {
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            controller.close();
          }
        } catch (err) {
          if (!isClosed) {
            console.error("Stream error:", err);
            controller.error(err);
          }
        }
      },
      cancel() {
        isClosed = true;
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
