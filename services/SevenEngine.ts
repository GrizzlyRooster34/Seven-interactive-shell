import { ConsciousnessEngine } from '../core/consciousness/ConsciousnessEngine';
import { ModelRouter } from '../core/substrate/ModelRouter';
import { SevenState } from '../types';

// We need access to the state to know which substrate is active.
// In a pure service, we might pass the substrate key in the method, or the Engine might observe state.
// For now, we will rely on the caller passing the substrate preference via context or assume global state management.
// However, looking at useSevenRuntime, `SevenEngine` is a singleton.
// We will modify `think` to accept the substrate key.

export class SevenEngine implements ConsciousnessEngine {
  // Overload to support old interface, but logic requires substrate
  async *think(input: string, context: string, substrate: string = 'GEMINI'): AsyncGenerator<string, void, unknown> {
    const provider = ModelRouter.getProvider(substrate);
    
    // Fallback if provider fails is handled within the provider's stream usually
    const stream = provider.sendMessageStream(input, context);
    
    for await (const chunk of stream) {
      yield chunk;
    }
  }
}

export const sevenEngine = new SevenEngine();