import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 透辉石片麻岩(3) —— 第三代透辉石片麻岩
 * - 固体，密度 Infinity
 * - 深绿灰色纹理
 */

export const DiopsideGneiss3: MaterialDef = {
  id: 1054,
  name: '透辉石片麻岩(3)',
  category: '固体',
  description: '第三代透辉石片麻岩，含丰富透辉石矿物的变质岩',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 88 + Math.floor(Math.random() * 20);
      g = 108 + Math.floor(Math.random() * 22);
      b = 92 + Math.floor(Math.random() * 18);
    } else if (phase < 0.8) {
      r = 95 + Math.floor(Math.random() * 12);
      g = 115 + Math.floor(Math.random() * 14);
      b = 98 + Math.floor(Math.random() * 12);
    } else {
      r = 82 + Math.floor(Math.random() * 10);
      g = 102 + Math.floor(Math.random() * 10);
      b = 86 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    // 4方向显式展开（上下左右，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1;
      const nid = world.get(nx, ny);
      if (nid === 11 && Math.random() < 0.003) {
        world.set(x, y, 11);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 8) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1;
      const nid = world.get(nx, ny);
      if (nid === 11 && Math.random() < 0.003) {
        world.set(x, y, 11);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 8) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y;
      const nid = world.get(nx, ny);
      if (nid === 11 && Math.random() < 0.003) {
        world.set(x, y, 11);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 8) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y;
      const nid = world.get(nx, ny);
      if (nid === 11 && Math.random() < 0.003) {
        world.set(x, y, 11);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 8) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
  },
};

registerMaterial(DiopsideGneiss3);
