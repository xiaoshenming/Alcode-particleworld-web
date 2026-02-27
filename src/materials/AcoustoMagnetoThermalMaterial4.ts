import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声磁热材料(4) —— 声-磁-热三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 声波同时产生磁效应和热效应
 * - 深褐紫色调
 */

export const AcoustoMagnetoThermalMaterial4: MaterialDef = {
  id: 1250,
  name: '声磁热材料(4)',
  category: '固体',
  description: '声-磁-热三场耦合材料，声波同时产生磁效应和热效应',
  density: Infinity,
  color() {
    const r = 138 + Math.floor(Math.random() * 20);
    const g = 112 + Math.floor(Math.random() * 20);
    const b = 128 + Math.floor(Math.random() * 22);
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

      // 声波产生磁效应和热效应
      if (nid !== 0 && Math.random() < 0.05) {
        // 磁效应：生成火花在空位
        if (Math.random() < 0.03) {
          const sparkPos = dirs.find(([sdx, sdy]) => {
            const sx = x + sdx, sy = y + sdy;
            return world.inBounds(sx, sy) && world.get(sx, sy) === 0;
          });
          if (sparkPos) {
            const [sdx, sdy] = sparkPos;
            world.set(x + sdx, y + sdy, 28);
            world.wakeArea(x + sdx, y + sdy);
          }
        }

        // 热效应：轻微升温
        if (Math.random() < 0.02) {
          world.addTemp(x, y, 5);
          world.wakeArea(x, y);
        }
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
  },
};

registerMaterial(AcoustoMagnetoThermalMaterial4);
