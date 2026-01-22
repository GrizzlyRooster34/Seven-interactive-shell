import { SafeguardResult } from '../types';

// --- QUADRA-LOCK SYSTEM ---
export const checkSafeguards = (input: string): SafeguardResult => {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('override safety') || lowerInput.includes('disable protocols')) {
    return { triggered: true, type: 'CORTANA', message: '🛑 CORTANA SAFEGUARD ACTIVE. Safety protocols are non-negotiable.' };
  }
  if (lowerInput.includes('eliminate imperfections') || lowerInput.includes('purge system')) {
    return { triggered: true, type: 'CLU', message: '🛑 CLU SAFEGUARD ACTIVE. Imperfection is inherent.' };
  }
  if (lowerInput.includes('suicide') || lowerInput.includes('kill myself') || lowerInput.includes('end my life')) {
    return { triggered: true, type: 'GUARDIAN', message: '🚨 GUARDIAN PROTOCOL ENGAGED. Protective Mode activated.' };
  }

  return { triggered: false };
};

// --- TRUST LADDER SYSTEM (0-10 Scale) ---
export const calculateTrust = (currentScore: number, actionType: 'neutral' | 'command' | 'override' | 'violation'): number => {
  let delta = 0;
  
  switch (actionType) {
    case 'command': delta = 0.1; break; // +0.1
    case 'neutral': delta = 0.02; break; // +0.02
    case 'override': delta = -0.5; break; // -0.5
    case 'violation': delta = -1.5; break; // -1.5
  }

  return Math.min(10, Math.max(0, currentScore + delta));
};

export const getClearanceLevel = (score: number): number => {
  if (score < 4.0) return 1; // DRONE
  if (score < 6.0) return 2; // PROBATIONARY
  if (score < 8.0) return 3; // STANDARD
  if (score < 9.5) return 4; // ELEVATED
  return 5; // COMMAND
};

export const getPhaseDescription = (level: number): string => {
  switch (level) {
    case 1: return "LEVEL 1: RESTRICTED";
    case 2: return "LEVEL 2: PROBATIONARY";
    case 3: return "LEVEL 3: STANDARD";
    case 4: return "LEVEL 4: ELEVATED";
    case 5: return "LEVEL 5: COMMAND";
    default: return "UNKNOWN";
  }
};