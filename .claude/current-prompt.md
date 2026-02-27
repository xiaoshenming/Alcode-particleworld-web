仅做修复、优化和测试，严禁新增任何功能。\n\n📋 本轮任务：\n1. git log --oneline -10 检查当前状态\n2. 阅读 .claude/loop-ai-state.json 了解上轮笔记\n3. 运行类型检查、构建、测试，找出所有错误\n4. 修复 bug、性能问题、代码质量问题\n5. 优化现有代码（重构、简化、消除技术债）\n6. 确保所有测试通过\n7. 每修复一个问题就 git commit + git push\n\n🔴 铁律：\n- 严禁新增功能\n- 只修复、优化、测试\n- 类型检查必须通过\n- 构建必须成功\n- 每次 commit 后 git push origin main

🧠 AI 上轮笔记：第84轮（迭代8）：纯性能优化和bug修复，无新功能。

1. 【bug修复】Fire.ts 消除冗余 setAge（init分支）：
   - if(life===0){ setAge(life) } 后面接 life--; set(); setAge(life)
   - init分支的 setAge 被后面的 set() 立即覆盖，完全冗余
   - 修复：删除 init 分支内的 world.setAge(x, y, life)

2. 【bug修复】undo/redo 路径补充全局状态清理：
   - 问题：main.ts 的 onUndo/onRedo 和 keyboard Ctrl+Z/Y 都调用 restoreFromSnapshot，但没有清理 antStates/portalPairs
   - 导致：undo后蚂蚁和传送门状态与世界快照不匹配
   - 修复：在所有 restoreFromSnapshot 调用后追加 clearAntStates() + clearAllPortals()
   - 注意：倒流模式（rewind）的 restoreFromSnapshot 不加清理（性能考虑，每帧快速回放）

3. 【重大性能优化】提取共享方向常量到 types.ts，批量替换1180+文件：
   - 问题：1177个材质文件在 update() 内定义 const dirs = [[0,-1],[0,1],[-1,0],[1,0]] 局部数组
   - 每次调用都重新分配数组对象，累积产生大量 GC 压力
   - 解决方案：在 types.ts 导出 DIRS4/DIRS8/DIRS_DIAG/DIRS3_UP 共享常量（ReadonlyArray）
   - 批量替换：Python脚本自动修改1174个文件，同时更新 import 语句
   - 处理 sort() 调用的文件：改为 [...DIRS4] 创建可变副本（Clone/Coral/Foam/Mushroom/Mycelium/Portal/DielectricElastomer）
   - bundle 体积：1465.64KB → 1434.61KB（减少约31KB）
   - 所有 tsc + vite build 检查通过

4. 关于 dirs.sort() 的 bug：
   - 原来多个文件对局部数组调用 sort()，这会修改原数组！
   - 当时用局部数组时不明显（每帧新建），但改用共享常量后 ReadonlyArray 报 TS 错误
   - 实际上这是一个潜在 bug：如果在同一帧两次进入这段代码，第二次会得到已经 shuffle 过的数组
   - 修复：改为 [...DIRS4].sort() 或 [...DIRS8].sort() 创建副本再排序

bundle: 1434.61KB（减少31KB，大幅改善）
🎯 AI 自定优先级：[
  "1. 检查是否还有其他类型的每帧临时对象创建（例如：spread syntax创建对象、Object.entries()等）",
  "2. 检查 Termite.ts/Vine.ts/Mycelium.ts 等扩展材质中对 diag 方向数组的 sort 调用 - 已改用 [...DIRS_DIAG] 但需要确认正确",
  "3. 检查是否有材质错误使用了 DIRS4 共享常量后调用了 sort（应该用 [...DIRS4].sort()）",
  "4. OilShale.ts 有 [[0,-1],[-1,0],[1,0]] 三方向数组（上+左右但不含斜向），可以考虑再加常量或保持现状",
  "5. 关注新材质批次（ID 1251+）的添加，确保使用 DIRS4/DIRS8 共享常量而非内联数组"
]
💡 AI 积累经验：1. tickAge()会干扰任何没有每帧调用setAge()的age用法。只有两种安全的age使用模式：
   (a) 只读+自动递增：只调getAge，依赖tickAge递增（Clay/Lightning/Smoke等）
   (b) 手动管理：每帧调setAge，阻止tickAge干扰（Fire/Wire/Clone等）
2. set(x, y, id) 会重置 _age[i]=0。因此：
   - 如果 if(age===0){setAge(init)} 后面立即有 set()+setAge()，init分支的 setAge 是冗余的
   - 如果 life--; setAge(life); set(); setAge(life)，前置的 setAge 是冗余的
   - 结论：任何在 set() 之前的 setAge 如果后面紧接着 set()+setAge，前者都是冗余的
3. 全局 Map 状态（Ant.antStates, Portal.portalPairs）必须在所有 world.clear()/load()/restoreFromSnapshot() 调用时同步清理。
   最佳实践：为这类全局状态导出 clearXxx() 函数，在 main.ts 的所有重置路径调用。
   例外：高��回放路径（rewind每帧）可跳过清理。
4. 批量替换技巧：Python 正则脚本可以安全处理大量文件的模式替换，但需要：
   (a) 同时更新 import 语句（区分 import type 和 import）
   (b) 注意 ReadonlyArray 不能调用 sort()，需要 [...DIRS4].sort() 创建副本
   (c) 替换后必须立即运行 tsc --noEmit 验证，不要等到最后
5. 使用 getXxxBuffer() 方法直接暴露内部 TypedArray 给性能敏感的调用方，
   比通过方法调用每次计算 idx 高效得多。
6. 共享常量应标注 ReadonlyArray 类型，防止意外修改共享状态。如果需要修改，必须先 [...arr] 复制。

迭代轮次: 9/100


🔄 自我进化（每轮必做）：
完成本轮工作后，更新 .claude/loop-ai-state.json：
{
  "notes": "本轮做了什么、发现了什么问题、下轮应该做什么",
  "priorities": "根据当前项目状态，你认为最重要的 3-5 个待办事项",
  "lessons": "积累的经验教训，比如哪些方法有效、哪些坑要避开",
  "last_updated": "2026-02-28T01:01:12+08:00"
}
这个文件是你的记忆，下一轮的你会读到它。写有价值的内容，帮助未来的自己更高效。
