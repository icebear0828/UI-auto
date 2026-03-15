# GenUI Architect

基于 Google Gemini AI 的智能 UI 生成器应用。

## 技术栈

- **前端框架**: React 19.2
- **构建工具**: Vite 6.2
- **语言**: TypeScript 5.8
- **AI 服务**: Google Gemini AI (`@google/genai`)
- **图表库**: Recharts 3.5
- **动画库**: Framer Motion 11
- **图标库**: Lucide React
- **数据验证**: Zod

## 快速启动

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐) 或 npm

### 1. 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 2. 配置环境变量

编辑 `.env.local` 文件，设置你的 Gemini API Key：

```env
GEMINI_API_KEY=你的_GEMINI_API_KEY
```

> 获取 API Key: https://ai.google.dev/gemini-api/docs/api-key

### 3. 启动开发服务器

```bash
# 使用 pnpm
pnpm dev

# 或使用 npm
npm run dev
```

应用将在 http://localhost:3000 启动。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 (端口 3000) |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览生产构建 |

## 项目结构

```
architect/
├── components/      # React 组件
├── hooks/           # 自定义 Hooks
├── services/        # API 服务层
├── types/           # TypeScript 类型定义
├── doc/             # 文档
├── dist/            # 构建输出目录
├── App.tsx          # 主应用组件
├── index.tsx        # 应用入口
├── index.html       # HTML 模板
├── constants.ts     # 常量配置
├── types.ts         # 共享类型
├── vite.config.ts   # Vite 配置
└── tsconfig.json    # TypeScript 配置
```

## 生产部署

### 构建

```bash
pnpm build
```

构建产物将输出到 `dist/` 目录。

### 部署

将 `dist/` 目录部署到任意静态文件服务器，如：
- Nginx
- Vercel
- Netlify
- GitHub Pages

## 许可证

Private
