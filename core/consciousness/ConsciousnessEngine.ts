export interface ConsciousnessEngine {
  think(input: string, context: string): AsyncGenerator<string, void, unknown>;
}