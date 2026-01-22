import { AIProvider } from '../../types';

export const ClaudeProvider: AIProvider = {
  name: 'Anthropic Claude',
  sendMessageStream: async function* (msg, ctx) {
     yield "CLAUDE SUBSTRATE NOT YET ACTIVE. CHECK CONNECTOR.";
  }
};