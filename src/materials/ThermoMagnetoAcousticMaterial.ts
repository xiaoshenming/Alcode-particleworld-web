import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热磁声材料 —— 热-磁-声三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 高温>380时产生磁效应（吸引附近金属粒子）
 * - 遇磁铁(42)产生声效应（生成龙卷风(50)碎片）
 * - 深灰红色带热磁纹理
 */

export const ThermoMagnetoAcousticMaterial: MaterialDef = {
  id: 750,
  name: '热磁声材料',
  category: '固体',
  description: '热-磁-声三场耦合功能材料，用于多物理场传感和能量转换',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 128 + Math.floor(Math.random() * 12);
      g = 82 + Math.floor(Math.random() * 12);
      b = 78 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 140 + Math.floor(Math.random() * 12);
      g = 94 + Math.floor(Math.random() * 11);
      b = 90 + Math.floor(Math.random() * 10);
    } else {
      r = 135 + Math.floor(Math.random() * 17);
      g = 88 + Math.floor(Math.random() * 17);
      b = 84 + Math.floor(Math.random() * 16);
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

      // 高温时产生磁效应（吸引附近金属粒子）
      if (temp > 380 && Math.random() < 0.02) {
        // 搜索附近范围内的金属粒子并吸引
        for (let sx = -3; sx <= 3; sx++) {
          for (let sy = -3; sy <= 3; sy++) {
            const tx = x + sx, ty = y + sy;
            if (!world.inBounds(tx, ty)) continue;
            const tid = world.get(tx, ty);
            // 金属类材质: 10=金属, 85=铜, 86=锡, 169=液态铁
            if ((tid === 10 || tid === 85 || tid === 86 || tid === 169) && Math.random() < 0.1) {
              const mx = tx + (tx > x ? -1 : tx < x ? 1 : 0);
              const my = ty + (ty > y ? -1 : ty < y ? 1 : 0);
              if (world.inBounds(mx, my) && world.get(mx, my) === 0) {
                world.swap(tx, ty, mx, my);
                world.wakeArea(mx, my);
              }
            }
          }
        }
      }

      // 遇磁铁产生声效应（生成龙卷风碎片）
      if (nid === 42 && Math.random() < 0.02) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 50);
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

registerMaterial(ThermoMagnetoAcousticMaterial);
