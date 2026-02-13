import { LLMProvider, SubstrateConfig } from '../../types';

interface OpenAIConfig {
  apiKey: string;
  model: string;
}

class OpenAIProviderImpl implements AIProvider {
  name = 'OpenAI';
  private config: OpenAIConfig = {
    apiKey: '',
    model: 'gpt-4o'
  };

  configure(config: any) {
    this.config = { ...this.config, ...config };
  }

  async *sendMessageStream(message: string, context: string): AsyncGenerator<string, void, unknown> {
    if (!this.config.apiKey) {
      yield "[ERROR: OPENAI API KEY MISSING. PLEASE CONFIGURE IN SETTINGS.]";
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: context },
            { role: 'user', content: message }
          ],
          stream: true
        })
      });

      if (!response.ok) {
        const err = await response.json();
        yield `[ERROR: OPENAI REQUEST FAILED - ${err.error?.message || response.statusText}]`;
        return;
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === 'data: [DONE]') return;
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices[0]?.delta?.content;
              if (content) yield content;
            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch (e: any) {
      yield `[CONNECTION ERROR: ${e.message}]`;
    }
  }
}

export const OpenAIProvider = new OpenAIProviderImpl();