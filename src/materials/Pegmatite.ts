import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 伟晶岩 —— 粗粒火成岩，含大晶体
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>1100° → 熔岩(11)
 * - 耐酸中等（概率0.008）
 * - 导热中等
 * - 粉白色带大颗粒斑晶
 */

export const Pegmatite: MaterialDef = {
  id: 414,
  name: '伟晶岩',
  category: '矿石',
  description: '粗粒火成岩，含有巨大晶体，是稀有矿物的重要来源',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 粉白色基质
      r = 215 + Math.floor(Math.random() * 18);
      g = 205 + Math.floor(Math.random() * 15);
      b = 200 + Math.floor(Math.random() * 12);
    } else if (phase < 0.55) {
      // 浅灰粉
      r = 195 + Math.floor(Math.random() * 12);
      g = 188 + Math.floor(Math.random() * 10);
      b = 185 + Math.floor(Math.random() * 10);
    } else if (phase < 0.75) {
      // 淡粉色斑晶（长石）
      r = 230 + Math.floor(Math.random() * 15);
      g = 195 + Math.floor(Math.random() * 12);
      b = 190 + Math.floor(Math.random() * 10);
    } else if (phase < 0.9) {
      // 白色石英斑晶
      r = 235 + Math.floor(Math.random() * 15);
      g = 235 + Math.floor(Math.random() * 12);
      b = 230 + Math.floor(Math.random() * 10);
    } else {
      // 暗色云母斑点
      r = 120 + Math.floor(Math.random() * 20);
      g = 110 + Math.floor(Math.random() * 15);
      b = 105 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1100) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸中等
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热中等
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Pegmatite);
