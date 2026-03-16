import type { SvgAssetDef } from './types';

const registry = new Map<string, SvgAssetDef>();

export function registerAsset(name: string, def: SvgAssetDef): void {
  registry.set(name, def);
}

export function getAsset(name: string): SvgAssetDef | undefined {
  return registry.get(name);
}

export function getAllAssets(): Map<string, SvgAssetDef> {
  return registry;
}

export function resetAssets(): void {
  registry.clear();
}
