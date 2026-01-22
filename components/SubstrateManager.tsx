import React, { useState, useEffect } from 'react';
import { SevenState } from '../types';
import { ModelRouter } from '../core/substrate/ModelRouter';

interface SubstrateManagerProps {
  currentSubstrate: SevenState['active_substrate'];
  onSetSubstrate: (sub: SevenState['active_substrate']) => void;
}

type ProviderType = 'GEMINI' | 'CLAUDE' | 'OPENAI' | 'OPENROUTER' | 'CUSTOM' | 'LOCAL';

interface Profile {
  id: string;
  name: string;
  provider: ProviderType;
  config: any;
}

const DEFAULT_MODELS: Record<string, string[]> = {
  'OPENAI': ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  'OPENROUTER': ['anthropic/claude-3.5-sonnet', 'google/gemini-flash-1.5', 'meta-llama/llama-3-70b-instruct'],
  'CUSTOM': ['local-model-v1', 'llama-3-8b'],
  'CLAUDE': ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  'LOCAL': ['llama3', 'mistral', 'neural-chat', 'gemma:7b']
};

export const SubstrateManager: React.FC<SubstrateManagerProps> = ({ currentSubstrate, onSetSubstrate }) => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>(currentSubstrate as ProviderType);
  
  // Configuration State
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('http://localhost:1234/v1');
  const [selectedModel, setSelectedModel] = useState('');
  
  // Model List
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  // Profiles
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Load initial settings on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('seven_substrate_profiles');
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    }
    
    // Attempt to load current config if available for the current provider
    const lastConfig = localStorage.getItem(`seven_config_${currentSubstrate}`);
    if (lastConfig) {
      const parsed = JSON.parse(lastConfig);
      setApiKey(parsed.apiKey || '');
      setBaseUrl(parsed.baseUrl || '');
      setSelectedModel(parsed.model || '');
    }
  }, [currentSubstrate]);

  // Update models list when provider changes
  useEffect(() => {
    setAvailableModels(DEFAULT_MODELS[selectedProvider] || []);
    if (!selectedModel && DEFAULT_MODELS[selectedProvider]) {
      setSelectedModel(DEFAULT_MODELS[selectedProvider][0]);
    }
    // Set default base URL for Local if selected
    if (selectedProvider === 'LOCAL' && baseUrl === 'http://localhost:1234/v1') {
       setBaseUrl('http://localhost:11434');
    }
  }, [selectedProvider]);

  const handleFetchModels = async () => {
    // Mocking dynamic fetch for now, but in a real app this would use the API Key
    // to query the provider's /models endpoint.
    console.log(`Fetching models for ${selectedProvider} with key ending in ...${apiKey.slice(-4)}`);
    
    // Simulate delay
    setAvailableModels([]);
    setTimeout(() => {
      setAvailableModels(DEFAULT_MODELS[selectedProvider] || ['model-fetch-failed']);
      setSelectedModel(DEFAULT_MODELS[selectedProvider]?.[0] || '');
    }, 800);
  };

  const handleSaveProfile = () => {
    const name = prompt("Enter Profile Name (e.g., 'Creative', 'Cheap'):");
    if (!name) return;

    const newProfile: Profile = {
      id: Date.now().toString(),
      name,
      provider: selectedProvider,
      config: { apiKey, baseUrl, model: selectedModel }
    };
    
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem('seven_substrate_profiles', JSON.stringify(updated));
  };

  const handleLoadProfile = (profile: Profile) => {
    setSelectedProvider(profile.provider);
    setApiKey(profile.config.apiKey || '');
    setBaseUrl(profile.config.baseUrl || '');
    setSelectedModel(profile.config.model || '');
  };

  const handleActivate = () => {
    // 1. Save Config Locally
    const config = { apiKey, baseUrl, model: selectedModel };
    localStorage.setItem(`seven_config_${selectedProvider}`, JSON.stringify(config));

    // 2. Configure Router
    ModelRouter.configureProvider(selectedProvider, config);

    // 3. Dispatch Global State Change
    onSetSubstrate(selectedProvider);
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-slate-900/50 border border-cyan-900/30 rounded-lg">
      <div className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest border-b border-cyan-900/30 pb-1 flex justify-between">
        <span>Cortical Substrate Manager</span>
        <span className="text-cyan-400">{currentSubstrate} ACTIVE</span>
      </div>

      {/* Provider Selector Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {(['GEMINI', 'CLAUDE', 'OPENAI', 'OPENROUTER', 'CUSTOM', 'LOCAL'] as ProviderType[]).map(p => (
          <button
            key={p}
            onClick={() => setSelectedProvider(p)}
            className={`
              px-2 py-1 text-[9px] font-bold border transition-colors whitespace-nowrap
              ${selectedProvider === p 
                ? 'bg-cyan-900/40 text-cyan-100 border-cyan-400' 
                : 'bg-slate-950 text-cyan-700 border-cyan-900/20 hover:text-cyan-400'}
            `}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Configuration Area */}
      <div className="flex flex-col gap-2 p-2 bg-black/20 rounded border border-white/5">
        
        {/* Credentials */}
        {selectedProvider !== 'GEMINI' && (
             <div className="space-y-2">
                {(selectedProvider === 'CUSTOM' || selectedProvider === 'LOCAL') && (
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-cyan-700 uppercase">Base URL</label>
                        <input 
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            className="bg-slate-950 border border-cyan-900/30 text-[10px] p-1 text-cyan-100 outline-none focus:border-cyan-500"
                            placeholder={selectedProvider === 'LOCAL' ? "http://localhost:11434" : "http://localhost:1234/v1"}
                        />
                    </div>
                )}
                
                {selectedProvider !== 'LOCAL' && (
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-cyan-700 uppercase">API Key</label>
                        <input 
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="bg-slate-950 border border-cyan-900/30 text-[10px] p-1 text-cyan-100 outline-none focus:border-cyan-500"
                            placeholder="sk-..."
                        />
                    </div>
                )}
             </div>
        )}

        {/* Model Selection */}
        {selectedProvider !== 'GEMINI' && (
            <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between items-end">
                    <label className="text-[9px] text-cyan-700 uppercase">Model</label>
                    <button onClick={handleFetchModels} className="text-[9px] text-cyan-500 hover:text-white underline">Fetch List</button>
                </div>
                {availableModels.length > 0 ? (
                    <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-slate-950 border border-cyan-900/30 text-[10px] p-1 text-cyan-100 outline-none"
                    >
                        {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                ) : (
                   <div className="text-[9px] text-red-400 italic">No models loaded. {selectedProvider === 'LOCAL' ? 'Check Ollama.' : 'Check Key.'}</div>
                )}
            </div>
        )}

        {/* Action Bar */}
        <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
            <button 
                onClick={handleActivate}
                className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white text-[10px] font-bold py-1.5 rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            >
                ACTIVATE {selectedProvider}
            </button>
            <button 
                onClick={handleSaveProfile}
                className="px-2 bg-slate-800 hover:bg-slate-700 text-cyan-200 text-[10px] py-1.5 rounded-sm border border-cyan-900/30"
                title="Save Profile"
            >
                💾
            </button>
        </div>

      </div>

      {/* Profiles List */}
      {profiles.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-1">
              {profiles.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => handleLoadProfile(p)}
                    className="text-[9px] px-2 py-0.5 bg-slate-900 border border-cyan-900/20 text-cyan-600 hover:bg-slate-800 hover:text-cyan-300 rounded-full"
                  >
                      {p.name}
                  </button>
              ))}
          </div>
      )}

      {selectedProvider === 'GEMINI' && (
          <div className="text-[9px] text-cyan-900 italic p-1">
              Using internal Google GenAI SDK configuration.
          </div>
      )}

    </div>
  );
};