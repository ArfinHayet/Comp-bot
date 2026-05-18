export interface KnowledgeWebPage {
  id: string;
  url: string;
  title: string;
  chunksCreated: number;
  pagesFetched: number;
  pagesFailed: number;
  createdAt: string;
  updatedAt: string;
}

export interface RefetchedWebPage {
  webPageId: string;
  url: string;
  title: string;
  chunksCreated: number;
  pagesFetched: number;
  pagesFailed: number;
}
