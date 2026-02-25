import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 检查目标位置是否可以被当前密度的粒子穿过（空气或密度更低的材质） */
function canDisplace(x: number, y: number, myDensity: number, world: WorldAPI): boolean {
  if (world.isEmpty(x, y)) return true;
  return world.getDensity(x, y) < myDensity;
}

/** 沙子 —— 粉末类，受重力影响，可堆积，可沉入液体 */
export const Sand: MaterialDef = {
  id: 1,
  name: '沙子',
  color() {
    const r = 194 + Math.floor(Math.random() * 20);
    const g = 178 + Math.floor(Math.random() * 15);
    const b = 128 + Math.floor(Math.random() * 10);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3,
  update(x: number, y: number, world: WorldAPI) {
    if (y >= world.height - 1) return;

    // 1. 尝试直接下落（空气或密度更低的液体）
    if (canDisplace(x, y + 1, Sand.density, world)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 2. 尝试左下或右下
    const dir = Math.random() < 0.5 ? -1 : 1;
    const nx1 = x + dir;
    const nx2 = x - dir;

    if (world.inBounds(nx1, y + 1) && canDisplace(nx1, y + 1, Sand.density, world)) {
      world.swap(x, y, nx1, y + 1);
      world.markUpdated(nx1, y + 1);
      return;
    }

    if (world.inBounds(nx2, y + 1) && canDisplace(nx2, y + 1, Sand.density, world)) {
      world.swap(x, y, nx2, y + 1);
      world.markUpdated(nx2, y + 1);
    }
  },
};

registerMaterial(Sand);
