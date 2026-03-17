import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import type { UIAction } from '@/types';
import type { SvgAnimationProps, SvgCharacter, SvgStep, SvgSide, SvgEvent } from '@/services/schemas/svg-animation';
import { useIsStreaming } from '@/components/ui/renderUtils';
import { useDeviceContext } from '@/components/DeviceContext';
import { getAsset } from '@/services/svg';
import { layoutElements } from '@/services/svg/layout';
import type { LayoutItem } from '@/services/svg/layout';
import { injectSymbols } from '@/services/svg/symbols';

// ============================================================
// VIEWBOX & ANIMATION
// ============================================================

const DESKTOP = { w: 1280, h: 720 };  // 16:9 (720p)
const MOBILE  = { w: 720, h: 1280 };  // 9:16

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const Anim: React.FC<{
  delay: number; streaming?: boolean; children: React.ReactNode;
}> = ({ delay, streaming, children }) => (
  <motion.g
    variants={streaming ? undefined : fadeIn}
    initial={streaming ? false : 'hidden'}
    animate={streaming ? undefined : 'visible'}
    transition={streaming ? undefined : { duration: 0.5, delay }}
  >
    {children}
  </motion.g>
);

// ============================================================
// ASSET RENDERERS
// ============================================================

function RenderAsset({ name, x, y, scale, variant, color, text, width, x2, y2, id }: {
  name: string; x: number; y: number; scale: number;
  variant?: string; color?: string; text?: string; width?: number;
  x2?: number; y2?: number; id?: string;
}) {
  const asset = getAsset(name);
  if (!asset) return null;
  return <>{asset.render({ x, y, scale, variant, color, text, width, x2, y2, id })}</>;
}

// ============================================================
// SHARED PRIMITIVES
// ============================================================

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

const WrappedText: React.FC<{
  x: number; y: number; text: string; maxWidth: number; fontSize: number; fill?: string; anchor?: string; lineHeight?: number;
}> = ({ x, y, text, maxWidth, fontSize, fill, anchor, lineHeight }) => {
  const charsPerLine = Math.max(8, Math.floor(maxWidth / (fontSize * 0.48)));
  const lines = wrapText(text, charsPerLine);
  const lh = lineHeight ?? fontSize * 1.4;

  return (
    <text x={x} textAnchor={anchor ?? 'middle'} fill={fill ?? '#e2e8f0'} fontSize={fontSize} fontFamily="sans-serif">
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lh} y={i === 0 ? y : undefined}>{line}</tspan>
      ))}
    </text>
  );
};

function StickmanAsset({ x, y, scale, pose, label, color }: {
  x: number; y: number; scale: number; pose?: string; label?: string; color?: string;
}) {
  return <RenderAsset name="stickman" x={x} y={y} scale={scale} variant={pose ?? 'stand'} color={color} text={label} />;
}

function BubbleAsset({ x, y, w, text, fontSize, color }: {
  x: number; y: number; w: number; text: string; fontSize?: number; color?: string;
}) {
  return <RenderAsset name="speech_bubble" x={x} y={y} scale={fontSize ?? 13} width={w} text={text} color={color} />;
}

function ArrowAsset({ x1, y1, x2, y2, color, id }: {
  x1: number; y1: number; x2: number; y2: number; color?: string; id: string;
}) {
  return <RenderAsset name="arrow" x={x1} y={y1} x2={x2} y2={y2} color={color} id={id} scale={1} />;
}

function IconAsset({ x, y, name, size, color }: {
  x: number; y: number; name?: string; size: number; color?: string;
}) {
  return <RenderAsset name={name ?? 'question'} x={x} y={y} scale={size} color={color} />;
}

// ============================================================
// SIZE HINTS → scale factor
// ============================================================

function sizeToScale(size: string | undefined, sc: number): number {
  switch (size) {
    case 'small':  return sc * 0.8;
    case 'large':  return sc * 1.8;
    default:       return sc * 1.3;  // "medium" or unspecified
  }
}

