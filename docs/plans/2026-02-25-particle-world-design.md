# Particle World 技术设计文档

## 概述

Particle World 是一个浏览器内运行的粉末沙盒模拟游戏，基于 cellular automaton 原理，模拟粒子的物理行为（重力、流动、燃烧、化学反应等）。

## 技术选型

| 维度 | 选择 | 理由 |
|------|------|------|
| 语言 | TypeScript | 类型安全，IDE 支持好 |
| 构建 | Vite | 零配置，HMR 快 |
| 渲染 | Canvas 2D ImageData | 像素级操作，天然适合粒子渲染 |
| UI | 原生 DOM | 粒子模拟 UI 简单，不需要框架 |
| 数据存储 | TypedArray | Uint8Array 存材质 ID，Uint32Array 存颜色 |

## 架构

```
src/
├── core/               # 核心引擎
│   ├── World.ts            # 网格世界（TypedArray 存储）
│   ├── Simulation.ts       # 模拟循环（requestAnimationFrame）
│   └── Renderer.ts         # Canvas 渲染器（ImageData）
├── materials/          # 材质系统
│   ├── types.ts            # 材质接口定义
│   ├── registry.ts         # 材质注册表
│   ├── Empty.ts            # 空气
│   ├── Sand.ts             # 沙子（粉末类）
│   ├── Water.ts            # 水（液体类）
│   └── Stone.ts            # 石头（固体类）
├── ui/                 # 用户界面
│   ├── Toolbar.ts          # 工具栏（材质选择、笔刷大小）
│   └── InputHandler.ts     # 鼠标/触摸交互
├── utils/              # 工具函数
│   └── helpers.ts
├── main.ts             # 入口
└── style.css           # 样式
```

## 核心数据结构

### 网格世界

```typescript
class World {
  width: number;
  height: number;
  cells: Uint8Array;      // 材质 ID（0=空气, 1=沙, 2=水, 3=石头...）
  colors: Uint32Array;    // RGBA 颜色（直接写入 ImageData.data）
  updated: Uint8Array;    // 本帧是否已更新（防止重复处理）
}
```

### 材质接口

```typescript
interface MaterialDef {
  id: number;
  name: string;
  color: number | (() => number);  // 固定色或随机色函数
  density: number;                  // 密度（决定沉浮）
  update(x: number, y: number, world: World): void;
}
```

## 物理规则

### 粉末类（沙子）
1. 尝试下落（下方为空或密度更低的液体）
2. 下方被阻挡 → 尝试左下或右下（随机先后）
3. 都被阻挡 → 静止

### 液体类（水）
1. 尝试下落
2. 下方被阻挡 → 尝试左下或右下
3. 斜下也被阻挡 → 尝试左或右水平流动
4. 流动有扩散范围限制

### 固体类（石头）
- 不移动，作为障碍物

## 渲染流程

每帧：
1. `Simulation.update()` — 从底部向上遍历网格，调用每个粒子的 update
2. `Renderer.render()` — 将 colors 数组写入 ImageData，putImageData 到 Canvas

## 迭代计划

| 版本 | 内容 |
|------|------|
| v0.1 | 项目骨架：Vite + TS + Canvas 空白画布 |
| v0.2 | 核心引擎：网格世界 + 模拟循环 + 沙子下落 |
| v0.3 | 交互系统：鼠标绘制 + 材质选择工具栏 |
| v0.4 | 液体物理：水的流动 + 密度分层 |
| v0.5 | 固体 + 擦除：石头 + 橡皮擦工具 |

## 性能目标

- 网格大小：200×150（3 万单元）
- 目标帧率：60fps
- 后期可扩展到 400×300（12 万单元）
