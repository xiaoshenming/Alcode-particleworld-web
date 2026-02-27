import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钯镨合金 —— 催化磁性合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1800° → 液态钯镨(1232)
 * - 结合钯的催化性与镨的磁性特性
 * - 银绿灰色调
 */

export const PalladiumPraseodymiumAlloy: MaterialDef = {
  id: 1231,
  name: '钯镨合金',
  category: '固体',
  description: '钯与镨的合金，结合钯的催化性与镨的磁性特性',
  density: Infinity,
  color() {
    const r = 182 + Math.floor(Math.random() * 18);
    const g = 188 + Math.floor(Math.random() * 18);
    const b = 182 + Math.floor(Math.random() * 18);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1800) {
      world.set(x, y, 1232);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.09;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(PalladiumPraseodymiumAlloy);
