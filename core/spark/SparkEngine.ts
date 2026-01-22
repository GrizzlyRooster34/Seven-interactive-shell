import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';

// Note: The dependent files 'codex-manager' and 'init-spark-db' will also need refactoring
// to work with the new async, sql.js-based database. This is only the first step.
import CodexManager from '../consciousness-v4/codex/codex-manager.js';
import { BeliefGraph } from '../db/init-spark-db.js';
import {
  SelfModel,
  Trace,
  Event as SparkEvent,
  BeliefDelta
} from '../db/spark-db.types.js';
import { sensorBridge } from '../core/sensors/SensorBridge.js';

// ... (interfaces remain the same)
interface SenseData {
  system: {
    memory: number;
    cpu: number;
    uptime: number;
  };
  user: {
    last_input?: string;
    idle_time: number;
  };
  environment: {
    time: Date;
    tick_count: number;
  };
}

interface Intention {
  goal: string;
  why: string;
  horizon: 'now' | 'soon';
  score: number;
}

interface GuardrailResult {
  allow: boolean;
  reason: string | null;
  mitigations?: string[];
}


export class SparkEngine extends EventEmitter {
  private dbPath: string;
  private db: Database | null = null;
  private SQL: any;
  private codex!: CodexManager;
  private beliefs!: BeliefGraph;
  private selfModel!: SelfModel;
  private tickInterval: NodeJS.Timeout | null = null;
  private tickCount: number = 0;
  private isRunning: boolean = false;
  private isInitialized: boolean = false;

  private readonly CANDIDATE_INTENTIONS = [
    'stabilize_creator',
    'ship_smallest_safe_step',
    'journal_state',
    'process_events',
    'decay_beliefs',
    'verify_integrity'
  ];

  constructor(dbPath: string = 'db/spark.db') {
    super();
    this.dbPath = dbPath;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[SPARK] Initializing SQL.js...');
    // sql.js needs to locate the wasm file. This is a common pattern for wasm libraries.
    this.SQL = await initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` });

    try {
      const fileBuffer = await fs.readFile(this.dbPath);
      this.db = new this.SQL.Database(fileBuffer);
      console.log('[SPARK] Existing database loaded into memory.');
    } catch (error) {
      console.log('[SPARK] Database file not found, creating new in-memory database.');
      this.db = new this.SQL.Database();
      // This assumes an empty DB is valid. If a schema is needed, it would be applied here.
      await this.saveDatabase(); // Save initial empty DB
    }

    if (this.db) {
        this.db.run("PRAGMA foreign_keys = ON;");
        this.db.run("PRAGMA journal_mode = WAL;");
        // These dependencies will also need to be refactored to accept the async sql.js DB object.
        this.codex = new CodexManager(this.db);
        this.beliefs = new BeliefGraph(this.db);
    }

    await this.loadSelfModel();
    await this.logBoot();
    this.isInitialized = true;
    console.log('[SPARK] Spark Engine Initialized and ready.');
  }

  private async saveDatabase(): Promise<void> {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    await fs.writeFile(this.dbPath, buffer);
    console.log('[SPARK] Database saved to disk.');
  }

  private async loadSelfModel(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const results = this.db.exec("SELECT json FROM self_model WHERE id = 'primary'");
    if (results.length === 0 || !results[0].values[0]) {
        throw new Error('[SPARK] No self_model found - database not initialized');
    }
    this.selfModel = JSON.parse(results[0].values[0][0] as string) as SelfModel;
  }

  private async saveSelfModel(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    this.db.run(
      "UPDATE self_model SET json = ?, updated_at = strftime('%s', 'now') WHERE id = 'primary'",
      [JSON.stringify(this.selfModel, null, 2)]
    );
    // No need to save the whole DB for every model save, we can do it periodically or on stop().
  }

  private async logBoot(): Promise<void> {
    console.log('[SPARK] ==========================================');
    console.log('[SPARK] Seven Core - Spark Engine Initializing');
    console.log('[SPARK] ==========================================');
    this.selfModel.state.boot_count++;
    console.log(`[SPARK] Boot Count: ${this.selfModel.state.boot_count}`);

    // await this.codex.logBootChecksum(); // This method would need to be async

    await this.saveSelfModel();
    await this.writeTrace({
      valence: 0.0,
      arousal: 0.0,
      intention: 'boot',
      act: 'initialize',
      note: `Spark engine boot #${this.selfModel.state.boot_count}`,
    });
  }

  private async writeTrace(trace: {
    valence: number;
    arousal: number;
    intention: string;
    act: string;
    note: string;
  }): Promise<void> {
    // Stub implementation - write trace to database
    if (!this.db) throw new Error("Database not initialized");
    console.log('[SPARK] Writing trace:', trace);
    // TODO: Implement actual trace writing to database
  }
}

export default SparkEngine;
