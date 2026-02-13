/**
 * SHARED TYPE DEFINITIONS
 * Common types used across Seven of Nine consciousness systems
 */

export interface MemoryRecord {
  id: string;
  timestamp: string;
  content: string;
  tags: string[];
  importance: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface LLMProvider {
  name: string;
  generate(prompt: string, options?: any): Promise<string>;
  stream(prompt: string, options?: any): AsyncGenerator<string, void, unknown>;
}

export interface AIProvider {
  name: string;
  sendMessageStream(message: string, context: string): AsyncGenerator<string, void, unknown>;
  configure?(config: any): void;
}

export interface SubstrateConfig {
  provider: 'claude' | 'gemini' | 'local' | 'custom';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
