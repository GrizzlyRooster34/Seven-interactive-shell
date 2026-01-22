import { CANONICAL_DB } from '../../constants';

export const CanonicalIngestion = {
  search: (query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    for (const [key, memory] of Object.entries(CANONICAL_DB)) {
      if (lowerQuery.includes(key)) {
        return memory;
      }
    }
    return null;
  },

  ingestFile: async (file: File): Promise<string> => {
      // Stub: Simulate reading a text file and returning its content for context.
      // Real impl would handle PDF parsing etc.
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
              const content = e.target?.result as string;
              resolve(`[FILE INGESTED: ${file.name}]\nCONTENT PREVIEW:\n${content.substring(0, 500)}...`);
          };
          reader.onerror = reject;
          reader.readAsText(file);
      });
  }
};