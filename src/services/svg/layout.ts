import type { SceneElement } from '@/services/schemas/svg-animation';

// ============================================================
// Semantic position → coordinate mapping
// ============================================================

interface PositionMap {
  [key: string]: { xPct: number; yPct: number };
}

const POSITIONS: PositionMap = {
  'left':           { xPct: 0.15, yPct: 0.50 },
  'center':         { xPct: 0.50, yPct: 0.50 },
  'right':          { xPct: 0.85, yPct: 0.50 },
  'top-left':       { xPct: 0.20, yPct: 0.25 },
  'top-center':     { xPct: 0.50, yPct: 0.25 },
  'top-right':      { xPct: 0.80, yPct: 0.25 },
  'bottom-left':    { xPct: 0.20, yPct: 0.80 },
  'bottom-center':  { xPct: 0.50, yPct: 0.80 },
  'bottom-right':   { xPct: 0.80, yPct: 0.80 },
};

// ============================================================
// Layout result
// ============================================================

export interface LayoutItem {
  element: SceneElement;
  x: number;
  y: number;
  fromXY?: { x: number; y: number };
  toXY?: { x: number; y: number };
}

// ============================================================
// Anchor offset (responsive to viewBox)
// ============================================================

const ANCHOR_OFFSET_Y = 0.12;
const ANCHOR_OFFSET_X = 0.15;

// ============================================================
// Resolve from/to references → coordinates
// ============================================================

function resolveRef(
  ref: string,
  laid: LayoutItem[],
  vb: { w: number; h: number },
): { x: number; y: number } | undefined {
  // Try as position name
  const pos = POSITIONS[ref];
  if (pos) return { x: vb.w * pos.xPct, y: vb.h * pos.yPct };

  // Try as element index
  const idx = parseInt(ref, 10);
  if (!isNaN(idx) && idx >= 0 && idx < laid.length) {
    return { x: laid[idx].x, y: laid[idx].y };
  }

  return undefined;
}

// ============================================================
// Main layout function
// ============================================================

export function layoutElements(
  elements: SceneElement[],
  vb: { w: number; h: number },
): LayoutItem[] {
  if (elements.length === 0) return [];

  const result: LayoutItem[] = [];

  // Track how many elements have no position/anchor so we can auto-distribute
  let unpositionedCount = 0;
  for (const el of elements) {
    if (!el.position && !el.anchor && !el.from) unpositionedCount++;
  }

  let unpositionedIdx = 0;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    let x: number;
    let y: number;

    if (el.position && POSITIONS[el.position]) {
      // Named position
      const pos = POSITIONS[el.position];
      x = vb.w * pos.xPct;
      y = vb.h * pos.yPct;
    } else if (el.anchor) {
      // Relative anchor
      const parsed = parseAnchor(el.anchor, result, vb);
      x = parsed.x;
      y = parsed.y;
    } else if (el.from && el.to) {
      // Connection element (arrow) — place at midpoint
      const fromPt = resolveRef(el.from, result, vb);
      const toPt = resolveRef(el.to, result, vb);
      x = fromPt && toPt ? (fromPt.x + toPt.x) / 2 : vb.w * 0.5;
      y = fromPt && toPt ? (fromPt.y + toPt.y) / 2 : vb.h * 0.5;
    } else {
      // Auto-distribute horizontally
      const n = unpositionedCount;
      const t = (unpositionedIdx + 0.5) / Math.max(n, 1);
      x = vb.w * (0.1 + t * 0.8);
      y = vb.h * 0.5;
      unpositionedIdx++;
    }

    const item: LayoutItem = { element: el, x, y };

    // Resolve from/to for connection elements
    if (el.from) {
      item.fromXY = resolveRef(el.from, result, vb);
    }
    if (el.to) {
      item.toXY = resolveRef(el.to, result, vb);
    }

    result.push(item);
  }

  return result;
}

// ============================================================
// Anchor parser
// ============================================================

function parseAnchor(
  anchor: string,
  laid: LayoutItem[],
  vb: { w: number; h: number },
): { x: number; y: number } {
  const last = laid.length > 0 ? laid[laid.length - 1] : undefined;
  const fallback = { x: vb.w * 0.5, y: vb.h * 0.5 };

  if (anchor === 'above-last') {
    if (!last) return fallback;
    return { x: last.x, y: last.y - vb.h * ANCHOR_OFFSET_Y };
  }

  if (anchor === 'right-of-last') {
    if (!last) return fallback;
    return { x: last.x + vb.w * ANCHOR_OFFSET_X, y: last.y };
  }

  if (anchor === 'below-last') {
    if (!last) return fallback;
    return { x: last.x, y: last.y + vb.h * ANCHOR_OFFSET_Y };
  }

  if (anchor === 'left-of-last') {
    if (!last) return fallback;
    return { x: last.x - vb.w * ANCHOR_OFFSET_X, y: last.y };
  }

  // "below:N" or "above:N" — relative to element at index N
  const match = anchor.match(/^(above|below|right-of|left-of):(\d+)$/);
  if (match) {
    const dir = match[1];
    const idx = parseInt(match[2], 10);
    const ref = idx >= 0 && idx < laid.length ? laid[idx] : undefined;
    if (!ref) return fallback;

    switch (dir) {
      case 'above':    return { x: ref.x, y: ref.y - vb.h * ANCHOR_OFFSET_Y };
      case 'below':    return { x: ref.x, y: ref.y + vb.h * ANCHOR_OFFSET_Y };
      case 'right-of': return { x: ref.x + vb.w * ANCHOR_OFFSET_X, y: ref.y };
      case 'left-of':  return { x: ref.x - vb.w * ANCHOR_OFFSET_X, y: ref.y };
    }
  }

  return fallback;
}
