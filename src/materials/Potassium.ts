import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钾 —— 碱金属元素
 * - 固体，低密度，可下落
 * - 遇水(2)剧烈反应：爆炸+产生氢气(19)+火(6)
 * - 遇盐水(24)也会反应但较温和
 * - 在空气中缓慢氧化（变为铁锈色）
 * - 视觉上呈银白色带紫色光泽
 */

export const Potassium: MaterialDef = {
  id: 158,
  name: '钾',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 195 + Math.floor(Math.random() * 20);
      g = 190 + Math.floor(Math.random() * 20);
      b = 200 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      r = 210 + Math.floor(Math.random() * 15);
      g = 205 + Math.floor(Math.random() * 15);
      b = 215 + Math.floor(Math.random() * 10);
    } else {
      // 紫色光泽
      r = 185 + Math.floor(Math.random() * 15);
      g = 175 + Math.floor(Math.random() * 15);
      b = 210 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.4,
  update(x: number, y: number, world: WorldAPI) {
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水剧烈反应
      if (nid === 2 && Math.random() < 0.3) {
        world.set(x, y, 6); // 火
        world.set(nx, ny, 19); // 氢气
        world.markUpdated(nx, ny);
        // 爆炸扩散
        for (const [ex, ey] of dirs) {
          const bx = x + ex, by = y + ey;
          if (world.inBounds(bx, by)) {
            const bid = world.get(bx, by);
            if (bid === 2) {
              world.set(bx, by, Math.random() < 0.3 ? 19 : 8);
              world.markUpdated(bx, by);
              world.wakeArea(bx, by);
            } else if (bid === 0) {
              world.set(bx, by, Math.random() < 0.5 ? 6 : 7);
              world.markUpdated(bx, by);
              world.wakeArea(bx, by);
            }
          }
        }
        world.wakeArea(x, y);
        return;
      }

      // 遇盐水温和反应
      if (nid === 24 && Math.random() < 0.05) {
        world.set(x, y, 0);
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 空气中氧化（极慢）
    if (Math.random() < 0.0003) {
      world.set(x, y, 72); // 铁锈（氧化物）
      world.wakeArea(x, y);
      return;
    }

    // 粉末下落
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0 && Math.random() < 0.3) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(Potassium);
