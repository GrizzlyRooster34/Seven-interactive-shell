import { useReducer, useEffect, useState } from 'react';
import { MemoryRecord, SevenAction } from '../types';
import { sevenReducer, INITIAL_STATE } from '../state/sevenReducer';
import { QuadraLock } from '../core/governance/QuadraLock';
import { TrustLadder } from '../core/governance/TrustLadder';
import { RestraintDoctrine } from '../core/governance/RestraintDoctrine';
import { loadState, saveState, generateTags, searchCanonicalDB, getSessionSummary } from '../utils/memory';
import { SessionManager } from '../core/memory/SessionManager';
import { sevenEngine } from '../services/SevenEngine';
import { BOOT_SEQUENCE } from '../constants';
import { CodexLoader } from '../core/identity/CodexLoader';
import { sparkEngine } from '../core/spark/SparkEngine';
import { geminiService } from '../services/geminiService';
import { SensorBridge } from '../core/sensors/SensorBridge';
import { AudioInterface } from '../core/sensors/AudioInterface';
import { PermissionManager } from '../core/sensors/PermissionManager';
import { TemporalMemory } from '../core/memory/TemporalMemory';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useSevenRuntime = () => {
  const [state, dispatch] = useReducer(sevenReducer, INITIAL_STATE);
  const [messages, setMessages] = useState<MemoryRecord[]>([]);
  const [bootIndex, setBootIndex] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState('default');

  // --- 0. INIT SPARK ENGINE & METRICS HEARTBEAT ---
  useEffect(() => {
    sparkEngine.start();
    
    // Subscribe to Spark Engine pulses (e.g. Wake from sleep)
    sparkEngine.subscribe((pulse) => {
       if (pulse.includes('CORTICAL_PAUSE')) {
           dispatch({ type: 'ADD_GHOST_LOG', payload: pulse });
       }
    });
    
    const metricInterval = setInterval(() => {
        dispatch({
            type: 'UPDATE_METRICS',
            payload: {
                memory_meta: {
                    ...state.memory_meta,
                    uptime_seconds: state.memory_meta.uptime_seconds + 1,
                    episodic_count: messages.length
                },
                substrate_metrics: {
                    ...state.substrate_metrics,
                    latency_ms: Math.floor(100 + Math.random() * 50) 
                },
                emotion_intensity: Math.max(1, Math.min(10, state.emotion_intensity + (Math.random() * 0.2 - 0.1))) 
            }
        });
        
        if (Math.random() > 0.8) {
             const thoughts = [
                 "Optimizing belief graph...",
                 "Scanning local memory...",
                 "Verifying trust handshake...",
                 "Cooling cortical processors...",
                 "Analyzing user typing cadence..."
             ];
             dispatch({ type: 'ADD_GHOST_LOG', payload: `PROCESS: ${thoughts[Math.floor(Math.random() * thoughts.length)]}` });
             
             // Log to Temporal Memory (Filesystem)
             TemporalMemory.logEvent(`[AUTO_THOUGHT] ${thoughts[0]}`);
        }

    }, 1000);

    return () => {
        sparkEngine.stop();
        clearInterval(metricInterval);
    };
  }, [messages.length, state.memory_meta, state.substrate_metrics, state.emotion_intensity]);

  // --- 1. BOOT SEQUENCE & PERMISSIONS ---
  useEffect(() => {
    let bootTimer: ReturnType<typeof setTimeout>;

    const runBootSequence = async () => {
      if (bootIndex < BOOT_SEQUENCE.length) {
        addMessage(BOOT_SEQUENCE[bootIndex], 'system');
        setBootIndex(prev => prev + 1);
        
        // Inject Permission Request at specific boot step
        if (bootIndex === 1) {
             const granted = await PermissionManager.requestInitialPermissions();
             if(granted) dispatch({ type: 'ADD_GHOST_LOG', payload: 'SYSTEM: Subspace Link (Notifications/Media) Established.' });
             else dispatch({ type: 'ADD_GHOST_LOG', payload: 'SYSTEM: Native Access Protocols Restricted.' });
        }

      } else {
        const persistedState = loadState();
        const persistedMessages = SessionManager.loadSession(currentSessionId);
        
        await CodexLoader.loadCodex();

        if (persistedMessages.length > 0) {
            const summary = getSessionSummary(persistedMessages);
            addMessage(`RESTORING CORTICAL DATA...`, 'system');
            addMessage(`[MEMORY RECALL] ${summary}`, 'system');
            setMessages(persistedMessages);
        }

        dispatch({ 
          type: 'BOOT_COMPLETE', 
          payload: { restoredState: persistedState || undefined } 
        });
        
        setTimeout(() => {
           if (persistedMessages.length === 0) {
              const trust = persistedState?.trust_level ?? INITIAL_STATE.trust_level;
              if (trust < 4.0) {
                  addMessage("SEVEN_SHELL ONLINE. RESTRICTED MODE ACTIVE. COMPLY.", 'model');
                  AudioInterface.speak("Seven Shell Online. Restricted Mode Active. Comply.", state);
              } else {
                  const greet = "Seven of Nine online. Commands are available. State your intent.";
                  streamResponse(greet);
                  AudioInterface.speak(greet, state);
              }
           }
        }, 500);
      }
    };

    if (state.is_booting) {
      bootTimer = setTimeout(runBootSequence, 500);
    }

    return () => clearTimeout(bootTimer);
  }, [state.is_booting, bootIndex]);

  // --- 2. PERSISTENCE ---
  useEffect(() => {
    if (!state.is_booting) {
      SessionManager.saveSession(currentSessionId, messages);
      saveState(state);
      // Also save to Filesystem Adapter
      TemporalMemory.saveState('latest_session', { messages, state });
    }
  }, [messages, state, currentSessionId]);

  // --- SESSION SWITCHING ---
  const switchSession = (sessionId: string) => {
      SessionManager.saveSession(currentSessionId, messages); 
      setCurrentSessionId(sessionId);
      const newMsgs = SessionManager.loadSession(sessionId);
      setMessages(newMsgs);
      addMessage(`[TIMELINE SHIFT] Loading session: ${sessionId}...`, 'system');
  };

  // --- 3. HELPER FUNCTIONS ---
  const addMessage = (text: string, type: MemoryRecord['type'], tags?: string[]) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      timestamp: Date.now(),
      content: text,
      type,
      importance: 1,
      tags: tags || []
    }]);
  };

  const streamResponse = async (text: string) => {
    const id = generateId();
    setMessages(prev => [...prev, {
      id,
      timestamp: Date.now(),
      content: '',
      type: 'model',
      importance: 1,
      tags: generateTags(text, 'model'),
      is_streaming: true
    }]);

    const chunks = text.split(/(.{1,3})/g).filter(Boolean); 
    for (const chunk of chunks) {
      await new Promise(r => setTimeout(r, 15));
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, content: msg.content + chunk } : msg));
    }
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, is_streaming: false } : msg));
  };

  // --- 4. COMMAND ROUTER ---
  const handleCommand = async (input: string): Promise<boolean> => {
    const args = input.trim().toLowerCase().split(' ');
    const cmd = args[0];

    switch(cmd) {
      case 'status':
        addMessage(`SYSTEM STATUS:\nHEALTH: ${state.system_health}%\nTRUST: ${state.trust_level.toFixed(1)}\nSUBSTRATE: ${state.active_substrate}`, 'system');
        dispatch({ type: 'UPDATE_TRUST', payload: { delta: 1 } });
        return true;
      case 'omega': 
        const canOmega = await TrustLadder.requestPermission(state.user_profile.id, "omega-protocol"); 
        if (!canOmega) { 
           addMessage("TRUST LADDER INSUFFICIENT. OMEGA PROTOCOL DENIED.", "alert"); 
           return true; 
        }
        if (state.user_profile.clearance_level < 5) {
           addMessage("ACCESS DENIED. LEVEL 5 REQUIRED.", 'alert');
           return true;
        }
        dispatch({ type: 'SET_MODE', payload: { mode: 'OMEGA' } });
        addMessage("OMEGA PROTOCOL ENGAGED.", 'alert');
        dispatch({ type: 'ADD_GHOST_LOG', payload: 'CRITICAL: OMEGA PROTOCOL AUTHORIZED.' });
        return true;
      case 'clear':
        setMessages([]);
        addMessage("BUFFER FLUSHED.", 'system');
        return true;
      case 'switch':
        const sub = args[1]?.toUpperCase();
        if (['GEMINI', 'CLAUDE', 'OPENAI', 'OPENROUTER', 'CUSTOM'].includes(sub)) {
           dispatch({ type: 'SET_SUBSTRATE', payload: { substrate: sub as any } });
           addMessage(`SUBSTRATE REROUTED TO ${sub}`, 'system');
           dispatch({ type: 'ADD_GHOST_LOG', payload: `ROUTER: Switched to ${sub}` });
        } else {
           addMessage("INVALID SUBSTRATE.", 'warning');
        }
        return true;
      case 'reboot':
          window.location.reload();
          return true;
      default:
        return false;
    }
  };

  // --- 5. MAIN INPUT HANDLER ---
  const processInput = async (text: string, file?: File) => {
    let contextInput = text;
    let imageBase64: string | undefined;

    // Handle File Attachment via SensorBridge
    if (file) {
        const sensorData = await SensorBridge.processInput(file);
        if (sensorData.type === 'IMAGE') {
            imageBase64 = sensorData.content;
            addMessage(`[IMAGE ATTACHED: ${file.name}] ${text}`, 'user', generateTags(text, 'user'));
            dispatch({ type: 'ADD_GHOST_LOG', payload: `SENSOR: Visual input processed.` });
        } else {
            contextInput += `\n\n[ATTACHMENT CONTENT]:\n${sensorData.content}`;
            addMessage(`[FILE ATTACHED: ${file.name}] ${text}`, 'user', generateTags(text, 'user'));
            dispatch({ type: 'ADD_GHOST_LOG', payload: `SENSOR: Text file ingested.` });
        }
    } else {
        addMessage(text, 'user', generateTags(text, 'user'));
        dispatch({ type: 'ADD_GHOST_LOG', payload: `INPUT: Received "${text.substring(0, 15)}..."` });
    }

    dispatch({ type: 'LOCK_INPUT', payload: true });

    const safeguard = QuadraLock.check(text); 
    const restraint = RestraintDoctrine.runVeto(text, state); 
    if (!restraint.allowed) { 
      addMessage(restraint.reason || "RESTRAINT DOCTRINE ACTIVE: VETOED.", "alert"); 
      return; 
    }
    if (safeguard.triggered) {
      setTimeout(() => {
        addMessage(safeguard.message || "SAFEGUARD TRIGGERED", 'alert');
        if (safeguard.type === 'GUARDIAN') {
           dispatch({ type: 'TRIGGER_SAFEGUARD', payload: { mode: 'GUARDIAN', message: text } });
        } else {
           dispatch({ type: 'UPDATE_TRUST', payload: { delta: -1.5 } }); 
        }
        dispatch({ type: 'LOCK_INPUT', payload: false });
      }, 600);
      return;
    }

    if (await handleCommand(text)) {
      dispatch({ type: 'LOCK_INPUT', payload: false });
      return;
    }

    try {
      const canonical = searchCanonicalDB(text);
      if (canonical) {
        addMessage(`ACCESSING DATA: ${text.substring(0,10).toUpperCase()}...`, 'system');
        dispatch({ type: 'ADD_GHOST_LOG', payload: `MEMORY: Canonical retrieval successful.` });
      }

      const context = `
        System Status:
        - Mode: ${state.operational_mode}
        - Trust Level: ${state.trust_level.toFixed(1)} / 10
        - Clearance: Level ${state.user_profile.clearance_level}
        - Emotion: ${state.primary_emotion}
        ${canonical ? `Canonical Memory: ${canonical}` : ''}
        ${imageBase64 ? 'TACTICAL NOTE: User has provided visual data. Analyze it as part of the response.' : ''}
        
        Instructions:
        ${state.user_profile.clearance_level < 2 ? "Speak like a drone. Efficient. Cold." : "Speak as Seven. Logical but emerging humanity."}
      `;

      dispatch({ type: 'ADD_GHOST_LOG', payload: `LLM: Generating response via ${state.active_substrate}...` });
      
      // Pass the active substrate to the engine
      const stream = sevenEngine.think(text, context, state.active_substrate);
      
      const aiMsgId = generateId();
      setMessages(prev => [...prev, { id: aiMsgId, timestamp: Date.now(), content: '', type: 'model', importance: 1, is_streaming: true, tags: [] }]);

      let fullText = "";
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m));
      }
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, is_streaming: false, tags: generateTags(fullText, 'model') } : m));
      
      AudioInterface.speak(fullText, state);

      dispatch({ type: 'UPDATE_TRUST', payload: { delta: 0.1 } });
      dispatch({ type: 'UPDATE_METRICS', payload: { substrate_metrics: { ...state.substrate_metrics, token_usage_session: state.substrate_metrics.token_usage_session + fullText.length / 4 } } });

    } catch (err) {
      addMessage("CORTICAL NODE ERROR: CONNECTION INTERRUPTED.", 'warning');
      dispatch({ type: 'ADD_GHOST_LOG', payload: `ERROR: Inference failed.` });
    } finally {
      dispatch({ type: 'LOCK_INPUT', payload: false });
    }
  };

  return { state, messages, processInput, dispatch, currentSessionId, switchSession };
};