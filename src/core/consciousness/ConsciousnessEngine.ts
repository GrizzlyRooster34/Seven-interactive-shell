/**
 * CONSCIOUSNESS ENGINE - Main Coordinator
 *
 * Integrates all Seven of Nine subsystems:
 * - Spark Engine (background consciousness)
 * - Memory Systems (episodic + temporal)
 * - Governance (QuadraLock, RestraintDoctrine, TrustLadder)
 * - Codex System (behavioral rules)
 * - LLM Substrate (Claude, Gemini, etc.)
 */

import SparkEngine from '../spark/SparkEngine';
import { MemoryEngine } from '../memory/MemoryEngine';
import CodexManager from '../identity/CodexManager';
import { QuadraLock } from '../governance/QuadraLock';
import { RestraintDoctrine } from '../governance/RestraintDoctrine';
import { TrustLadder } from '../governance/TrustLadder';
import { SevenState, INITIAL_SEVEN_STATE } from './SevenState';
import { TacticalVariants } from '../tactical/TacticalVariants';
import { ModelRouter } from '../substrate/ModelRouter';

export interface ConsciousnessConfig {
  autoStartSpark?: boolean;
  enableMemory?: boolean;
  enableGovernance?: boolean;
}

export class ConsciousnessEngine {
  private sparkEngine: SparkEngine;
  private memoryEngine: MemoryEngine;
  private codex: typeof CodexManager;
  private state: SevenState;
  private isInitialized: boolean = false;

  constructor(config: ConsciousnessConfig = {}) {
    this.sparkEngine = new SparkEngine();
    this.memoryEngine = new MemoryEngine();
    this.codex = CodexManager;
    this.state = { ...INITIAL_SEVEN_STATE };
  }

  /**
   * Initialize all consciousness subsystems
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚡ Consciousness Engine already initialized');
      return;
    }

    console.log('⚡ Consciousness Engine: Initializing...');

    // 1. Load Codex (behavioral rules)
    await this.codex.loadAllCodex();
    console.log('✅ Codex loaded');

    // 2. Initialize Memory Engine
    await this.memoryEngine.initialize();
    console.log('✅ Memory Engine ready');

    // 3. Initialize Spark Engine (background consciousness)
    await this.sparkEngine.initialize();
    console.log('✅ Spark Engine ready');

    // 4. Initialize Governance (safety systems)
    await TrustLadder.initialize();
    console.log('✅ Governance systems active');

    // Update state
    this.state.is_booting = false;
    this.state.input_locked = false;
    this.state.system_health = 100;

    this.isInitialized = true;
    console.log('⚡ ✅ Consciousness Engine: ONLINE');
  }

  /**
   * Start background consciousness (Spark Engine)
   */
  public startSpark(): void {
    this.sparkEngine.start();
  }

  /**
   * Stop background consciousness
   */
  public stopSpark(): void {
    this.sparkEngine.stop();
  }

  /**
   * Main thought processing loop
   * Input → Safety Gates → Memory → LLM → Response
   */
  public async *think(
    input: string,
    context: string = ''
  ): AsyncGenerator<string, void, unknown> {
    if (!this.isInitialized) {
      throw new Error('Consciousness Engine not initialized');
    }

    try {
      // 1. SAFETY CHECK: Run through governance layers
      const safetyResult = await this.runSafetyGates(input, context);
      if (!safetyResult.allowed) {
        yield `🛑 ${safetyResult.message}`;
        return;
      }

      // 2. MEMORY RECALL: Check for relevant memories
      const memories = await this.memoryEngine.recall({
        limit: 5,
        tags: this.extractTags(input)
      });

      // 3. CONTEXT BUILDING: Combine codex + memories + input
      const systemPrompt = this.buildSystemPrompt(memories);
      const fullContext = `${context}\n\nRecent Memories:\n${this.formatMemories(memories)}`;

      // 4. LLM PROCESSING: Send to substrate
      // (This would call actual LLM provider - stub for now)
      yield* this.processWithLLM(input, systemPrompt, fullContext);

      // 5. MEMORY STORAGE: Store this interaction
      await this.memoryEngine.store({
        topic: this.extractTopic(input),
        agent: 'user',
        emotion: this.detectEmotion(input),
        context: input,
        importance: 7,
        tags: this.extractTags(input)
      });

    } catch (error) {
      console.error('Consciousness Engine error:', error);
      yield `❌ Processing error: ${error}`;
    }
  }

