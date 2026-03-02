import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电磁弹性材料 —— 电磁场下变形的智能聚合物
 * - 轻质固体，密度 1.4（受重力下落）
 * - 接触电弧(145)/电线(44)时膨胀（向空位扩展）
 * - 接触火(6)时燃烧
 * - 接触水缓慢溶胀
 * - 深棕色带橙色光泽
 */

export const ElectromagneticElastomer: MaterialDef = {
  id: 420,
  name: '电磁弹性材料',
  category: '特殊',
  description: '电磁场下可变形的智能聚合物，接触电弧时膨胀扩展',
  density: 1.4,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深棕橙
      r = 140 + Math.floor(Math.random() * 20);
      g = 90 + Math.floor(Math.random() * 15);
      b = 55 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 暗棕
      r = 115 + Math.floor(Math.random() * 15);
      g = 72 + Math.floor(Math.random() * 12);
      b = 42 + Math.floor(Math.random() * 10);
    } else {
      // 亮橙光泽
      r = 175 + Math.floor(Math.random() * 18);
      g = 115 + Math.floor(Math.random() * 15);
      b = 65 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 检查邻居（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.06) { world.set(x, y, 6); world.wakeArea(x, y); return; }
      if ((nid === 145 || nid === 44) && Math.random() < 0.12) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 420); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 420); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 420); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 420); world.wakeArea(x + 1, y); }
        world.wakeArea(x, y); return;
      }
      if (nid === 2 && Math.random() < 0.02) { world.set(nx, ny, 420); world.wakeArea(nx, ny); return; }
      if (nid !== 0 && Math.random() < 0.04) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.06) { world.set(x, y, 6); world.wakeArea(x, y); return; }
      if ((nid === 145 || nid === 44) && Math.random() < 0.12) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 420); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 420); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 420); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 420); world.wakeArea(x + 1, y); }
        world.wakeArea(x, y); return;
      }
      if (nid === 2 && Math.random() < 0.02) { world.set(nx, ny, 420); world.wakeArea(nx, ny); return; }
      if (nid !== 0 && Math.random() < 0.04) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.06) { world.set(x, y, 6); world.wakeArea(x, y); return; }
      if ((nid === 145 || nid === 44) && Math.random() < 0.12) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 420); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 420); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 420); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 420); world.wakeArea(x + 1, y); }
        world.wakeArea(x, y); return;
      }
      if (nid === 2 && Math.random() < 0.02) { world.set(nx, ny, 420); world.wakeArea(nx, ny); return; }
      if (nid !== 0 && Math.random() < 0.04) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.06) { world.set(x, y, 6); world.wakeArea(x, y); return; }
      if ((nid === 145 || nid === 44) && Math.random() < 0.12) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 420); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 420); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 420); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 420); world.wakeArea(x + 1, y); }
        world.wakeArea(x, y); return;
      }
      if (nid === 2 && Math.random() < 0.02) { world.set(nx, ny, 420); world.wakeArea(nx, ny); return; }
      if (nid !== 0 && Math.random() < 0.04) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }

    // 高温分解
    if (temp > 250) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // === 轻固体运动（受重力下落） ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      const bDensity = world.getDensity(x, y + 1);
      if (bDensity !== Infinity && bDensity < 1.4) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 斜下滑落
    if (y < world.height - 1 && Math.random() < 0.4) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
        world.swap(x, y, x + dir, y + 1);
        world.markUpdated(x + dir, y + 1);
        return;
      }
    }
  },
};

registerMaterial(ElectromagneticElastomer);
