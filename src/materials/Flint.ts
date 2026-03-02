import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 燧石 —— 可打火的硅质岩石
 * - 固体，密度 Infinity（不可移动）
 * - 打火效果：与金属(10)/铁锈(72)碰撞时产生火花(28)
 * - 高硬度：耐酸腐蚀
 * - 高温(>1000°)碎裂为沙子(1)
 * - 深灰色带贝壳状断口光泽
 */

export const Flint: MaterialDef = {
  id: 254,
  name: '燧石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰色
      const base = 55 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.7) {
      // 暗褐灰
      r = 65 + Math.floor(Math.random() * 15);
      g = 55 + Math.floor(Math.random() * 12);
      b = 50 + Math.floor(Math.random() * 12);
    } else if (phase < 0.9) {
      // 中灰
      const base = 75 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 1;
      b = base + 3;
    } else {
      // 贝壳状断口光泽
      const base = 100 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 5;
      b = base + 10;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温碎裂
    if (temp > 1000) {
      world.set(x, y, 1); // 沙子
      world.setTemp(x, y, temp * 0.4);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 72 || nid === 85 || nid === 246) && Math.random() < 0.008) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
      }
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.005) { world.set(nx, ny, 7); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
      if (nid === 208 && Math.random() < 0.01) { world.set(x, y, 0); world.set(nx, ny, 7); world.markUpdated(nx, ny); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 72 || nid === 85 || nid === 246) && Math.random() < 0.008) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
      }
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.005) { world.set(nx, ny, 7); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
      if (nid === 208 && Math.random() < 0.01) { world.set(x, y, 0); world.set(nx, ny, 7); world.markUpdated(nx, ny); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 72 || nid === 85 || nid === 246) && Math.random() < 0.008) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
      }
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.005) { world.set(nx, ny, 7); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
      if (nid === 208 && Math.random() < 0.01) { world.set(x, y, 0); world.set(nx, ny, 7); world.markUpdated(nx, ny); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 72 || nid === 85 || nid === 246) && Math.random() < 0.008) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
      }
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.005) { world.set(nx, ny, 7); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
      if (nid === 208 && Math.random() < 0.01) { world.set(x, y, 0); world.set(nx, ny, 7); world.markUpdated(nx, ny); world.wakeArea(x, y); return; }
    }
  },
};

registerMaterial(Flint);
