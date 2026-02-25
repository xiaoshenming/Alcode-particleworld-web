import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 等离子球 —— 装饰性等离子放电球
 * - 固体，不可移动
 * - 持续向周围空位释放等离子体(55)
 * - 接触电线(44)加速释放
 * - 接触水(2)短路爆炸产生蒸汽(8)+火花(28)
 * - 高温(>800)过载爆炸
 * - 视觉上呈深紫色发光球体
 */

export const PlasmaOrb: MaterialDef = {
  id: 128,
  name: '等离子球',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 深紫色
      r = 120 + Math.floor(Math.random() * 30);
      g = 40 + Math.floor(Math.random() * 20);
      b = 180 + Math.floor(Math.random() * 40);
    } else if (t < 0.7) {
      // 亮紫色
      r = 160 + Math.floor(Math.random() * 30);
      g = 60 + Math.floor(Math.random() * 30);
      b = 210 + Math.floor(Math.random() * 30);
    } else if (t < 0.9) {
      // 粉紫色
      r = 180 + Math.floor(Math.random() * 30);
      g = 80 + Math.floor(Math.random() * 20);
      b = 200 + Math.floor(Math.random() * 30);
    } else {
      // 白色核心
      r = 220 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 30);
      b = 240 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 过载爆炸
    if (temp > 800) {
      world.set(x, y, 55); // 等离子体
      const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && (world.isEmpty(nx, ny) || world.get(nx, ny) === 7)) {
          world.set(nx, ny, Math.random() < 0.5 ? 55 : 28);
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
        }
      }
      world.wakeArea(x, y);
      return;
    }

    let hasWire = false;
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水短路
      if (nid === 2 && Math.random() < 0.05) {
        world.set(x, y, 28); // 火花
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      if (nid === 44) hasWire = true;
    }

    // 释放等离子体
    const rate = hasWire ? 0.12 : 0.04;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (world.inBounds(nx, ny) && world.isEmpty(nx, ny) && Math.random() < rate) {
        world.set(nx, ny, 55); // 等离子体
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        break;
      }
    }

    world.wakeArea(x, y);
  },
};

registerMaterial(PlasmaOrb);
