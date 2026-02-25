import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 空气 —— 什么都不做 */
export const Empty: MaterialDef = {
  id: 0,
  name: '空气',
  color: () => 0xFF3E2116, // 背景色 #16213e ABGR
  density: 0,
  update(_x: number, _y: number, _world: WorldAPI) {
    // 空气不需要更新
  },
};

registerMaterial(Empty);
