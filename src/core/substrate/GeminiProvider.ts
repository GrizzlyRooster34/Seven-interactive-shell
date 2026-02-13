import { LLMProvider, SubstrateConfig } from '../../types';
import { geminiService } from '../../services/geminiService';

export const GeminiProvider: AIProvider = {
  name: 'Google Gemini',
  sendMessageStream: (msg, ctx) => geminiService.sendMessageStream(msg, ctx)
};