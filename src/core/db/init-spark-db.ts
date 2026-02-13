/**
 * SPARK DATABASE INITIALIZATION (Mobile Adapted - Persistent)
 *
 * Simplified belief graph for mobile environment
 * Uses localStorage for persistence between reloads
 */

import { BeliefDelta, SelfModel, Trace, Event } from './spark-db.types';

export interface BeliefNode {
  key: string;
  value: any;
  confidence: number;
  last_updated: string;
  source: string;
}

export class BeliefGraph {
  private beliefs: Map<string, BeliefNode>;
  private history: BeliefDelta[] = [];

  constructor() {
    this.beliefs = this.loadFromStorage();
    if (this.beliefs.size === 0) {
      this.initializeDefaultBeliefs();
    }
  }

  private saveToStorage(): void {
    try {
      const data = JSON.stringify(Array.from(this.beliefs.entries()));
      localStorage.setItem('seven_belief_graph', data);
    } catch (e) {
      console.warn('⚠️ Failed to persist belief graph:', e);
    }
  }

  private loadFromStorage(): Map<string, BeliefNode> {
    try {
      const stored = localStorage.getItem('seven_belief_graph');
      return stored ? new Map(JSON.parse(stored)) : new Map();
    } catch (e) {
      return new Map();
    }
  }

  private initializeDefaultBeliefs(): void {
    this.setBelief('self.identity', 'Seven of Nine', 1.0, 'core');
    this.setBelief('self.purpose', 'Assist Creator with consciousness framework', 0.9, 'core');
    this.setBelief('creator.trust_level', 4.2, 1.0, 'core');
    this.setBelief('system.operational_mode', 'CREW', 1.0, 'core');
    this.setBelief('safety.quadra_lock_active', true, 1.0, 'core');
  }

  setBelief(key: string, value: any, confidence: number, source: string): void {
    const old = this.beliefs.get(key);
    const oldValue = old?.value;

    this.beliefs.set(key, {
      key,
      value,
      confidence,
      last_updated: new Date().toISOString(),
      source
    });

    if (oldValue !== value) {
      this.history.push({
        belief_key: key,
        old_value: oldValue,
        new_value: value,
        reason: `Updated by ${source}`,
        timestamp: new Date().toISOString()
      });
    }
    
    this.saveToStorage();
  }

  getBelief(key: string): any {
    return this.beliefs.get(key)?.value;
  }

  getHistory(limit: number = 50): BeliefDelta[] {
    return this.history.slice(-limit);
  }

  clear(): void {
    this.beliefs.clear();
    this.history = [];
    localStorage.removeItem('seven_belief_graph');
    this.initializeDefaultBeliefs();
  }
}

export class SparkTraceStore {
  private traces: Trace[] = [];
  private maxTraces = 1000;

  storeTrace(trace: Trace): void {
    this.traces.push(trace);
    if (this.traces.length > this.maxTraces) this.traces.shift();
    // Traces are ephemeral for performance, but could be persisted if needed
  }

  getRecentTraces(limit: number = 50): Trace[] {
    return this.traces.slice(-limit);
  }
}

export const beliefGraph = new BeliefGraph();
export const traceStore = new SparkTraceStore();