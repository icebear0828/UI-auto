import { UINode } from "@/types";

// 1. 动态命名：不再查表，算法生成
const toPascalCase = (str: string): string => {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase()) // snake/kebab -> camel
    .replace(/^\w/, (c) => c.toUpperCase());         // first -> upper
};

// 2. 漂亮打印：递归序列化，而不是一行 JSON
const serializeProp = (value: unknown, depth: number = 0): string => {
  const indent = "  ".repeat(depth);
  
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map(v => serializeProp(v, depth + 1)).join(",\n" + indent + "  ");
    return `[\n${indent}  ${items}\n${indent}]`;
  }
  
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    // 动作对象特殊处理，显示得更像代码
    if (obj.type && obj.payload) {
        return `{ type: "${obj.type}", payload: ${serializeProp(obj.payload, depth)} }`;
    }

    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";
    
    const props = entries
      .map(([k, v]) => `${k}: ${serializeProp(v, depth + 1)}`)
      .join(",\n" + indent + "  ");
      
    return `{\n${indent}  ${props}\n${indent}}`;
  }

  return JSON.stringify(value);
};

const generateJSX = (node: UINode, depth: number = 0): string => {
  if (!node || typeof node !== "object") return "";

  const key = Object.keys(node)[0];
  if (!key) return "";

  const ComponentName = toPascalCase(key);
  const props = (node[key] || {}) as Record<string, unknown>;
  const { children, ...restProps } = props;

  const indentStr = "  ".repeat(depth);
  
  // 生成 Props 字符串
  const propLines = Object.entries(restProps).map(([k, v]) => {
    if (v === undefined || v === null) return "";
    if (v === true) return k; // Boolean shorthand
    if (typeof v === "string") {
      // Use curly brace syntax for strings containing quotes or newlines
      if (v.includes('"') || v.includes('\n') || v.length > 100) {
        return `${k}={${JSON.stringify(v)}}`;
      }
      return `${k}="${v}"`;
    }
    return `${k}={${serializeProp(v, depth + 1)}}`;
  }).filter(Boolean);

  const propsString = propLines.length > 0 ? " " + propLines.join(" ") : "";

  // 处理子节点
  const hasChildren = Array.isArray(children) && children.length > 0;

  if (!hasChildren) {
    return `${indentStr}<${ComponentName}${propsString} />`;
  }

  const childrenJSX = children
    .map((child: UINode) => generateJSX(child, depth + 1))
    .join("\n");

  return `${indentStr}<${ComponentName}${propsString}>\n${childrenJSX}\n${indentStr}</${ComponentName}>`;
};

export const generateReactCode = (rootNode: UINode): string => {
  if (!rootNode) return "// No UI to generate.";

  // 扫描所有用到的组件，生成 import
  const importsSet = new Set<string>();
  const scanImports = (node: UINode) => {
    const key = Object.keys(node)[0];
    if (key) {
      importsSet.add(toPascalCase(key));
      const nodeProps = node[key] as Record<string, unknown> | undefined;
      const children = nodeProps?.children;
      if (Array.isArray(children)) children.forEach(scanImports);
    }
  };
  scanImports(rootNode);

  const importStatement = `import React from 'react';
import { 
  ${Array.from(importsSet).sort().join(",\n  ")} 
} from './components/ui';`;

  const jsxBody = generateJSX(rootNode, 2);

  return `${importStatement}

export default function GeneratedPage() {
  return (
${jsxBody}
  );
}`;
};