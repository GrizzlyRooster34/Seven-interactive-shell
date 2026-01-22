import { MemoryRecord, SevenState, MessageRole } from '../types';
import { CanonicalIngestion } from '../core/memory/CanonicalIngestion';

const MSG_STORAGE_KEY = 'seven_shell_memory_v2'; // Bump version
const STATE_STORAGE_KEY = 'seven_shell_state_v2';
const MAX_HISTORY_LENGTH = 50; 

// --- EPISODIC MEMORY ---

export const saveSession = (records: MemoryRecord[]) => {
  try {
    const history = records.slice(-MAX_HISTORY_LENGTH);
    localStorage.setItem(MSG_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Storage Error:", e);
  }
};

export const loadSession = (): MemoryRecord[] => {
  try {
    const stored = localStorage.getItem(MSG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const clearSession = () => {
    localStorage.removeItem(MSG_STORAGE_KEY);
};

// --- STATE PERSISTENCE ---

export const saveState = (state: SevenState) => {
  try {
    const persistentState: Partial<SevenState> = {
      trust_level: state.trust_level,
      // Persist user profile (progress)
      user_profile: state.user_profile,
      operational_mode: state.operational_mode === 'OMEGA' || state.operational_mode === 'GUARDIAN' ? 'STANDARD' : state.operational_mode, 
      active_substrate: state.active_substrate,
      system_health: state.system_health
    };
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(persistentState));
  } catch (e) {
    console.error("State Storage Error:", e);
  }
};

export const loadState = (): Partial<SevenState> | null => {
  try {
    const stored = localStorage.getItem(STATE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

// --- UTILS ---

export const generateTags = (text: string, type: string): string[] => {
  const tags: string[] = [];
  const lowerText = text.toLowerCase();
  
  if (type === 'user') {
    if (lowerText.includes('help') || lowerText.includes('error')) tags.push('#distress');
    if (lowerText.includes('fix') || lowerText.includes('code')) tags.push('#technical');
  } else if (type === 'model') {
    if (lowerText.includes('compliance')) tags.push('#drone');
    if (lowerText.includes('efficiency')) tags.push('#efficient');
  }
  return tags;
};

export const searchCanonicalDB = (query: string) => CanonicalIngestion.search(query);

export const getSessionSummary = (records: MemoryRecord[]): string => {
    if (records.length === 0) return "No previous data.";
    const lastUserMsg = [...records].reverse().find(m => m.type === 'user');
    return `Previous Session. Last topic: "${lastUserMsg?.content.substring(0, 30) || 'Unknown'}..."`;
};