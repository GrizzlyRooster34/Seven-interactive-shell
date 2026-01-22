import { AIProvider } from '../../types';
import { GeminiProvider } from './GeminiProvider';
import { ClaudeProvider } from './ClaudeProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { OpenRouterProvider } from './OpenRouterProvider';
import { CustomProvider } from './CustomProvider';
import { LocalProvider } from './LocalProvider';

export class SevenModelManager {
  private providers: Record<string, AIProvider> = {
      'GEMINI': GeminiProvider,
      'CLAUDE': ClaudeProvider,
      'OPENAI': OpenAIProvider,
      'OPENROUTER': OpenRouterProvider,
      'CUSTOM': CustomProvider,
      'LOCAL': LocalProvider
  };

  getProvider(substrate: string): AIProvider {
    return this.providers[substrate] || this.providers['GEMINI'];
  }

  configureProvider(substrate: string, config: any) {
    const provider = this.getProvider(substrate);
    if (provider && provider.configure) {
        provider.configure(config);
    }
  }
}

export const ModelRouter = new SevenModelManager();