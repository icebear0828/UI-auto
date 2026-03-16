import React from 'react';
import { registerAsset } from '../registry';
import type { AssetRenderProps } from '../types';

// Original SVGs: viewBox="0 0 200 300", character centered at x=100, y~150
const CX = 100;
const CY = 150;

function PoseStand() {
  return (
    <g strokeWidth={8} strokeLinecap="round" fill="none" stroke="currentColor">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 3; 0 0" dur="4s" repeatCount="indefinite" />
        <circle cx={100} cy={50} r={20} fill="currentColor" stroke="none" />
        <line x1={100} y1={70} x2={100} y2={150} />
        <line x1={100} y1={80} x2={80} y2={140}>
          <animateTransform attributeName="transform" type="rotate" values="0 100 80; 3 100 80; 0 100 80" dur="4s" repeatCount="indefinite" />
        </line>
        <line x1={100} y1={80} x2={120} y2={140}>
          <animateTransform attributeName="transform" type="rotate" values="0 100 80; -3 100 80; 0 100 80" dur="4s" repeatCount="indefinite" />
        </line>
        <line x1={100} y1={150} x2={85} y2={230} />
        <line x1={100} y1={150} x2={115} y2={230} />
      </g>
    </g>
  );
}

function PoseThink() {
  return (
    <g strokeLinecap="round" fill="none">
      <g fill="currentColor" stroke="none" opacity={0.5}>
        <circle cx={75} cy={15} r={4}>
          <animate attributeName="opacity" values="0; 1; 0" dur="1.5s" begin="0s" repeatCount="indefinite" />
        </circle>
        <circle cx={100} cy={10} r={4}>
          <animate attributeName="opacity" values="0; 1; 0" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx={125} cy={15} r={4}>
          <animate attributeName="opacity" values="0; 1; 0" dur="1.5s" begin="1.0s" repeatCount="indefinite" />
        </circle>
      </g>
      <g stroke="currentColor" strokeWidth={8}>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 1.5; 0 0" dur="4s" repeatCount="indefinite" />
        <circle cx={95} cy={50} r={20} fill="currentColor" stroke="none" />
        <line x1={100} y1={70} x2={100} y2={150} />
        <path d="M 100 80 L 125 110 L 95 115" stroke="currentColor" opacity={0.5} />
        <line x1={100} y1={150} x2={85} y2={230} stroke="currentColor" opacity={0.5} />
        <line x1={100} y1={150} x2={115} y2={230} />
        <path d="M 100 80 L 70 110 L 90 70" />
      </g>
    </g>
  );
}

function PoseSit() {
  return (
    <g strokeLinecap="round" fill="none">
      <path d="M 85 165 L 125 165 L 125 240 M 95 165 L 95 240" stroke="currentColor" strokeWidth={12} strokeLinecap="square" opacity={0.2} />
      <g stroke="currentColor" strokeWidth={8}>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 2; 0 0" dur="3.5s" repeatCount="indefinite" />
        <circle cx={100} cy={70} r={20} fill="currentColor" stroke="none" />
        <line x1={100} y1={90} x2={100} y2={160} />
        <line x1={100} y1={100} x2={125} y2={150} stroke="currentColor" opacity={0.5} />
        <line x1={100} y1={160} x2={140} y2={160} />
        <line x1={140} y1={160} x2={140} y2={230}>
          <animateTransform attributeName="transform" type="rotate" values="0 140 160; 12 140 160; 0 140 160" dur="0.6s" repeatCount="indefinite" />
        </line>
        <line x1={100} y1={100} x2={135} y2={155} />
      </g>
    </g>
  );
}

function PoseWave() {
  return (
    <g strokeWidth={8} strokeLinecap="round" fill="none" stroke="currentColor">
      <circle cx={100} cy={50} r={20} fill="currentColor" stroke="none" />
      <line x1={100} y1={70} x2={100} y2={150} />
      <line x1={100} y1={80} x2={80} y2={140} />
      <line x1={100} y1={80} x2={100} y2={140}>
        <animateTransform attributeName="transform" type="rotate" values="0 100 80; -90 100 80; -90 100 80; 0 100 80" keyTimes="0; 0.2; 0.8; 1" dur="2.5s" repeatCount="indefinite" />
      </line>
      <line x1={100} y1={150} x2={85} y2={230} />
      <line x1={100} y1={150} x2={115} y2={230} />
    </g>
  );
}

function PoseWalk() {
  return (
    <g strokeWidth={8} strokeLinecap="round" fill="none">
      <circle cx={100} cy={50} r={20} fill="currentColor" stroke="none" />
      <line x1={100} y1={70} x2={100} y2={150} stroke="currentColor" />
      <line x1={100} y1={80} x2={100} y2={140} stroke="currentColor" opacity={0.5}>
        <animateTransform attributeName="transform" type="rotate" values="30 100 80; -30 100 80; 30 100 80" dur="1.2s" repeatCount="indefinite" />
      </line>
      <line x1={100} y1={80} x2={100} y2={140} stroke="currentColor">
        <animateTransform attributeName="transform" type="rotate" values="-30 100 80; 30 100 80; -30 100 80" dur="1.2s" repeatCount="indefinite" />
      </line>
      <line x1={100} y1={150} x2={100} y2={230} stroke="currentColor" opacity={0.5}>
        <animateTransform attributeName="transform" type="rotate" values="-30 100 150; 30 100 150; -30 100 150" dur="1.2s" repeatCount="indefinite" />
      </line>
      <line x1={100} y1={150} x2={100} y2={230} stroke="currentColor">
        <animateTransform attributeName="transform" type="rotate" values="30 100 150; -30 100 150; 30 100 150" dur="1.2s" repeatCount="indefinite" />
      </line>
    </g>
  );
}

function PosePoint() {
  return (
    <g strokeWidth={8} strokeLinecap="round" fill="none" stroke="currentColor">
      <circle cx={100} cy={50} r={20} fill="currentColor" stroke="none" />
      <line x1={100} y1={70} x2={100} y2={150} />
      <line x1={100} y1={80} x2={80} y2={140} />
      <line x1={100} y1={80} x2={140} y2={30}>
        <animateTransform attributeName="transform" type="rotate" values="-20 100 80; 25 100 80; -20 100 80" dur="0.5s" repeatCount="indefinite" />
      </line>
      <line x1={100} y1={150} x2={85} y2={230} />
      <line x1={100} y1={150} x2={115} y2={230} />
    </g>
  );
}

const POSES: Record<string, React.FC> = {
  stand: PoseStand,
  think: PoseThink,
  sit: PoseSit,
  wave: PoseWave,
  walk: PoseWalk,
  point: PosePoint,
};

function render({ x, y, scale, variant: pose, text: label }: AssetRenderProps): React.ReactNode {
  const PoseComponent = POSES[pose ?? 'stand'] ?? POSES.stand;
  // Normalize from 200x300 original space to target size
  const s = scale * 0.35;

  return (
    <g transform={`translate(${x}, ${y}) scale(${s}) translate(${-CX}, ${-CY})`} color="currentColor">
      <PoseComponent />
      {label && (
        <text x={CX} y={260} textAnchor="middle" fill="currentColor" opacity={0.5} fontSize={28} fontFamily="monospace">
          {label}
        </text>
      )}
    </g>
  );
}

registerAsset('stickman', {
  name: 'stickman',
  type: 'character',
  variants: ['stand', 'walk', 'wave', 'point', 'sit', 'think'],
  render,
});
