import React from 'react';
import { registerAsset } from '../registry';
import type { AssetRenderProps } from '../types';

// Word-wrap text into lines
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length + word.length + 1 > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

registerAsset('speech_bubble', {
  name: 'speech_bubble',
  type: 'decoration',
  render: ({ x, y, width: w = 150, text = '', color, scale }: AssetRenderProps) => {
    const c = color ?? '#94a3b8';
    const fontSize = (scale ?? 1) * 13;
    const bubbleW = w;
    const charsPerLine = Math.max(8, Math.floor(bubbleW / (fontSize * 0.5)));
    const lines = wrapText(text, charsPerLine);
    const lineH = fontSize * 1.35;
    const h = Math.max(36, lines.length * lineH + 18);

    return React.createElement('g', null,
      React.createElement('rect', { x: x - bubbleW / 2, y: y - h / 2, width: bubbleW, height: h, rx: h * 0.15, fill: '#1e293b', stroke: c, strokeWidth: 1.5 }),
      React.createElement('polygon', { points: `${x - 8},${y + h / 2} ${x},${y + h / 2 + 10} ${x + 8},${y + h / 2}`, fill: '#1e293b', stroke: c, strokeWidth: 1.5 }),
      React.createElement('rect', { x: x - 7, y: y + h / 2 - 1, width: 14, height: 3, fill: '#1e293b' }),
      React.createElement('text', { x, textAnchor: 'middle', fill: '#e2e8f0', fontSize, fontFamily: 'sans-serif' },
        ...lines.map((line, i) =>
          React.createElement('tspan', { key: i, x, y: y - (lines.length - 1) * lineH / 2 + i * lineH }, line)
        ),
      ),
    );
  },
});
