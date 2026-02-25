import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 金 —— 贵重金属，由炼金石将普通金属转化而来
 * - 不可移动的固体
 * - 不可燃，不受酸液腐蚀
 * - 金色闪烁效果
 */
export const Gold: MaterialDef = {
  id: 31,
  name: '金',
  color() {
    const t = Math.random();
    const r = 230 + Math.floor(t * 25);
    const g = 180 + Math.floor(t * 40);
    const b = 30 + Math.floor(t * 30);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 金色
  },
  density: Infinity,
  update(_x: number, _y: number, _world: WorldAPI) {
    // 金是惰性固体，不做任何事
  },
};

registerMaterial(Gold);
