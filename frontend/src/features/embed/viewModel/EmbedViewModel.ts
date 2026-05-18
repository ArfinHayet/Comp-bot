import type { AllowedDomain, WidgetKey } from "../model/entities/WidgetSettings";

export interface EmbedActionResult {
  success: boolean;
  message?: string;
  errorMessage?: string;
}

export interface EmbedViewModel {
  keys: WidgetKey[];
  domains: AllowedDomain[];
  newLabel: string;
  newDomain: string;
  loadingKeys: boolean;
  loadingDomains: boolean;
  apiUrl: string;
  snippetTemplate: string;
  setNewLabel(value: string): void;
  setNewDomain(value: string): void;
  createKey(): Promise<EmbedActionResult>;
  deleteKey(id: string): Promise<EmbedActionResult>;
  copySnippet(key: string): Promise<EmbedActionResult>;
  createDomain(): Promise<EmbedActionResult>;
  deleteDomain(id: string): Promise<EmbedActionResult>;
}
