# Particle World - 粉末沙盒模拟游戏

## 核心目标
创建一个基于物理引擎的粉末沙盒模拟游戏，运行在浏览器中。

## 本质需求
- 模拟物质世界的物理行为（重力、流动、燃烧、反应等）
- 用户可以与模拟世界交互（添加/删除/修改物质）
- 不同材质之间有真实的相互作用
- 视觉上有清晰的材质区分和动态效果

## 技术架构

### 技术栈
- TypeScript + Vite（零运行时依赖）
- Canvas 2D 渲染，像素风格（imageSmoothingEnabled = false）

### 核心数据结构
- `World`: 200x150 网格，TypedArray 存储
  - `cells: Uint8Array` — 材质 ID
  - `colors: Uint32Array` — ABGR 颜色（直接写入 ImageData）
  - `_updated: Uint8Array` — 帧内更新标记
  - `_awake / _awakeNext: Uint8Array` — 双缓冲活跃标记
- `Simulation`: 从底向上扫描，随机左右方向，只处理活跃粒子
- `Renderer`: 1:1 ImageData → 临时 Canvas → 4x 缩放绘制到主 Canvas

### 材质系统
- `MaterialDef` 接口：id, name, color(), density, update()
- `registry.ts` 注册表：Map<id, MaterialDef>
- 材质 ID 分配：0=空气, 1=沙子, 2=水, 3=石头, 4=木头, 5=油, 6=火, 7=烟, 8=蒸汽, 9=酸液, 10=金属, 11=熔岩, 12=种子, 13=植物
- 新材质只需：创建文件 → 实现 MaterialDef → registerMaterial() → main.ts 导入

### 性能优化
- 双缓冲活跃标记：set/swap 自动唤醒 3x3 邻域
- 静止粒子（已堆积的沙子、石头、金属等）跳过更新

## 技术边界
- 浏览器可运行（无需后端）
- 纯前端实现
- 代码可维护、可扩展

## 自主决策权
你自己决定：
1. **开发节奏**：分几个迭代周期，每个周期做什么
2. **技术选型**：用 Canvas/WebGL，数据结构如何设计
3. **物理精度**：像素级/网格级，模拟复杂度多少
4. **材质系统**：先做哪些材质，化学反应规则如何设计
5. **UI 设计**：控制面板、工具栏、交互方式
6. **优化策略**：何时优化、如何优化、性能目标

## 规范体系
- `.agent/rules/` — Awesome AGV 代码质量规则（30条）
- `.agent/skills/` — 开发技能（代码审查、调试、架构等）
- `.agent/workflows/` — 工作流程（研究→实现→集成→验证→提交）
- `.claude/commands/opsx/` — OpenSpec 功能规划命令
- 使用 `/opsx:propose` 规划新功能，`/opsx:apply` 实施

## 开发规范
- 每个功能一个原子 commit（feat/fix/refactor: 描述）
- 代码质量检查必须通过（tsc --noEmit + vite build）
- 构建必须成功
- 每次 commit 后 git push origin main（确保远程同步）
- 代码要有清晰注释

## 迭代原则
每轮迭代完成后自我评估：
1. 当前版本完成了什么？
2. 有什么明显的问题或瓶颈？
3. 下一个迭代周期应该优先解决什么？
4. 是否需要调整技术方向或架构？

## 持续关注
- 🎮 可玩性：用户能否轻松创造有趣的场景？
- ⚡ 性能：模拟是否流畅？能否支持更多粒子？
- 🎨 表现力：材质视觉效果是否清晰美观？
- 🔬 真实性：物理行为是否符合直觉？
- 🧩 扩展性：添加新材质/新规则是否容易？

## 输出要求
- 每次迭代提供完整可运行的代码
- 说明本次改动的核心内容
- 说明已知局限和下一步计划
- 代码要有清晰注释

## 📄 文档同步（每轮必做）
- 根据当前 git 状态和项目进展，更新以下文件：
  - CLAUDE.md — 项目规范、架构说明、开发约定
  - README.md — 项目介绍、功能列表、使用说明
  - .agent/skills/ 或 openspec/specs/ — 如有新功能模块，补充对应的 skill 或 spec
- 文档更新也要 commit（docs: 更新 xxx）
