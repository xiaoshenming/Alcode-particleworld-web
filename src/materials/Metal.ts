import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 金属 —— 固体，不移动，不可燃，导热
 * 酸液无法腐蚀金属
 */
export const Metal: MaterialDef = {
  id: 10,
  name: '金属',
  color() {
    const base = 160 + Math.floor(Math.random() * 20);
    const r = base;
    const g = base + 5;
    const b = base + 15; // 略带蓝色金属光泽
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(_x: number, _y: number, _world: WorldAPI) {
    // 金属不移动
  },
};

registerMaterial(Metal);
