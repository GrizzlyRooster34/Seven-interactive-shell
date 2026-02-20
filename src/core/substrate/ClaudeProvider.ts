import { LLMProvider, SubstrateConfig } from '../../types';
import { AIProvider } from './AIProvider.interface';

export const ClaudeProvider: AIProvider = {
  name: 'Anthropic Claude',
  sendMessageStream: async function* (msg, ctx) {
     yield "CLAUDE SUBSTRATE NOT YET ACTIVE. CHECK CONNECTOR.";
  }
};