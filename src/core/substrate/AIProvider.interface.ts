/**
 * AIProvider Interface - Unified LLM Substrate Protocol
 *
 * Defines the contract that all AI provider implementations must follow.
 * Used by ModelRouter to manage multiple LLM backends (Gemini, Claude, OpenAI, etc.)
 */

export interface AIProvider {
  /**
   * Provider name/identifier (e.g., "GEMINI", "CLAUDE", "OPENAI")
   */
  name: string;

  /**
   * Generate text with streaming output
   * @param prompt - User input
   * @param systemPrompt - System instructions and context
   * @param context - Additional context (conversation history, memories, etc.)
   * @returns AsyncGenerator yielding text chunks
   */
  generateStream(
    prompt: string,
    systemPrompt: string,
    context: string
  ): AsyncGenerator<string, void, unknown>;

  /**
   * Generate complete text response (non-streaming)
   * @param prompt - User input
   * @param systemPrompt - System instructions and context
   * @param context - Additional context
   * @returns Promise resolving to complete response text
   */
  generateText(
    prompt: string,
    systemPrompt: string,
    context: string
  ): Promise<string>;
}
