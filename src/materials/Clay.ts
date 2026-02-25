import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 黏土 —— 半固体，缓慢流动
 * - 由泥土+水生成
 * - 缓慢下落，有粘性（不易水平扩散）
 * - 长时间后干燥变成石头
 */

const clayAge = new Map<string, number>();

function getAge(x: number, y: number): number {
  return clayAge.get(`${x},${y}`) ?? 0;
}

function setAge(x: number, y: number, age: number): void {
  if (age <= 0) {
    clayAge.delete(`${x},${y}`);
  } else {
    clayAge.set(`${x},${y}`, age);
  }
}

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
    // 老化计数
    let age = getAge(x, y);
    age++;
    setAge(x, y, age);

    // 干燥硬化：经过足够时间变成石头
    if (age > 500 && Math.random() < 0.01) {
      world.set(x, y, 3); // 变石头
      setAge(x, y, 0);
      return;
    }

    if (y >= world.height - 1) return;

    // 缓慢下落（比水慢很多）
    if (Math.random() < 0.3) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        // 迁移老化数据
        setAge(x, y + 1, age);
        setAge(x, y, 0);
        return;
      }

      // 偶尔斜下
      if (Math.random() < 0.3) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        const nx = x + dir;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          setAge(nx, y + 1, age);
          setAge(x, y, 0);
          return;
        }
      }
    }
  },
};

registerMaterial(Clay);
