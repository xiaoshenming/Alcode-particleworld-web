import { DIRS8 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 病毒 —— 感染并转化接触到的有机材质
 * - 接触木头、植物、种子等有机物时将其转化为病毒
 * - 有限寿命，死后变成毒气
 * - 火焰和高温可以杀死病毒
 * - 酸液可以溶解病毒
 * - 不能感染金属、石头、玻璃等无机物
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

/** 可感染的材质（有机物） */
const INFECTABLE = new Set([4, 12, 13, 20, 21, 25, 26, 29, 40]); // 木头、种子、植物、泥土、黏土、蜡、液蜡、橡皮泥、蚂蚁

export const Virus: MaterialDef = {
  id: 43,
  name: '病毒',
  color() {
    // 黄绿色，恶心的生物感
    const t = Math.random();
    const r = 120 + Math.floor(t * 40);
    const g = 180 + Math.floor(t * 50);
    const b = 20 + Math.floor(t * 30);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.5,
  update(x: number, y: number, world: WorldAPI) {
    // 初始化/递减生命值（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 200 + Math.floor(Math.random() * 200);
    }
    life--;

    // 刷新颜色（脉动效果）：set()会重置age，需立即恢复
    world.set(x, y, 43);
    world.setAge(x, y, life);

    // 高温杀死病毒
    if (world.getTemp(x, y) > 60) {
      world.set(x, y, 0);
      return;
    }

    // 寿命耗尽 → 变毒气
    if (life <= 0) {
      world.set(x, y, 18); // 毒气
      return;
    }

    // 检查邻居，感染或���杀
    const dirs = DIRS8;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火/熔岩 → 死亡
      if (nid === 6 || nid === 11) {
        world.set(x, y, 0);
        return;
      }

      // 遇酸液 → 溶解
      if (nid === 9) {
        world.set(x, y, 0);
        return;
      }

      // 感染有机物（低概率，避免瞬间扩散）
      if (INFECTABLE.has(nid) && Math.random() < 0.03) {
        world.set(nx, ny, 43);
        world.markUpdated(nx, ny);
      }
    }

    // 重力下落（swap 自动迁移 age）
    if (y < world.height - 1 && world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    if (world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
      world.swap(x, y, x + dir, y + 1);
      world.markUpdated(x + dir, y + 1);
      return;
    }

    // 缓慢蠕动（水平移动）
    if (Math.random() < 0.2) {
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(Virus);
