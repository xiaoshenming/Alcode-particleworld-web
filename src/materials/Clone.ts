import { DIRS8 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 克隆体 —— 记忆型固体
 * 记住第一个接触到的非空材质，然后持续在周围空位生成该材质
 * 不可移动，不可燃，酸液无法腐蚀
 * 使用 World 内置 age 替代 Map<string,number>（固体无需迁移）
 * age=0: 未记忆; age=N: 记忆的材质ID=N
 */

/** 不可克隆的材质（避免无限循环或破坏性行为） */
const UNCLONABLE = new Set([0, 37, 38]); // 空气、克隆体自身、虚空

export const Clone: MaterialDef = {
  id: 37,
  name: '克隆体',
  color() {
    // 亮紫色，带闪烁
    const t = Math.random();
    const r = 180 + Math.floor(t * 40);
    const g = 50 + Math.floor(t * 30);
    const b = 220 + Math.floor(t * 35);
    return (0xFF << 24) | (Math.min(255, b) << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    // age=0: 未记忆; age=materialId: 记忆的材质
    const memory = world.getAge(x, y);
    const dirs = [...DIRS8];

    // 还没记忆 → 扫描邻居，记住第一个接触到的材质
    if (memory === 0) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if (nid !== 0 && !UNCLONABLE.has(nid)) {
          // 刷新颜色以示已激活（set()会重置age，需立即恢复）
          world.set(x, y, 37);
          world.setAge(x, y, nid); // 存储记忆的材质ID
          world.markUpdated(x, y);
          return;
        }
      }
      return;
    }

    // 已记忆 → 阻止 tickAge 递增，保持记忆的材质 ID 不变
    world.setAge(x, y, memory);

    // 在随机空位生成克隆材质（低频率，避免爆炸式增长）
    if (Math.random() > 0.15) return;

    // 随机选一个方向
    const shuffled = dirs.sort(() => Math.random() - 0.5);
    for (const [dx, dy] of shuffled) {
      const nx = x + dx;
      const ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.isEmpty(nx, ny)) {
        world.set(nx, ny, memory);
        world.markUpdated(nx, ny);
        return;
      }
    }
  },
};

registerMaterial(Clone);
