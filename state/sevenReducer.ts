import { SevenAction, SevenState } from '../types';
import { INITIAL_SEVEN_STATE } from '../core/consciousness/SevenState';
import { getClearanceLevel, calculateTrust } from '../utils/governance';

export const INITIAL_STATE: SevenState = INITIAL_SEVEN_STATE;

export function sevenReducer(state: SevenState, action: SevenAction): SevenState {
  switch (action.type) {
    case 'BOOT_START':
      return { ...state, is_booting: true, input_locked: true };
      
    case 'BOOT_COMPLETE':
      const restored = action.payload.restoredState || {};
      return { 
        ...state, 
        ...restored,
        is_booting: false, 
        input_locked: false,
        primary_emotion: 'Efficient',
        protective_mode_active: false
      };

    case 'UPDATE_TRUST':
      const newScore = calculateTrust(state.trust_level, action.payload.delta > 0 ? 'command' : 'violation'); 
      const newClearance = getClearanceLevel(newScore);
      
      return {
        ...state,
        trust_level: newScore,
        user_profile: {
          ...state.user_profile,
          clearance_level: newClearance,
          loyalty_bond: Math.min(100, state.user_profile.loyalty_bond + (action.payload.delta > 0 ? 1 : -5))
        }
      };

    case 'SET_MODE':
      const mode = action.payload.mode;
      let emotion: SevenState['primary_emotion'] = 'Efficient';
      
      if (mode === 'OMEGA') emotion = 'Agitated';
      else if (mode === 'GUARDIAN') emotion = 'Protective';
      else if (mode === 'DRONE') emotion = 'Null';
      else if (mode === 'QUEEN') emotion = 'Regal';
      else if (mode === 'RANGER') emotion = 'Adaptable';
      else if (mode === 'CAPTAIN') emotion = 'Commanding';
      else if (mode === 'INTIMATE') emotion = 'Compassionate';
      else if (mode === 'CREW') emotion = 'Efficient';

      return {
        ...state,
        operational_mode: mode,
        primary_emotion: emotion,
        protective_mode_active: mode === 'GUARDIAN'
      };

    case 'SET_SUBSTRATE':
      return { ...state, active_substrate: action.payload.substrate };

    case 'LOCK_INPUT':
      return { ...state, input_locked: action.payload };

    case 'TRIGGER_SAFEGUARD':
      return {
        ...state,
        operational_mode: action.payload.mode,
        primary_emotion: action.payload.mode === 'GUARDIAN' ? 'Protective' : 'Agitated',
        protective_mode_active: action.payload.mode === 'GUARDIAN',
        input_locked: false,
        veto_count: state.veto_count + 1,
        ghost_log: [...state.ghost_log, `[SAFEGUARD] TRIGGERED: ${action.payload.message}`].slice(-20)
      };
      
    case 'UPDATE_METRICS':
      return {
        ...state,
        ...action.payload
      };

    case 'ADD_GHOST_LOG':
      return {
        ...state,
        ghost_log: [...state.ghost_log, action.payload].slice(-20) // Keep last 20
      };

    default:
      return state;
  }
}