import { openrouter } from "./openrouter.service.ts";
import { sendCerebrasChat } from "./cerebras.service.ts";
import { sendGroqChat } from "./groq.service.ts";

type AIService = {
  name: string;
  chat: (messages: any[]) => Promise<any>; // Can return EventStream or ReadableStream
  isSDK?: boolean;
};

const services: AIService[] = [
  {
    name: "OpenRouter",
    chat: (messages) => openrouter.chat.send({
      chatGenerationParams: {
        model: "openrouter/free",
        messages,
        stream: true
      }
    }),
    isSDK: true
  },
  {
    name: "Cerebras",
    chat: sendCerebrasChat,
    isSDK: false
  },
  {
    name: "Groq",
    chat: sendGroqChat,
    isSDK: false
  }
];

let currentIndex = 0;

export function getNextService() {
  const availableServices = services.filter(s => {
    if (s.name === "OpenRouter") return !!process.env.OPENROUTER_API_KEY;
    if (s.name === "Cerebras") return !!process.env.CEREBRAS_API_KEY;
    if (s.name === "Groq") return !!process.env.GROQ_API_KEY;
    return true;
  });

  if (availableServices.length === 0) return null;

  const service = availableServices[currentIndex % availableServices.length];
  currentIndex = (currentIndex + 1) % availableServices.length;
  return service;
}
