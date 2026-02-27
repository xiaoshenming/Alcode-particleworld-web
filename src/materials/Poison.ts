import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 毒气 —— 有毒气体，向上飘散
 * 使用 World 内置 age 系统替代 Map<string,number>
 */
export const Poison: MaterialDef = {
  id: 18,
  name: '毒气',
  color() {
    const r = 30 + Math.floor(Math.random() * 20);
    const g = 160 + Math.floor(Math.random() * 60);
    const b = 20 + Math.floor(Math.random() * 20);
    return (0xBB << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.2,
  update(x: number, y: number, world: WorldAPI) {
    const age = world.getAge(x, y);

    // 生命耗尽：age>80 后以概率消失，模拟 80~140 帧随机寿命
    if (age > 80 && Math.random() < 0.014) {
      world.set(x, y, 0);
      return;
    }

    // 检查邻居反应
    const dxs = [0, 0, -1, 1];
    const dys = [-1, 1, 0, 0];
    for (let d = 0; d < 4; d++) {
      const nx = x + dxs[d];
      const ny = y + dys[d];
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid === 13 && Math.random() < 0.08) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
      }
      if (nid === 12 && Math.random() < 0.1) {
        world.set(nx, ny, 0);
      }
      if (nid === 2 && Math.random() < 0.05) {
        world.set(x, y, 0);
        return;
      }
    }

    // 向上飘动
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.4) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 随机水平扩散（受风力影响）
    const windDir = world.getWind();
    const windStr = world.getWindStrength();
    if (Math.random() < 0.3 + windStr * 0.4) {
      let dir: number;
      if (windDir !== 0 && Math.random() < windStr) {
        dir = windDir;
      } else {
        dir = Math.random() < 0.5 ? -1 : 1;
      }
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(Poison);
