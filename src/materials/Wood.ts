import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 木头 —— 固体，不移动，可燃 */
export const Wood: MaterialDef = {
  id: 4,
  name: '木头',
  color() {
    const r = 120 + Math.floor(Math.random() * 20);
    const g = 70 + Math.floor(Math.random() * 15);
    const b = 30 + Math.floor(Math.random() * 10);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(_x: number, _y: number, _world: WorldAPI) {
    // 木头不移动（燃烧逻辑由火材质处理）
  },
};

registerMaterial(Wood);
