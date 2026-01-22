import { AIProvider } from '../../types';

interface CustomConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

class CustomProviderImpl implements AIProvider {
  name = 'Custom Endpoint';
  private config: CustomConfig = {
    baseUrl: 'http://localhost:1234/v1',
    apiKey: 'lm-studio',
    model: 'local-model'
  };

  configure(config: any) {
    this.config = { ...this.config, ...config };
  }

  async *sendMessageStream(message: string, context: string): AsyncGenerator<string, void, unknown> {
    let url = this.config.baseUrl;
    if (!url.endsWith('/chat/completions')) {
        // Naive URL construction, ensuring no double slashes
        url = url.replace(/\/+$/, '') + '/chat/completions';
    }

    try {
      const response = await fetch(url, {
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
        yield `[ERROR: CUSTOM ENDPOINT FAILED - ${response.status} ${response.statusText}]`;
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

export const CustomProvider = new CustomProviderImpl();