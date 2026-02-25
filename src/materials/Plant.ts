import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 植物 —— 固体，可燃，遇水向上/侧面生长
 * 生长有概率限制，不会无限蔓延
 */

/** 植物生长计数器，限制单株最大高度 */
const growthEnergy = new Map<string, number>();

function getEnergy(x: number, y: number): number {
  return growthEnergy.get(`${x},${y}`) ?? 0;
}

function setEnergy(x: number, y: number, energy: number): void {
  if (energy <= 0) {
    growthEnergy.delete(`${x},${y}`);
  } else {
    growthEnergy.set(`${x},${y}`, energy);
  }
}

export const Plant: MaterialDef = {
  id: 13,
  name: '植物',
  color() {
    const r = 20 + Math.floor(Math.random() * 30);
    const g = 100 + Math.floor(Math.random() * 80);
    const b = 15 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 绿色
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    // 初始化生长能量
    let energy = getEnergy(x, y);
    if (energy === 0) {
      energy = 5 + Math.floor(Math.random() * 8); // 5~12 次生长机会
      setEnergy(x, y, energy);
    }

    if (energy <= 0) return; // 已停止生长

    // 检查附近是否有水
    const waterDirs: [number, number][] = [];
    const growDirs: [number, number][] = [];

    const checks: [number, number][] = [
      [x, y - 1], [x - 1, y], [x + 1, y],
      [x - 1, y - 1], [x + 1, y - 1],
    ];

    for (const [nx, ny] of checks) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid === 2) waterDirs.push([nx, ny]);
      if (nid === 0) growDirs.push([nx, ny]);
    }

    // 有水才能生长
    if (waterDirs.length === 0 || growDirs.length === 0) return;

    // 生长概率
    if (Math.random() < 0.02) {
      // 消耗一格水
      const [wx, wy] = waterDirs[Math.floor(Math.random() * waterDirs.length)];
      world.set(wx, wy, 0);

      // 在空位生长一格植物
      const [gx, gy] = growDirs[Math.floor(Math.random() * growDirs.length)];
      world.set(gx, gy, 13);
      // 新植物继承部分能量
      setEnergy(gx, gy, energy - 1);
      world.markUpdated(gx, gy);

      // 消耗自身能量
      energy--;
      setEnergy(x, y, energy);
    }
  },
};

registerMaterial(Plant);
