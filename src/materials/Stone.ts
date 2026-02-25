import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 石头 —— 固体，不移动，作为障碍物 */
export const Stone: MaterialDef = {
  id: 3,
  name: '石头',
  color() {
    const v = 100 + Math.floor(Math.random() * 30);
    return (0xFF << 24) | (v << 16) | (v << 8) | v;
  },
  density: Infinity,
  update(_x: number, _y: number, _world: WorldAPI) {
    // 石头不移动
  },
};

registerMaterial(Stone);
