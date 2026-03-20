
import React from 'react';
import { Container } from './Container';
import { Typography } from './Typography';
import { Button } from './Button';
import { Hero } from './Hero';
import { Card } from './Card';
import { StatCard } from './StatCard';
import { Progress } from './Progress';
import { Alert } from './Alert';
import { Avatar } from './Avatar';
import { Input } from './Input';
import { Separator } from './Separator';
import { Badge } from './Badge';
import { Accordion } from './Accordion';
import { ImageComponent } from './Image';
import { BentoContainer, BentoCard } from './BentoGrid';
import { Kanban } from './Kanban';
import { Switch } from './Switch';
import { Slider } from './Slider';
import { Tabs } from './Tabs';
import { Stepper } from './Stepper';
import { Timeline } from './Timeline';
import { CodeBlock } from './CodeBlock';
import { Textarea } from './Textarea';
import { SplitPane } from './SplitPane';
import { Calendar } from './Calendar';

/** Broad component type for runtime registry — type safety ensured by schema validation */
type DynamicComponent = React.ComponentType<Record<string, unknown>>;

// --- Safe Lazy Loader ---
// This decouples the Registry from the specific export style (default vs named) of the target file.
// It automatically finds the correct component, preventing Error #520 (Suspense Mismatch).
function safeLazy(
  importFunc: () => Promise<Record<string, unknown>>,
  componentName?: string
): React.LazyExoticComponent<DynamicComponent> {
  return React.lazy(() =>
    importFunc().then((module: Record<string, unknown>) => {
      // 1. Try Default Export
      if (module.default) return { default: module.default as DynamicComponent };

      // 2. Try Named Export (if name provided)
      if (componentName && module[componentName]) return { default: module[componentName] as DynamicComponent };

      // 3. Fallback: Try to find the first PascalCase export
      const key = Object.keys(module).find(k => k[0] === k[0].toUpperCase() && typeof module[k] === 'function');
      if (key) return { default: module[key] as DynamicComponent };

      throw new Error(`Module loaded but Component not found. Keys: ${Object.keys(module).join(', ')}`);
    })
  );
}

// Lazy load heavy components to optimize bundle size and TTI
const ChartComponent = safeLazy(() => import('./Chart'), 'ChartComponent');
const MapWidget = safeLazy(() => import('./Map'), 'MapWidget');
const Table = safeLazy(() => import('./Table'), 'Table');

// VNStage: Load safely from the galgame module
const VNStage = safeLazy(() => import('../galgame/VNStage'), 'VNStage');

// SvgAnimation: Animated SVG scenes
const SvgAnimation = safeLazy(() => import('../svg/SvgAnimation'), 'SvgAnimation');

// Presentation: Slide deck with SVG slides
const Presentation = safeLazy(() => import('../presentation/Presentation'), 'Presentation');

/* -------------------------------------------------------------------------- */
/*                            COMPONENT REGISTRY MAP                          */
/* -------------------------------------------------------------------------- */
export const ComponentRegistry: Record<string, DynamicComponent> = {
  container: Container,
  card: Card,
  separator: Separator,
  hero: Hero,
  accordion: Accordion,
  
  text: Typography,
  button: Button,
  input: Input,
  textarea: Textarea, 
  switch: Switch,
  slider: Slider,
  tabs: Tabs, 
  stepper: Stepper, 
  badge: Badge,
  avatar: Avatar,
  alert: Alert,
  
  stat: StatCard,
  progress: Progress,
  image: ImageComponent,
  
  // New Complex Components
  bento_container: BentoContainer,
  bento_card: BentoCard,
  kanban: Kanban,
  timeline: Timeline, 
  codeblock: CodeBlock, 
  split_pane: SplitPane, 
  calendar: Calendar, 
  vn_stage: VNStage,
  svg_animation: SvgAnimation,
  presentation: Presentation,

  // Lazy Components
  chart: ChartComponent,
  table: Table,
  map: MapWidget
};
