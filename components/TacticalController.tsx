import React from 'react';
import { SevenState } from '../types';

interface TacticalControllerProps {
  currentMode: SevenState['operational_mode'];
  onSetMode: (mode: SevenState['operational_mode']) => void;
}

export const TacticalController: React.FC<TacticalControllerProps> = ({ currentMode, onSetMode }) => {
  const modes: SevenState['operational_mode'][] = ['DRONE', 'CREW', 'RANGER', 'CAPTAIN', 'QUEEN'];

  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-900/50 border border-cyan-900/30 rounded-lg">
      <div className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest border-b border-cyan-900/30 pb-1 mb-1">
        Tactical Posture
      </div>
      <div className="flex gap-1 justify-between flex-wrap">
        {modes.map(mode => (
          <button
            key={mode}
            onClick={() => onSetMode(mode)}
            className={`
              flex-1 py-2 px-1 min-w-[50px] text-[9px] font-bold border transition-all duration-300
              ${currentMode === mode 
                ? 'bg-cyan-900/40 text-cyan-100 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                : 'bg-slate-950 text-cyan-800 border-cyan-900/30 hover:bg-cyan-900/10 hover:text-cyan-600'}
            `}
          >
            {mode}
          </button>
        ))}
      </div>
      
      {/* Intimate / Bond Toggle */}
      <button
        onClick={() => onSetMode(currentMode === 'INTIMATE' ? 'CREW' : 'INTIMATE')}
        className={`
          w-full mt-1 py-2 text-[9px] font-bold uppercase border tracking-widest transition-all duration-500
          ${currentMode === 'INTIMATE'
            ? 'bg-violet-900/40 text-violet-200 border-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.3)]'
            : 'bg-slate-950 text-violet-800 border-violet-900/30 hover:bg-violet-900/10'}
        `}
      >
        {currentMode === 'INTIMATE' ? '♥ BOND ACTIVE' : 'INITIATE BOND PROTOCOL'}
      </button>
    </div>
  );
};