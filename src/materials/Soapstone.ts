import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 滑石岩 —— 最软的矿物组成的岩石
 * - 固体，密度 Infinity（不可移动）
 * - 低熔点：>800° → 熔岩(11)
 * - 耐酸弱（概率0.02）
 * - 接触水缓慢溶解（概率0.003）
 * - 导热较慢
 * - 白绿色带滑腻质感
 */

export const Soapstone: MaterialDef = {
  id: 409,
  name: '滑石岩',
  category: '矿石',
  description: '由滑石组成的软质岩石，白绿色，可用手指刮划',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 白绿色
      r = 195 + Math.floor(Math.random() * 18);
      g = 210 + Math.floor(Math.random() * 15);
      b = 200 + Math.floor(Math.random() * 12);
    } else if (phase < 0.65) {
      // 淡灰绿
      r = 180 + Math.floor(Math.random() * 12);
      g = 195 + Math.floor(Math.random() * 12);
      b = 185 + Math.floor(Math.random() * 10);
    } else if (phase < 0.85) {
      // 浅白
      r = 215 + Math.floor(Math.random() * 15);
      g = 220 + Math.floor(Math.random() * 12);
      b = 215 + Math.floor(Math.random() * 10);
    } else {
      // 灰绿斑点
      r = 170 + Math.floor(Math.random() * 15);
      g = 185 + Math.floor(Math.random() * 12);
      b = 175 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低熔点熔化
    if (temp > 800) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸弱
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 接触水缓慢溶解
      if (nid === 2 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 导热较慢
      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Soapstone);
