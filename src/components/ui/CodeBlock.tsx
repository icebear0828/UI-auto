
import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export const CodeBlock = ({ code, language = 'bash', filename }: CodeBlockProps) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={theme.codeblock.container}>
      {/* Header */}
      <div className={theme.codeblock.header}>
        <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            {filename && (
                <div className="ml-2 text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 opacity-60">
                    <Terminal className="w-3 h-3" />
                    {filename}
                </div>
            )}
        </div>
        <button 
           onClick={handleCopy} 
           className="text-zinc-500 hover:text-white transition-colors p-1 rounded"
        >
           {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      
      {/* Body */}
      <div className={theme.codeblock.body}>
        <pre className="whitespace-pre">
            {code}
        </pre>
      </div>
    </div>
  );
};
