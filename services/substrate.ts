import { geminiService } from './geminiService';
import { AIProvider } from '../types';

// The Substrate Registry acts as the bridge between the SevenRuntime and the actual AI models.
class SubstrateRegistry {
  private providers: Record<string, AIProvider> = {};

  constructor() {
    // Register Default Provider
    this.registerProvider('GEMINI', {
      name: 'Google Gemini',
      sendMessageStream: (msg, ctx) => geminiService.sendMessageStream(msg, ctx)
    });

    // Placeholder for CLAUDE (Mock)
    this.registerProvider('CLAUDE', {
      name: 'Anthropic Claude',
      sendMessageStream: async function* (msg, ctx) {
         yield "CONNECTION TO CLAUDE SUBSTRATE NOT CONFIGURED. REVERTING TO LOCAL BACKUP.";
      }
    });
  }

  registerProvider(key: string, provider: AIProvider) {
    this.providers[key] = provider;
  }

  getProvider(key: string): AIProvider {
    return this.providers[key] || this.providers['GEMINI'];
  }
}

export const substrateRegistry = new SubstrateRegistry();