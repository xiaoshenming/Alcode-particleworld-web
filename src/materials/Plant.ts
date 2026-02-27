import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 植物 —— 固体，可燃，遇水向上/侧面生长
 * 生长有概率限制，不会无限蔓延
 * 使用 World 内置 age 替代 Map<string,number>
 * age=0: 未初始化; age=1: 能量耗尽; age>=2: 实际剩余能量=age-1
 */

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
    // age 偏移1存储能量：age=0未初始化，age=1能量耗尽，age=N表示剩余N-1次生长
    let ageVal = world.getAge(x, y);
    if (ageVal === 0) {
      // 初始化：5~12 次生长机会，存为 age = energy+1
      const energy = 5 + Math.floor(Math.random() * 8);
      ageVal = energy + 1;
      world.setAge(x, y, ageVal);
    }

    if (ageVal <= 1) return; // 能量耗尽（age=1 对应 energy=0）

    const energy = ageVal - 1; // 实际剩余能量

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
      world.set(gx, gy, 13); // set() 会重置 age=0
      // 新植物继承部分能量（energy-1，存为 (energy-1)+1 = energy）
      world.setAge(gx, gy, energy);
      world.markUpdated(gx, gy);

      // 消耗自身能量（energy-1 → 存为 energy-1+1 = energy）
      world.setAge(x, y, energy);
    }
  },
};

registerMaterial(Plant);
