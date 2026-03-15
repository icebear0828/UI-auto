# 前端组件文档

> 本文档描述 UI 组件库的完整规格

---

## 组件概览

| 分类 | 组件数量 | 说明 |
|------|----------|------|
| 布局 | 5 | Container, Hero, BentoGrid, SplitPane, Separator |
| 输入 | 5 | Input, Textarea, Switch, Slider, Calendar |
| 展示 | 10 | Card, StatCard, Progress, Alert, Badge, Avatar, Image, Typography, CodeBlock, Timeline |
| 交互 | 4 | Button, Tabs, Stepper, Accordion |
| 数据 | 3 | Table, Chart, Kanban |
| 特殊 | 2 | Map, VNStage |

---

## 全局动画属性

所有可视组件支持 `animation` 属性：

```typescript
interface AnimationConfig {
  type: 
    | 'FADE_IN' | 'FADE_IN_UP' | 'SLIDE_FROM_LEFT' | 'SLIDE_FROM_RIGHT'
    | 'SCALE_IN' | 'SCALE_ELASTIC' | 'BLUR_IN' | 'STAGGER_CONTAINER'
    | 'PULSE' | 'SHIMMER' | 'SHAKE' | 'GLOW' | 'BOUNCE'
    | 'TYPEWRITER' | 'SCRAMBLE' | 'GRADIENT_FLOW'
    | 'WIGGLE' | 'POP' | 'HOVER_GROW' | 'NONE';
  duration?: 'FAST' | 'NORMAL' | 'SLOW';
  delay?: number; // seconds
  trigger?: 'ON_MOUNT' | 'ON_HOVER' | 'ON_VIEW';
}
```

---

## 布局组件

### Container

```typescript
interface ContainerProps {
  layout?: 'COL' | 'ROW' | 'GRID';
  gap?: 'GAP_SM' | 'GAP_MD' | 'GAP_LG' | 'GAP_XL';
  padding?: boolean;
  background?: 'DEFAULT' | 'SURFACE' | 'GLASS';
  bgImage?: string;
  className?: string;
  children?: UINode[];
}
```

### Hero

```typescript
interface HeroProps {
  title: string;
  subtitle?: string;
  gradient?: 'BLUE_PURPLE' | 'ORANGE_RED' | 'GREEN_TEAL' | 'AURORA' | 'CYBER';
  align?: 'CENTER' | 'LEFT';
  children?: UINode[]; // 通常是 Button
}
```

### BentoGrid

```typescript
// bento_container
interface BentoContainerProps {
  children: UINode[]; // 必须是 bento_card
}

// bento_card
interface BentoCardProps {
  title?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
  bgImage?: string;
  children?: UINode[];
}
```

---

## 输入组件

### Input

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  inputType?: 'text' | 'email' | 'password' | 'number';
  value?: string;
  validation?: {
    required?: boolean;
    pattern?: string; // Regex
    minLength?: number;
    maxLength?: number;
    errorMessage?: string;
  };
}
```

### Switch

```typescript
interface SwitchProps {
  label: string;
  value?: boolean;
}
```

### Slider

```typescript
interface SliderProps {
  label: string;
  min?: number;
  max?: number;
  value?: number;
  step?: number;
}
```

---

## 展示组件

### Card

```typescript
interface CardProps {
  title?: string;
  variant?: 'DEFAULT' | 'GLASS' | 'NEON' | 'OUTLINED' | 'ELEVATED' | 'FROSTED';
  children?: UINode[];
}
```

### StatCard

```typescript
interface StatProps {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: 'UP' | 'DOWN' | 'NEUTRAL';
}
```

### Chart (Recharts)

```typescript
interface ChartProps {
  title?: string;
  type: 'BAR' | 'LINE' | 'AREA';
  color?: string; // Hex
  data: Array<{ name: string; value: number }>;
}
```

---

## 交互组件

### Button

```typescript
interface ButtonProps {
  label: string;
  variant?: 'PRIMARY' | 'SECONDARY' | 'GHOST' | 'DANGER' | 'GLOW' | 'OUTLINE' | 'SOFT' | 'GRADIENT';
  icon?: string; // Lucide icon name
  disabled?: boolean;
  action?: UIAction;
}
```

**支持的 Action 类型**:
- `NAVIGATE` - 打开 URL
- `OPEN_MODAL` - 打开模态框
- `CLOSE_MODAL` - 关闭模态框
- `TRIGGER_EFFECT` - 触发特效 (CONFETTI/SNOW)
- `SHOW_TOAST` - 显示 Toast
- `COPY_TO_CLIPBOARD` - 复制到剪贴板
- `DOWNLOAD` - 下载文件
- `CYCLE_STATE` - 循环状态
- `SUBMIT_FORM` - 提交表单
- `PATCH_STATE` - 更新状态
- `SEQUENCE` - 顺序执行多个 Action
- `DELAY` - 延迟执行
- `GO_BACK` - 撤销

### Tabs

```typescript
interface TabsProps {
  defaultValue?: string;
  variant?: 'DEFAULT' | 'PILLS' | 'UNDERLINE';
  items: Array<{
    id: string;
    label: string;
    content: UINode[];
  }>;
}
```

### Stepper

```typescript
interface StepperProps {
  currentStep?: number; // 0-indexed
  items: Array<{
    id: string;
    title: string;
    content: UINode[];
  }>;
}
```

---

## 特殊组件

### VNStage (视觉小说)

```typescript
interface VNStageProps {
  background: {
    source: 'EXTERNAL_URL' | 'GENERATED';
    value: string;
    style?: string;
  };
  characters?: Array<{
    id: string;
    name: string;
    avatar: ImageAsset;
    position: 'LEFT' | 'CENTER' | 'RIGHT' | 'CLOSE_UP';
    expression: 'NEUTRAL' | 'SMILE' | 'ANGRY' | 'BLUSH' | 'SAD' | 'SHOCKED';
    animation?: { type: string; delay?: number };
  }>;
  dialogue: {
    speaker: string;
    content: string;
    speed?: 'SLOW' | 'NORMAL' | 'FAST';
  };
  choices?: Array<{
    label: string;
    action: UIAction;
    style?: 'DEFAULT' | 'AGGRESSIVE' | 'ROMANTIC';
  }>;
  bgm?: string;
}
```

---

## 主题系统

所有组件样式定义在 `components/ui/theme.ts`，使用 Token 化设计：

```typescript
export const DEFAULT_THEME = {
  typography: { variants: {...}, colors: {...}, fonts: {...} },
  button: { base: '...', variants: {...} },
  card: { base: '...', variants: {...} },
  container: { base: '...', layouts: {...}, gaps: {...}, backgrounds: {...} },
  // ... 20+ 组件主题
};
```
