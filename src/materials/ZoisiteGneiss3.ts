import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 黝帘石片麻岩(3) —— 黝帘石与片麻岩的变质岩
 * - 固体，密度 Infinity
 * - 灰绿色带条纹
 */

export const ZoisiteGneiss3: MaterialDef = {
  id: 1094,
  name: '黝帘石片麻岩(3)',
  category: '固体',
  description: '黝帘石与片麻岩的高级变质岩，具有柱状晶体纹理',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 95 + Math.floor(Math.random() * 22);
      g = 115 + Math.floor(Math.random() * 22);
      b = 88 + Math.floor(Math.random() * 18);
    } else if (phase < 0.8) {
      r = 105 + Math.floor(Math.random() * 12);
      g = 125 + Math.floor(Math.random() * 12);
      b = 95 + Math.floor(Math.random() * 12);
    } else {
      r = 88 + Math.floor(Math.random() * 10);
      g = 108 + Math.floor(Math.random() * 10);
      b = 82 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    // 4方向显式展开（上下左右，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1;
      const nid = world.get(nx, ny);
      if (nid === 11 && Math.random() < 0.0008) {
        world.set(x, y, 11);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1;
      const nid = world.get(nx, ny);
      if (nid === 11 && Math.random() < 0.0008) {
        world.set(x, y, 11);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y;
      const nid = world.get(nx, ny);
      if (nid === 11 && Math.random() < 0.0008) {
        world.set(x, y, 11);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y;
      const nid = world.get(nx, ny);
      if (nid === 11 && Math.random() < 0.0008) {
        world.set(x, y, 11);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
  },
};

registerMaterial(ZoisiteGneiss3);
