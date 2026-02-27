import { DIRS8 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 等离子体 —— 超高温电离气体
 * - 极轻，快速向上飘动
 * - 持续发出高温，点燃周围可燃物
 * - 融化金属、玻璃、冰等
 * - 有限寿命，逐渐冷却消散
 * - 颜色在蓝白/紫白之间剧烈闪烁
 * - 接触水会产生蒸汽并加速消亡
 * 使用 World 内置 age 替代 Map<string,number>（plasmaLife）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

/** 可被等离子体点燃的材质 */
const IGNITABLE = new Set([4, 5, 13, 22, 25, 26, 46]); // 木头、油、植物、火药、蜡、液蜡、木炭

/** 可被等离子体融化的材质（常量 Map，用于规则存储，不是状态跟踪） */
const MELTABLE: Map<number, number> = new Map([
  [10, 11], // 金属 → 熔岩
  [14, 2],  // 冰 → 水
  [15, 2],  // 雪 → 水
  [17, 1],  // 玻璃 → 沙子
  [1, 17],  // 沙子 → 玻璃（高温烧结）
]);

/** 水系材质 */
const WATER_LIKE = new Set([2, 24]); // 水、盐水

export const Plasma: MaterialDef = {
  id: 55,
  name: '等离子体',
  color() {
    // 蓝白/紫白剧烈闪烁
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 蓝白
      r = 150 + Math.floor(Math.random() * 105);
      g = 180 + Math.floor(Math.random() * 75);
      b = 255;
    } else if (phase < 0.7) {
      // 紫白
      r = 200 + Math.floor(Math.random() * 55);
      g = 130 + Math.floor(Math.random() * 60);
      b = 255;
    } else {
      // 纯白闪光
      r = 240 + Math.floor(Math.random() * 15);
      g = 240 + Math.floor(Math.random() * 15);
      b = 255;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.05, // 极轻
  update(x: number, y: number, world: WorldAPI) {
    // 初始化寿命（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 40 + Math.floor(Math.random() * 60); // 40~100 帧
    }

    // 刷新颜色（闪烁）：set()会重置age，需立即恢复
    world.set(x, y, 55);
    world.setAge(x, y, life);

    // 持续释放高温
    world.setTemp(x, y, 300);

    // 向周围传热
    const dirs = DIRS8;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 加热邻居
      world.addTemp(nx, ny, 15);

      // 点燃可燃物
      if (IGNITABLE.has(nid) && Math.random() < 0.3) {
        world.set(nx, ny, 6); // 火
        world.markUpdated(nx, ny);
        continue;
      }

      // 融化材质
      const meltTo = MELTABLE.get(nid);
      if (meltTo !== undefined && Math.random() < 0.1) {
        world.set(nx, ny, meltTo);
        world.markUpdated(nx, ny);
        continue;
      }

      // 接触水：产生蒸汽，加速消亡
      if (WATER_LIKE.has(nid)) {
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        life -= 5; // 加速消亡
      }
    }

    // 寿命递减
    life--;
    world.setAge(x, y, life);

    if (life <= 0) {
      // 消散：变成火或烟
      world.set(x, y, Math.random() < 0.3 ? 6 : 7); // 火或烟
      return;
    }

    // 快速向上飘动（swap 自动迁移 age）
    if (y > 0 && world.isEmpty(x, y - 1)) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上方
    const d = Math.random() < 0.5 ? -1 : 1;
    for (const sd of [d, -d]) {
      const nx = x + sd;
      if (y > 0 && world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }

    // 水平漂移
    if (Math.random() < 0.4) {
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(Plasma);
