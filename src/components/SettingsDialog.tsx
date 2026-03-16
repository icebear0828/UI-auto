
import React, { useState, useEffect } from 'react';
import { X, Save, Zap, Brain, Activity, AlertTriangle, Volume2, VolumeX, Eye, EyeOff, Cpu, Image } from 'lucide-react';
import { ModelConfig, DEFAULT_CONFIG, DEFAULT_MODELS, ProviderType } from '@/types/settings';

interface SettingsDialogProps {
  config: ModelConfig;
  onSave: (config: ModelConfig) => void;
  onClose: () => void;
  onRunDiagnostics?: () => void;
}

const PROVIDER_MODELS: Record<ProviderType, { id: string; name: string; description: string; icon: React.FC<{ className?: string }> }[]> = {
  gemini: [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash', description: 'Fastest, low latency', icon: Zap },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', description: 'High reasoning', icon: Brain },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal, fast', icon: Zap },
    { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Latest reasoning model', icon: Brain },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Fast, balanced', icon: Zap },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most capable', icon: Brain },
  ],
};

const PROVIDER_LABELS: Record<ProviderType, string> = {
  gemini: 'Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
};

const ENV_KEY_NAMES: Record<ProviderType, string> = {
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
};

function hasEnvKey(provider: ProviderType): boolean {
  switch (provider) {
    case 'gemini': return !!process.env.GEMINI_API_KEY;
    case 'openai': return !!process.env.OPENAI_API_KEY;
    case 'anthropic': return !!process.env.ANTHROPIC_API_KEY;
  }
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ config, onSave, onClose, onRunDiagnostics }) => {
  const [localConfig, setLocalConfig] = useState<ModelConfig>(config);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const handleProviderSwitch = (provider: ProviderType) => {
    setLocalConfig(prev => ({
      ...prev,
      provider,
      model: prev.providers[provider].apiKey || hasEnvKey(provider)
        ? (PROVIDER_MODELS[provider][0]?.id ?? DEFAULT_MODELS[provider])
        : DEFAULT_MODELS[provider],
    }));
    setShowApiKey(false);
  };

  const currentProvider = localConfig.provider;
  const currentProviderConfig = localConfig.providers[currentProvider];
  const models = PROVIDER_MODELS[currentProvider];

  const updateProviderConfig = (field: 'apiKey' | 'baseUrl', value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [currentProvider]: { ...prev.providers[currentProvider], [field]: value },
      },
    }));
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" data-testid="settings-dialog">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-lg font-bold text-white tracking-tight">Configuration</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800" data-testid="settings-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">

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
              data-testid="settings-sound-toggle"
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${localConfig.soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Provider Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-3">Provider</label>
            <div className="flex gap-2">
              {(['gemini', 'openai', 'anthropic'] as ProviderType[]).map(p => (
                <button
                  key={p}
                  onClick={() => handleProviderSwitch(p)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    currentProvider === p
                      ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-200 ring-1 ring-indigo-500/50'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                  data-testid={`provider-${p}`}
                >
                  {PROVIDER_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={currentProviderConfig.apiKey}
                onChange={e => updateProviderConfig('apiKey', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                placeholder={hasEnvKey(currentProvider) ? `Using .env.local (${ENV_KEY_NAMES[currentProvider]})` : `Enter ${PROVIDER_LABELS[currentProvider]} API key`}
                data-testid="settings-api-key"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Base URL (optional)</label>
            <input
              type="text"
              value={currentProviderConfig.baseUrl}
              onChange={e => updateProviderConfig('baseUrl', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
              placeholder="Default (leave empty for official API)"
              data-testid="settings-base-url"
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-3">Model</label>
            <div className="grid gap-3">
              {models.map(m => (
                <button
                  key={m.id}
                  onClick={() => setLocalConfig(prev => ({ ...prev, model: m.id }))}
                  className={`relative flex items-start gap-4 p-4 rounded-xl text-left border transition-all ${
                    localConfig.model === m.id
                      ? 'bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/50'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className={`mt-1 p-2 rounded-lg ${localConfig.model === m.id ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <m.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${localConfig.model === m.id ? 'text-indigo-200' : 'text-slate-200'}`}>{m.name}</div>
                    <div className="text-xs text-zinc-500 mt-1">{m.description}</div>
                  </div>
                  {localConfig.model === m.id && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-3 h-3" />
                Custom Model ID
              </label>
              <input
                type="text"
                value={localConfig.model}
                onChange={e => setLocalConfig(prev => ({ ...prev, model: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                placeholder={`e.g. ${DEFAULT_MODELS[currentProvider]}`}
                data-testid="settings-model-input"
              />
            </div>
          </div>

          {/* Image Provider */}
          <div className="pt-4 border-t border-zinc-800">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Image className="w-3 h-3" />
              Image Generation (Optional)
            </label>
            <p className="text-[11px] text-zinc-600 mb-3">OpenAI-compatible endpoint. Leave empty to use Pollinations (free).</p>
            <div className="space-y-3">
              <input
                type="text"
                value={localConfig.imageProvider?.baseUrl ?? ''}
                onChange={e => setLocalConfig(prev => ({
                  ...prev,
                  imageProvider: { ...prev.imageProvider, baseUrl: e.target.value },
                }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                placeholder="Base URL, e.g. http://192.168.10.4:7860/v1"
                data-testid="settings-image-base-url"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localConfig.imageProvider?.model ?? ''}
                  onChange={e => setLocalConfig(prev => ({
                    ...prev,
                    imageProvider: { ...prev.imageProvider, model: e.target.value },
                  }))}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  placeholder="Model (optional)"
                  data-testid="settings-image-model"
                />
                <input
                  type="password"
                  value={localConfig.imageProvider?.apiKey ?? ''}
                  onChange={e => setLocalConfig(prev => ({
                    ...prev,
                    imageProvider: { ...prev.imageProvider, apiKey: e.target.value },
                  }))}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  placeholder="API Key (optional)"
                  data-testid="settings-image-api-key"
                />
              </div>
            </div>
          </div>

          {/* System Diagnostics */}
          <div className="pt-4 border-t border-zinc-800">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Activity className="w-3 h-3" />
              System Diagnostics
            </label>
            <button
              onClick={() => { if (onRunDiagnostics) { onRunDiagnostics(); onClose(); } }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-500 transition-all text-xs font-medium"
              data-testid="run-diagnostics"
            >
              <AlertTriangle className="w-4 h-4" />
              Run Full System Test Suite
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={() => setLocalConfig(DEFAULT_CONFIG)}
            className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            data-testid="settings-reset"
          >
            Reset Default
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
            data-testid="settings-save"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
