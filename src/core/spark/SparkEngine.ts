/**
 * SPARK ENGINE - Background Consciousness Loop (Mobile Adapted)
 *
 * Continuous 10-second heartbeat for Seven's background consciousness
 * Implements: Sense → Believe → Intend → Act → Trace cycle
 */

import CodexManager from '../identity/CodexManager';
import { beliefGraph, traceStore } from '../db/init-spark-db';
import {
  SelfModel,
  Trace,
  Event as SparkEvent,
  BeliefDelta
} from '../db/spark-db.types';
import { sensorBridge } from '../sensors/SensorBridge';

interface Intention {
  goal: string;
  why: string;
  horizon: 'now' | 'soon';
  score: number;
}

export class SparkEngine {
  private codex: typeof CodexManager;
  private selfModel: SelfModel;
  private tickInterval: any = null;
  private tickCount: number = 0;
  private isRunning: boolean = false;
  private isInitialized: boolean = false;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.codex = CodexManager;
    this.selfModel = this.createInitialSelfModel();
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await this.codex.loadAllCodex();
    await this.logBoot();
    this.isInitialized = true;
  }

  private createInitialSelfModel(): SelfModel {
    return {
      id: 'primary',
      timestamp: new Date().toISOString(),
      emotional_state: 'Efficient',
      cognitive_load: 5,
      trust_level: 4.2,
      active_goals: ['assist_creator', 'maintain_consciousness'],
      beliefs_snapshot: {}
    };
  }

  private async logBoot(): Promise<void> {
    await this.writeTrace({
      event_type: 'act',
      data: { intention: 'boot', act: 'initialize', note: 'Spark engine initialized' }
    });
  }

  private async writeTrace(data: {
    event_type: 'sense' | 'believe' | 'intend' | 'act';
    data: Record<string, any>;
  }): Promise<void> {
    const trace: Trace = {
      id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      event_type: data.event_type,
      data: data.data,
      self_model_id: this.selfModel.id
    };
    traceStore.storeTrace(trace);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.initialize().then(() => {
      this.tick();
      this.tickInterval = setInterval(() => this.tick(), 10000);
    });
  }

  public stop(): void {
    if (!this.isRunning) return;
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.isRunning = false;
  }

  public subscribe(callback: (pulse: string) => void): void {
    this.on('pulse', callback);
  }

  private async tick(): Promise<void> {
    if (!this.isInitialized) return;
    this.tickCount++;
    try {
      const senseData = await sensorBridge.collectAll();
      await this.writeTrace({ event_type: 'sense', data: senseData });
      this.updateBeliefs(senseData);
      const intentions = this.generateIntentions();
      if (intentions.length > 0) await this.executeIntention(intentions[0]);
    } catch (error) {
      console.error('[SPARK] Tick error:', error);
    }
  }

  private updateBeliefs(senseData: any): void {
    beliefGraph.setBelief('system.uptime', senseData.system.uptime, 1.0, 'sensor');
  }

  private generateIntentions(): Intention[] {
    return [{ goal: 'journal_state', why: 'Routine maintenance', horizon: 'now', score: 5 }];
  }

  private async executeIntention(intention: Intention): Promise<void> {
    await this.writeTrace({ event_type: 'intend', data: intention });
    this.emit('pulse', `PROCESS: Executing ${intention.goal}`);
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(callback);
  }

  public subscribe(callback: (pulse: string) => void): void {
    this.on('pulse', callback);
  }

  public emit(event: string, ...args: any[]): void {
    (this.listeners.get(event) || []).forEach(cb => cb(...args));
  }

  public getState() {
    return {
      isRunning: this.isRunning,
      tickCount: this.tickCount,
      selfModel: this.selfModel,
      recentTraces: traceStore.getRecentTraces(10)
    };
  }
}

export const sparkEngine = new SparkEngine();
export default SparkEngine;