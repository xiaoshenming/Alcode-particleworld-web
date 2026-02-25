import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液氮 —— 极低温液体
 * - 轻质液体，快速流动
 * - 极低温（-196°C）：瞬间冷冻接触的一切
 * - 水→冰，熔岩→石头，水银→金属，蜂蜜→蜡，泥浆→泥土
 * - 快速蒸发：持续变为蒸汽（白色冷雾）
 * - 高温环境加速蒸发
 * - 淡蓝色半透明外观
 */

/** 被液氮冷冻的材质映射 */
const FREEZABLE: Record<number, number> = {
  2: 14,   // 水 → 冰
  24: 14,  // 盐水 → 冰
  11: 3,   // 熔岩 → 石头
  56: 10,  // 水银 → 金属
  45: 25,  // 蜂蜜 → 蜡
  63: 20,  // 泥浆 → 泥土
  5: 25,   // 油 → 蜡（凝固）
  67: 67,  // 沥青 → 沥青（已经很粘，不变但降温）
  26: 25,  // 液蜡 → 蜡
};

export const LiquidNitrogen: MaterialDef = {
  id: 68,
  name: '液氮',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number, a: number;
    if (phase < 0.5) {
      // 淡蓝色
      r = 160 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 30);
      b = 240 + Math.floor(Math.random() * 15);
      a = 0xB0;
    } else if (phase < 0.8) {
      // 浅蓝白
      r = 190 + Math.floor(Math.random() * 25);
      g = 220 + Math.floor(Math.random() * 20);
      b = 245 + Math.floor(Math.random() * 10);
      a = 0xC0;
    } else {
      // 近白色
      r = 210 + Math.floor(Math.random() * 20);
      g = 230 + Math.floor(Math.random() * 15);
      b = 250;
      a = 0xD0;
    }
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.8, // 比水轻
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 持续降低自身温度
    world.setTemp(x, y, Math.min(temp, -80));

    // 蒸发概率（温度越高越快）
    let evapChance = 0.015;
    if (temp > -50) evapChance = 0.05;
    if (temp > 0) evapChance = 0.12;
    if (temp > 50) evapChance = 0.3;

    // 检查邻居：冷冻一切
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 冷冻
      const freezeTo = FREEZABLE[nid];
      if (freezeTo !== undefined && freezeTo !== nid && Math.random() < 0.15) {
        world.set(nx, ny, freezeTo);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 冷冻消耗自身
        evapChance += 0.05;
      }

      // 接触火/熔岩：剧烈蒸发
      if ((nid === 6 || nid === 11 || nid === 55) && Math.random() < 0.5) {
        // 自身蒸发
        world.set(x, y, 8); // 蒸汽
        world.wakeArea(x, y);
        return;
      }

      // 降低邻居温度
      world.addTemp(nx, ny, -15);
    }

    // 蒸发
    if (Math.random() < evapChance) {
      // 上方产生冷雾（蒸汽）
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 8); // 蒸汽
        world.markUpdated(x, y - 1);
      }
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    if (y >= world.height - 1) return;

    // 直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换（比水轻，会浮在水上面）
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 0.8) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y);
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

    // 水平流动（快速）
    for (const d of [dir, -dir]) {
      const sx = x + d;
      if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
    }
  },
};

registerMaterial(LiquidNitrogen);
