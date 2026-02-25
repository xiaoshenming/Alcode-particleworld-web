import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 水草 —— 水生植物
 * - 固体/半固体，低密度
 * - 在水(2)/盐水(24)中生长（向上延伸）
 * - 产生氧气（偶尔在水中产生气泡(73)）
 * - 离开水枯萎变为泥土(20)
 * - 可燃：遇火(6)燃烧
 * - 视觉上呈绿色长条
 */

export const Seaweed: MaterialDef = {
  id: 156,
  name: '水草',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 20 + Math.floor(Math.random() * 15);
      g = 100 + Math.floor(Math.random() * 30);
      b = 30 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      r = 15 + Math.floor(Math.random() * 10);
      g = 80 + Math.floor(Math.random() * 25);
      b = 25 + Math.floor(Math.random() * 10);
    } else {
      // 深绿
      r = 10 + Math.floor(Math.random() * 10);
      g = 65 + Math.floor(Math.random() * 20);
      b = 20 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.3,
  update(x: number, y: number, world: WorldAPI) {
    let inWater = false;
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 2 || nid === 24) {
        inWater = true;
      }

      // 遇火燃烧
      if (nid === 6 && Math.random() < 0.05) {
        world.set(x, y, 6);
        world.wakeArea(x, y);
        return;
      }
    }

    // 在水中生长
    if (inWater && Math.random() < 0.003) {
      if (world.inBounds(x, y - 1) && (world.get(x, y - 1) === 2 || world.get(x, y - 1) === 24)) {
        world.set(x, y - 1, 156);
        world.markUpdated(x, y - 1);
        world.wakeArea(x, y - 1);
      }
    }

    // 产生气泡
    if (inWater && Math.random() < 0.001) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && (world.get(nx, ny) === 2 || world.get(nx, ny) === 24)) {
          world.set(nx, ny, 73); // 泡泡
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
          break;
        }
      }
    }

    // 离开水枯萎
    if (!inWater && Math.random() < 0.005) {
      world.set(x, y, 20);
      world.wakeArea(x, y);
      return;
    }
  },
};

registerMaterial(Seaweed);
