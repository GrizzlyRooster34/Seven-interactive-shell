import { SYSTEM_INSTRUCTION } from '../../constants';

export const CodexLoader = {
  loadCodex: async (): Promise<string> => {
    // Stub: Returns default config. 
    // Future: Will return mock JSON of 10 categories or load from assets.
    try {
      const response = await fetch('/assets/codex/identity.json');
      if (response.ok) {
        const data = await response.json();
        return JSON.stringify(data); 
      }
    } catch (e) {
      // Fallback
    }
    return SYSTEM_INSTRUCTION;
  }
};