import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 炼金石 —— 魔法材质，接触其他材质时进行转化
 * - 金属(10) → 金(31)
 * - 石头(3) → 钻石(32)
 * - 沙子(1) → 玻璃(17)
 * - 泥土(20) → 种子(12)
 * - 转化后自身缓慢消耗（有使用次数）
 * - 发出紫色光芒
 * 使用 World 内置 age 替代 Map<string,number>
 * age=0: 未初始化; age=1: 能量耗尽; age=N: 剩余转化次数=N-1
 */

/** 转化规则：源材质ID → 目标材质ID */
const TRANSMUTE: Record<number, number> = {
  10: 31, // 金属 → 金
  3: 32,  // 石头 → 钻石
  1: 17,  // 沙子 → 玻璃
  20: 12, // 泥土 → 种子
};

export const Philosopher: MaterialDef = {
  id: 30,
  name: '炼金石',
  color() {
    const t = Math.random();
    const r = 160 + Math.floor(t * 60);
    const g = 50 + Math.floor(t * 40);
    const b = 200 + Math.floor(t * 55);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 紫色
  },
  density: 5,
  update(x: number, y: number, world: WorldAPI) {
    // age 偏移1存储能量：age=0未初始化，age=1耗尽，age=N剩余N-1次转化
    let ageVal = world.getAge(x, y);
    if (ageVal === 0) {
      const energy = 15 + Math.floor(Math.random() * 10); // 15~25 次转化
      ageVal = energy + 1;
    }

    // 刷新颜色（闪烁）：set()会重置age，需立即恢复
    world.set(x, y, 30);
    world.setAge(x, y, ageVal);

    if (ageVal <= 1) {
      // 能量耗尽，炼金石碎裂
      world.set(x, y, 7); // 变成烟
      return;
    }

    const energy = ageVal - 1; // 实际剩余转化次数

    // 检查四周邻居进行��化
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];

    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      const target = TRANSMUTE[nid];

      if (target !== undefined && Math.random() < 0.1) {
        world.set(nx, ny, target);
        world.markUpdated(nx, ny);
        // 消耗一次转化次数（存为 energy，即 energy-1+1）
        world.setAge(x, y, energy);

        // 能量耗尽，炼金石碎裂
        if (energy <= 1) {
          world.set(x, y, 7); // 变成烟
          return;
        }
        break; // 每帧只转化一个
      }
    }

    if (y >= world.height - 1) return;

    // 粉末物理：下落（world.swap() 自动迁移 age）
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
  },
};

registerMaterial(Philosopher);
