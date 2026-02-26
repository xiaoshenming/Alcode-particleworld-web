import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光热磁材料 —— 光-热-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇光束(48)/激光(47)产生热效应（加温周围）
 * - 遇熔岩(11)/火(6)产生磁效应（吸引附近金属粒子）
 * - 深琥珀色带光热纹理
 */

export const PhotoThermoMagneticMaterial: MaterialDef = {
  id: 620,
  name: '光热磁材料',
  category: '固体',
  description: '光-热-磁三场耦合功能材料，用于太阳能热磁发电和光控磁开关',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 158 + Math.floor(Math.random() * 15);
      g = 108 + Math.floor(Math.random() * 10);
      b = 48 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 142 + Math.floor(Math.random() * 12);
      g = 92 + Math.floor(Math.random() * 8);
      b = 35 + Math.floor(Math.random() * 8);
    } else {
      r = 175 + Math.floor(Math.random() * 18);
      g = 122 + Math.floor(Math.random() * 12);
      b = 58 + Math.floor(Math.random() * 12);
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

      // 遇光束/激光产生热效应（模拟光→热）
      if ((nid === 48 || nid === 47) && Math.random() < 0.06) {
        world.addTemp(x, y, 40);
        world.wakeArea(x, y);
      }

      // 遇熔岩/火产生磁效应（模拟热→磁）
      if ((nid === 11 || nid === 6) && Math.random() < 0.05) {
        world.addTemp(x, y, 25);
        world.wakeArea(x, y);
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

registerMaterial(PhotoThermoMagneticMaterial);