// ============================================================
// CSS animation keyframes for SVG elements
// ============================================================

const ANIMATE_STYLES: Record<string, React.CSSProperties> = {
  spin:   { animation: 'svg-spin 3s linear infinite', transformOrigin: 'center' },
  pulse:  { animation: 'svg-pulse 2s ease-in-out infinite', transformOrigin: 'center' },
  bounce: { animation: 'svg-bounce 1.5s ease-in-out infinite', transformOrigin: 'center' },
};

// ============================================================
// NEW: Scene Orchestration Renderer (elements-based)
// ============================================================

function SceneRenderer({ items, vb, streaming }: {
  items: LayoutItem[]; vb: { w: number; h: number }; streaming: boolean;
}) {
  const sc = Math.min(vb.w, vb.h) / 400;

  return (
    <>
      {items.map((item, i) => {
        const { element: el, x, y, fromXY, toXY } = item;

        // Arrow / connection element
        if (el.asset === 'arrow' && fromXY && toXY) {
          const dashStyle = el.style === 'dashed' ? '8,4' : undefined;
          return (
            <Anim key={i} delay={i * 0.15} streaming={streaming}>
              <ArrowAsset
                x1={fromXY.x} y1={fromXY.y}
                x2={toXY.x} y2={toXY.y}
                id={`scene-arr-${i}`}
                color={el.style === 'flow' ? '#6366f1' : undefined}
              />
              {dashStyle && (
                <line
                  x1={fromXY.x} y1={fromXY.y} x2={toXY.x} y2={toXY.y}
                  stroke="#64748b" strokeWidth={2} strokeDasharray={dashStyle}
                />
              )}
            </Anim>
          );
        }

        // Speech bubble
        if (el.asset === 'speech_bubble') {
          return (
            <Anim key={i} delay={i * 0.15} streaming={streaming}>
              <BubbleAsset x={x} y={y} w={vb.w * 0.28} text={el.text ?? ''} fontSize={10 * sc} />
            </Anim>
          );
        }

        // Stickman character
        if (el.asset === 'stickman') {
          const charScale = sizeToScale(el.size, sc);
          return (
            <Anim key={i} delay={i * 0.15} streaming={streaming}>
              <g style={el.animate ? ANIMATE_STYLES[el.animate] : undefined}>
                <StickmanAsset x={x} y={y} scale={charScale} pose={el.pose} label={el.label} />
              </g>
            </Anim>
          );
        }

        // Icon assets (gear, check, lightbulb, etc.)
        const iconScale = sizeToScale(el.size, sc);
        const iconSize = iconScale * 20;
        return (
          <Anim key={i} delay={i * 0.15} streaming={streaming}>
            <g style={el.animate ? ANIMATE_STYLES[el.animate] : undefined}>
              <IconAsset x={x} y={y} name={el.asset} size={iconSize} />
              {el.label && (
                <WrappedText x={x} y={y + iconSize * 0.7} text={el.label} maxWidth={vb.w * 0.2} fontSize={11 * sc} fill="#94a3b8" />
              )}
            </g>
          </Anim>
        );
      })}
    </>
  );
}

// ============================================================
// LEGACY TEMPLATE RENDERERS (backward compat)
// ============================================================

