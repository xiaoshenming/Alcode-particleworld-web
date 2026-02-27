仅做修复、优化和测试，严禁新增任何功能。\n\n📋 本轮任务：\n1. git log --oneline -10 检查当前状态\n2. 阅读 .claude/loop-ai-state.json 了解上轮笔记\n3. 运行类型检查、构建、测试，找出所有错误\n4. 修复 bug、性能问题、代码质量问题\n5. 优化现有代码（重构、简化、消除技术债）\n6. 确保所有测试通过\n7. 每修复一个问题就 git commit + git push\n\n🔴 铁律：\n- 严禁新增功能\n- 只修复、优化、测试\n- 类型检查必须通过\n- 构建必须成功\n- 每次 commit 后 git push origin main

🧠 AI 上轮笔记：第83轮（迭代7）：纯bug修复和性能优化，无新功能。

1. 【内存泄漏修复】Ant.ts/Portal.ts 全局状态 Map 清理：
   - 问题：world.clear() 和 world.load() 时，antStates 和 portalPairs/unpairedSet 不会被清理
   - 导致：clear后放置新蚂蚁可能复用旧状态（错误的 life/carrying 值）；传送门状态混乱
   - 修复：在 Ant.ts 导出 clearAntStates()，在 Portal.ts 导出 clearAllPortals()
   - 在 main.ts 的 onClear、onLoad、文件导入等所有重置路径都调用这些清理函数

2. 【性能优化】Simulation.update() 热路径优化：
   - 问题：每个格子调用 world.get/isUpdated/isAwake 各自重复计算 idx(x,y) = y*width+x（共3次乘法+加法）
   - 修复：在 World 添加 getUpdatedBuffer()/getAwakeBuffer() 方法，直接返回内部 Uint8Array
   - Simulation 在热路径开始时取引用，内层循环预计算 rowBase = y*width，idx = rowBase+x，一次计算覆盖所有读取
   - 效果：每格从3次 idx 计算降为1次，减少2/3的索引开销

3. 【性能优化】消除大量冗余 setAge 写入：
   - 类型A（双写）：Virus/Tornado/PhosphorusFire 有 life--; setAge(life); set(); setAge(life) 模式
     修复：去掉前置 setAge，直接 life--; set(); setAge(life)
   - 类型B（初始化冗余）：if(life===0){ setAge(init) } set(x,y,id); setAge(life)
     因为 set() 会重置 _age=0，if 分支中的 setAge 立即被覆盖，完全冗余
     修复：Plasma/ElectroPlasma/Firefly/Philosopher/Tornado/Virus/PhosphorusFire
     修复后这些材质的初始化分支只设置 life 变量，实际写入由后面的 set()+setAge() 完成
   - 总计：减少约7个材质各节省1次 Uint16Array 写入/帧

4. 颜色越界检查（优先级2）：
   - 全量扫描1200+材质文件的 r/g/b 颜色分量计算
   - 未发现真正越界（base + random_max > 255）的情况
   - 所有颜色值在合法范围内

5. 材质ID完整性检查：
   - 发现有~19个 ID 在 CLAUDE.md 中规划但尚未实现（如274辉绿岩、316铟等）
   - 这是正常规划状态，不影响当前运行
   - 已验证没有材质引用未注册的 ID

bundle: 1465.64KB（略有变化，代码逻辑优化）
🎯 AI 自定优先级：[
  "1. 继续检查更多材质的冗余setAge模式（还有400+类似结构的材质文件待系统扫描）",
  "2. 检查 Jellyfish/BallLightning/SteamCloud 等移动材质的 age 传播是否正确（已确认，但可再验）",
  "3. 检查 world.restoreFromSnapshot() 路径是否需要清理 antStates/portalPairs（undo/redo时）",
  "4. 检查是否有材质的 update() 每帧创建大量临时对象（dirs数组等），考虑统一提取为模块级常量",
  "5. 关注新材质批次（ID 1251+）的添加，确保与已有模式一致"
]
💡 AI 积累经验：1. tickAge()会干扰任何没有每帧调用setAge()的age用法。只有两种安全的age使用模式：
   (a) 只读+自动递增：只调getAge，依赖tickAge递增（Clay/Lightning/Smoke等）
   (b) 手动管理：每帧调setAge，阻止tickAge干扰（Fire/Wire/Clone等）
2. set(x, y, id) 会重置 _age[i]=0。因此：
   - 如果 if(age===0){setAge(init)} 后面立即有 set()+setAge()，init分支的 setAge 是冗余的
   - 如果 life--; setAge(life); set(); setAge(life)，前置的 setAge 是冗余的
   - 结论：任何在 set() 之前的 setAge 如果后面紧接着 set()+setAge，前者都是冗余的
3. 全局 Map 状态（Ant.antStates, Portal.portalPairs）必须在 world.clear()/load() 时同步清理。
   最佳实践：为这类全局状态导出 clearXxx() 函数，在 main.ts 的所有重置路径调用。
4. Simulation 热路径优化：避免在每格重复调用返回相同 idx 的方法。
   可在行开始时预计算 rowBase = y*width，每列直接 idx = rowBase + x。
5. 使用 getXxxBuffer() 方法直接暴露内部 TypedArray 给性能敏感的调用方，
   比通过方法调用每次计算 idx 高效得多。

迭代轮次: 8/100


🔄 自我进化（每轮必做）：
完成本轮工作后，更新 .claude/loop-ai-state.json：
{
  "notes": "本轮做了什么、发现了什么问题、下轮应该做什么",
  "priorities": "根据当前项目状态，你认为最重要的 3-5 个待办事项",
  "lessons": "积累的经验教训，比如哪些方法有效、哪些坑要避开",
  "last_updated": "2026-02-28T00:45:02+08:00"
}
这个文件是你的记忆，下一轮的你会读到它。写有价值的内容，帮助未来的自己更高效。
