import React, { useState, useEffect, useRef } from 'react';

interface TraceLogProps {
  logs: string[];
}

type FilterType = 'ALL' | 'SENSE' | 'INTENTION' | 'ACT' | 'RAILS';

export const TraceLog: React.FC<TraceLogProps> = ({ logs }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, filter]);

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.includes(filter);
  });

  const formatLogContent = (text: string) => {
    // Regex for specific keywords to colorize
    const parts = text.split(/(\[SENSE\]|\[BELIEF\]|\[ACT\]|\[RAILS\]|\[.*?\])/g);
    
    return parts.map((part, index) => {
        if (part === '[SENSE]') return <span key={index} className="text-cyan-400 font-bold">{part}</span>;
        if (part === '[BELIEF]') return <span key={index} className="text-purple-400 font-bold">{part}</span>;
        if (part === '[ACT]') return <span key={index} className="text-emerald-400 font-bold">{part}</span>;
        if (part === '[RAILS]') return <span key={index} className="text-red-500 font-bold">{part}</span>;
        if (part.startsWith('[') && part.endsWith(']')) return <span key={index} className="opacity-60">{part}</span>;
        return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/50 rounded-lg overflow-hidden border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/20">
        <div className="flex flex-col">
            <h2 className="text-sm font-bold text-cyan-500 tracking-wider">TRACE_LOG</h2>
        </div>
        
        {/* Filters */}
        <div className="flex gap-1">
          {(['ALL', 'SENSE', 'ACT', 'RAILS'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 border text-[9px] font-bold transition-all ${
                filter === f 
                  ? 'bg-cyan-900 text-cyan-100 border-cyan-400' 
                  : 'bg-transparent text-cyan-700 border-cyan-900/30 hover:border-cyan-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 p-2 font-mono text-[10px]"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center text-cyan-900 italic mt-10">No data.</div>
        ) : (
          filteredLogs.map((log, i) => {
             const isSense = log.includes('SENSE') || log.includes('INPUT');
             const isAct = log.includes('ACT') || log.includes('LLM');
             const isRails = log.includes('RAILS') || log.includes('SAFEGUARD');
             
             let borderColor = 'border-l-gray-700';
             
             if (isSense) borderColor = 'border-l-cyan-500';
             if (isAct) borderColor = 'border-l-emerald-500';
             if (isRails) borderColor = 'border-l-red-500';

             return (
               <div key={i} className={`pl-2 border-l-2 ${borderColor} py-0.5 hover:bg-white/5 transition-colors leading-tight`}>
                 <span className="opacity-30 mr-2 text-[9px]">{new Date().toLocaleTimeString()}</span>
                 <span className="text-gray-300">{formatLogContent(log)}</span>
               </div>
             );
          })
        )}
      </div>
    </div>
  );
};