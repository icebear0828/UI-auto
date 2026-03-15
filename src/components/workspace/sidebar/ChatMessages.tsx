import React from 'react';
import { Sparkles, Terminal } from 'lucide-react';
import { Message } from '@/types';

interface ChatMessagesProps {
    messages: Message[];
    setInput: (value: string) => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
    messages,
    setInput,
    messagesEndRef
}) => (
    <div className="p-5 space-y-8 min-h-full flex flex-col">
        {messages && messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 p-4 space-y-6">
                <div className="relative group cursor-pointer" onClick={() => setInput("Create a crypto dashboard")}>
                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform duration-500 backdrop-blur-md">
                        <Sparkles className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                    </div>
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl group-hover:blur-3xl transition-all" />
                </div>
                <div>
                    <p className="text-base font-medium text-slate-200">Start Building</p>
                    <p className="text-sm text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">Describe any UI you can imagine. We'll handle the code.</p>
                </div>
            </div>
        )}

        {messages && messages.map((msg, idx) => (
            <div key={idx} className={`group flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-500 fade-in`}>
                <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {msg.role === 'user' ? 'You' : 'Architect'}
                    </span>
                </div>

                {msg.role === 'system' ? (
                    <div className="w-full flex items-center gap-3 py-2.5 px-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>{msg.content}</span>
                    </div>
                ) : (
                    <div className={`max-w-[90%] px-5 py-4 rounded-2xl text-sm leading-7 shadow-lg backdrop-blur-md ${msg.role === 'user'
                            ? 'bg-zinc-800/80 text-slate-100 rounded-tr-sm border border-zinc-700'
                            : 'bg-black/40 text-slate-300 border border-white/10 rounded-tl-sm'
                        }`}>
                        {msg.content || (msg.uiNode ? <span className="italic text-slate-500 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Generated UI Component</span> : null)}
                    </div>
                )}
            </div>
        ))}
        <div ref={messagesEndRef} className="h-4" />
    </div>
);
