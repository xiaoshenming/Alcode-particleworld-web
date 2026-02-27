import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 蛇纹石化橄榄岩 —— 深部地幔岩石经水化变质
 * - 固体，密度 Infinity（不可移动）
 * - 耐高温（>1600° 才熔化为熔岩(11)）
 * - 接触水(2)缓慢释放氢气(19)（蛇纹石化反应）
 * - 耐酸(9)中等
 * - 深绿色带蛇纹状纹理
 */

export const SerpentinizedPeridotite: MaterialDef = {
  id: 359,
  name: '蛇纹石化橄榄岩',
  category: '矿石',
  description: '深部地幔岩石经水化变质，接触水释放氢气',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 深绿
      r = 60 + Math.floor(Math.random() * 20);
      g = 95 + Math.floor(Math.random() * 25);
      b = 55 + Math.floor(Math.random() * 15);
    } else if (phase < 0.6) {
      // 黄绿（橄榄石残余）
      r = 100 + Math.floor(Math.random() * 20);
      g = 115 + Math.floor(Math.random() * 20);
      b = 50 + Math.floor(Math.random() * 15);
    } else if (phase < 0.85) {
      // 暗绿（蛇纹石）
      r = 45 + Math.floor(Math.random() * 15);
      g = 75 + Math.floor(Math.random() * 20);
      b = 45 + Math.floor(Math.random() * 12);
    } else {
      // 白色脉纹
      r = 170 + Math.floor(Math.random() * 25);
      g = 175 + Math.floor(Math.random() * 20);
      b = 160 + Math.floor(Math.random() * 18);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1600) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水释放氢气（蛇纹石化反应）
      if (nid === 2 && Math.random() < 0.008) {
        world.set(nx, ny, 19); // 氢气
        world.wakeArea(nx, ny);
      }

      // 耐酸中等
      if (nid === 9 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(SerpentinizedPeridotite);
