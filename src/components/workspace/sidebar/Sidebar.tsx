/**
 * Sidebar Component
 *
 * Layout shell that composes sidebar sub-components.
 */

import React from 'react';
import { UINode, UserContext, Message } from '@/types';
import { SidebarHeader } from './SidebarHeader';
import { SidebarTabBar } from './SidebarTabBar';
import { ChatMessages } from './ChatMessages';
import { LayersPanel } from './LayersPanel';
import { RefinementBar } from './RefinementBar';
import { PromptInput } from './PromptInput';
import { ModeToggle } from './ModeToggle';

interface SidebarProps {
    showSidebar: boolean;
    sidebarTab: 'chat' | 'layers';
    setSidebarTab: (tab: 'chat' | 'layers') => void;
    messages: Message[];
    activeNode: UINode | null;
    input: string;
    setInput: (value: string) => void;
    loading: boolean;
    isGenerating: boolean;
    editMode: boolean;
    setEditMode: (value: boolean) => void;
    selectedPath: string | null;
    setSelectedPath: (path: string | null) => void;
    context: UserContext;
    setContext: React.Dispatch<React.SetStateAction<UserContext>>;
    metrics: { active: boolean };
    onSubmit: (e: React.FormEvent) => void;
    onSettingsClick: () => void;
    onPlaySound: (sound: string) => void;
    showToast: (options: any) => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
    const {
        showSidebar, sidebarTab, setSidebarTab, messages, activeNode,
        input, setInput, loading, isGenerating, editMode, setEditMode,
        selectedPath, setSelectedPath, context, setContext, metrics,
        onSubmit, onSettingsClick, onPlaySound, showToast, messagesEndRef
    } = props;

    const breadcrumbs = selectedPath
        ? selectedPath.split('.').filter(p => isNaN(Number(p)) && p !== 'children' && p !== 'root')
        : [];
    const selectedName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : 'Component';

    return (
        <div className={`${showSidebar ? 'w-[420px] border-r' : 'w-0'} flex flex-col border-white/10 bg-black/60 backdrop-blur-2xl transition-all duration-500 ease-[0.23,1,0.32,1] relative z-20 overflow-hidden shadow-2xl`}>
            <div className="flex-1 flex flex-col min-h-0 w-[420px]">
                <SidebarHeader isGenerating={isGenerating} onSettingsClick={onSettingsClick} onPlaySound={onPlaySound} />
                <SidebarTabBar sidebarTab={sidebarTab} setSidebarTab={setSidebarTab} onPlaySound={onPlaySound} />

                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {sidebarTab === 'chat' && (
                        <ChatMessages messages={messages} setInput={setInput} messagesEndRef={messagesEndRef} />
                    )}
                    {sidebarTab === 'layers' && (
                        <LayersPanel activeNode={activeNode} />
                    )}
                </div>

                <div className="p-5 bg-black/60 backdrop-blur-2xl border-t border-white/5 relative z-10">
                    <RefinementBar selectedPath={selectedPath} setSelectedPath={setSelectedPath} />
                    <PromptInput
                        input={input} setInput={setInput} loading={loading} isGenerating={isGenerating}
                        editMode={editMode} selectedPath={selectedPath} selectedName={selectedName}
                        context={context} onSubmit={onSubmit} onPlaySound={onPlaySound}
                    />
                    <ModeToggle
                        editMode={editMode} setEditMode={setEditMode} context={context}
                        setContext={setContext} metrics={metrics} onPlaySound={onPlaySound} showToast={showToast}
                    />
                </div>
            </div>
        </div>
    );
};
