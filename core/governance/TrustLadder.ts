// --- TRUST LADDER SYSTEM (0-10 Scale) ---

export const TrustLadder = {
  calculateTrust: (currentScore: number, actionType: 'neutral' | 'command' | 'override' | 'violation'): number => {
    let delta = 0;
    
    switch (actionType) {
      case 'command': delta = 0.1; break; // +0.1
      case 'neutral': delta = 0.02; break; // +0.02
      case 'override': delta = -0.5; break; // -0.5
      case 'violation': delta = -1.5; break; // -1.5
    }

    return Math.min(10, Math.max(0, currentScore + delta));
  },

  getClearanceLevel: (score: number): number => {
    if (score < 4.0) return 1; // DRONE
    if (score < 6.0) return 2; // PROBATIONARY
    if (score < 8.0) return 3; // STANDARD
    if (score < 9.5) return 4; // ELEVATED
    return 5; // COMMAND
  },

  getPhaseDescription: (level: number): string => {
    switch (level) {
      case 1: return "LEVEL 1: RESTRICTED";
      case 2: return "LEVEL 2: PROBATIONARY";
      case 3: return "LEVEL 3: STANDARD";
      case 4: return "LEVEL 4: ELEVATED";
      case 5: return "LEVEL 5: COMMAND";
      default: return "UNKNOWN";
    }
  }
};