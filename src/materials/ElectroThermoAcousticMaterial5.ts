import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电热声材料(5) —— 电-热-声三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 深青铜色调
 * - 电场同时产生热效应和声波
 * - 酸液溶解 0.0005，热传导 0.06/0.07
 */

export const ElectroThermoAcousticMaterial5: MaterialDef = {
  id: 1240,
  name: '电热声材料(5)',
  category: '固体',
  description: '电-热-声三场耦合材料,电场同时产生热效应和声波',
  density: Infinity,
  color() {
    const r = 146 + Math.floor(Math.random() * 20);
    const g = 118 + Math.floor(Math.random() * 20);
    const b = 92 + Math.floor(Math.random() * 22);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸液溶解
      if (nid === 9 && Math.random() < 0.0005) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 热传导
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // 电场同时产生热效应和声波
    // 遇电线产生热效应
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 44 && Math.random() < 0.05) {
        // 电线触发：升温并产生声波（在空位生成泡沫代表声波）
        world.addTemp(x, y, 25);
        world.wakeArea(x, y);

        // 产生声波（在周围空位生成泡沫51代表声波振动）
        for (const [ax, ay] of dirs) {
          const axx = x + ax, ayy = y + ay;
          if (world.inBounds(axx, ayy) && world.get(axx, ayy) === 0 && Math.random() < 0.1) {
            world.set(axx, ayy, 51); // 泡沫代表声波
            world.wakeArea(axx, ayy);
            break;
          }
        }
        break;
      }
    }
  },
};

registerMaterial(ElectroThermoAcousticMaterial5);
