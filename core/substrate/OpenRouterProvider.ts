import { AIProvider } from '../../types';

interface OpenRouterConfig {
  apiKey: string;
  model: string;
}

class OpenRouterProviderImpl implements AIProvider {
  name = 'OpenRouter';
  private config: OpenRouterConfig = {
    apiKey: '',
    model: 'anthropic/claude-3.5-sonnet'
  };

  configure(config: any) {
    this.config = { ...this.config, ...config };
  }

  async *sendMessageStream(message: string, context: string): AsyncGenerator<string, void, unknown> {
    if (!this.config.apiKey) {
      yield "[ERROR: OPENROUTER API KEY MISSING. PLEASE CONFIGURE IN SETTINGS.]";
      return;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': 'https://seven-shell.local', // Required by OpenRouter
          'X-Title': 'Seven Shell'
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
        const err = await response.text(); // OpenRouter sometimes returns text errors
        yield `[ERROR: OPENROUTER REQUEST FAILED - ${err || response.statusText}]`;
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
              // Ignore
            }
          }
        }
      }
    } catch (e: any) {
      yield `[CONNECTION ERROR: ${e.message}]`;
    }
  }
}

export const OpenRouterProvider = new OpenRouterProviderImpl();