import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 黏土 —— 半固体，缓慢流动
 * - 由泥土+水生成
 * - 缓慢下落，有粘性（不易水平扩散）
 * - 长时间后干燥变成石头
 * 使用 World 内置 age 系统，避免 Map<string,number> 的字符串拼接开销
 */

export const Clay: MaterialDef = {
  id: 21,
  name: '黏土',
  color() {
    const r = 160 + Math.floor(Math.random() * 15);
    const g = 100 + Math.floor(Math.random() * 10);
    const b = 60 + Math.floor(Math.random() * 10);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 深棕偏红
  },
  density: 4,
  update(x: number, y: number, world: WorldAPI) {
    // 老化计数（使用 World 内置 age，tickAge 每帧自动递增）
    const age = world.getAge(x, y);

    // 干燥硬化：经过足够时间变成石头
    if (age > 500 && Math.random() < 0.01) {
      world.set(x, y, 3); // 变石头
      return;
    }

    if (y >= world.height - 1) return;

    // 缓慢下落（比水慢很多）
    if (Math.random() < 0.3) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }

      // 偶尔斜下
      if (Math.random() < 0.3) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        const nx = x + dir;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(Clay);
