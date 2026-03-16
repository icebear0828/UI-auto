import React from 'react';

export interface AssetRenderProps {
  x: number;
  y: number;
  scale: number;
  color?: string;
  variant?: string;
  text?: string;
  width?: number;
  // arrow-specific
  x2?: number;
  y2?: number;
  id?: string;
}

export interface SvgAssetDef {
  name: string;
  type: 'character' | 'icon' | 'decoration';
  variants?: string[];
  render: (props: AssetRenderProps) => React.ReactNode;
}
