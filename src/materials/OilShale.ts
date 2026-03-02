import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 油页岩 —— 含有机质的沉积岩
 * - 固体，不可移动
 * - 高温(>350)热解释放油(5) + 烟(7)
 * - 遇火(6)缓慢燃烧，产生油(5)和烟(7)
 * - 遇熔岩(11)快速热解
 * - 遇酸液(9)缓慢腐蚀
 * - 视觉上呈深灰褐色层状纹理
 */

export const OilShale: MaterialDef = {
  id: 122,
  name: '油页岩',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 深灰褐色
      r = 85 + Math.floor(Math.random() * 20);
      g = 75 + Math.floor(Math.random() * 15);
      b = 60 + Math.floor(Math.random() * 15);
    } else if (t < 0.7) {
      // 暗褐色
      r = 100 + Math.floor(Math.random() * 20);
      g = 85 + Math.floor(Math.random() * 15);
      b = 65 + Math.floor(Math.random() * 15);
    } else if (t < 0.9) {
      // 灰色层
      r = 110 + Math.floor(Math.random() * 15);
      g = 105 + Math.floor(Math.random() * 15);
      b = 95 + Math.floor(Math.random() * 15);
    } else {
      // 油光斑点
      r = 70 + Math.floor(Math.random() * 15);
      g = 60 + Math.floor(Math.random() * 10);
      b = 45 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温热解
    if (temp > 350) {
      if (Math.random() < 0.05) {
        world.set(x, y, 1); // 残留沙子
        // 释放油到空位（3方向侧面，transmuted布尔替代break）
        let released = false;
        if (!released && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, Math.random() < 0.6 ? 5 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); released = true; }
        if (!released && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, Math.random() < 0.6 ? 5 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); released = true; }
        if (!released && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, Math.random() < 0.6 ? 5 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); }
        world.wakeArea(x, y);
        return;
      }
    }

    // 检查邻居（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.03) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
        world.addTemp(x, y, 5);
        if (Math.random() < 0.02) { world.set(x, y, 1); world.wakeArea(x, y); return; }
      }
      if (nid === 11 && Math.random() < 0.1) { world.set(x, y, 5); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.03) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
        world.addTemp(x, y, 5);
        if (Math.random() < 0.02) { world.set(x, y, 1); world.wakeArea(x, y); return; }
      }
      if (nid === 11 && Math.random() < 0.1) { world.set(x, y, 5); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.03) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
        world.addTemp(x, y, 5);
        if (Math.random() < 0.02) { world.set(x, y, 1); world.wakeArea(x, y); return; }
      }
      if (nid === 11 && Math.random() < 0.1) { world.set(x, y, 5); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.03) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, Math.random() < 0.5 ? 5 : 7); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
        world.addTemp(x, y, 5);
        if (Math.random() < 0.02) { world.set(x, y, 1); world.wakeArea(x, y); return; }
      }
      if (nid === 11 && Math.random() < 0.1) { world.set(x, y, 5); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.03) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(OilShale);
