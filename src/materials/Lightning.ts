import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 可燃材质 ID */
const FLAMMABLE = new Set([4, 5, 13]); // 木头、油、植物

/** 雷电生命值 */
const boltLife = new Map<string, number>();

function getLife(x: number, y: number): number {
  return boltLife.get(`${x},${y}`) ?? 0;
}

function setLife(x: number, y: number, life: number): void {
  if (life <= 0) {
    boltLife.delete(`${x},${y}`);
  } else {
    boltLife.set(`${x},${y}`, life);
  }
}

/**
 * 雷电 —— 短寿命高能粒子
 * - 快速向下移动，带有随机横向偏移（锯齿形路径）
 * - 点燃可燃物，熔化沙子为玻璃，蒸发水
 * - 寿命极短，几帧后消失
 */
export const Lightning: MaterialDef = {
  id: 16,
  name: '雷电',
  color() {
    const t = Math.random();
    const r = 200 + Math.floor(t * 55);
    const g = 200 + Math.floor(t * 55);
    const b = 255;
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 亮白蓝色
  },
  density: 0.05,
  update(x: number, y: number, world: WorldAPI) {
    // 初始化生命值
    let life = getLife(x, y);
    if (life === 0) {
      life = 4 + Math.floor(Math.random() * 4); // 4~7 帧
      setLife(x, y, life);
    }

    life--;
    setLife(x, y, life);

    // 刷新颜色（闪烁）
    world.set(x, y, 16);

    if (life <= 0) {
      world.set(x, y, 0);
      return;
    }

    // 检查邻居并反应
    const neighbors: [number, number][] = [
      [x, y + 1], [x - 1, y], [x + 1, y],
      [x - 1, y + 1], [x + 1, y + 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 沙子 → 玻璃
      if (nid === 1) {
        world.set(nx, ny, 17);
        world.markUpdated(nx, ny);
      }
      // 点燃可燃物
      if (FLAMMABLE.has(nid)) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
      }
      // 水 → 蒸汽
      if (nid === 2) {
        world.set(nx, ny, 8);
        world.markUpdated(nx, ny);
      }
      // 冰 → 水
      if (nid === 14) {
        world.set(nx, ny, 2);
        world.markUpdated(nx, ny);
      }
    }

    // 向下移动，带随机横向偏移（锯齿形闪电路径）
    if (y < world.height - 1) {
      const dx = Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0;
      const nx = x + dx;
      const ny = y + 1;

      if (world.inBounds(nx, ny)) {
        const targetId = world.get(nx, ny);

        if (targetId === 0) {
          // 空位：移动过去
          world.swap(x, y, nx, ny);
          setLife(nx, ny, life);
          setLife(x, y, 0);
          world.markUpdated(nx, ny);
        } else if (targetId === 1) {
          // 沙子：熔化为玻璃，继续前进
          world.set(nx, ny, 17);
          world.swap(x, y, nx, ny);
          setLife(nx, ny, life);
          setLife(x, y, 0);
          world.markUpdated(nx, ny);
        } else if (FLAMMABLE.has(targetId)) {
          // 可燃物：点燃，雷电消失
          world.set(nx, ny, 6);
          world.set(x, y, 0);
          setLife(x, y, 0);
        } else if (targetId === 2) {
          // 水：蒸发，雷电消失
          world.set(nx, ny, 8);
          world.set(x, y, 0);
          setLife(x, y, 0);
        } else {
          // 碰到固体：雷电消失
          world.set(x, y, 0);
          setLife(x, y, 0);
        }
      }
    } else {
      // 到达底部消失
      world.set(x, y, 0);
      setLife(x, y, 0);
    }
  },
};

registerMaterial(Lightning);
