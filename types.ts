import { SevenState } from './core/consciousness/SevenState';
import { SafeguardResult } from './core/governance/QuadraLock';
import { MemoryRecord } from './core/memory/SparkDB';
import { OperatorProfile } from './core/identity/OperatorProfile';

export { SevenState, SafeguardResult, MemoryRecord, OperatorProfile };

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
  ALERT = 'alert',
  WARNING = 'warning'
}

export interface AIProvider {
  name: string;
  configure?(config: any): void;
  sendMessageStream(message: string, context: string): AsyncGenerator<string, void, unknown>;
}

export type SevenAction = 
  | { type: 'BOOT_START' }
  | { type: 'BOOT_COMPLETE'; payload: { restoredState?: Partial<SevenState> } }
  | { type: 'UPDATE_TRUST'; payload: { delta: number } }
  | { type: 'SET_MODE'; payload: { mode: SevenState['operational_mode'] } }
  | { type: 'SET_SUBSTRATE'; payload: { substrate: SevenState['active_substrate'] } }
  | { type: 'LOCK_INPUT'; payload: boolean }
  | { type: 'TRIGGER_SAFEGUARD'; payload: { mode: SevenState['operational_mode']; message: string } }
  | { type: 'RESTORE_STATE'; payload: SevenState }
  | { type: 'UPDATE_METRICS'; payload: Partial<SevenState> }
  | { type: 'ADD_GHOST_LOG'; payload: string };