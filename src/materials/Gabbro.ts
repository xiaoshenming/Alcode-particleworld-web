import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 辉长岩 —— 深成侵入岩，质地粗粒致密
 * - 固体，不受重力影响
 * - 极高温(>1200°)时融化为熔岩
 * - 酸腐蚀极慢：普通酸概率0.008，强酸概率0.015
 * - 低导热：温差>10时缓慢传导(0.04)
 * - 深灰绿到黑色，多相粗粒纹理
 */

export const Gabbro: MaterialDef = {
  id: 299,
  name: '辉长岩',
  category: '矿石',
  description: '深成侵入岩，质地粗粒致密',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰绿（40%）
      r = 35 + Math.floor(Math.random() * 15);
      g = 45 + Math.floor(Math.random() * 15);
      b = 38 + Math.floor(Math.random() * 12);
    } else if (phase < 0.7) {
      // 黑灰（30%）
      r = 28 + Math.floor(Math.random() * 12);
      g = 28 + Math.floor(Math.random() * 12);
      b = 32 + Math.floor(Math.random() * 10);
    } else if (phase < 0.85) {
      // 暗绿斑（15%）— 辉石矿物
      r = 25 + Math.floor(Math.random() * 10);
      g = 50 + Math.floor(Math.random() * 18);
      b = 30 + Math.floor(Math.random() * 12);
    } else {
      // 白色长石斑（15%）— 斜长石矿物
      r = 160 + Math.floor(Math.random() * 30);
      g = 160 + Math.floor(Math.random() * 28);
      b = 155 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固体不动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温(>1200°)融化为熔岩
    if (temp > 1200) {
      world.set(x, y, 11); // 熔岩
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 普通酸(9)缓慢腐蚀
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 强酸：硫酸(173)、硝酸(183)腐蚀稍快
      if ((nid === 173 || nid === 183) && Math.random() < 0.015) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 低导热：温差>10时缓慢传导
    if (Math.random() < 0.03) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nTemp = world.getTemp(nx, ny);
        if (Math.abs(temp - nTemp) > 10) {
          const transfer = (nTemp - temp) * 0.04;
          world.addTemp(x, y, transfer);
          world.addTemp(nx, ny, -transfer);
        }
      }
    }
  },
};

registerMaterial(Gabbro);
