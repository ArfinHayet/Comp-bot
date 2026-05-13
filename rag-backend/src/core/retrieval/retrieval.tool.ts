/** Gemini function declaration for the document search tool. */
export const SEARCH_DOCUMENTS_TOOL = {
  name: 'search_documents',
  description:
    'Search the uploaded document knowledge base for content relevant to a query. ' +
    'Call this tool for EVERY factual question before answering. ' +
    'You may call it multiple times with different queries for complex questions. ' +
    'Returns the most relevant document excerpts.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'A focused natural-language search query. ' +
          'For multi-part questions, break into separate targeted queries and call the tool once per query.',
      },
    },
    required: ['query'],
  },
} as const;
