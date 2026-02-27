import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钛 —— 高强度耐腐蚀金属
 * - 固体，密度无限，不可移动
 * - 极耐高温：>1668° 才熔化为液态钛(193)
 * - 耐腐蚀：酸液(9)无法腐蚀
 * - 高强度：不被爆炸破坏
 * - 银灰色带蓝色光泽
 */

export const Titanium: MaterialDef = {
  id: 192,
  name: '钛',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银灰色基底
      r = 170 + Math.floor(Math.random() * 20);
      g = 175 + Math.floor(Math.random() * 20);
      b = 185 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 蓝色光泽
      r = 155 + Math.floor(Math.random() * 15);
      g = 165 + Math.floor(Math.random() * 15);
      b = 200 + Math.floor(Math.random() * 25);
    } else {
      // 亮银高光
      r = 190 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 20);
      b = 210 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化：>1668° 变为液态钛
    if (temp > 1668) {
      world.set(x, y, 193); // 液态钛
      world.setTemp(x, y, 1700);
      world.wakeArea(x, y);
      return;
    }

    // 缓慢散热（金属导热）
    if (temp > 30) {
      const dirs = DIRS4;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nTemp = world.getTemp(nx, ny);
        if (nTemp < temp - 5) {
          world.addTemp(nx, ny, 2);
          world.addTemp(x, y, -2);
        }
      }
    }

    // 钛不移动，耐腐蚀，耐爆炸 —— 无其他逻辑
  },
};

registerMaterial(Titanium);
