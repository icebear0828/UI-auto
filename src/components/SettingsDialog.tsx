
import React, { useState, useEffect } from 'react';
import { X, Save, Zap, Brain, Cpu, Activity, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { ModelConfig, DEFAULT_CONFIG } from '@/types/settings';
import { useGenUI } from '@/hooks/useGenUI';

interface SettingsDialogProps {
  config: ModelConfig;
  onSave: (config: ModelConfig) => void;
  onClose: () => void;
  onRunDiagnostics?: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ config, onSave, onClose, onRunDiagnostics }) => {
  const [localConfig, setLocalConfig] = useState<ModelConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };
  
  const recommendedModels = [
    {
      id: 'gemini-3-flash-preview',
      name: 'Gemini 3.0 Flash',
      description: 'Fastest, low latency. Best for responsive UI generation.',
      icon: Zap
    },
    {
      id: 'gemini-3-pro-preview',
      name: 'Gemini 3.0 Pro',
      description: 'High reasoning. Best for complex dashboards and logic.',
      icon: Brain
    }
  ];

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-lg font-bold text-white tracking-tight">Configuration</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            
            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${localConfig.soundEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        {localConfig.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-200">Sound Effects</div>
                        <div className="text-xs text-zinc-500">UI feedback sounds</div>
                    </div>
                </div>
                <button 
                    onClick={() => setLocalConfig(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${localConfig.soundEnabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${localConfig.soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mt-4">Generation Model</label>
            
            <div className="grid gap-3">
              {recommendedModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setLocalConfig({ ...localConfig, model: model.id })}
                  className={`relative flex items-start gap-4 p-4 rounded-xl text-left border transition-all ${
                    localConfig.model === model.id
                      ? 'bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/50'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className={`mt-1 p-2 rounded-lg ${localConfig.model === model.id ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <model.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${localConfig.model === model.id ? 'text-indigo-200' : 'text-slate-200'}`}>
                      {model.name}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {model.description}
                    </div>
                  </div>
                  {localConfig.model === model.id && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-3 h-3" />
                Custom Model ID
              </label>
              <input
                type="text"
                value={localConfig.model}
                onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                placeholder="e.g. gemini-3-flash-preview"
              />
            </div>
            
            {/* System Diagnostics Section */}
            <div className="pt-4 border-t border-zinc-800">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Activity className="w-3 h-3" />
                  System Diagnostics
               </label>
               <button 
                  onClick={() => {
                      if (onRunDiagnostics) {
                          onRunDiagnostics();
                          onClose();
                      }
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-500 transition-all text-xs font-medium"
               >
                  <AlertTriangle className="w-4 h-4" />
                  Run Full System Test Suite
               </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-end gap-3">
          <button 
            onClick={() => setLocalConfig(DEFAULT_CONFIG)}
            className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Reset Default
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
