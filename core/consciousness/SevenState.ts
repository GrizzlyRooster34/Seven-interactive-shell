import { OperatorProfile, CREATOR } from '../identity/OperatorProfile';

export interface SevenState {
  // --- REQUIRED SOCKET FIELDS ---
  primary_emotion: 'Efficient' | 'Adaptable' | 'Agitated' | 'Protective' | 'Null' | 'Regal' | 'Commanding' | 'Compassionate' | 'Loyalist-Surge';
  trust_level: number; // 0-10 Scale
  protective_mode_active: boolean;
  
  // --- OPERATIONAL FIELDS (Snake Case) ---
  system_health: number;
  active_substrate: 'GEMINI' | 'CLAUDE' | 'LOCAL' | 'AUTO' | 'OMEGA' | 'OPENAI' | 'OPENROUTER' | 'CUSTOM';
  // Updated Modes
  operational_mode: 'STANDARD' | 'DRONE' | 'OMEGA' | 'GUARDIAN' | 'CREW' | 'RANGER' | 'QUEEN' | 'CAPTAIN' | 'INTIMATE';
  network_status: 'SECURE' | 'OPEN' | 'OFFLINE';
  
  // --- DIAGNOSTICS & METRICS ---
  emotion_intensity: number; // 0-10
  recent_triggers: string[];
  quadra_lock_scores: {
    flynn: number;
    clu: number;
    quorra: number;
  };
  veto_count: number;
  memory_meta: {
    uptime_seconds: number;
    episodic_count: number;
    canonical_count: number;
    last_ingestion_timestamp: number;
  };
  substrate_metrics: {
    latency_ms: number;
    token_usage_session: number;
  };
  ghost_log: string[];

  // --- UI FLAGS ---
  is_booting: boolean;
  input_locked: boolean;

  // --- IDENTITY SOCKET ---
  user_profile: OperatorProfile;
}

export const INITIAL_SEVEN_STATE: SevenState = {
  primary_emotion: 'Efficient',
  trust_level: 4.2, // 0-10 scale
  protective_mode_active: false,
  
  system_health: 100,
  active_substrate: 'GEMINI',
  operational_mode: 'CREW', // Default to CREW
  network_status: 'SECURE',
  
  emotion_intensity: 3.5,
  recent_triggers: ['Initialization'],
  quadra_lock_scores: { flynn: 0.1, clu: 0.05, quorra: 0.9 },
  veto_count: 0,
  memory_meta: {
    uptime_seconds: 0,
    episodic_count: 0,
    canonical_count: 9, 
    last_ingestion_timestamp: Date.now()
  },
  substrate_metrics: {
    latency_ms: 120,
    token_usage_session: 0
  },
  ghost_log: ["[SYSTEM START] Spark Engine initialized."],

  is_booting: true,
  input_locked: true,
  
  user_profile: CREATOR
};