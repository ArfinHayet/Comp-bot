import { useEffect, useMemo, useState } from "react";
import type { AllowedDomain, WidgetKey } from "../model/entities/WidgetSettings";
import { createEmbedService } from "../model/services/createEmbedService";
import type { EmbedViewModel } from "./EmbedViewModel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function useEmbedViewModel(): EmbedViewModel {
  const embedService = useMemo(() => createEmbedService(), []);
  const [keys, setKeys] = useState<WidgetKey[]>([]);
  const [domains, setDomains] = useState<AllowedDomain[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingDomains, setLoadingDomains] = useState(true);

  useEffect(() => {
    embedService
      .listWidgetKeys()
      .then(setKeys)
      .catch(() => undefined)
      .finally(() => setLoadingKeys(false));

    embedService
      .listAllowedDomains()
      .then(setDomains)
      .catch(() => undefined)
      .finally(() => setLoadingDomains(false));
  }, [embedService]);

  const createKey = async () => {
    try {
      const created = await embedService.createWidgetKey(newLabel);
      setKeys((prev) => [created, ...prev]);
      setNewLabel("");
      return { success: true, message: "Widget key created" };
    } catch {
      return { success: false, errorMessage: "Failed to create widget key" };
    }
  };

  const deleteKey = async (id: string) => {
    try {
      await embedService.deleteWidgetKey(id);
      setKeys((prev) => prev.filter((key) => key.id !== id));
      return { success: true, message: "Widget key deleted" };
    } catch {
      return { success: false, errorMessage: "Failed to delete widget key" };
    }
  };

  const copySnippet = async (key: string) => {
    try {
      await navigator.clipboard.writeText(embedService.createSnippet(key, API_URL));
      return { success: true, message: "Snippet copied to clipboard" };
    } catch {
      return { success: false, errorMessage: "Failed to copy" };
    }
  };

  const createDomain = async () => {
    if (!newDomain.trim()) return { success: false };
    try {
      const created = await embedService.createAllowedDomain(newDomain);
      setDomains((prev) => [created, ...prev]);
      setNewDomain("");
      return { success: true, message: "Domain added" };
    } catch {
      return { success: false, errorMessage: "Failed to add domain" };
    }
  };

  const deleteDomain = async (id: string) => {
    try {
      await embedService.deleteAllowedDomain(id);
      setDomains((prev) => prev.filter((domain) => domain.id !== id));
      return { success: true, message: "Domain removed" };
    } catch {
      return { success: false, errorMessage: "Failed to remove domain" };
    }
  };

  return {
    keys,
    domains,
    newLabel,
    newDomain,
    loadingKeys,
    loadingDomains,
    apiUrl: API_URL,
    snippetTemplate: embedService.createSnippetTemplate(API_URL),
    setNewLabel,
    setNewDomain,
    createKey,
    deleteKey,
    copySnippet,
    createDomain,
    deleteDomain,
  };
}
