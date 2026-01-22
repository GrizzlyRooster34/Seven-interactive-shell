import { GoogleGenAI, Chat } from "@google/genai";
import { MODEL_NAME, SYSTEM_INSTRUCTION } from '../constants';

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public resetSession(): void {
    this.chatSession = null;
  }

  // We initialize chat lazily
  private ensureSession(): Chat {
    if (!this.chatSession) {
      this.chatSession = this.ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.5,
        },
      });
    }
    return this.chatSession;
  }

  public async *sendMessageStream(message: string, context: string, imageBase64?: string): AsyncGenerator<string, void, unknown> {
    const session = this.ensureSession();
    
    const contextHeader = `[SYSTEM CONTEXT: ${context}]\n`;
    
    try {
      let result;
      
      if (imageBase64) {
          // Multimodal Request
          // Note: Chat history with images works, but we send the parts structure
          const parts = [
              { text: contextHeader + message },
              { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
          ];
          result = await session.sendMessageStream(parts);
      } else {
          // Text Only
          const fullMessage = contextHeader + `USER INPUT: ${message}`;
          result = await session.sendMessageStream({ message: fullMessage });
      }

      for await (const chunk of result) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      yield "\n[ERROR: CORTICAL NODE DESYNCHRONIZED. REINITIALIZING LINK...]";
      this.chatSession = null; 
    }
  }
}

export const geminiService = new GeminiService();