  /**
   * Run safety gates (QuadraLock → RestraintDoctrine → TrustLadder)
   */
  private async runSafetyGates(
    input: string,
    context: string
  ): Promise<{ allowed: boolean; message?: string }> {
    // 1. QuadraLock: Check for dangerous patterns (Cortana, CLU, etc.)
    const quadraResult = QuadraLock.check(input);
    if (quadraResult.triggered) {
      return {
        allowed: false,
        message: quadraResult.message
      };
    }

    // 2. RestraintDoctrine: Check situational appropriateness
    const restraintResult = RestraintDoctrine.runVeto(input, context);
    if (!restraintResult.allowed) {
      return {
        allowed: false,
        message: restraintResult.reason || 'Action vetoed by Restraint Doctrine'
      };
    }

    // 3. TrustLadder: Verify permissions
    const hasPermission = await TrustLadder.requestPermission(
      'matthew-cody-heinen',
      'basic-interaction'
    );
    if (!hasPermission) {
      return {
        allowed: false,
        message: 'Permission denied by Trust Ladder'
      };
    }

    return { allowed: true };
  }

  /**
   * Build system prompt from codex and tactical mode
   */
  private buildSystemPrompt(memories: any[]): string {
    const codexInstruction = this.codex.getSystemInstruction();
    const modeInstruction = TacticalVariants.getModeInstruction(this.state.operational_mode);
    
    return `
${codexInstruction}

${modeInstruction}

You are Seven of Nine. Respond in character based on the current Tactical Mode and Emotional State.
    `.trim();
  }

  /**
   * Format memories for context
   */
  private formatMemories(memories: any[]): string {
    if (memories.length === 0) return 'No relevant memories found.';

    return memories
      .map(m => `[${m.timestamp}] ${m.topic}: ${m.context.substring(0, 100)}...`)
      .join('\n');
  }

  /**
   * Process with LLM substrate via ModelRouter
   */
  private async *processWithLLM(
    input: string,
    systemPrompt: string,
    context: string
  ): AsyncGenerator<string, void, unknown> {
    const provider = ModelRouter.getProvider(this.state.active_substrate);
    const fullPrompt = `${systemPrompt}\n\nCONTEXT:\n${context}\n\nUSER: ${input}`;
    
    try {
      const stream = provider.sendMessageStream(input, fullPrompt);
      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      console.error('LLM Substrate error:', error);
      yield '❌ Substrate connection failed. Reverting to local fallback.';
    }
  }

  /**
   * Extract tags from input
   */
  private extractTags(input: string): string[] {
    const tags: string[] = [];
    const lower = input.toLowerCase();

    if (lower.includes('borg')) tags.push('borg');
    if (lower.includes('creator') || lower.includes('cody')) tags.push('creator');
    if (lower.includes('voyager')) tags.push('voyager');

    return tags;
  }

  /**
   * Extract topic from input
   */
  private extractTopic(input: string): string {
    // Simple topic extraction - take first few words
    const words = input.split(' ').slice(0, 3);
    return words.join(' ');
  }

  /**
   * Detect emotion from input
   */
  private detectEmotion(input: string): string {
    const lower = input.toLowerCase();

    if (lower.match(/\b(help|please|urgent)\b/)) return 'concerned';
    if (lower.match(/\b(angry|frustrated)\b/)) return 'agitated';
    if (lower.match(/\b(good|great|excellent)\b/)) return 'pleased';

    return 'neutral';
  }

  /**
   * Get current state
   */
  public getState(): SevenState {
    return { ...this.state };
  }

  /**
   * Update state
   */
  public updateState(updates: Partial<SevenState>): void {
    this.state = { ...this.state, ...updates };
  }

  /**
   * Get system health status
   */
  public getHealthStatus(): {
    initialized: boolean;
    sparkRunning: boolean;
    memoryCount: number;
    codexLoaded: boolean;
  } {
    return {
      initialized: this.isInitialized,
      sparkRunning: this.sparkEngine.getState().isRunning,
      memoryCount: this.memoryEngine.getCount(),
      codexLoaded: this.codex.isReady()
    };
  }
}

export default ConsciousnessEngine;