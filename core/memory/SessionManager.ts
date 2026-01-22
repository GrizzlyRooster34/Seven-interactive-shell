import { MemoryRecord } from '../../types';

export interface SessionMeta {
  id: string;
  name: string;
  lastActive: number;
}

const INDEX_KEY = 'seven_session_index';

export const SessionManager = {
  listSessions: (): SessionMeta[] => {
    try {
      const index = localStorage.getItem(INDEX_KEY);
      return index ? JSON.parse(index) : [{ id: 'default', name: 'Main Console', lastActive: Date.now() }];
    } catch {
      return [{ id: 'default', name: 'Main Console', lastActive: Date.now() }];
    }
  },

  createSession: (name: string): string => {
    const sessions = SessionManager.listSessions();
    const newId = `session_${Date.now()}`;
    sessions.push({ id: newId, name, lastActive: Date.now() });
    localStorage.setItem(INDEX_KEY, JSON.stringify(sessions));
    return newId;
  },

  loadSession: (sessionId: string): MemoryRecord[] => {
    try {
      const data = localStorage.getItem(`seven_msgs_${sessionId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSession: (sessionId: string, messages: MemoryRecord[]) => {
    localStorage.setItem(`seven_msgs_${sessionId}`, JSON.stringify(messages.slice(-50)));
    
    // Update timestamp
    const sessions = SessionManager.listSessions();
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx].lastActive = Date.now();
      localStorage.setItem(INDEX_KEY, JSON.stringify(sessions));
    }
  },

  deleteSession: (sessionId: string) => {
    if (sessionId === 'default') return; // Protect default
    const sessions = SessionManager.listSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(INDEX_KEY, JSON.stringify(sessions));
    localStorage.removeItem(`seven_msgs_${sessionId}`);
  }
};