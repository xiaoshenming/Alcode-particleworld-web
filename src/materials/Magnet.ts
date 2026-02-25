import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁铁 —— 吸引金属类粒子的固体
 * - 不可移动，密度无限
 * - 在一定范围内吸引金属(10)、金(31)粒子向自身靠近
 * - 吸引力随距离衰减
 * - 不影响非金属材质
 */

/** 可被磁铁吸引的材质 */
const MAGNETIC = new Set([10, 31]); // 金属、金

/** 磁力作用半径 */
const MAGNET_RADIUS = 8;

export const Magnet: MaterialDef = {
  id: 42,
  name: '磁铁',
  color() {
    // 红灰色，经典磁铁外观
    const t = Math.random();
    const r = 180 + Math.floor(t * 40);
    const g = 40 + Math.floor(t * 20);
    const b = 40 + Math.floor(t * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    // 扫描磁力范围内的金属粒子
    for (let dy = -MAGNET_RADIUS; dy <= MAGNET_RADIUS; dy++) {
      for (let dx = -MAGNET_RADIUS; dx <= MAGNET_RADIUS; dx++) {
        if (dx === 0 && dy === 0) continue;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MAGNET_RADIUS) continue;

        const tx = x + dx;
        const ty = y + dy;
        if (!world.inBounds(tx, ty)) continue;

        const matId = world.get(tx, ty);
        if (!MAGNETIC.has(matId)) continue;
        if (world.isUpdated(tx, ty)) continue;

        // 吸引概率随距离衰减
        const prob = 0.3 / dist;
        if (Math.random() > prob) continue;

        // 计算朝磁铁方向移动一格
        const mx = tx + (dx > 0 ? -1 : dx < 0 ? 1 : 0);
        const my = ty + (dy > 0 ? -1 : dy < 0 ? 1 : 0);

        if (!world.inBounds(mx, my)) continue;
        // 不能移动到磁铁自身位置
        if (mx === x && my === y) continue;

        if (world.isEmpty(mx, my)) {
          world.swap(tx, ty, mx, my);
          world.markUpdated(mx, my);
        }
      }
    }
  },
};

registerMaterial(Magnet);
