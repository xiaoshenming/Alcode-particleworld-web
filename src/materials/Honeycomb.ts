import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蜂巢 —— 蜜蜂建造的有机结构
 * - 固体，不可移动
 * - 蜂蜜(45)接触时有概率生成蜂巢
 * - 可燃，遇火(6)燃烧产生蜂蜜(45)和烟(7)
 * - 酸液(9)腐蚀
 * - 高温(>150)融化为蜂蜜(45)
 * - 视觉上呈金黄色蜂窝纹理
 */

export const Honeycomb: MaterialDef = {
  id: 107,
  name: '蜂巢',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 金黄色
      r = 210 + Math.floor(Math.random() * 30);
      g = 165 + Math.floor(Math.random() * 25);
      b = 30 + Math.floor(Math.random() * 20);
    } else if (t < 0.8) {
      // 深蜜色
      r = 185 + Math.floor(Math.random() * 25);
      g = 135 + Math.floor(Math.random() * 20);
      b = 20 + Math.floor(Math.random() * 15);
    } else if (t < 0.93) {
      // 蜂蜡浅色
      r = 230 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 20);
      b = 60 + Math.floor(Math.random() * 25);
    } else {
      // 暗色孔洞
      r = 120 + Math.floor(Math.random() * 20);
      g = 85 + Math.floor(Math.random() * 15);
      b = 10 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温融化为蜂蜜
    if (temp > 150) {
      world.set(x, y, 45); // 蜂蜜
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.08) { world.set(x, y, Math.random() < 0.6 ? 45 : 7); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.06) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid === 11) { world.addTemp(x, y, 12); }
      if (nid === 45 && Math.random() < 0.003) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 107); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 107); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 107); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 107); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); world.set(nx, ny, 0); world.wakeArea(nx, ny); }
        return;
      }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.08) { world.set(x, y, Math.random() < 0.6 ? 45 : 7); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.06) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid === 11) { world.addTemp(x, y, 12); }
      if (nid === 45 && Math.random() < 0.003) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 107); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 107); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 107); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 107); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); world.set(nx, ny, 0); world.wakeArea(nx, ny); }
        return;
      }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.08) { world.set(x, y, Math.random() < 0.6 ? 45 : 7); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.06) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid === 11) { world.addTemp(x, y, 12); }
      if (nid === 45 && Math.random() < 0.003) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 107); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 107); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 107); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 107); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); world.set(nx, ny, 0); world.wakeArea(nx, ny); }
        return;
      }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.08) { world.set(x, y, Math.random() < 0.6 ? 45 : 7); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.06) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid === 11) { world.addTemp(x, y, 12); }
      if (nid === 45 && Math.random() < 0.003) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 107); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 107); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 107); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); world.set(nx, ny, 0); world.wakeArea(nx, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 107); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); world.set(nx, ny, 0); world.wakeArea(nx, ny); }
        return;
      }
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.04) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Honeycomb);
