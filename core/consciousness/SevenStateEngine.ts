import { SevenState, INITIAL_SEVEN_STATE } from './SevenState';

// Stub: Hook or Class that calculates SevenState.
export class SevenStateEngine {
  private currentState: SevenState = INITIAL_SEVEN_STATE;

  public calculateState(input: string, context: any): SevenState {
    // Currently simply returns the current state.
    // Future: Will use complex heuristics to update emotion/mode.
    return this.currentState;
  }
  
  public getCurrentState(): SevenState {
      return this.currentState;
  }
}