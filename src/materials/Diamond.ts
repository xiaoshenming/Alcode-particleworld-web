import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钻石 —— 由炼金石将石头转化而来
 * - 不可移动的固体
 * - 不可燃，不受酸液腐蚀
 * - 闪亮的蓝白色
 */
export const Diamond: MaterialDef = {
  id: 32,
  name: '钻石',
  color() {
    const t = Math.random();
    const r = 180 + Math.floor(t * 60);
    const g = 220 + Math.floor(t * 35);
    const b = 240 + Math.floor(t * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 蓝白闪光
  },
  density: Infinity,
  update(_x: number, _y: number, _world: WorldAPI) {
    // 钻石是惰性固体，不做任何事
  },
};

registerMaterial(Diamond);
