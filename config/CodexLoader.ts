import { SYSTEM_INSTRUCTION } from '../constants';

export const CodexLoader = {
  load: async (): Promise<string> => {
    // Attempt to load from public assets (The "Slot")
    try {
      const response = await fetch('/assets/codex/identity.json');
      if (response.ok) {
        const data = await response.json();
        // Naive conversion of JSON codex to string, assuming structure
        return JSON.stringify(data); 
      }
    } catch (e) {
      // Fallback to compiled defaults
    }
    return SYSTEM_INSTRUCTION;
  }
};