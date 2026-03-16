import { describe, it, expect } from 'vitest';
import { layoutElements } from '@/services/svg/layout';
import type { SceneElement } from '@/services/schemas/svg-animation';

const VB = { w: 1000, h: 562 };
const VB_MOBILE = { w: 562, h: 1000 };

describe('layoutElements', () => {
  it('should place element at named position "left"', () => {
    const elements: SceneElement[] = [
      { asset: 'stickman', position: 'left' },
    ];
    const laid = layoutElements(elements, VB);
    expect(laid).toHaveLength(1);
    expect(laid[0].x).toBeCloseTo(VB.w * 0.15, 0);
    expect(laid[0].y).toBeCloseTo(VB.h * 0.5, 0);
  });

  it('should place element at named position "center"', () => {
    const laid = layoutElements([{ asset: 'gear', position: 'center' }], VB);
    expect(laid[0].x).toBeCloseTo(VB.w * 0.5, 0);
    expect(laid[0].y).toBeCloseTo(VB.h * 0.5, 0);
  });

  it('should place element at named position "right"', () => {
    const laid = layoutElements([{ asset: 'check', position: 'right' }], VB);
    expect(laid[0].x).toBeCloseTo(VB.w * 0.85, 0);
    expect(laid[0].y).toBeCloseTo(VB.h * 0.5, 0);
  });

  it('should place element at compound position "top-left"', () => {
    const laid = layoutElements([{ asset: 'gear', position: 'top-left' }], VB);
    expect(laid[0].x).toBeCloseTo(VB.w * 0.2, 0);
    expect(laid[0].y).toBeCloseTo(VB.h * 0.25, 0);
  });

  it('should place element at compound position "bottom-center"', () => {
    const laid = layoutElements([{ asset: 'gear', position: 'bottom-center' }], VB);
    expect(laid[0].x).toBeCloseTo(VB.w * 0.5, 0);
    expect(laid[0].y).toBeCloseTo(VB.h * 0.8, 0);
  });

  it('should resolve "above-last" anchor relative to previous element', () => {
    const elements: SceneElement[] = [
      { asset: 'stickman', position: 'left' },
      { asset: 'speech_bubble', anchor: 'above-last', text: 'Hello' },
    ];
    const laid = layoutElements(elements, VB);
    expect(laid[1].x).toBe(laid[0].x);
    expect(laid[1].y).toBeLessThan(laid[0].y);
  });

  it('should resolve "right-of-last" anchor relative to previous element', () => {
    const elements: SceneElement[] = [
      { asset: 'stickman', position: 'left' },
      { asset: 'gear', anchor: 'right-of-last' },
    ];
    const laid = layoutElements(elements, VB);
    expect(laid[1].x).toBeGreaterThan(laid[0].x);
    expect(laid[1].y).toBe(laid[0].y);
  });

  it('should resolve "below:N" anchor relative to Nth element', () => {
    const elements: SceneElement[] = [
      { asset: 'stickman', position: 'left' },
      { asset: 'gear', position: 'center' },
      { asset: 'check', anchor: 'below:0' },
    ];
    const laid = layoutElements(elements, VB);
    expect(laid[2].x).toBe(laid[0].x);
    expect(laid[2].y).toBeGreaterThan(laid[0].y);
  });

  it('should auto-distribute elements with no position', () => {
    const elements: SceneElement[] = [
      { asset: 'gear' },
      { asset: 'check' },
      { asset: 'lightbulb' },
    ];
    const laid = layoutElements(elements, VB);
    expect(laid).toHaveLength(3);
    // Elements should be distributed horizontally
    expect(laid[0].x).toBeLessThan(laid[1].x);
    expect(laid[1].x).toBeLessThan(laid[2].x);
  });

  it('should return empty array for empty input', () => {
    expect(layoutElements([], VB)).toEqual([]);
  });

  it('should work with mobile viewBox', () => {
    const laid = layoutElements([{ asset: 'gear', position: 'center' }], VB_MOBILE);
    expect(laid[0].x).toBeCloseTo(VB_MOBILE.w * 0.5, 0);
    expect(laid[0].y).toBeCloseTo(VB_MOBILE.h * 0.5, 0);
  });

  it('should resolve from/to as connections (arrow elements)', () => {
    const elements: SceneElement[] = [
      { asset: 'stickman', position: 'left' },
      { asset: 'gear', position: 'right' },
      { asset: 'arrow', from: 'left', to: 'right', style: 'flow' },
    ];
    const laid = layoutElements(elements, VB);
    const arrow = laid[2];
    // Arrow should have fromXY/toXY resolved
    expect(arrow.fromXY).toBeDefined();
    expect(arrow.toXY).toBeDefined();
    expect(arrow.fromXY!.x).toBeCloseTo(VB.w * 0.15, 0);
    expect(arrow.toXY!.x).toBeCloseTo(VB.w * 0.85, 0);
  });

  it('should resolve from/to by element index', () => {
    const elements: SceneElement[] = [
      { asset: 'stickman', position: 'left' },
      { asset: 'gear', position: 'right' },
      { asset: 'arrow', from: '0', to: '1' },
    ];
    const laid = layoutElements(elements, VB);
    const arrow = laid[2];
    expect(arrow.fromXY).toBeDefined();
    expect(arrow.toXY).toBeDefined();
    expect(arrow.fromXY!.x).toBeCloseTo(laid[0].x, 0);
    expect(arrow.toXY!.x).toBeCloseTo(laid[1].x, 0);
  });
});
