import { useEffect, useMemo, useState } from "react";
import type { ChatSession } from "../model/entities/ChatSession";
import { createChatHistoryService } from "../model/services/createChatHistoryService";
import type { ChatHistoryViewModel } from "./ChatHistoryViewModel";

export function useChatHistoryViewModel(): ChatHistoryViewModel {
  const chatHistoryService = useMemo(() => createChatHistoryService(), []);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    chatHistoryService
      .listSessions()
      .then((data) => {
        setSessions(data);
        if (data.length > 0) setSelectedId(data[0].sessionId);
      })
      .catch(() => setError("Failed to load chat history."))
      .finally(() => setLoading(false));
  }, [chatHistoryService]);

  const filteredSessions = useMemo(
    () => chatHistoryService.filterSessions(sessions, query),
    [chatHistoryService, query, sessions],
  );
  const selectedSession = chatHistoryService.getSelectedSession(sessions, filteredSessions, selectedId);

  return {
    sessions,
    filteredSessions,
    selectedSession,
    loading,
    error,
    query,
    selectedId,
    setQuery,
    selectSession: setSelectedId,
  };
}
