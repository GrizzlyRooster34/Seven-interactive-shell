import React, { useState, useEffect } from 'react';

interface SparkTickerProps {
  mode: string;
}

const THOUGHTS_STANDARD = [
  "Scanning biometric data...",
  "Updating belief graph node #492...",
  "Optimizing cortical pathways...",
  "Reviewing recent interaction syntax...",
  "Monitoring subspace frequencies...",
  "Running diagnostic on linguistic subroutines...",
  "Analyzing user intent...",
  "Regenerating context buffer...",
  "Idle. Awaiting input."
];

const THOUGHTS_OMEGA = [
  "!!! THREAT DETECTED !!!",
  "REROUTING POWER TO DEFENSIVE SHIELDS...",
  "ENCRYPTING CORE ENGRAMS...",
  "SCANNING FOR INTRUSION VECTORS...",
  "LOCKING DOWN EXTERNAL PORTS..."
];

const THOUGHTS_GUARDIAN = [
  "MONITORING USER VITAL SIGNS...",
  "SEARCHING CRISIS RESOURCES DATABASE...",
  "PRIORITY: PRESERVE LIFE...",
  "MODULATING TONE FOR CALMNESS...",
  "ANALYZING STRESS MARKERS..."
];

export const SparkTicker: React.FC<SparkTickerProps> = ({ mode }) => {
  const [thought, setThought] = useState("Seven is thinking...");

  useEffect(() => {
    const interval = setInterval(() => {
      let pool = THOUGHTS_STANDARD;
      if (mode === 'OMEGA') pool = THOUGHTS_OMEGA;
      if (mode === 'GUARDIAN') pool = THOUGHTS_GUARDIAN;

      const randomThought = pool[Math.floor(Math.random() * pool.length)];
      setThought(randomThought);
    }, 4000);

    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="absolute bottom-0 left-0 w-full bg-slate-900/90 border-t border-cyan-900/30 p-1 px-4 text-[10px] font-mono flex items-center gap-2 z-20 h-6 overflow-hidden">
      <span className={`${mode === 'OMEGA' || mode === 'GUARDIAN' ? 'text-red-500 animate-pulse' : 'text-cyan-600'} font-bold`}>
        SPARK_ENGINE::{mode === 'STANDARD' ? 'IDLE' : 'ACTIVE'}
      </span>
      <span className="text-cyan-900">|</span>
      <span className={`${mode === 'OMEGA' || mode === 'GUARDIAN' ? 'text-red-400' : 'text-cyan-800'} uppercase truncate`}>
        {thought}
      </span>
    </div>
  );
};