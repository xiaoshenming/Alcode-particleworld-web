import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电光声材料 —— 电-光-声三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇电线(44)/闪电(16)产生光效应（生成荧光(133)）
 * - 遇激光(47)/光束(48)产生声波（生成蒸汽(8)）
 * - 深青蓝色带电光纹理
 */

export const ElectroOptoAcousticMaterial: MaterialDef = {
  id: 555,
  name: '电光声材料',
  category: '固体',
  description: '电-光-声三场耦合功能材料，用于多物理场传感和信号转换',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 42 + Math.floor(Math.random() * 12);
      g = 88 + Math.floor(Math.random() * 12);
      b = 142 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 32 + Math.floor(Math.random() * 10);
      g = 72 + Math.floor(Math.random() * 10);
      b = 122 + Math.floor(Math.random() * 12);
    } else {
      r = 55 + Math.floor(Math.random() * 15);
      g = 105 + Math.floor(Math.random() * 12);
      b = 162 + Math.floor(Math.random() * 18);
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

      // 遇电线/闪电产生荧光
      if ((nid === 44 || nid === 16) && Math.random() < 0.05) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 133);
          world.wakeArea(x, fy);
        }
      }

      // 遇激光/光束产生声波
      if ((nid === 47 || nid === 48) && Math.random() < 0.1) {
        const sdx = Math.random() < 0.5 ? -1 : 1;
        const sy = y - 1;
        if (world.inBounds(x + sdx, sy) && world.get(x + sdx, sy) === 0) {
          world.set(x + sdx, sy, 8);
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

registerMaterial(ElectroOptoAcousticMaterial);
