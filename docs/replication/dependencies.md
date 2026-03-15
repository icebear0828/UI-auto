# 依赖配置

> 本文档包含项目复刻所需的完整依赖配置

## package.json

```json
{
  "name": "genui-architect",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@google/genai": "^1.30.0",
    "canvas-confetti": "^1.9.2",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.555.0",
    "openai": "^4.28.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "recharts": "^3.5.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "autoprefixer": "^10.4.23",
    "jsdom": "^24.0.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19",
    "typescript": "~5.8.2",
    "vite": "^6.2.0",
    "vitest": "^2.0.0"
  }
}
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "types": ["node"],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./*"]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

---

## vite.config.ts

```typescript
/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve('.'),
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: ['node_modules/', 'tests/']
      }
    }
  };
});
```

---

## tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                deep: {
                    950: '#030014',
                    900: '#0a0118',
                    800: '#120225',
                },
            },
            animation: {
                'gradient-x': 'gradient-x 3s ease infinite',
                'shine': 'shine 1.5s linear infinite',
                'float-y': 'float-y 3s ease-in-out infinite',
                'float-slow': 'float-slow 25s infinite alternate ease-in-out',
                'float-reverse': 'float-reverse 30s infinite alternate-reverse ease-in-out',
                'pulse-glow': 'pulse-glow 20s infinite ease-in-out',
            },
            keyframes: {
                'gradient-x': {
                    '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
                    '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
                },
                'shine': {
                    'from': { transform: 'translateX(-100%) skewX(-12deg)' },
                    'to': { transform: 'translateX(200%) skewX(-12deg)' },
                },
                'float-y': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                'float-slow': {
                    '0%': { transform: 'translate(0, 0) scale(1)' },
                    '50%': { transform: 'translate(30px, 20px) scale(1.05)' },
                    '100%': { transform: 'translate(-20px, 40px) scale(1)' },
                },
                'float-reverse': {
                    '0%': { transform: 'translate(0, 0) rotate(0deg)' },
                    '100%': { transform: 'translate(-40px, -20px) rotate(5deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.15', transform: 'scale(1)' },
                    '50%': { opacity: '0.25', transform: 'scale(1.2)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
```

---

## postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## .env.example

```env
# Gemini API Key (Required)
GEMINI_API_KEY=your_api_key_here
```

---

## 依赖说明

### 运行时依赖

| 包名 | 用途 |
|------|------|
| `@google/genai` | Gemini AI SDK，流式生成 |
| `react` / `react-dom` | UI 框架 |
| `framer-motion` | 动画库，18 种预设动画 |
| `lucide-react` | 图标库 |
| `recharts` | 图表组件 (Bar/Line/Area) |
| `zod` | Schema 验证，29 种组件定义 |
| `canvas-confetti` | 特效 (CONFETTI/SNOW) |
| `openai` | OpenAI 兼容接口 (备用) |

### 开发依赖

| 包名 | 用途 |
|------|------|
| `vite` | 构建工具，HMR |
| `typescript` | 类型系统 |
| `tailwindcss` | 原子化 CSS |
| `vitest` | 测试框架 |
| `@testing-library/*` | React 测试工具 |
