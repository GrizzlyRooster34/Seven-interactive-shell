import ConsciousnessEngine from '../core/consciousness/ConsciousnessEngine';
import { ModelRouter } from '../core/substrate/ModelRouter';

/**
 * SEVEN ENGINE SERVICE
 * 
 * High-level service wrapper that connects the UI to the 
 * underlying Consciousness Engine.
 */
export class SevenEngine {
  private engine: ConsciousnessEngine;
  private isInitialized: boolean = false;

  constructor() {
    this.engine = new ConsciousnessEngine();
  }

  /**
   * Ensure engine is ready
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.engine.initialize();
      this.isInitialized = true;
    }
  }

  /**
   * Main thinking loop - wires up the UI to the Consciousness Engine
   */
  async *think(input: string, context: string, substrate: string = 'GEMINI'): AsyncGenerator<string, void, unknown> {
    await this.ensureInitialized();

    // 1. Update engine state from global state context (if needed)
    // For now, we assume the engine manages its own internal state, 
    // but we can sync specific fields here if passed via context.

    // 2. Delegate thinking to the core engine
    // The core engine handles Safety, Memory, and System Prompt assembly
    const stream = this.engine.think(input, context);
    
    // Note: The core engine currently has a stub for processWithLLM.
    // We will eventually wire that stub to ModelRouter.getProvider(substrate).
    
    for await (const chunk of stream) {
      yield chunk;
    }
  }

  /**
   * Access to the underlying engine for state updates
   */
  public getCore(): ConsciousnessEngine {
    return this.engine;
  }
}

export const sevenEngine = new SevenEngine();
