import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 干冰 —— 固态二氧化碳
 * - 固体粉末，受重力下落（类似沙子）
 * - 持续升华：缓慢变为蒸汽/烟雾（白色浓雾效果）
 * - 极低温：冷冻周围的水→冰，盐水→冰，泥浆→泥土
 * - 接触水时剧烈升华（快速产生大量蒸汽）
 * - 高温加速升华
 * - 白色/淡蓝色半透明外观
 */

/** 会被干冰冷冻的液体 */
const FREEZABLE: Record<number, number> = {
  2: 14,   // 水 → 冰
  24: 14,  // 盐水 → 冰
  63: 20,  // 泥浆 → 泥土
  45: 25,  // 蜂蜜 → 蜡（凝固）
  56: 10,  // 水银 → 金属（凝固）
};

export const DryIce: MaterialDef = {
  id: 65,
  name: '干冰',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number, a: number;
    if (phase < 0.5) {
      // 白色
      r = 220 + Math.floor(Math.random() * 30);
      g = 225 + Math.floor(Math.random() * 30);
      b = 235 + Math.floor(Math.random() * 20);
      a = 0xE0;
    } else if (phase < 0.8) {
      // 淡蓝色
      r = 190 + Math.floor(Math.random() * 25);
      g = 210 + Math.floor(Math.random() * 25);
      b = 240 + Math.floor(Math.random() * 15);
      a = 0xD0;
    } else {
      // 亮白高光
      r = 240 + Math.floor(Math.random() * 15);
      g = 242 + Math.floor(Math.random() * 13);
      b = 250;
      a = 0xF0;
    }
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.6,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 持续降低自身周围温度
    world.setTemp(x, y, Math.min(temp, -30));

    // 升华概率（温度越高越快）
    let sublimateChance = 0.008;
    if (temp > 0) sublimateChance = 0.03;
    if (temp > 30) sublimateChance = 0.1;

    // 检查邻居
    const dirs = DIRS4;
    let waterContact = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水剧烈升华
      if (nid === 2 || nid === 24) {
        waterContact = true;
      }

      // 冷冻周围液体
      if (nid in FREEZABLE && Math.random() < 0.05) {
        world.set(nx, ny, FREEZABLE[nid]);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 冷冻周围空气（降温）
      world.addTemp(nx, ny, -5);
    }

    // 接触水时剧烈升华
    if (waterContact) {
      sublimateChance = 0.3;
    }

    // 升华：变为蒸汽
    if (Math.random() < sublimateChance) {
      // 上方产生蒸汽雾气
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 8); // 蒸汽
        world.markUpdated(x, y - 1);
      }
      world.set(x, y, 0); // 自身消失
      world.wakeArea(x, y);
      return;
    }

    // 重力下落
    if (y < world.height - 1) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < 1.6) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y);
        world.markUpdated(x, y + 1);
        return;
      }
      // 滑落
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(DryIce);
