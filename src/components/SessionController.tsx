import React, { useState, useEffect } from 'react';
import { SessionManager, SessionMeta } from '../core/memory/SessionManager';

interface SessionControllerProps {
  currentSessionId: string;
  onSwitchSession: (id: string) => void;
}

export const SessionController: React.FC<SessionControllerProps> = ({ currentSessionId, onSwitchSession }) => {
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [newSessionName, setNewSessionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setSessions(SessionManager.listSessions());
  }, [currentSessionId]);

  const handleCreate = () => {
    if (!newSessionName.trim()) return;
    const id = SessionManager.createSession(newSessionName);
    onSwitchSession(id);
    setNewSessionName('');
    setIsCreating(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this timeline?')) {
        SessionManager.deleteSession(id);
        setSessions(SessionManager.listSessions());
        if (currentSessionId === id) onSwitchSession('default');
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-900/50 border border-cyan-900/30 rounded-lg">
      <div className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest border-b border-cyan-900/30 pb-1 mb-1 flex justify-between">
        <span>Timeline Select</span>
        <button onClick={() => setIsCreating(!isCreating)} className="text-cyan-400 hover:text-white">+</button>
      </div>

      {isCreating && (
        <div className="flex gap-1 mb-2">
            <input 
                className="bg-slate-950 text-xs px-1 border border-cyan-900/50 flex-1 outline-none text-cyan-200"
                placeholder="SESSION NAME"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
            />
            <button onClick={handleCreate} className="text-[10px] bg-cyan-900 px-2 text-white">OK</button>
        </div>
      )}

      <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
        {sessions.map(s => (
          <button
            key={s.id}
            onClick={() => onSwitchSession(s.id)}
            className={`
              px-2 py-1 text-[10px] font-mono border text-left flex justify-between items-center group
              ${currentSessionId === s.id 
                ? 'bg-amber-900/20 text-amber-400 border-amber-500/50' 
                : 'bg-slate-950 text-cyan-800 border-cyan-900/20 hover:border-cyan-700'}
            `}
          >
            <span className="truncate max-w-[120px]">{s.name}</span>
            {s.id !== 'default' && (
                <span onClick={(e) => handleDelete(e, s.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 px-1">×</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};