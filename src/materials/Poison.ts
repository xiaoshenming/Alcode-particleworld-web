import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 毒气生命值 */
const gasLife = new Map<string, number>();

function getLife(x: number, y: number): number {
  return gasLife.get(`${x},${y}`) ?? 0;
}

function setLife(x: number, y: number, life: number): void {
  if (life <= 0) {
    gasLife.delete(`${x},${y}`);
  } else {
    gasLife.set(`${x},${y}`, life);
  }
}

/**
 * 毒气 —— 有毒气体，向上飘散
 * - 杀死植物（植物变烟）
 * - 有寿命限制，自然消散
 * - 遇水被吸收（水净化毒气）
 */
export const Poison: MaterialDef = {
  id: 18,
  name: '毒气',
  color() {
    const r = 30 + Math.floor(Math.random() * 20);
    const g = 160 + Math.floor(Math.random() * 60);
    const b = 20 + Math.floor(Math.random() * 20);
    return (0xBB << 24) | (b << 16) | (g << 8) | r; // 半透明绿色
  },
  density: 0.2, // 比空气略重，比火轻
  update(x: number, y: number, world: WorldAPI) {
    let life = getLife(x, y);
    if (life === 0) {
      life = 80 + Math.floor(Math.random() * 60); // 80~140 帧
      setLife(x, y, life);
    }

    life--;
    setLife(x, y, life);

    // 刷新颜色
    world.set(x, y, 18);

    if (life <= 0) {
      world.set(x, y, 0);
      return;
    }

    // 检查邻居反应
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];

    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 杀死植物 → 变烟
      if (nid === 13 && Math.random() < 0.08) {
        world.set(nx, ny, 7); // 烟
        world.markUpdated(nx, ny);
      }

      // 杀死种子
      if (nid === 12 && Math.random() < 0.1) {
        world.set(nx, ny, 0);
      }

      // 水吸收毒气
      if (nid === 2 && Math.random() < 0.05) {
        world.set(x, y, 0);
        setLife(x, y, 0);
        return;
      }
    }

    // 向上飘动
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.4) {
      world.swap(x, y, x, y - 1);
      setLife(x, y - 1, life);
      setLife(x, y, 0);
      world.markUpdated(x, y - 1);
      return;
    }

    // 随机水平扩散（受风力影响）
    const windDir = world.getWind();
    const windStr = world.getWindStrength();
    const driftChance = 0.3 + windStr * 0.4;
    if (Math.random() < driftChance) {
      let dir: number;
      if (windDir !== 0 && Math.random() < windStr) {
        dir = windDir;
      } else {
        dir = Math.random() < 0.5 ? -1 : 1;
      }
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        setLife(nx, y, life);
        setLife(x, y, 0);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(Poison);
