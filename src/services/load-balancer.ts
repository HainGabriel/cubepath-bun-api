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
  const service = services[currentIndex];
  currentIndex = (currentIndex + 1) % services.length;
  return service;
}
