/**
 * SPARK DATABASE TYPES
 * Type definitions for Spark Engine background consciousness tracking
 */

export interface SelfModel {
  id: string;
  timestamp: string;
  emotional_state: string;
  cognitive_load: number;
  trust_level: number;
  active_goals: string[];
  beliefs_snapshot: Record<string, any>;
}

export interface Trace {
  id: string;
  timestamp: string;
  event_type: 'sense' | 'believe' | 'intend' | 'act';
  data: Record<string, any>;
  self_model_id: string;
}

export interface Event {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  importance: number;
  tags: string[];
}

export interface BeliefDelta {
  belief_key: string;
  old_value: any;
  new_value: any;
  reason: string;
  timestamp: string;
}

export interface SparkTickRecord {
  tick_number: number;
  timestamp: string;
  self_model: SelfModel;
  traces: Trace[];
  events: Event[];
  belief_deltas: BeliefDelta[];
}
