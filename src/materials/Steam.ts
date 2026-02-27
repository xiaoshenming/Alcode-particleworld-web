import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蒸汽 —— 气体，比烟更轻，向上快速飘散
 * 遇冷（生命耗尽）凝结为水
 * 使用 World 内置 age 系统替代 Map<string,number>
 */

export const Steam: MaterialDef = {
  id: 8,
  name: '蒸汽',
  color() {
    const v = 200 + Math.floor(Math.random() * 40);
    return (0xBB << 24) | (v << 16) | (v << 8) | v;
  },
  density: 0.02,
  update(x: number, y: number, world: WorldAPI) {
    const age = world.getAge(x, y);

    // 生命耗尽：age>80 后以概率消失，模拟 80~160 帧随机寿命
    if (age > 80 && Math.random() < 0.012) {
      if (Math.random() < 0.3) {
        world.set(x, y, 2); // 凝结为水
      } else {
        world.set(x, y, 0);
      }
      return;
    }

    // 快速上升
    if (y > 0) {
      const rise = Math.random() < 0.4 ? 2 : 1;
      for (let d = rise; d >= 1; d--) {
        const ny = y - d;
        if (ny >= 0 && world.isEmpty(x, ny)) {
          world.swap(x, y, x, ny);
          world.markUpdated(x, ny);
          return;
        }
      }
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          world.swap(x, y, nx, y - 1);
          world.markUpdated(nx, y - 1);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          world.swap(x, y, nx, y - 1);
          world.markUpdated(nx, y - 1);
          return;
        }
      }
    }

    // 水平漂移（受风力影响）
    const windDir = world.getWind();
    const windStr = world.getWindStrength();
    const driftChance = 0.5 + windStr * 0.4;
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
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(Steam);