function TutorialStep({ props, vb, streaming }: { props: SvgAnimationProps; vb: { w: number; h: number }; streaming: boolean }) {
  const { character, content, step, icon } = props;
  const isVert = vb.h > vb.w;
  const sc = Math.min(vb.w, vb.h) / 400;
  const charScale = sc * 1.3;
  const headOffset = 30 * charScale;
  const charX = isVert ? vb.w * 0.5 : vb.w * 0.15;
  const charY = isVert ? vb.h * 0.35 : vb.h * 0.55;
  const contentX = isVert ? vb.w * 0.5 : vb.w * 0.6;
  const contentY = isVert ? vb.h * 0.6 : vb.h * 0.25;
  const contentW = vb.w * (isVert ? 0.8 : 0.55);
  const anchor = isVert ? 'middle' : 'start';

  return (
    <>
      {step && (
        <Anim delay={0} streaming={streaming}>
          <text x={contentX} y={contentY - 15 * sc} textAnchor={anchor} fill="#6366f1" fontSize={14 * sc} fontWeight="bold" fontFamily="monospace">{step}</text>
        </Anim>
      )}
      {content && (
        <Anim delay={0.4} streaming={streaming}>
          <WrappedText x={contentX} y={contentY + 10 * sc} text={content} maxWidth={contentW} fontSize={12 * sc} fill="#cbd5e1" anchor={anchor} />
        </Anim>
      )}
      {icon && (
        <Anim delay={0.7} streaming={streaming}>
          <IconAsset x={isVert ? vb.w * 0.5 : vb.w * 0.88} y={isVert ? vb.h * 0.82 : vb.h * 0.5} name={icon} size={28 * sc} />
        </Anim>
      )}
      {character?.dialog && (
        <Anim delay={0.5} streaming={streaming}>
          <BubbleAsset x={charX + (isVert ? 0 : 40 * sc)} y={charY - headOffset - 40 * sc} w={vb.w * (isVert ? 0.65 : 0.25)} text={character.dialog} fontSize={10 * sc} />
        </Anim>
      )}
      <Anim delay={0.2} streaming={streaming}>
        <StickmanAsset x={charX} y={charY} scale={charScale} pose={character?.pose ?? 'stand'} label={character?.label} />
      </Anim>
    </>
  );
}

function Comparison({ props, vb, streaming }: { props: SvgAnimationProps; vb: { w: number; h: number }; streaming: boolean }) {
  const { left, right } = props;
  const isVert = vb.h > vb.w;
  const sc = Math.min(vb.w, vb.h) / 400;
  const lx = isVert ? vb.w * 0.5 : vb.w * 0.25;
  const rx = isVert ? vb.w * 0.5 : vb.w * 0.75;
  const ly = isVert ? vb.h * 0.25 : vb.h * 0.35;
  const ry = isVert ? vb.h * 0.6 : vb.h * 0.35;
  const boxW = vb.w * (isVert ? 0.7 : 0.36);
  const ptFontSize = 11 * sc;
  const ptLineH = ptFontSize * 1.4;
  const charsPerLine = Math.max(8, Math.floor((boxW * 0.85) / (ptFontSize * 0.48)));

  const renderSide = (side: SvgSide | undefined, x: number, y: number, delay: number, color: string) => {
    if (!side) return null;
    const pts = side.points ?? [];
    const pointLineCounts = pts.map(p => wrapText(`• ${p}`, charsPerLine).length);
    const totalLines = pointLineCounts.reduce((a, b) => a + b, 0);
    const boxH = (40 + totalLines * ptLineH / sc) * sc;
    let currentY = y + 28 * sc;
    return (
      <Anim delay={delay} streaming={streaming}>
        <rect x={x - boxW / 2} y={y - 20 * sc} width={boxW} height={boxH} rx={8 * sc} fill="#0f172a" stroke={color} strokeWidth={1.5} opacity={0.8} />
        <text x={x} y={y + 5 * sc} textAnchor="middle" fill={color} fontSize={16 * sc} fontWeight="bold" fontFamily="sans-serif">{side.title}</text>
        {pts.map((p, i) => {
          const el = <WrappedText key={i} x={x} y={currentY} text={`• ${p}`} maxWidth={boxW * 0.85} fontSize={ptFontSize} fill="#cbd5e1" />;
          currentY += pointLineCounts[i] * ptLineH + 4 * sc;
          return el;
        })}
      </Anim>
    );
  };

  return (
    <>
      {renderSide(left, lx, ly, 0.2, '#34d399')}
      <Anim delay={0.5} streaming={streaming}>
        <text x={vb.w * 0.5} y={isVert ? vb.h * 0.44 : vb.h * 0.5} textAnchor="middle" fill="#475569" fontSize={20 * sc} fontWeight="bold" fontFamily="sans-serif">VS</text>
      </Anim>
      {renderSide(right, rx, ry, 0.8, '#f87171')}
    </>
  );
}

