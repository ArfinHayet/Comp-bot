export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
  },
  rag: {
    chunkSize: parseInt(process.env.CHUNK_SIZE ?? '1000', 10) || 1000,
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP ?? '200', 10) || 200,
    topK: parseInt(process.env.TOP_K_RESULTS ?? '5', 10) || 5,
    maxToolIterations: parseInt(process.env.MAX_TOOL_ITERATIONS ?? '5', 10) || 5,
  },
});
