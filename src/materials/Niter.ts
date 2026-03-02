import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 硝石 —— 硝酸钾矿物
 * - 粉末，中等密度
 * - 强氧化剂：遇火(6)/火花(28)剧烈燃烧爆炸
 * - 遇水(2)溶解消失
 * - 与木炭(46)+硫磺(66)混合=黑火药效果
 * - 视觉上呈白色针状结晶
 */

export const Niter: MaterialDef = {
  id: 150,
  name: '硝石',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 230 + Math.floor(Math.random() * 20);
      g = 232 + Math.floor(Math.random() * 18);
      b = 235 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      r = 220 + Math.floor(Math.random() * 15);
      g = 225 + Math.floor(Math.random() * 15);
      b = 228 + Math.floor(Math.random() * 12);
    } else {
      // 微黄
      r = 235 + Math.floor(Math.random() * 15);
      g = 230 + Math.floor(Math.random() * 15);
      b = 215 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.8,
  update(x: number, y: number, world: WorldAPI) {
    // 检查邻居（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if ((nid === 6 || nid === 28) && Math.random() < 0.2) {
        world.set(x, y, 6);
        if (world.inBounds(x, y - 1)) { const bid = world.get(x, y - 1); if (bid === 0) { world.set(x, y - 1, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } else if (bid === 150) { world.set(x, y - 1, 6); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } }
        if (world.inBounds(x, y + 1)) { const bid = world.get(x, y + 1); if (bid === 0) { world.set(x, y + 1, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } else if (bid === 150) { world.set(x, y + 1, 6); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } }
        if (world.inBounds(x - 1, y)) { const bid = world.get(x - 1, y); if (bid === 0) { world.set(x - 1, y, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } else if (bid === 150) { world.set(x - 1, y, 6); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } }
        if (world.inBounds(x + 1, y)) { const bid = world.get(x + 1, y); if (bid === 0) { world.set(x + 1, y, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } else if (bid === 150) { world.set(x + 1, y, 6); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } }
        world.wakeArea(x, y); return;
      }
      if (nid === 2 && Math.random() < 0.03) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if ((nid === 46 || nid === 66) && Math.random() < 0.001) { world.set(x, y, 22); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if ((nid === 6 || nid === 28) && Math.random() < 0.2) {
        world.set(x, y, 6);
        if (world.inBounds(x, y - 1)) { const bid = world.get(x, y - 1); if (bid === 0) { world.set(x, y - 1, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } else if (bid === 150) { world.set(x, y - 1, 6); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } }
        if (world.inBounds(x, y + 1)) { const bid = world.get(x, y + 1); if (bid === 0) { world.set(x, y + 1, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } else if (bid === 150) { world.set(x, y + 1, 6); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } }
        if (world.inBounds(x - 1, y)) { const bid = world.get(x - 1, y); if (bid === 0) { world.set(x - 1, y, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } else if (bid === 150) { world.set(x - 1, y, 6); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } }
        if (world.inBounds(x + 1, y)) { const bid = world.get(x + 1, y); if (bid === 0) { world.set(x + 1, y, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } else if (bid === 150) { world.set(x + 1, y, 6); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } }
        world.wakeArea(x, y); return;
      }
      if (nid === 2 && Math.random() < 0.03) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if ((nid === 46 || nid === 66) && Math.random() < 0.001) { world.set(x, y, 22); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 6 || nid === 28) && Math.random() < 0.2) {
        world.set(x, y, 6);
        if (world.inBounds(x, y - 1)) { const bid = world.get(x, y - 1); if (bid === 0) { world.set(x, y - 1, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } else if (bid === 150) { world.set(x, y - 1, 6); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } }
        if (world.inBounds(x, y + 1)) { const bid = world.get(x, y + 1); if (bid === 0) { world.set(x, y + 1, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } else if (bid === 150) { world.set(x, y + 1, 6); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } }
        if (world.inBounds(x - 1, y)) { const bid = world.get(x - 1, y); if (bid === 0) { world.set(x - 1, y, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } else if (bid === 150) { world.set(x - 1, y, 6); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } }
        if (world.inBounds(x + 1, y)) { const bid = world.get(x + 1, y); if (bid === 0) { world.set(x + 1, y, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } else if (bid === 150) { world.set(x + 1, y, 6); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } }
        world.wakeArea(x, y); return;
      }
      if (nid === 2 && Math.random() < 0.03) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if ((nid === 46 || nid === 66) && Math.random() < 0.001) { world.set(x, y, 22); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 6 || nid === 28) && Math.random() < 0.2) {
        world.set(x, y, 6);
        if (world.inBounds(x, y - 1)) { const bid = world.get(x, y - 1); if (bid === 0) { world.set(x, y - 1, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } else if (bid === 150) { world.set(x, y - 1, 6); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); } }
        if (world.inBounds(x, y + 1)) { const bid = world.get(x, y + 1); if (bid === 0) { world.set(x, y + 1, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } else if (bid === 150) { world.set(x, y + 1, 6); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); } }
        if (world.inBounds(x - 1, y)) { const bid = world.get(x - 1, y); if (bid === 0) { world.set(x - 1, y, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } else if (bid === 150) { world.set(x - 1, y, 6); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); } }
        if (world.inBounds(x + 1, y)) { const bid = world.get(x + 1, y); if (bid === 0) { world.set(x + 1, y, Math.random() < 0.4 ? 6 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } else if (bid === 150) { world.set(x + 1, y, 6); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); } }
        world.wakeArea(x, y); return;
      }
      if (nid === 2 && Math.random() < 0.03) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if ((nid === 46 || nid === 66) && Math.random() < 0.001) { world.set(x, y, 22); world.wakeArea(x, y); return; }
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

registerMaterial(Niter);
