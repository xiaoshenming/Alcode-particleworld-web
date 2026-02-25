import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 烟 —— 气体，向上飘散，有生命周期后消失 */

const smokeLife = new Map<string, number>();

function getLife(x: number, y: number): number {
  return smokeLife.get(`${x},${y}`) ?? 0;
}

function setLife(x: number, y: number, life: number): void {
  if (life <= 0) {
    smokeLife.delete(`${x},${y}`);
  } else {
    smokeLife.set(`${x},${y}`, life);
  }
}

export const Smoke: MaterialDef = {
  id: 7,
  name: '烟',
  color() {
    const v = 80 + Math.floor(Math.random() * 40);
    const a = 0xCC; // 半透明感
    return (a << 24) | (v << 16) | (v << 8) | v;
  },
  density: 0.05, // 极轻，比火还轻
  update(x: number, y: number, world: WorldAPI) {
    // 初始化生命值
    let life = getLife(x, y);
    if (life === 0) {
      life = 60 + Math.floor(Math.random() * 60); // 60~120 帧
      setLife(x, y, life);
    }

    life--;
    setLife(x, y, life);

    // 生命耗尽 → 消失
    if (life <= 0) {
      world.set(x, y, 0);
      return;
    }

    // 向上飘动
    if (y > 0) {
      // 1. 直接上升
      if (world.isEmpty(x, y - 1)) {
        world.swap(x, y, x, y - 1);
        setLife(x, y - 1, life);
        setLife(x, y, 0);
        world.markUpdated(x, y - 1);
        return;
      }

      // 2. 斜上方
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          world.swap(x, y, nx, y - 1);
          setLife(nx, y - 1, life);
          setLife(x, y, 0);
          world.markUpdated(nx, y - 1);
          return;
        }
      }
    }

    // 3. 水平漂移（受风力影响）
    const windDir = world.getWind();
    const windStr = world.getWindStrength();
    const driftChance = 0.3 + windStr * 0.5;
    if (Math.random() < driftChance) {
      // 风力偏移：有风时偏向风向
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

registerMaterial(Smoke);
