import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁声光材料 —— 磁-声-光三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇磁铁(42)产生声效应（生成龙卷风(50)）
 * - 遇龙卷风(50)/沙尘暴(84)产生光效应（生成光束(48)）
 * - 深钴蓝色带磁声纹理
 */

export const MagnetoAcoustoOpticMaterial: MaterialDef = {
  id: 625,
  name: '磁声光材料',
  category: '固体',
  description: '磁-声-光三场耦合功能材料，用于声光调制和磁声成像',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 38 + Math.floor(Math.random() * 12);
      g = 58 + Math.floor(Math.random() * 10);
      b = 138 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 28 + Math.floor(Math.random() * 10);
      g = 45 + Math.floor(Math.random() * 8);
      b = 122 + Math.floor(Math.random() * 12);
    } else {
      r = 48 + Math.floor(Math.random() * 15);
      g = 68 + Math.floor(Math.random() * 12);
      b = 155 + Math.floor(Math.random() * 18);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇磁铁产生声效应（模拟磁→声）
      if (nid === 42 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 50);
          world.wakeArea(x, fy);
        }
      }

      // 遇龙卷风/沙尘暴产生光效应（模拟声→光）
      if ((nid === 50 || nid === 84) && Math.random() < 0.05) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 48);
          world.wakeArea(x, fy);
        }
      }

      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(MagnetoAcoustoOpticMaterial);
