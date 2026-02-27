import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 超冷液 —— 极低温液体，淡蓝色发光脉动
 * - 密度 1.4，标准液体流动
 * - 极低温：持续降低周围温度（-10/帧）
 * - 遇水(2)使水结冰(14)
 * - 遇熔岩(11)→石头(3)，遇液态金属(113)→金属(10)
 * - 高温(>50°)蒸发为蒸汽(8)
 */

/** 被超冷液冷冻的材质映射 */
const FREEZE_MAP: Record<number, number> = {
  2: 14,    // 水 → 冰
  11: 3,    // 熔岩 → 石头
  113: 10,  // 液态金属 → 金属
  24: 14,   // 盐水 → 冰
  26: 25,   // 液蜡 → 蜡
  63: 20,   // 泥浆 → 泥土
};

/** 脉动计数器（全局帧计数模拟） */
let pulseCounter = 0;

export const CryoFluid: MaterialDef = {
  id: 198,
  name: '超冷液',
  color() {
    pulseCounter++;
    // 颜色脉动：基于全局计数器产生明暗变化
    const pulse = Math.sin(pulseCounter * 0.05) * 0.3 + 0.7;
    const r = Math.floor((100 + Math.random() * 40) * pulse);
    const g = Math.floor((180 + Math.random() * 40) * pulse);
    const b = Math.floor((240 + Math.random() * 15) * pulse);
    const a = 0xC0 + Math.floor(Math.random() * 0x20);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.4,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 持续将自身温度压低
    world.setTemp(x, y, Math.min(temp, -60));

    // 高温(>50°)蒸发为蒸汽
    if (temp > 50) {
      world.set(x, y, 8); // 蒸汽
      world.wakeArea(x, y);
      return;
    }

    // 刷新颜色（脉动效果）
    world.set(x, y, 198);

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 冷冻反应
      const freezeTo = FREEZE_MAP[nid];
      if (freezeTo !== undefined && Math.random() < 0.12) {
        world.set(nx, ny, freezeTo);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 接触火/等离子体：剧烈蒸发
      if ((nid === 6 || nid === 55) && Math.random() < 0.4) {
        world.set(x, y, 8); // 蒸汽
        world.wakeArea(x, y);
        return;
      }

      // 持续降低周围温度（-10/帧）
      world.addTemp(nx, ny, -10);
    }

    // 缓慢自然蒸发
    if (Math.random() < 0.005) {
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 8); // 上方产生蒸汽
        world.markUpdated(x, y - 1);
      }
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    if (y >= world.height - 1) return;

    // 1. 直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 2. 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < CryoFluid.density && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y);
      world.markUpdated(x, y + 1);
      return;
    }

    // 3. 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 4. 水平流动
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

registerMaterial(CryoFluid);