function Flowchart({ props, vb, streaming }: { props: SvgAnimationProps; vb: { w: number; h: number }; streaming: boolean }) {
  const steps = props.steps ?? [];
  const isVert = vb.h > vb.w;
  const sc = Math.min(vb.w, vb.h) / 400;
  const n = steps.length || 1;

  return (
    <>
      {steps.map((s: SvgStep, i: number) => {
        const x = isVert ? vb.w * 0.5 : vb.w * ((i + 0.5) / n);
        const y = isVert ? vb.h * ((i + 0.5) / n) : vb.h * 0.5;
        const nodeW = vb.w * (isVert ? 0.55 : 0.7 / n);
        const nodeH = 55 * sc;
        return (
          <React.Fragment key={i}>
            <Anim delay={i * 0.3} streaming={streaming}>
              <rect x={x - nodeW / 2} y={y - nodeH / 2} width={nodeW} height={nodeH} rx={8 * sc} fill="#1e293b" stroke="#6366f1" strokeWidth={1.5} />
              <WrappedText x={x} y={y - 6 * sc} text={s.label} maxWidth={nodeW * 0.85} fontSize={13 * sc} fill="#e2e8f0" />
              {s.description && (
                <WrappedText x={x} y={y + 12 * sc} text={s.description} maxWidth={nodeW * 0.85} fontSize={10 * sc} fill="#94a3b8" />
              )}
              {s.icon && <IconAsset x={x + nodeW / 2 - 14 * sc} y={y - nodeH / 2 + 14 * sc} name={s.icon} size={16 * sc} />}
            </Anim>
            {i < steps.length - 1 && (
              <Anim delay={i * 0.3 + 0.15} streaming={streaming}>
                {isVert ? (
                  <ArrowAsset x1={x} y1={y + nodeH / 2 + 2} x2={x} y2={vb.h * ((i + 1.5) / n) - nodeH / 2 - 2} id={`flow-arr-${i}`} />
                ) : (
                  <ArrowAsset x1={x + nodeW / 2 + 2} y1={y} x2={vb.w * ((i + 1.5) / n) - nodeW / 2 - 2} y2={y} id={`flow-arr-${i}`} />
                )}
              </Anim>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

function DialogScene({ props, vb, streaming }: { props: SvgAnimationProps; vb: { w: number; h: number }; streaming: boolean }) {
  const chars = props.characters ?? [];
  const isVert = vb.h > vb.w;
  const sc = Math.min(vb.w, vb.h) / 400;

  return (
    <>
      {chars.map((ch: SvgCharacter, i: number) => {
        const x = isVert ? vb.w * 0.5 : vb.w * ((i + 0.5) / Math.max(chars.length, 1));
        const y = isVert ? vb.h * (0.3 + i * 0.35) : vb.h * 0.6;
        return (
          <React.Fragment key={i}>
            {ch.dialog && (
              <Anim delay={i * 0.4 + 0.2} streaming={streaming}>
                <BubbleAsset x={x} y={y - 30 * sc * 1.2 - 40 * sc} w={vb.w * (isVert ? 0.65 : 0.35)} text={ch.dialog} fontSize={11 * sc} />
              </Anim>
            )}
            <Anim delay={i * 0.4} streaming={streaming}>
              <StickmanAsset x={x} y={y} scale={sc * 1.2} pose={ch.pose ?? 'stand'} label={ch.label} />
            </Anim>
          </React.Fragment>
        );
      })}
    </>
  );
}

function HighlightConcept({ props, vb, streaming }: { props: SvgAnimationProps; vb: { w: number; h: number }; streaming: boolean }) {
  const { concept, description, icon, points } = props;
  const sc = Math.min(vb.w, vb.h) / 400;
  const cx = vb.w * 0.5;
  const cy = vb.h * 0.38;

  return (
    <>
      {icon && (
        <Anim delay={0} streaming={streaming}>
          <IconAsset x={cx} y={cy - 30 * sc} name={icon} size={50 * sc} />
        </Anim>
      )}
      {concept && (
        <Anim delay={0.3} streaming={streaming}>
          <WrappedText x={cx} y={cy + 25 * sc} text={concept} maxWidth={vb.w * 0.8} fontSize={22 * sc} fill="#e2e8f0" />
        </Anim>
      )}
      {description && (
        <Anim delay={0.5} streaming={streaming}>
          <WrappedText x={cx} y={cy + 55 * sc} text={description} maxWidth={vb.w * 0.75} fontSize={12 * sc} fill="#94a3b8" />
        </Anim>
      )}
      {points?.map((p, i) => (
        <Anim key={i} delay={0.7 + i * 0.2} streaming={streaming}>
          <WrappedText x={cx} y={cy + (85 + i * 24) * sc} text={`• ${p}`} maxWidth={vb.w * 0.7} fontSize={12 * sc} fill="#cbd5e1" />
        </Anim>
      ))}
    </>
  );
}

function Timeline({ props, vb, streaming }: { props: SvgAnimationProps; vb: { w: number; h: number }; streaming: boolean }) {
  const events = props.events ?? [];
  const isVert = vb.h > vb.w;
  const sc = Math.min(vb.w, vb.h) / 400;
  const n = events.length || 1;
  const lineX1 = isVert ? vb.w * 0.15 : vb.w * 0.1;
  const lineY1 = isVert ? vb.h * 0.1 : vb.h * 0.5;
  const lineX2 = isVert ? vb.w * 0.15 : vb.w * 0.9;
  const lineY2 = isVert ? vb.h * 0.9 : vb.h * 0.5;

  return (
    <>
      <Anim delay={0} streaming={streaming}>
        <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} stroke="#334155" strokeWidth={2} />
      </Anim>
      {events.map((ev: SvgEvent, i: number) => {
        const t = (i + 0.5) / n;
        const dotX = isVert ? vb.w * 0.15 : vb.w * (0.1 + t * 0.8);
        const dotY = isVert ? vb.h * (0.1 + t * 0.8) : vb.h * 0.5;
        const textX = isVert ? vb.w * 0.35 : dotX;
        const textY = isVert ? dotY : vb.h * 0.5 - 25 * sc;
        return (
          <Anim key={i} delay={0.2 + i * 0.3} streaming={streaming}>
            <circle cx={dotX} cy={dotY} r={6 * sc} fill="#6366f1" />
            <WrappedText x={textX} y={textY} text={ev.label} maxWidth={isVert ? vb.w * 0.55 : vb.w * 0.7 / n} fontSize={13 * sc} fill="#e2e8f0" anchor={isVert ? 'start' : 'middle'} />
            {ev.description && (
              <WrappedText x={textX} y={textY + 16 * sc} text={ev.description} maxWidth={isVert ? vb.w * 0.55 : vb.w * 0.7 / n} fontSize={10 * sc} fill="#94a3b8" anchor={isVert ? 'start' : 'middle'} />
            )}
            {ev.icon && <IconAsset x={dotX} y={dotY - 18 * sc} name={ev.icon} size={14 * sc} />}
          </Anim>
        );
      })}
    </>
  );
}

// ============================================================
// LEGACY TEMPLATE REGISTRY
// ============================================================

const TEMPLATES: Record<string, React.FC<{ props: SvgAnimationProps; vb: { w: number; h: number }; streaming: boolean }>> = {
  tutorial_step: TutorialStep,
  comparison: Comparison,
  flowchart: Flowchart,
  dialog_scene: DialogScene,
  highlight_concept: HighlightConcept,
  timeline: Timeline,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

interface SvgAnimationComponentProps extends SvgAnimationProps {
  onAction: (action: UIAction) => void;
  path?: string;
}

// ============================================================
// SVG SANITIZER — strips scripts, event handlers, keeps SMIL
// ============================================================

function sanitizeSvg(raw: string): string {
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: [
      'animate', 'animateTransform', 'animateMotion', 'use', 'symbol',
      'set', 'mpath', 'filter', 'feGaussianBlur',
      'feComposite', 'feBlend', 'feColorMatrix',
      'feFlood', 'feMerge', 'feMergeNode', 'feTurbulence',
      'feDisplacementMap', 'feSpecularLighting', 'fePointLight',
      'feOffset', 'feDiffuseLighting',
    ],
    ADD_ATTR: [
      'attributeName', 'values', 'dur', 'begin', 'end',
      'repeatCount', 'fill', 'keyTimes', 'keySplines',
      'calcMode', 'additive', 'accumulate', 'from', 'to', 'by',
      'type', 'mode', 'in', 'in2', 'result', 'stdDeviation',
      'baseFrequency', 'numOctaves', 'seed', 'scale',
      'xChannelSelector', 'yChannelSelector',
      'operator', 'k1', 'k2', 'k3', 'k4',
      'flood-color', 'flood-opacity', 'lighting-color',
      'surfaceScale', 'specularConstant', 'specularExponent',
      'dx', 'dy', 'azimuth', 'elevation',
      'viewBox', 'preserveAspectRatio', 'xmlns', 'href',
      'patternUnits', 'patternTransform', 'gradientUnits',
      'gradientTransform', 'spreadMethod',
      'markerWidth', 'markerHeight', 'refX', 'refY', 'orient',
      'dominant-baseline', 'letter-spacing', 'text-anchor',
      'font-weight', 'font-family', 'font-size',
      'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap',
      'stroke-linejoin', 'stroke-width',
      'stop-color', 'stop-opacity', 'pointer-events',
      'textLength', 'lengthAdjust',
      'path', 'rotate', 'keyPoints',
    ],
  });
}

// ============================================================
// RAW SVG CODE RENDERER
// ============================================================

// Extract viewBox dimensions from SVG string
function extractViewBox(svg: string): { w: number; h: number } | null {
  const match = svg.match(/viewBox=["'](\d+)\s+(\d+)\s+(\d+)\s+(\d+)["']/);
  if (match) return { w: Number(match[3]), h: Number(match[4]) };
  return null;
}

const RawSvgRenderer: React.FC<{
  svgCode: string;
  onAction: (action: UIAction) => void;
  isStreaming: boolean;
  vb: { w: number; h: number };
}> = ({ svgCode, onAction, isStreaming, vb }) => {
  // Keep last complete SVG to avoid flicker during streaming
  const lastValidSvg = React.useRef<string>('');

  const sanitized = useMemo(() => {
    // Only update if SVG looks complete (has closing </svg> tag)
    if (svgCode.includes('</svg>')) {
      const withSymbols = injectSymbols(svgCode);
      const clean = sanitizeSvg(withSymbols);
      lastValidSvg.current = clean;
      return clean;
    }
    // During streaming, return last valid SVG (or empty)
    return lastValidSvg.current;
  }, [svgCode]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isStreaming) {
      onAction({ type: 'SUBMIT_FORM', payload: { intent: 'continue' } });
    }
  };

  // Show progress while streaming and no valid SVG yet
  if (!sanitized) {
    // Estimate progress from raw svg_code length (typical SVG ~3000-8000 chars)
    const chars = svgCode.length;
    const pct = Math.min(95, Math.round((chars / 5000) * 100));
    const barWidth = 200;
    const filled = barWidth * (pct / 100);

    return (
      <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl select-none">
        <svg viewBox="0 0 1280 720" className="block w-full">
          <defs>
            <radialGradient id="pg-bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#131c2e" />
              <stop offset="100%" stopColor="#0a0f1a" />
            </radialGradient>
            <linearGradient id="pg-bar" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <rect width="1280" height="720" fill="url(#pg-bg)" />

          {/* Animated dots */}
          <g>
            <circle cx="610" cy="320" r="4" fill="#6366f1" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="640" cy="320" r="4" fill="#818cf8" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="670" cy="320" r="4" fill="#a78bfa" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Status text */}
          <text x="640" y="365" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="monospace">
            Generating illustration…
          </text>

          {/* Progress bar */}
          <rect x="540" y="385" width={barWidth} height="4" rx="2" fill="#1e293b" />
          <rect x="540" y="385" width={filled} height="4" rx="2" fill="url(#pg-bar)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
          </rect>

          {/* Char count */}
          <text x="640" y="410" textAnchor="middle" fill="#334155" fontSize="10" fontFamily="monospace">
            {chars > 0 ? `${(chars / 1000).toFixed(1)}k chars received` : ''}
          </text>
        </svg>
      </div>
    );
  }

  // Use SVG's own viewBox for aspect ratio, fallback to current device vb
  const svgVb = extractViewBox(svgCode) ?? vb;

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl cursor-pointer select-none group mx-auto"
      style={{ aspectRatio: `${svgVb.w} / ${svgVb.h}`, maxWidth: '100%' }}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const SvgAnimation: React.FC<SvgAnimationComponentProps> = (props) => {
  const isStreaming = useIsStreaming();
  const { device } = useDeviceContext();
  const isMobile = device === 'mobile';
  const vb = isMobile ? MOBILE : DESKTOP;
  const { background, title, template, elements, svg_code, onAction } = props;
  const sc = Math.min(vb.w, vb.h) / 400;

  // Priority: svg_code > elements > template
  if (svg_code) {
    return <RawSvgRenderer svgCode={svg_code} onAction={onAction} isStreaming={isStreaming} vb={vb} />;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isStreaming) {
      onAction({ type: 'SUBMIT_FORM', payload: { intent: 'continue' } });
    }
  };

  // Decide rendering path: elements-based (new) vs template-based (legacy)
  const hasElements = elements && elements.length > 0;
  const hasTemplate = template && TEMPLATES[template];

  const layoutItems = hasElements ? layoutElements(elements, vb) : [];

  const TemplateRenderer = hasTemplate ? TEMPLATES[template] : undefined;

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl cursor-pointer select-none group"
      onClick={handleClick}
    >
      <style>{`
        @keyframes svg-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes svg-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.7; } }
        @keyframes svg-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
      <svg viewBox={`0 0 ${vb.w} ${vb.h}`} preserveAspectRatio="xMidYMid meet" className="block w-full">
        {/* Background */}
        <rect x={0} y={0} width={vb.w} height={vb.h} fill={background ?? '#0f172a'} />

        {/* Title */}
        {title && (
          <Anim delay={0} streaming={isStreaming}>
            <WrappedText x={vb.w / 2} y={vb.h * 0.08} text={title} maxWidth={vb.w * 0.85} fontSize={20 * sc} fill="#e2e8f0" />
          </Anim>
        )}

        {/* New: elements-based scene */}
        {hasElements && <SceneRenderer items={layoutItems} vb={vb} streaming={isStreaming} />}

        {/* Legacy: template-based content */}
        {!hasElements && TemplateRenderer && <TemplateRenderer props={props} vb={vb} streaming={isStreaming} />}

        {/* Click to continue */}
        {!isStreaming && (
          <motion.text
            x={vb.w / 2} y={vb.h * 0.96}
            textAnchor="middle" fill="#475569" fontSize={10 * sc} fontFamily="monospace"
            initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
          >
            CLICK TO CONTINUE ▸
          </motion.text>
        )}
      </svg>
    </div>
  );
};

export default SvgAnimation;
