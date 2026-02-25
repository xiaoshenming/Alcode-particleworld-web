# Particle World - 粉末沙盒模拟游戏

## 项目概述
基于物理引擎的粉末沙盒模拟游戏，纯前端实现，运行在浏览器中。

## 技术栈
- 语言：TypeScript（strict 模式）
- 构建：Vite 7
- 渲染：Canvas 2D ImageData（像素级操作）
- UI：原生 DOM（无框架）
- 数据存储：TypedArray（Uint8Array 材质ID + Uint32Array 颜色）

## 架构
```
src/
├── core/               # 核心引擎
│   ├── World.ts            # 网格世界（TypedArray 存储）
│   ├── Simulation.ts       # 模拟循环（底部向上扫描）
│   └── Renderer.ts         # Canvas 渲染器（ImageData 缩放）
├── materials/          # 材质系统
│   ├── types.ts            # MaterialDef + WorldAPI 接口
│   ├── registry.ts         # 材质注册表
│   ├── Empty.ts            # 空气（id=0）
│   ├── Sand.ts             # 沙子（id=1，粉末类）
│   ├── Water.ts            # 水（id=2，液体类）
│   └── Stone.ts            # 石头（id=3，固体类）
├── ui/                 # 用户界面
│   ├── Toolbar.ts          # 材质选择 + 笔刷大小
│   └── InputHandler.ts     # 鼠标/触摸交互
├── main.ts             # 入口
└── style.css           # 样式
```

## 核心设计
- 网格大小：200x150，像素缩放 4x
- 材质通过 `MaterialDef` 接口定义，注册到全局 registry
- 模拟从底部向上扫描，随机左右方向避免偏向
- 密度系统：高密度粒子可置换低密度粒子（沙沉水浮）
- 每种材质的 `update()` 方法定义物理行为

## 命令
- `npm run dev` — 开发服务器
- `npm run build` — 类型检查 + 构建
- `npm run typecheck` — 仅类型检查

## 核心需求
- 模拟物质世界的物理行为（重力、流动、燃烧、反应等）
- 用户可以与模拟世界交互（添加/删除/修改物质）
- 不同材质之间有真实的相互作用
- 视觉上有清晰的材质区分和动态效果

## 技术边界
- 浏览器可运行（无需后端）
- 纯前端实现
- 代码可维护、可扩展

## 开发规范
- 每个功能一个原子 commit（feat/fix/refactor: 描述）
- `tsc --noEmit` 类型检查必须通过
- `npm run build` 构建必须成功
- 每次 commit 后 git push
- 代码要有清晰注释

## 迭代原则
每轮迭代完成后自我评估：
1. 当前版本完成了什么？
2. 有什么明显的问题或瓶颈？
3. 下一个迭代周期应该优先解决什么？
4. 是否需要调整技术方向或架构？

## 当前版本：v0.5
已实现：项目骨架、核心引擎、4种材质（空气/沙/水/石头）、鼠标交互、工具栏、FPS显示

## 下一轮迭代方向
- 更多材质（火、烟、油、木头等）
- 化学反应系统（水+火=蒸汽，火+木=灰烬等）
- 暂停/清空/保存功能
- 性能优化（脏区域检测、WebWorker）
- 视觉增强（粒子动画、发光效果）
