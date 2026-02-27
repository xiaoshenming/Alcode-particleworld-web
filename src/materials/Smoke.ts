import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 烟 —— 气体，向上飘散，有生命周期后消失
 * 使用 World 内置 age 系统替代 Map<string,number>，swap 时 age 自动迁移
 */

export const Smoke: MaterialDef = {
  id: 7,
  name: '烟',
  color() {
    const v = 80 + Math.floor(Math.random() * 40);
    const a = 0xCC;
    return (a << 24) | (v << 16) | (v << 8) | v;
  },
  density: 0.05,
  update(x: number, y: number, world: WorldAPI) {
    const age = world.getAge(x, y);

    // 生命耗尽：age>60 后以概率消失，模拟 60~120 帧随机寿命
    if (age > 60 && Math.random() < 0.016) {
      world.set(x, y, 0);
      return;
    }

    // 向上飘动
    if (y > 0) {
      if (world.isEmpty(x, y - 1)) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        return;
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
    const driftChance = 0.3 + windStr * 0.5;
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

registerMaterial(Smoke);
