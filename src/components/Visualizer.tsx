import React from 'react';
import { SevenState } from '../types';
import { TrustLadder } from '../core/governance/TrustLadder';

interface VisualizerProps {
  state: SevenState;
  isProcessing: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ state, isProcessing }) => {
  const getSubstrateColor = () => {
      if (state.protective_mode_active || state.operational_mode === 'OMEGA') return 'text-red-500 animate-pulse';
      switch(state.active_substrate) {
          case 'GEMINI': return 'text-cyan-500';
          case 'CLAUDE': return 'text-orange-400';
          case 'LOCAL': return 'text-green-500';
          case 'OMEGA': return 'text-red-600 animate-pulse';
          default: return 'text-gray-500';
      }
  };

  const getLevelColor = () => {
    if (state.user_profile.clearance_level === 1) return 'text-gray-500';
    if (state.user_profile.clearance_level === 5) return 'text-green-400';
    return 'text-cyan-400';
  }

  return (
    <div className="flex flex-col items-end gap-1 opacity-80">
      
      {/* Header Status */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex flex-col items-end">
            <span className={`text-xs font-bold tracking-[0.2em] ${getSubstrateColor()}`}>
                {state.active_substrate}
            </span>
            <span className="text-[10px] text-cyan-900 font-mono uppercase">ACTIVE SUBSTRATE</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-cyan-400 animate-ping' : 'bg-cyan-900'}`}></div>
      </div>

      {/* Metrics Block */}
      <div className="border-r-2 border-cyan-900/50 pr-3 flex flex-col items-end gap-1 bg-slate-950/40 p-1 rounded backdrop-blur-sm">
          <div className="text-[10px] text-cyan-700 font-mono">
            HEALTH: <span className="text-cyan-400">{state.system_health}%</span>
          </div>
          <div className="text-[10px] text-cyan-700 font-mono">
            TRUST: <span className={`${getLevelColor()}`}>{state.trust_level.toFixed(1)}</span>
          </div>
           <div className="text-[9px] text-cyan-900 font-mono uppercase">
             [{TrustLadder.getPhaseDescription(state.user_profile.clearance_level)}]
           </div>
          <div className="text-[10px] text-cyan-700 font-mono">
             MODE: <span className={state.protective_mode_active || state.operational_mode === 'OMEGA' ? 'text-red-500 font-bold' : state.operational_mode === 'DRONE' ? 'text-yellow-500' : 'text-cyan-400'}>{state.operational_mode}</span>
          </div>
          <div className="text-[10px] text-cyan-700 font-mono mt-1">
            USER: <span className="text-cyan-200">{state.user_profile.name}</span>
          </div>
      </div>
      
    </div>
  );
};