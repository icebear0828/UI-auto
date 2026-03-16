import React from 'react';
import { motion } from 'framer-motion';
import type { UIAction } from '@/types';
import type { SvgAnimationProps, SvgCharacter, SvgStep, SvgSide, SvgEvent } from '@/services/schemas/svg-animation';
import { useIsStreaming } from '@/components/ui/renderUtils';
import { useDeviceContext } from '@/components/DeviceContext';
import { getAsset } from '@/services/svg';

// ============================================================
// VIEWBOX & ANIMATION
// ============================================================

const DESKTOP = { w: 1000, h: 562 };  // 16:9
const MOBILE  = { w: 562, h: 1000 };  // 9:16

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
// STICKMAN RENDERER
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

// Word-wrap text into lines that fit within maxWidth (approximate)
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
  // Use 0.48 per char average (accounts for wide chars like m, W)
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
}

// Convenience wrappers using the asset registry
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
// TEMPLATE RENDERERS
// ============================================================

function TutorialStep({ props, vb, streaming }: { props: SvgAnimationProps; vb: { w: number; h: number }; streaming: boolean }) {
  const { character, content, step, icon } = props;
  const isVert = vb.h > vb.w;
  const sc = Math.min(vb.w, vb.h) / 400;

  // Layout zones
  const charX = isVert ? vb.w * 0.5 : vb.w * 0.15;
  const charY = isVert ? vb.h * 0.22 : vb.h * 0.5;
  const contentX = isVert ? vb.w * 0.5 : vb.w * 0.6;
  const contentY = isVert ? vb.h * 0.5 : vb.h * 0.25;
  const contentW = vb.w * (isVert ? 0.8 : 0.55);
  const anchor = isVert ? 'middle' : 'start';

  return (
    <>
      {/* Background elements first (rendered below) */}
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
      {/* Character on top (rendered last = highest z-order in SVG) */}
      {character?.dialog && (
        <Anim delay={0.5} streaming={streaming}>
          <BubbleAsset x={charX + (isVert ? 0 : 40 * sc)} y={charY - 60 * sc} w={vb.w * (isVert ? 0.65 : 0.25)} text={character.dialog} fontSize={10 * sc} />
        </Anim>
      )}
      <Anim delay={0.2} streaming={streaming}>
        <StickmanAsset x={charX} y={charY} scale={sc * 1.3} pose={character?.pose ?? 'stand'} label={character?.label} />
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
    // Calculate total lines needed for all points
    const pointLineCounts = pts.map(p => wrapText(`• ${p}`, charsPerLine).length);
    const totalLines = pointLineCounts.reduce((a, b) => a + b, 0);
    const boxH = (40 + totalLines * ptLineH / sc) * sc;

    let currentY = y + 28 * sc;
    return (
      <Anim delay={delay} streaming={streaming}>
        <rect x={x - boxW / 2} y={y - 20 * sc} width={boxW} height={boxH} rx={8 * sc} fill="#0f172a" stroke={color} strokeWidth={1.5} opacity={0.8} />
        <text x={x} y={y + 5 * sc} textAnchor="middle" fill={color} fontSize={16 * sc} fontWeight="bold" fontFamily="sans-serif">
          {side.title}
        </text>
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
            {/* Bubble first (below), then character on top */}
            {ch.dialog && (
              <Anim delay={i * 0.4 + 0.2} streaming={streaming}>
                <BubbleAsset x={x} y={y - 65 * sc} w={vb.w * (isVert ? 0.65 : 0.35)} text={ch.dialog} fontSize={11 * sc} />
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

  // Timeline line
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
// TEMPLATE REGISTRY
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

export const SvgAnimation: React.FC<SvgAnimationComponentProps> = (props) => {
  const isStreaming = useIsStreaming();
  const { device } = useDeviceContext();
  const isMobile = device === 'mobile';
  const vb = isMobile ? MOBILE : DESKTOP;
  const { background, title, template, onAction } = props;
  const sc = Math.min(vb.w, vb.h) / 400;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isStreaming) {
      onAction({ type: 'SUBMIT_FORM', payload: { intent: 'continue' } });
    }
  };

  const TemplateRenderer = TEMPLATES[template];

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl cursor-pointer select-none group"
      onClick={handleClick}
    >
      <svg viewBox={`0 0 ${vb.w} ${vb.h}`} preserveAspectRatio="xMidYMid meet" className="block w-full">
        {/* Background */}
        <rect x={0} y={0} width={vb.w} height={vb.h} fill={background ?? '#0f172a'} />

        {/* Title */}
        {title && (
          <Anim delay={0} streaming={isStreaming}>
            <WrappedText x={vb.w / 2} y={vb.h * 0.08} text={title} maxWidth={vb.w * 0.85} fontSize={20 * sc} fill="#e2e8f0" />
          </Anim>
        )}

        {/* Template content */}
        {TemplateRenderer && <TemplateRenderer props={props} vb={vb} streaming={isStreaming} />}

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
