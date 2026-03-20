export async function sendGroqChat(messages: any[]): Promise<ReadableStream> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not found");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b", // Requested by user
        messages,
        stream: true,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API Error: ${error}`);
    }

    return response.body!;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') throw new Error("Groq API request timed out after 15s");
    throw error;
  }
}
