import React from 'react';
import { registerAsset } from '../registry';
import type { AssetRenderProps } from '../types';

registerAsset('arrow', {
  name: 'arrow',
  type: 'decoration',
  render: ({ x: x1, y: y1, x2 = 0, y2 = 0, color, id = 'arrow-default' }: AssetRenderProps) => {
    const c = color ?? '#64748b';
    return React.createElement('g', null,
      React.createElement('defs', null,
        React.createElement('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' },
          React.createElement('path', { d: 'M0,0 L10,5 L0,10 z', fill: c }),
        ),
      ),
      React.createElement('line', { x1, y1, x2, y2, stroke: c, strokeWidth: 2, markerEnd: `url(#${id})` }),
    );
  },
});
