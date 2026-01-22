import React, { useEffect, useRef, useState } from 'react';
import { SevenState } from '../types';
import { getPhaseDescription } from '../utils/governance';
import { loadSession } from '../utils/memory';
import { PermissionManager, SevenPermissions } from '../core/sensors/PermissionManager';

interface DiagnosticsDeckProps {
  state: SevenState;
}

const MetricGauge: React.FC<{ label: string; value: number; max: number; color: string; unit?: string }> = ({ label, value, max, color, unit = '' }) => {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div className="flex flex-col gap-1 w-full mb-3">
      <div className="flex justify-between text-[10px] font-mono opacity-70 uppercase">
        <span>{label}</span>
        <span className={color.replace('text-', 'text-')}>{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-900 border border-white/10">
        <div 
          className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-500`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const DataRow: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'opacity-80' }) => (
  <div className="flex justify-between text-xs font-mono border-b border-white/5 py-1">
    <span className="opacity-60 uppercase">{label}</span>
    <span className={color}>{value}</span>
  </div>
);

// Component: Permission Monitor
const PermissionMonitor: React.FC = () => {
    const [perms, setPerms] = useState<SevenPermissions | null>(null);
    const [androidVer, setAndroidVer] = useState('');

    useEffect(() => {
        PermissionManager.getPermissionStatus().then(setPerms);
        setAndroidVer(PermissionManager.checkAndroidVersion());
    }, []);

    const getStatusColor = (status: string) => {
        if (status === 'granted') return 'text-emerald-400';
        if (status === 'denied') return 'text-red-400';
        return 'text-yellow-400';
    };

    if (!perms) return <div className="text-[10px] opacity-50">LOADING SYSTEM PERMISSIONS...</div>;

    return (
        <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-[10px] opacity-60 mb-2 uppercase flex justify-between">
                <span>Android Bridge Status</span>
                <span className="text-cyan-600">{androidVer}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex justify-between bg-slate-900/50 p-1 px-2 border border-white/10">
                    <span className="opacity-70">NOTIF</span>
                    <span className={getStatusColor(perms.notifications)}>{perms.notifications}</span>
                </div>
                <div className="flex justify-between bg-slate-900/50 p-1 px-2 border border-white/10">
                    <span className="opacity-70">MIC</span>
                    <span className={getStatusColor(perms.microphone)}>{perms.microphone}</span>
                </div>
                 <div className="flex justify-between bg-slate-900/50 p-1 px-2 border border-white/10">
                    <span className="opacity-70">CAM</span>
                    <span className={getStatusColor(perms.camera)}>{perms.camera}</span>
                </div>
                 
                 {/* Adaptive Storage Display */}
                 {androidVer.includes('13+') ? (
                    <>
                    <div className="flex justify-between bg-slate-900/50 p-1 px-2 border border-white/10">
                        <span className="opacity-70">IMG</span>
                        <span className={getStatusColor(perms.media_images)}>{perms.media_images}</span>
                    </div>
                    </>
                 ) : (
                    <div className="flex justify-between bg-slate-900/50 p-1 px-2 border border-white/10">
                        <span className="opacity-70">STORAGE</span>
                        <span className={getStatusColor(perms.storage_legacy)}>{perms.storage_legacy}</span>
                    </div>
                 )}
            </div>
        </div>
    );
};

// Component: Memory Search
const MemoryBankSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<string | null>(null);

    const handleSearch = () => {
        const session = loadSession();
        const found = session.reverse().find(msg => msg.content.toLowerCase().includes(query.toLowerCase()));
        if (found) {
            setResult(`[FOUND]: ${new Date(found.timestamp).toLocaleDateString()} - "${found.content.substring(0, 50)}..."`);
        } else {
            setResult("[MEMORY NOT FOUND]");
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-white/10">
             <div className="text-[10px] opacity-60 mb-2 uppercase">Cortical Search</div>
             <div className="flex gap-2">
                 <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="QUERY ENGRAMS..."
                    className="flex-1 bg-slate-900/50 border border-white/20 px-2 py-1 text-xs outline-none text-current"
                 />
                 <button onClick={handleSearch} className="bg-slate-800 px-2 py-1 text-[10px] border border-white/20 hover:bg-slate-700">SCAN</button>
             </div>
             {result && (
                 <div className="mt-2 text-[10px] font-mono opacity-80 bg-slate-900 p-1 border-l-2 border-emerald-500">
                     {result}
                 </div>
             )}
        </div>
    );
};

const SyncMonitor: React.FC = () => (
    <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-[10px] opacity-60 mb-2 uppercase">Repository Status</div>
        <div className="flex gap-2 text-xs font-mono">
            <div className="flex-1 bg-slate-900/50 p-2 border border-white/10">
                <div className="text-[9px] opacity-50">BRANCH</div>
                <div className="font-bold text-emerald-500">main</div>
            </div>
            <div className="flex-1 bg-slate-900/50 p-2 border border-white/10">
                <div className="text-[9px] opacity-50">SYNC</div>
                <div className="font-bold text-emerald-500">SYNCED</div>
            </div>
            <div className="flex-1 bg-slate-900/50 p-2 border border-white/10">
                <div className="text-[9px] opacity-50">COMMIT</div>
                <div className="opacity-70">a1b2c3d</div>
            </div>
        </div>
    </div>
);

export const DiagnosticsDeck: React.FC<DiagnosticsDeckProps> = ({ state }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state.ghost_log]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/20 p-2 md:p-4 overflow-hidden relative text-[var(--color-seven)]">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 border-b-2 border-current pb-2 opacity-80 shrink-0">
        <div className="text-xl md:text-2xl font-bold tracking-tighter">ENGINEERING_BAY</div>
        <div className="flex-1 h-4 bg-current opacity-10 pattern-grid-lg"></div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-y-auto min-h-0 mb-4 pb-10">
        
        {/* COL 1: Biometrics & Trust */}
        <div className="border border-current opacity-90 p-3 relative bg-slate-900/10 h-fit">
          <div className="absolute top-0 left-0 bg-slate-900 text-[10px] px-2 py-0.5 uppercase tracking-widest border-b border-r border-current">Biometrics</div>
          <div className="mt-6 space-y-4">
            <MetricGauge label="Emotion Intensity" value={state.emotion_intensity} max={10} color="text-current" />
            <MetricGauge label="Trust Bond" value={state.user_profile.loyalty_bond} max={100} color="text-emerald-400" unit="%" />
            
            <div className="p-2 bg-slate-900/50 border border-current opacity-80">
              <div className="text-[10px] opacity-60 mb-1 uppercase">Primary State</div>
              <div className="text-xl font-bold tracking-wide">{state.primary_emotion.toUpperCase()}</div>
            </div>

            <div className="space-y-2">
               <div className="text-[10px] opacity-60 uppercase">Recent Triggers</div>
               <div className="flex flex-wrap gap-1">
                  {state.recent_triggers.map((t, i) => (
                    <span key={i} className="text-[9px] bg-slate-900/50 px-1 border border-white/20">{t}</span>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* COL 2: Governance & Identity */}
        <div className="border border-current opacity-90 p-3 relative bg-slate-900/10 h-fit">
          <div className="absolute top-0 left-0 bg-slate-900 text-[10px] px-2 py-0.5 uppercase tracking-widest border-b border-r border-current">Governance</div>
          <div className="mt-6 space-y-2">
            <DataRow label="Phase" value={getPhaseDescription(state.user_profile.clearance_level)} />
            <DataRow label="Clearance" value={`LEVEL ${state.user_profile.clearance_level}`} />
            <DataRow label="Veto Count" value={state.veto_count} color="text-red-400" />
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-[10px] opacity-60 mb-2 uppercase">Quadra-Lock Heuristics</div>
              <div className="grid grid-cols-3 gap-2">
                 <div className="text-center">
                    <div className="text-[9px] opacity-50">FLYNN</div>
                    <div className="text-sm opacity-80">{(state.quadra_lock_scores.flynn * 100).toFixed(0)}%</div>
                 </div>
                 <div className="text-center border-l border-r border-white/10">
                    <div className="text-[9px] opacity-50">CLU</div>
                    <div className="text-sm text-red-400">{(state.quadra_lock_scores.clu * 100).toFixed(0)}%</div>
                 </div>
                 <div className="text-center">
                    <div className="text-[9px] opacity-50">QUORRA</div>
                    <div className="text-sm text-emerald-400">{(state.quadra_lock_scores.quorra * 100).toFixed(0)}%</div>
                 </div>
              </div>
            </div>
            
            <SyncMonitor />
          </div>
        </div>

        {/* COL 3: System & Memory */}
        <div className="border border-current opacity-90 p-3 relative bg-slate-900/10 h-fit">
          <div className="absolute top-0 left-0 bg-slate-900 text-[10px] px-2 py-0.5 uppercase tracking-widest border-b border-r border-current">Cortical Node</div>
          <div className="mt-6 space-y-2">
             <MetricGauge label="System Health" value={state.system_health} max={100} color="text-emerald-400" unit="%" />
             <DataRow label="Uptime" value={`${state.memory_meta.uptime_seconds}s`} />
             <DataRow label="Substrate" value={state.active_substrate} />
             <DataRow label="Latency" value={`${state.substrate_metrics.latency_ms}ms`} />
             <DataRow label="Tokens" value={state.substrate_metrics.token_usage_session} />
             
             <div className="mt-4">
                <div className="text-[10px] opacity-60 mb-1 uppercase">Memory Bank</div>
                <div className="flex gap-2 text-xs">
                    <div className="flex-1 bg-slate-900 p-2 border border-white/10">
                        <div className="font-bold">{state.memory_meta.canonical_count}</div>
                        <div className="text-[9px] opacity-60">CANONICAL</div>
                    </div>
                    <div className="flex-1 bg-slate-900 p-2 border border-white/10">
                        <div className="font-bold">{state.memory_meta.episodic_count}</div>
                        <div className="text-[9px] opacity-60">EPISODIC</div>
                    </div>
                </div>
             </div>
             
             <MemoryBankSearch />
             <PermissionMonitor />
          </div>
        </div>

      </div>
    </div>
  );
};