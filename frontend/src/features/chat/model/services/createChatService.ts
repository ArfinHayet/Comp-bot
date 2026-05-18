import { HttpChatRepository } from "../repositories/HttpChatRepository";
import { ChatService } from "./ChatService";

export function createChatService() {
  return new ChatService(new HttpChatRepository());
}
