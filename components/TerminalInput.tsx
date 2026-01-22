import React, { useState, useRef, useEffect } from 'react';
import { AudioInterface } from '../core/sensors/AudioInterface';

interface TerminalInputProps {
  onSendMessage: (text: string, file?: File) => void;
  isLoading: boolean;
  inputLocked: boolean;
  isIntimate?: boolean;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({ onSendMessage, isLoading, inputLocked, isIntimate }) => {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputLocked && !isLoading) {
      inputRef.current?.focus();
    }
  }, [inputLocked, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
      if ((input.trim() || selectedFile) && !isLoading && !inputLocked) {
        onSendMessage(input.trim(), selectedFile || undefined);
        setInput('');
        setSelectedFile(null);
      }
  };

  const handleMicClick = () => {
      if (isListening) return;
      setIsListening(true);
      AudioInterface.listen(
          (text) => {
              setInput(prev => prev + ' ' + text);
              setIsListening(false);
          },
          (err) => {
              console.error(err);
              setIsListening(false);
          }
      );
  };

  const containerClass = isIntimate 
    ? 'bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md' 
    : 'bg-slate-950/90 border-t border-cyan-900/50 rounded-none';

  return (
    <div className={`p-4 flex flex-col gap-2 relative z-10 transition-all duration-500 ${containerClass}`}>
      
      {/* PROCESSING STATE INDICATOR */}
      {(isLoading || selectedFile) && (
        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
            <div className={`h-full ${isIntimate ? 'bg-violet-500' : 'bg-cyan-500'} animate-linear-progress opacity-50`}></div>
        </div>
      )}

      {selectedFile && (
          <div className={`flex items-center gap-2 text-xs px-2 py-1 w-fit animate-in fade-in slide-in-from-bottom-1 ${isIntimate ? 'text-violet-200 bg-violet-900/30 rounded-lg' : 'text-cyan-400 bg-cyan-900/20 rounded'}`}>
              <span className="animate-pulse">Scanning Data stream...</span>
              <span>📎 {selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)} className="text-red-400 hover:text-red-300 ml-2">×</button>
          </div>
      )}

      <div className="flex items-center gap-3">
        <span className={`${isIntimate ? 'text-violet-400 font-sans' : 'text-cyan-500 font-mono'} font-bold select-none shrink-0 tracking-tighter transition-colors`}>
            {isIntimate ? 'Seven' : 'SEVEN>'}
        </span>
        
        <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || inputLocked}
            className={`w-full bg-transparent border-none outline-none text-lg placeholder-opacity-40 ${isIntimate ? 'font-sans text-violet-100 placeholder-violet-300/30' : 'font-mono text-cyan-100 placeholder-cyan-900/40'}`}
            placeholder={inputLocked ? "INITIALIZING..." : isLoading ? "PROCESSING..." : isListening ? "LISTENING..." : "Enter message..."}
            autoComplete="off"
            spellCheck="false"
        />

        {/* Tools */}
        <div className="flex gap-3 shrink-0 items-center">
             {/* File Upload */}
            <button 
                onClick={() => fileInputRef.current?.click()}
                className={`${isIntimate ? 'text-violet-300 hover:text-white' : 'text-cyan-700 hover:text-cyan-400'} transition-colors disabled:opacity-50`}
                disabled={isLoading}
                title="Attach File/Image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
            />

            {/* Microphone - SENSOR FEEDBACK LOOP */}
            <button 
                onClick={handleMicClick}
                className={`
                    relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                    ${isListening 
                        ? (isIntimate ? 'bg-violet-500/20 text-violet-300' : 'bg-red-900/20 text-red-500') 
                        : (isIntimate ? 'text-violet-300 hover:text-white' : 'text-cyan-700 hover:text-cyan-400')}
                    disabled:opacity-50
                `}
                disabled={isLoading}
                title="Voice Input"
            >
                {isListening && (
                    <span className={`absolute inset-0 rounded-full animate-ping ${isIntimate ? 'bg-violet-400' : 'bg-red-500'} opacity-30`}></span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </button>
            
            {/* Send */}
            <button 
                onClick={handleSubmit}
                className={`${isIntimate ? 'text-violet-300 hover:text-white' : 'text-cyan-700 hover:text-cyan-400'} transition-colors disabled:opacity-50`}
                disabled={isLoading || (!input && !selectedFile)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
        </div>
      </div>
    </div>
  );
};