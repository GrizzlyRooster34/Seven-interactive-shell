import { LLMProvider, SubstrateConfig } from '../../types';
import { AIProvider } from './AIProvider.interface';
import { geminiService } from '../../services/geminiService';

export const GeminiProvider: AIProvider = {
  name: 'Google Gemini',
  sendMessageStream: (msg, ctx) => geminiService.sendMessageStream(msg, ctx)
};