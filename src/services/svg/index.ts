// Import all asset modules to trigger self-registration
import './characters/stickman';
import './icons/basic';
import './decorations/speech-bubble';
import './decorations/arrow';

// Re-export registry API
export { registerAsset, getAsset, getAllAssets, resetAssets } from './registry';
export type { SvgAssetDef, AssetRenderProps } from './types';
