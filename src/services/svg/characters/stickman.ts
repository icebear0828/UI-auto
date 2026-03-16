import React from 'react';
import { registerAsset } from '../registry';
import type { AssetRenderProps } from '../types';

function render({ x, y, scale: s, variant: pose, color, text: label }: AssetRenderProps): React.ReactNode {
  const c = color ?? '#e2e8f0';

  const arms = (() => {
    switch (pose) {
      case 'wave':
        return React.createElement('g', null,
          React.createElement('line', { x1: x, y1: y - 12 * s, x2: x - 14 * s, y2: y - 6 * s }),
          React.createElement('line', { x1: x, y1: y - 12 * s, x2: x + 14 * s, y2: y - 30 * s }),
        );
      case 'point':
        return React.createElement('g', null,
          React.createElement('line', { x1: x, y1: y - 12 * s, x2: x - 14 * s, y2: y - 4 * s }),
          React.createElement('line', { x1: x, y1: y - 12 * s, x2: x + 22 * s, y2: y - 12 * s }),
        );
      case 'think':
        return React.createElement('g', null,
          React.createElement('line', { x1: x, y1: y - 12 * s, x2: x - 14 * s, y2: y - 4 * s }),
          React.createElement('line', { x1: x, y1: y - 12 * s, x2: x + 8 * s, y2: y - 28 * s }),
          React.createElement('circle', { cx: x + 16 * s, cy: y - 38 * s, r: 2 * s, fill: c, opacity: 0.4 }),
          React.createElement('circle', { cx: x + 22 * s, cy: y - 46 * s, r: 3 * s, fill: c, opacity: 0.3 }),
        );
      case 'walk':
        return React.createElement('g', null,
          React.createElement('line', { x1: x, y1: y - 12 * s, x2: x - 18 * s, y2: y - 5 * s }),
          React.createElement('line', { x1: x, y1: y - 12 * s, x2: x + 15 * s, y2: y - 15 * s }),
        );
      case 'sit':
        return React.createElement('line', { x1: x - 14 * s, y1: y - 8 * s, x2: x + 14 * s, y2: y - 8 * s });
      default: // stand
        return React.createElement('line', { x1: x - 14 * s, y1: y - 8 * s, x2: x + 14 * s, y2: y - 8 * s });
    }
  })();

  const legs = pose === 'sit'
    ? React.createElement('g', null,
        React.createElement('line', { x1: x, y1: y + 8 * s, x2: x + 15 * s, y2: y + 8 * s }),
        React.createElement('line', { x1: x + 15 * s, y1: y + 8 * s, x2: x + 15 * s, y2: y + 30 * s }),
        React.createElement('line', { x1: x, y1: y + 8 * s, x2: x - 15 * s, y2: y + 8 * s }),
        React.createElement('line', { x1: x - 15 * s, y1: y + 8 * s, x2: x - 15 * s, y2: y + 30 * s }),
      )
    : pose === 'walk'
    ? React.createElement('g', null,
        React.createElement('line', { x1: x, y1: y + 8 * s, x2: x - 15 * s, y2: y + 30 * s }),
        React.createElement('line', { x1: x, y1: y + 8 * s, x2: x + 15 * s, y2: y + 26 * s }),
      )
    : React.createElement('g', null,
        React.createElement('line', { x1: x, y1: y + 8 * s, x2: x - 10 * s, y2: y + 30 * s }),
        React.createElement('line', { x1: x, y1: y + 8 * s, x2: x + 10 * s, y2: y + 30 * s }),
      );

  return React.createElement('g', null,
    React.createElement('g', { stroke: c, strokeWidth: 2.5 * s, fill: 'none', strokeLinecap: 'round' },
      React.createElement('circle', { cx: x, cy: y - 30 * s, r: 8 * s }),
      React.createElement('line', { x1: x, y1: y - 22 * s, x2: x, y2: y + 8 * s }),
      arms,
      legs,
    ),
    label ? React.createElement('text', {
      x, y: y + 44 * s, textAnchor: 'middle', fill: '#94a3b8', fontSize: 11 * s, fontFamily: 'monospace',
    }, label) : null,
  );
}

registerAsset('stickman', {
  name: 'stickman',
  type: 'character',
  variants: ['stand', 'walk', 'wave', 'point', 'sit', 'think'],
  render,
});
