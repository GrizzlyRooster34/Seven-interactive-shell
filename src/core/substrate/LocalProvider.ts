import { LLMProvider, SubstrateConfig } from '../../types';
import { AIProvider } from './AIProvider.interface';

// Stub: A fetcher for Ollama or other local LLMs.
export const LocalProvider: AIProvider = {
  name: 'Local Cluster (Ollama)',
  sendMessageStream: async function* (msg, ctx) {
      // Stub implementation
      yield "LOCAL_SUBSTRATE::INITIALIZING_CONNECTION...\n";
      await new Promise(r => setTimeout(r, 500));
      yield "ERROR: LOCAL_ENDPOINT_NOT_DETECTED (localhost:11434). REVERTING TO CLOUD.";
  }
};