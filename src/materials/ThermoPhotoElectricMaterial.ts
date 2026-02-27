import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热光电材料 —— 热-光-电三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 高温(>500°)产生光效应（生成荧光(133)）
 * - 遇激光(47)/光束(48)产生电效应（生成闪电(16)）
 * - 深橙红色带热光纹理
 */

export const ThermoPhotoElectricMaterial: MaterialDef = {
  id: 565,
  name: '热光电材料',
  category: '固体',
  description: '热-光-电三场耦合功能材料，用于热光伏发电和红外探测',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 168 + Math.floor(Math.random() * 15);
      g = 62 + Math.floor(Math.random() * 12);
      b = 38 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 148 + Math.floor(Math.random() * 12);
      g = 48 + Math.floor(Math.random() * 10);
      b = 28 + Math.floor(Math.random() * 8);
    } else {
      r = 188 + Math.floor(Math.random() * 18);
      g = 78 + Math.floor(Math.random() * 15);
      b = 48 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温产生荧光
    if (temp > 500 && Math.random() < 0.04) {
      const fy = y - 1;
      if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
        world.set(x, fy, 133);
        world.wakeArea(x, fy);
      }
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇激光/光束产生闪电
      if ((nid === 47 || nid === 48) && Math.random() < 0.08) {
        const sdx = Math.random() < 0.5 ? -1 : 1;
        const sy = y - 1;
        if (world.inBounds(x + sdx, sy) && world.get(x + sdx, sy) === 0) {
          world.set(x + sdx, sy, 16);
          world.wakeArea(x + sdx, sy);
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

registerMaterial(ThermoPhotoElectricMaterial);
