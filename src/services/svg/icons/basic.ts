import React from 'react';
import { registerAsset } from '../registry';
import type { AssetRenderProps } from '../types';

function iconFactory(name: string, renderFn: (x: number, y: number, r: number, c: string) => React.ReactNode) {
  registerAsset(name, {
    name,
    type: 'icon',
    render: ({ x, y, scale: size, color }: AssetRenderProps) => {
      const c = color ?? '#a78bfa';
      const r = (size ?? 20) / 2;
      return renderFn(x, y, r, c);
    },
  });
}

iconFactory('lightbulb', (x, y, r, c) =>
  React.createElement('circle', { cx: x, cy: y, r, fill: c, opacity: 0.2, stroke: c, strokeWidth: 1.5 })
);

iconFactory('gear', (x, y, r, c) =>
  React.createElement('circle', { cx: x, cy: y, r, fill: 'none', stroke: c, strokeWidth: 1.5, strokeDasharray: '4,3' })
);

iconFactory('check', (x, y, r, c) =>
  React.createElement('g', { stroke: c, strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round' },
    React.createElement('circle', { cx: x, cy: y, r, opacity: 0.15, fill: c }),
    React.createElement('polyline', { points: `${x - r * 0.4},${y} ${x - r * 0.1},${y + r * 0.3} ${x + r * 0.4},${y - r * 0.3}` }),
  )
);

iconFactory('warning', (x, y, r, c) =>
  React.createElement('g', { fill: c, opacity: 0.8 },
    React.createElement('polygon', { points: `${x},${y - r} ${x + r},${y + r * 0.6} ${x - r},${y + r * 0.6}`, fill: 'none', stroke: c, strokeWidth: 1.5 }),
    React.createElement('text', { x, y: y + r * 0.2, textAnchor: 'middle', fontSize: r, fontWeight: 'bold' }, '!'),
  )
);

iconFactory('heart', (x, y, r, _c) =>
  React.createElement('circle', { cx: x, cy: y, r, fill: '#ef4444', opacity: 0.3, stroke: '#ef4444', strokeWidth: 1.5 })
);

iconFactory('question', (x, y, r, c) =>
  React.createElement('g', null,
    React.createElement('circle', { cx: x, cy: y, r, fill: c, opacity: 0.15, stroke: c, strokeWidth: 1.5 }),
    React.createElement('text', { x, y: y + r * 0.15, textAnchor: 'middle', dominantBaseline: 'middle', fill: c, fontSize: r, fontWeight: 'bold' }, '?'),
  )
);
