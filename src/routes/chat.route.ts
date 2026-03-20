import { handleChat } from "../controllers/chat.controller";

export const chatRoute = {
  path: "/chat",
  handler: handleChat
};
