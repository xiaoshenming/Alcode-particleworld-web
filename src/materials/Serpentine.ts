import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蛇纹石 —— 含水镁硅酸盐矿物
 * - 固体，密度 Infinity（不可移动）
 * - 高温 >600° 脱水变为火山灰(144)并释放蒸汽
 * - 耐酸中等（概率0.008）
 * - 导热较慢
 * - 绿色带蛇皮纹理
 */

export const Serpentine: MaterialDef = {
  id: 404,
  name: '蛇纹石',
  category: '矿石',
  description: '含水镁硅酸盐矿物，绿色带蛇皮状纹理，加热脱水释放蒸汽',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深绿
      r = 60 + Math.floor(Math.random() * 20);
      g = 110 + Math.floor(Math.random() * 25);
      b = 55 + Math.floor(Math.random() * 18);
    } else if (phase < 0.65) {
      // 暗绿带黄
      r = 80 + Math.floor(Math.random() * 15);
      g = 100 + Math.floor(Math.random() * 18);
      b = 45 + Math.floor(Math.random() * 12);
    } else if (phase < 0.85) {
      // 中绿
      r = 70 + Math.floor(Math.random() * 18);
      g = 130 + Math.floor(Math.random() * 20);
      b = 65 + Math.floor(Math.random() * 15);
    } else {
      // 浅绿斑点
      r = 100 + Math.floor(Math.random() * 20);
      g = 150 + Math.floor(Math.random() * 18);
      b = 85 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温脱水
    if (temp > 600) {
      world.set(x, y, 144); // 火山灰
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      // 释放蒸汽到上方
      if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 8); // 蒸汽
        world.wakeArea(x, y - 1);
      }
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

registerMaterial(Serpentine);
