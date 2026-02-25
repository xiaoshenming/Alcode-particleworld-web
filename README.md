# Particle World

基于物理引擎的粉末沙盒模拟游戏，纯浏览器运行。

## 功能

- 4 种材质：沙子、水、石头、空气（橡皮擦）
- 真实物理：重力下落、粉末堆积、液体流动、密度分层
- 交互绘制：鼠标/触摸拖拽，可调笔刷大小
- 实时 FPS 显示

## 技术栈

TypeScript + Vite + Canvas 2D（无框架依赖）

## 快速开始

```bash
npm install
npm run dev
```

打开浏览器访问 `http://localhost:5173`，选择材质后在画布上拖拽绘制。

## 构建

```bash
npm run build
```

## 物理规则

| 材质 | 行为 |
|------|------|
| 沙子 | 重力下落，斜向滑落堆积，沉入水中 |
| 水 | 重力下落，斜向流动，水平扩散 |
| 石头 | 不移动，作为障碍物 |
| 空气 | 橡皮擦，清除粒子 |

## 项目结构

```
src/
├── core/           # 引擎：World + Simulation + Renderer
├── materials/      # 材质定义和注册
├── ui/             # 工具栏和输入处理
├── main.ts         # 入口
└── style.css       # 样式
```
