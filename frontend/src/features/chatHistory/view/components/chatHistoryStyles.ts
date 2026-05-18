import type { ChatHistoryUserStatus } from "../../model/entities/ChatHistoryUser";

export const statusClass: Record<ChatHistoryUserStatus, string> = {
  active: "bg-emerald-500",
  idle: "bg-amber-500",
  offline: "bg-gray-300",
};
