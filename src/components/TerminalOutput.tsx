import React, { useEffect, useRef } from 'react';
import { MemoryRecord } from '../types';

interface TerminalOutputProps {
  messages: MemoryRecord[];
}

const formatContent = (text: string) => {
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const content = part.slice(3, -3);
      const firstNewLine = content.indexOf('\n');
      let code = content;
      let language = '';
      
      if (firstNewLine > -1) {
        language = content.slice(0, firstNewLine).trim();
        code = content.slice(firstNewLine + 1);
      }

      return (
        <div key={index} className="my-3 border border-cyan-900 bg-slate-950/80 rounded overflow-hidden">
          {language && (
            <div className="bg-cyan-950/50 px-3 py-1 text-xs text-cyan-400 font-bold uppercase border-b border-cyan-900/50">
              {language}
            </div>
          )}
          <pre className="p-4 overflow-x-auto text-sm text-cyan-200 font-mono">
            <code>{code}</code>
          </pre>
        </div>
      );
    }
    const inlineParts = part.split(/(`[^`]+`)/g);
    return (
      <span key={index} className="whitespace-pre-wrap leading-relaxed">
        {inlineParts.map((subPart, subIndex) => {
          if (subPart.startsWith('`') && subPart.endsWith('`')) {
            return (
              <span key={subIndex} className="bg-cyan-900/30 text-cyan-200 px-1.5 py-0.5 rounded text-sm mx-1 border border-cyan-900/50">
                {subPart.slice(1, -1)}
              </span>
            );
          }
          return subPart;
        })}
      </span>
    );
  });
};

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ messages }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getRoleStyles = (type: MemoryRecord['type']) => {
    switch (type) {
      case 'user':
        return 'text-yellow-100/90 self-end border-r-2 border-yellow-500/50 pr-4 bg-yellow-900/10';
      case 'model':
        return 'text-cyan-400 glow-seven self-start';
      case 'system':
        return 'text-green-500 self-start font-bold uppercase text-xs tracking-widest my-1';
      case 'alert':
        return 'text-red-500 glow-alert self-start font-bold border-l-4 border-red-600 pl-2 bg-red-950/20 w-full';
      case 'warning':
        return 'text-yellow-400 self-start border-l-4 border-yellow-600 pl-2 bg-yellow-950/20 w-full';
      default:
        return 'text-gray-400 self-start';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex flex-col max-w-[95%] md:max-w-[85%] ${
             msg.type === 'user' ? 'items-end' : 'items-start'
          }`}
        > 
          <div className={`px-4 py-2 ${getRoleStyles(msg.type)}`}>
            {msg.type === 'user' && (
               <div className="text-[10px] text-yellow-500/50 uppercase tracking-widest mb-1 text-right">User Input</div>
            )}
            {formatContent(msg.content)}
            {msg.is_streaming && (
              <span className="inline-block w-2 h-4 ml-1 align-middle bg-cyan-500 cursor-blink"></span>
            )}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};