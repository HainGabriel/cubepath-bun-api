import { getNextService } from "../services/load-balancer";

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

    // Round Robin selection
    const service = getNextService();
    if (!service) {
      return new Response("No AI services available", { status: 503 });
    }
    console.log(`Using AI Service: ${service.name}`);

    const stream = await service.chat(messages);

    let isClosed = false;
    const readable = new ReadableStream({
      async start(controller) {
        try {
          if (service.isSDK) {
            // Handle OpenRouter SDK EventStream
            for await (const chunk of stream) {
              if (isClosed) break;
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content, service: service.name })}\n\n`));
              }
              if (chunk.usage) {
                const reasoningTokens = chunk.usage.completionTokensDetails?.reasoningTokens;
                if (reasoningTokens) {
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ reasoningTokens })}\n\n`));
                }
              }
            }
          } else {
            // Handle native Fetch ReadableStream (Cerebras, Grok)
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            while (true) {
              const { done, value } = await reader.read();
              if (done || isClosed) break;
              
              const chunk = decoder.decode(value, { stream: true });
              // Native fetch chunks are already SSE format usually, 
              // but we need to pass-through or re-format.
              // For simplicity, we re-broadcast with the service name.
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const dataStr = line.slice(6).trim();
                  if (dataStr === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(dataStr);
                    const content = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text;
                    if (content) {
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content, service: service.name })}\n\n`));
                    }
                  } catch (e) {}
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
            console.error(`Stream error from ${service.name}:`, err);
            controller.error(err);
          }
        }
      },
      cancel() {
        isClosed = true;
      }
    });

    console.log(`Streaming started from ${service.name}`);
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
      }
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
