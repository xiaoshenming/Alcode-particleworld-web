import type { MaterialDef, WorldAPI } from './types';
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
    // 检查邻居（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.3) {
        world.set(x, y, 6); world.set(nx, ny, 19); world.markUpdated(nx, ny);
        if (world.inBounds(x, y - 1)) { const bid = world.get(x, y - 1); if (bid === 2) { world.set(x, y - 1, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } else if (bid === 0) { world.set(x, y - 1, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } }
        if (world.inBounds(x, y + 1)) { const bid = world.get(x, y + 1); if (bid === 2) { world.set(x, y + 1, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } else if (bid === 0) { world.set(x, y + 1, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } }
        if (world.inBounds(x - 1, y)) { const bid = world.get(x - 1, y); if (bid === 2) { world.set(x - 1, y, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } else if (bid === 0) { world.set(x - 1, y, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } }
        if (world.inBounds(x + 1, y)) { const bid = world.get(x + 1, y); if (bid === 2) { world.set(x + 1, y, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } else if (bid === 0) { world.set(x + 1, y, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } }
        world.wakeArea(x, y); return;
      }
      if (nid === 24 && Math.random() < 0.05) { world.set(x, y, 0); world.set(nx, ny, 8); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.3) {
        world.set(x, y, 6); world.set(nx, ny, 19); world.markUpdated(nx, ny);
        if (world.inBounds(x, y - 1)) { const bid = world.get(x, y - 1); if (bid === 2) { world.set(x, y - 1, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } else if (bid === 0) { world.set(x, y - 1, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } }
        if (world.inBounds(x, y + 1)) { const bid = world.get(x, y + 1); if (bid === 2) { world.set(x, y + 1, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } else if (bid === 0) { world.set(x, y + 1, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } }
        if (world.inBounds(x - 1, y)) { const bid = world.get(x - 1, y); if (bid === 2) { world.set(x - 1, y, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } else if (bid === 0) { world.set(x - 1, y, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } }
        if (world.inBounds(x + 1, y)) { const bid = world.get(x + 1, y); if (bid === 2) { world.set(x + 1, y, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } else if (bid === 0) { world.set(x + 1, y, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } }
        world.wakeArea(x, y); return;
      }
      if (nid === 24 && Math.random() < 0.05) { world.set(x, y, 0); world.set(nx, ny, 8); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.3) {
        world.set(x, y, 6); world.set(nx, ny, 19); world.markUpdated(nx, ny);
        if (world.inBounds(x, y - 1)) { const bid = world.get(x, y - 1); if (bid === 2) { world.set(x, y - 1, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } else if (bid === 0) { world.set(x, y - 1, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } }
        if (world.inBounds(x, y + 1)) { const bid = world.get(x, y + 1); if (bid === 2) { world.set(x, y + 1, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } else if (bid === 0) { world.set(x, y + 1, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } }
        if (world.inBounds(x - 1, y)) { const bid = world.get(x - 1, y); if (bid === 2) { world.set(x - 1, y, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } else if (bid === 0) { world.set(x - 1, y, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } }
        if (world.inBounds(x + 1, y)) { const bid = world.get(x + 1, y); if (bid === 2) { world.set(x + 1, y, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } else if (bid === 0) { world.set(x + 1, y, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } }
        world.wakeArea(x, y); return;
      }
      if (nid === 24 && Math.random() < 0.05) { world.set(x, y, 0); world.set(nx, ny, 8); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.3) {
        world.set(x, y, 6); world.set(nx, ny, 19); world.markUpdated(nx, ny);
        if (world.inBounds(x, y - 1)) { const bid = world.get(x, y - 1); if (bid === 2) { world.set(x, y - 1, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } else if (bid === 0) { world.set(x, y - 1, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } }
        if (world.inBounds(x, y + 1)) { const bid = world.get(x, y + 1); if (bid === 2) { world.set(x, y + 1, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } else if (bid === 0) { world.set(x, y + 1, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } }
        if (world.inBounds(x - 1, y)) { const bid = world.get(x - 1, y); if (bid === 2) { world.set(x - 1, y, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } else if (bid === 0) { world.set(x - 1, y, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } }
        if (world.inBounds(x + 1, y)) { const bid = world.get(x + 1, y); if (bid === 2) { world.set(x + 1, y, Math.random() < 0.3 ? 19 : 8); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } else if (bid === 0) { world.set(x + 1, y, Math.random() < 0.5 ? 6 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } }
        world.wakeArea(x, y); return;
      }
      if (nid === 24 && Math.random() < 0.05) { world.set(x, y, 0); world.set(nx, ny, 8); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
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
            {
        const d = dir;
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
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
