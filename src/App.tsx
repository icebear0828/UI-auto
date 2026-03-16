/**
 * App Component - Application Entry Point
 * 
 * Clean Architecture: Presentation layer - minimal orchestration
 * Refactored to delegate UI concerns to extracted workspace components.
 */

import React, { useState, useEffect } from 'react';
import { PanelLeft, Palette } from 'lucide-react';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { ToastProvider, useToast } from './components/ui/Toast';
import { EditorProvider } from './components/EditorContext';
import { useGenUI } from './hooks/useGenUI';
import { useSound } from './hooks/useSound';
import { generateTheme } from './services/themeAgent';
import { UINode } from './types';

// Extracted workspace components
import { DeviceWrapper, Sidebar, Toolbar } from './components/workspace';
import { DeviceProvider } from './components/DeviceContext';
import { CodeViewer } from './components/CodeViewer';
import { SettingsDialog } from './components/SettingsDialog';
import { InspectorPanel } from './components/InspectorPanel';
import { ModalRenderer } from './components/ModalRenderer';

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Workspace />
      </ToastProvider>
    </ThemeProvider>
  );
};

const Workspace = () => {
  const { state, actions, refs, history } = useGenUI();
  const { context, input, loading, streamingNode, messages, metrics, editMode, selectedPath, config, modalNode, canCancel } = state;
  const { setTheme, isGenerating, setIsGenerating } = useTheme();

  const [showSettings, setShowSettings] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'layers'>('chat');

  // Auto-hide sidebar in immersive modes during generation
  useEffect(() => {
    if ((context.mode === 'galgame' || context.mode === 'svg_animation') && loading) {
      setShowSidebar(false);
    }
  }, [context.mode, loading]);

  // Audio Engine
  const { play } = useSound(config.soundEnabled);
  const { showToast } = useToast();

  // Trigger sounds on state changes
  useEffect(() => {
    if (!loading && messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        play('SUCCESS');
      }
    }
  }, [loading, messages, play]);

  // Calculate the active node to display on the stage
  const activeNode: UINode | null = streamingNode ||
    (messages && messages.slice ? messages.slice().reverse().find(m => m.uiNode)?.uiNode : null) ||
    null;

  // Intercept theme commands
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    play('ACTIVATE');
    if (input.startsWith('/theme')) {
      const themePrompt = input.replace('/theme', '').trim();
      if (!themePrompt) return;

      setIsGenerating(true);
      actions.setInput('');
      try {
        const newTheme = await generateTheme(themePrompt, config);
        setTheme(newTheme);
        actions.handleAction({ type: 'SYSTEM', payload: `Theme updated: ${themePrompt}` });
        play('SUCCESS');
      } catch (err) {
        console.error(err);
        play('ERROR');
      } finally {
        setIsGenerating(false);
      }
      return;
    }
    actions.handleSubmit(e);
  };

  return (
    <DeviceProvider context={context}>
      <EditorProvider value={{
        isEditing: editMode,
        selectedPath,
        onSelect: (p) => { actions.setSelectedPath(p); if (p) play('CLICK'); }
      }}>
        <div className="flex h-screen w-full bg-transparent text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">

          {/* --- LEFT SIDEBAR (CHAT & INPUT) --- */}
          <Sidebar
            showSidebar={showSidebar}
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            messages={messages}
            activeNode={activeNode}
            input={input}
            setInput={actions.setInput}
            loading={loading}
            isGenerating={isGenerating}
            editMode={editMode}
            setEditMode={actions.setEditMode}
            selectedPath={selectedPath}
            setSelectedPath={actions.setSelectedPath}
            context={context}
            setContext={actions.setContext}
            metrics={metrics}
            onSubmit={handleCustomSubmit}
            onSettingsClick={() => setShowSettings(true)}
            onPlaySound={play}
            showToast={showToast}
            messagesEndRef={refs.messagesEndRef}
            canCancel={canCancel}
            onCancel={actions.cancelGeneration}
          />

          {/* --- CENTER CANVAS --- */}
          <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-0">

            {/* Sidebar Toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`absolute left-5 top-5 z-40 p-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all hover:bg-white/10 shadow-xl ${!showSidebar ? 'translate-x-0' : '-translate-x-full opacity-0 pointer-events-none'}`}
              data-testid="sidebar-toggle"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            {/* Toolbar */}
            <Toolbar
              context={context}
              setContext={actions.setContext}
              editMode={editMode}
              selectedPath={selectedPath}
              loading={loading}
              showCode={showCode}
              setShowCode={setShowCode}
              history={history}
              onCreateVariation={actions.createVariation}
              onPlaySound={play}
            />

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center" data-streaming={loading ? 'true' : 'false'} data-testid="canvas">
              {/* Streaming progress bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 z-30 overflow-hidden transition-opacity duration-300 ${loading ? 'opacity-100' : 'opacity-0'}`}
                data-testid="progress-bar"
              >
                <div className="h-full w-1/3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"
                  style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
                />
                <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
              </div>

              <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar flex items-start justify-center pt-12 pb-32">
                {activeNode ? (
                  <DeviceWrapper
                    context={context}
                    node={activeNode}
                    onAction={(a: unknown) => { actions.handleAction(a); play('CLICK'); }}
                    onError={actions.fixNode}
                    isStreaming={loading}
                    editMode={editMode}
                    history={history}
                  />
                ) : loading ? (
                  <div className="flex flex-col items-center justify-center mt-32 w-full max-w-md space-y-4 animate-in fade-in duration-500" data-testid="skeleton-screen">
                    <div className="w-3/4 h-8 bg-white/5 rounded-lg animate-pulse" />
                    <div className="w-full h-32 bg-white/5 rounded-lg animate-pulse" />
                    <div className="w-1/2 h-10 bg-white/5 rounded-lg animate-pulse" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-500 mt-32 animate-in fade-in zoom-in-95 duration-700">
                    <div className="w-32 h-32 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl rotate-3 ring-1 ring-white/5 relative group backdrop-blur-md">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      <Palette className="w-12 h-12 opacity-50 text-indigo-400 relative z-10 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-300 tracking-tight">Ready to Architect</h3>
                    <p className="text-base text-slate-500 mt-3 max-w-md text-center font-light leading-relaxed">
                      Enter a prompt to generate a new UI.
                      <br />Try <span className="text-indigo-400">"Cyberpunk Dashboard"</span> or <span className="text-emerald-400">"Glassmorphism Finance App"</span>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDEBAR (INSPECTOR) --- */}
          {editMode && selectedPath && activeNode && (
            <div className="relative z-30 flex-shrink-0">
              <InspectorPanel
                rootNode={activeNode}
                selectedPath={selectedPath}
                onClose={() => actions.setSelectedPath(null)}
                onAction={actions.handleAction}
              />
            </div>
          )}

          {/* Modals & Overlays */}
          <ModalRenderer node={modalNode} onClose={actions.closeModal} onAction={actions.handleAction} onError={actions.fixNode} />
          {showSettings && (
            <SettingsDialog
              config={config}
              onSave={actions.setConfig}
              onClose={() => setShowSettings(false)}
              onRunDiagnostics={actions.runDiagnostics}
            />
          )}
          {showCode && activeNode && <CodeViewer node={activeNode} onClose={() => setShowCode(false)} />}

        </div>
      </EditorProvider>
    </DeviceProvider>
  );
};

export default App;
