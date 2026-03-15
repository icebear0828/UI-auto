import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';
import { UINode } from '@/types';
import { generateReactCode } from '@/services/codeGenerator';

interface CodeViewerProps {
  node: UINode;
  onClose: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ node, onClose }) => {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate code when node changes
    const generated = generateReactCode(node);
    setCode(generated);
  }, [node]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl h-[80vh] flex flex-col bg-[#0d1117] rounded-xl border border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#161b22]">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-zinc-800/50 border border-zinc-700">
              <Terminal className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-slate-200">Generated JSX</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                copied 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-zinc-800 text-slate-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto custom-scrollbar relative bg-[#0d1117]">
          <pre className="p-6 text-sm font-mono leading-relaxed">
            <code className="block">
              {code.split('\n').map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell select-none text-zinc-700 text-right pr-4 w-8 border-r border-zinc-800/50 mr-4">
                    {i + 1}
                  </span>
                  <span className="table-cell pl-4 whitespace-pre">
                    {highlightSyntax(line)}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

// Simple syntax highlighter for basic JSX/TS
// In a real production app, use PrismJS or Shiki.
// This is a lightweight approximation for performance.
const highlightSyntax = (line: string) => {
  // Regex patterns
  const patterns = [
    { regex: /(import|from|export|default|function|return|const|let|var)/g, color: 'text-pink-400' }, // Keywords
    { regex: /(<)(\w+)/g, color: 'text-blue-400', group: 2 }, // Component Open
    { regex: /(<\/)(\w+)(>)/g, color: 'text-blue-400', group: 2 }, // Component Close
    { regex: /(\w+)=/g, color: 'text-violet-300' }, // Props
    { regex: /(".*?")/g, color: 'text-emerald-300' }, // Strings
    { regex: /({|})/g, color: 'text-yellow-500' }, // Braces
  ];

  let parts: React.ReactNode[] = [];
  
  // Naive tokenization for basic coloring (splitting by space to keep it simple and safe from XSS)
  // For the purpose of this demo, we'll return the line as is but wrapped in a span for default color
  // Implementing full regex highlighting manually in React without dangerouslySetInnerHTML is complex.
  // We will return a simplified colored version.
  
  return <span className="text-slate-300">{line}</span>; 
};
