import { describe, it, expect, beforeEach } from 'vitest';
import { registerAsset, getAsset, getAllAssets, resetAssets } from '@/services/svg/registry';
import type { SvgAssetDef } from '@/services/svg/types';
import React from 'react';

const mockRender = () => React.createElement('g');

describe('SVG Asset Registry', () => {
  beforeEach(() => {
    resetAssets();
  });

  it('should register and retrieve an asset', () => {
    const def: SvgAssetDef = { name: 'test', type: 'character', render: mockRender };
    registerAsset('test', def);
    expect(getAsset('test')).toBe(def);
  });

  it('should return undefined for unregistered asset', () => {
    expect(getAsset('nonexistent')).toBeUndefined();
  });

  it('should overwrite existing asset with same name', () => {
    const def1: SvgAssetDef = { name: 'a', type: 'icon', render: mockRender };
    const def2: SvgAssetDef = { name: 'a', type: 'icon', render: mockRender };
    registerAsset('a', def1);
    registerAsset('a', def2);
    expect(getAsset('a')).toBe(def2);
  });

  it('should return all registered assets', () => {
    registerAsset('x', { name: 'x', type: 'character', render: mockRender });
    registerAsset('y', { name: 'y', type: 'icon', render: mockRender });
    expect(getAllAssets().size).toBe(2);
  });

  it('should clear all assets on reset', () => {
    registerAsset('z', { name: 'z', type: 'decoration', render: mockRender });
    resetAssets();
    expect(getAllAssets().size).toBe(0);
  });

  it('should store variants metadata', () => {
    const def: SvgAssetDef = {
      name: 'stickman', type: 'character',
      variants: ['stand', 'wave', 'point', 'think', 'sit', 'walk'],
      render: mockRender,
    };
    registerAsset('stickman', def);
    expect(getAsset('stickman')?.variants).toEqual(['stand', 'wave', 'point', 'think', 'sit', 'walk']);
  });
});

describe('SVG Asset self-registration', () => {
  it('should have stickman registered after importing index', async () => {
    await import('@/services/svg');
    expect(getAsset('stickman')).toBeDefined();
    expect(getAsset('stickman')?.type).toBe('character');
    expect(getAsset('stickman')?.variants).toContain('stand');
    expect(getAsset('stickman')?.variants).toContain('wave');
  });

  it('should have all 6 icons registered', async () => {
    await import('@/services/svg');
    for (const name of ['lightbulb', 'gear', 'check', 'heart', 'warning', 'question']) {
      expect(getAsset(name)).toBeDefined();
      expect(getAsset(name)?.type).toBe('icon');
    }
  });

  it('should have speech_bubble registered', async () => {
    await import('@/services/svg');
    expect(getAsset('speech_bubble')).toBeDefined();
    expect(getAsset('speech_bubble')?.type).toBe('decoration');
  });

  it('should have arrow registered', async () => {
    await import('@/services/svg');
    expect(getAsset('arrow')).toBeDefined();
    expect(getAsset('arrow')?.type).toBe('decoration');
  });

  it('stickman render should return non-null for valid props', async () => {
    await import('@/services/svg');
    const result = getAsset('stickman')?.render({ x: 100, y: 200, scale: 1, variant: 'stand' });
    expect(result).not.toBeNull();
  });

  it('icon render should return non-null', async () => {
    await import('@/services/svg');
    const result = getAsset('lightbulb')?.render({ x: 50, y: 50, scale: 20 });
    expect(result).not.toBeNull();
  });
});
