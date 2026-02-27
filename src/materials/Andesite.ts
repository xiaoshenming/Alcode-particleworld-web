import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 安山岩 —— 中性火山岩，质地致密
 * - 固体，不受重力影响
 * - 极高温(>1100°)时融化为熔岩
 * - 酸腐蚀缓慢：普通酸概率0.006，强酸概率0.012
 * - 低导热：温差>10时缓慢传导(0.035)
 * - 灰色到深灰色，带斑状纹理
 */

export const Andesite: MaterialDef = {
  id: 304,
  name: '安山岩',
  category: '矿石',
  description: '中性火山岩，质地致密坚硬',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.45) {
      // 中灰（45%）
      const base = 105 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.75) {
      // 深灰（30%）
      const base = 70 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 3;
      b = base + 6;
    } else if (phase < 0.9) {
      // 浅灰斑晶（15%）— 斜长石
      const base = 150 + Math.floor(Math.random() * 25);
      r = base;
      g = base - 2;
      b = base + 3;
    } else {
      // 暗色斑点（10%）— 辉石/角闪石
      r = 45 + Math.floor(Math.random() * 15);
      g = 50 + Math.floor(Math.random() * 12);
      b = 42 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温融化为熔岩
    if (temp > 1100) {
      world.set(x, y, 11);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 普通酸缓慢腐蚀
      if (nid === 9 && Math.random() < 0.006) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 强酸腐蚀稍快
      if ((nid === 173 || nid === 183) && Math.random() < 0.012) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 低导热
    if (Math.random() < 0.03) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nTemp = world.getTemp(nx, ny);
        if (Math.abs(temp - nTemp) > 10) {
          const transfer = (nTemp - temp) * 0.035;
          world.addTemp(x, y, transfer);
          world.addTemp(nx, ny, -transfer);
        }
      }
    }
  },
};

registerMaterial(Andesite);
