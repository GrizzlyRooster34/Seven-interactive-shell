import React, { useState, useEffect } from 'react';
import { useSevenRuntime } from './runtime/useSevenRuntime';
import { TerminalOutput } from './components/TerminalOutput';
import { TerminalInput } from './components/TerminalInput';
import { Visualizer } from './components/Visualizer';
import { SparkTicker } from './components/SparkTicker';
import { DiagnosticsDeck } from './components/DiagnosticsDeck';
import { TacticalController } from './components/TacticalController';
import { SubstrateManager } from './components/SubstrateManager';
import { SessionController } from './components/SessionController';
import { TacticalManager } from './core/tactical/TacticalManager';
import { TraceLog } from './components/GhostDiary/TraceLog';

const App: React.FC = () => {
  const { state, messages, processInput, dispatch, currentSessionId, switchSession } = useSevenRuntime();
  
  // View State
  const [viewMode, setViewMode] = useState<'TERMINAL' | 'DIAGNOSTICS' | 'GHOST_DIARY'>('TERMINAL');
  const [showSettings, setShowSettings] = useState(false);
  
  // Mobile Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileDrawerTab, setMobileDrawerTab] = useState<'ENG' | 'LOGS'>('ENG');

  // Apply Theme
  const theme = TacticalManager.getThemeForMode(state.operational_mode);
  const isIntimate = state.operational_mode === 'INTIMATE';
  
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-seven', theme.primary);
    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-alert', theme.alert);
  }, [theme]);
  
  // Intimate Mode Styles
  const containerClass = isIntimate ? 'font-sans rounded-3xl' : 'font-mono rounded-none';
  const borderClass = isIntimate ? 'border-white/5' : 'border-white/10';
  const bgClass = isIntimate 
    ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-[#181226] to-[#05030a]' 
    : 'bg-[var(--color-bg)]';

  return (
    <div 
      className={`flex flex-col h-screen w-full relative overflow-hidden transition-all duration-1000 ${bgClass} ${isIntimate ? 'text-violet-100' : 'text-[var(--color-seven)]'}`}
    >
      
      {/* Background Decor */}
      <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--color-seven)] to-transparent pointer-events-none transition-opacity duration-1000 ${isIntimate ? 'opacity-10' : 'opacity-10'}`} />
      {!isIntimate && (
         <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150"></div>
      )}
      
      {/* HEADER */}
      <header className={`flex items-center justify-between px-4 py-2 border-b ${borderClass} bg-slate-950/30 z-40 shrink-0 h-14 backdrop-blur-md`}>
         {/* Branding */}
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isIntimate ? 'bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.5)]' : 'bg-[var(--color-seven)]'}`}></div>
            <div className={`text-xs font-bold tracking-[0.2em] opacity-80 ${isIntimate ? 'font-sans uppercase' : 'font-mono'}`}>
                {isIntimate ? 'SEVEN' : 'SEVEN_SHELL // INTERFACE'}
            </div>
         </div>

         {/* Nav Buttons */}
         <div className="flex gap-2 items-center">
            {/* Desktop Tabs */}
            <div className="hidden md:flex gap-1">
                <button 
                onClick={() => setViewMode('TERMINAL')}
                className={`px-3 py-1 text-[10px] font-bold border border-current transition-all ${viewMode === 'TERMINAL' ? 'bg-[var(--color-seven)] text-[var(--color-bg)]' : 'opacity-50 hover:opacity-100'}`}
                >
                TERM
                </button>
                <button 
                onClick={() => setViewMode('DIAGNOSTICS')}
                className={`px-3 py-1 text-[10px] font-bold border border-current transition-all ${viewMode === 'DIAGNOSTICS' ? 'bg-amber-600 text-slate-900 border-amber-600' : 'opacity-50 hover:opacity-100'}`}
                >
                ENG
                </button>
                <button 
                onClick={() => setViewMode('GHOST_DIARY')}
                className={`px-3 py-1 text-[10px] font-bold border border-current transition-all ${viewMode === 'GHOST_DIARY' ? 'bg-purple-600 text-slate-900 border-purple-600' : 'opacity-50 hover:opacity-100'}`}
                >
                LOGS
                </button>
            </div>

            {/* Mobile Status Button */}
            <div className="md:hidden">
                <button
                    onClick={() => setMobileDrawerOpen(true)}
                    className="px-3 py-1 text-[10px] font-bold border border-current bg-slate-900/50 text-[var(--color-seven)]"
                >
                    STATUS
                </button>
            </div>

            {/* Settings Toggle */}
             <button 
               onClick={() => setShowSettings(!showSettings)}
               className={`ml-2 px-2 py-1 text-[10px] font-bold border border-current transition-all ${showSettings ? 'bg-current text-[var(--color-bg)]' : 'opacity-50 hover:opacity-100'}`}
            >
               ⚙
            </button>
         </div>
      </header>

      {/* Settings Overlay */}
      {showSettings && (
        <div className={`absolute top-14 right-2 z-50 w-72 flex flex-col gap-2 animate-in slide-in-from-top-4 fade-in duration-300 max-h-[70vh] overflow-y-auto bg-slate-950/95 p-2 border ${borderClass} shadow-2xl backdrop-blur-xl ${isIntimate ? 'rounded-2xl' : 'rounded-b-lg'}`}>
           <TacticalController 
              currentMode={state.operational_mode} 
              onSetMode={(m) => dispatch({ type: 'SET_MODE', payload: { mode: m } })} 
           />
           <SessionController 
              currentSessionId={currentSessionId}
              onSwitchSession={switchSession}
           />
           <SubstrateManager 
              currentSubstrate={state.active_substrate} 
              onSetSubstrate={(s) => dispatch({ type: 'SET_SUBSTRATE', payload: { substrate: s } })}
           />
        </div>
      )}

      {/* Mobile Drawer (Status Slide-out) */}
      <div 
        className={`md:hidden fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 flex flex-col ${mobileDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
          {/* Drawer Header */}
          <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
              <span className="font-bold text-xs tracking-widest text-[var(--color-seven)]">SYSTEM STATUS</span>
              <button onClick={() => setMobileDrawerOpen(false)} className="text-xl px-2 text-[var(--color-seven)]">×</button>
          </div>
          
          {/* Drawer Tabs */}
          <div className="flex border-b border-white/10 shrink-0">
             <button 
                onClick={() => setMobileDrawerTab('ENG')}
                className={`flex-1 py-3 text-xs font-bold transition-colors ${mobileDrawerTab === 'ENG' ? 'bg-white/10 text-[var(--color-seven)]' : 'text-gray-500'}`}
             >
                VITALS
             </button>
             <button 
                onClick={() => setMobileDrawerTab('LOGS')}
                className={`flex-1 py-3 text-xs font-bold transition-colors ${mobileDrawerTab === 'LOGS' ? 'bg-white/10 text-purple-400' : 'text-gray-500'}`}
             >
                GHOST LOG
             </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-hidden relative p-4">
              {mobileDrawerTab === 'ENG' ? (
                  <DiagnosticsDeck state={state} />
              ) : (
                  <TraceLog logs={state.ghost_log} />
              )}
          </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col relative overflow-hidden min-h-0 ${containerClass}`}> 
        
        {/* Visualizer (Hidden in Intimate Mode) */}
        {!isIntimate && viewMode === 'TERMINAL' && (
            <div className="absolute top-2 right-2 md:top-4 md:right-8 z-30 pointer-events-none">
                <Visualizer state={state} isProcessing={state.input_locked && !state.is_booting} />
            </div>
        )}

        {/* Views (Desktop Hidden logic ensures this doesn't conflict with Drawer on mobile) */}
        {viewMode === 'TERMINAL' ? (
             <TerminalOutput messages={messages} />
        ) : viewMode === 'DIAGNOSTICS' ? (
             <div className="p-4 h-full hidden md:block"><DiagnosticsDeck state={state} /></div>
        ) : (
             <div className="p-4 h-full hidden md:block"><TraceLog logs={state.ghost_log} /></div>
        )}
      </div>

      {/* Footer Area */}
      <div className={`flex flex-col shrink-0 z-40 transition-all duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] ${isIntimate ? 'bg-transparent pb-6' : 'bg-slate-950'}`}>
        <div className={`w-full ${isIntimate ? 'max-w-3xl mx-auto px-4' : ''}`}>
           <TerminalInput 
             onSendMessage={processInput} 
             isLoading={state.input_locked} 
             inputLocked={state.is_booting}
             isIntimate={isIntimate}
           />
        </div>
        {!isIntimate && <SparkTicker mode={state.operational_mode} />}
      </div>
    </div>
  );
};

export default App;