import { HttpChatHistoryRepository } from "../repositories/HttpChatHistoryRepository";
import { ChatHistoryService } from "./ChatHistoryService";

export function createChatHistoryService() {
  return new ChatHistoryService(new HttpChatHistoryRepository());
}
