import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钆 —— 稀土金属，银白色
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>1312° → 液态钆(377)
 * - 磁性：低温下为铁磁性，接近磁铁(42)时产生火花
 * - 耐酸较弱
 */

export const Gadolinium: MaterialDef = {
  id: 376,
  name: '钆',
  category: '金属',
  description: '稀土金属，银白色，具有最高的热中子捕获截面，用于核反应堆和MRI造影剂',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白色
      r = 200 + Math.floor(Math.random() * 15);
      g = 202 + Math.floor(Math.random() * 15);
      b = 208 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 暗银
      r = 180 + Math.floor(Math.random() * 12);
      g = 182 + Math.floor(Math.random() * 12);
      b = 190 + Math.floor(Math.random() * 10);
    } else {
      // 亮银高光
      r = 215 + Math.floor(Math.random() * 18);
      g = 218 + Math.floor(Math.random() * 15);
      b = 225 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1312) {
      world.set(x, y, 377); // 液态钆
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if ((nid === 42 || nid === 230) && Math.random() < 0.02) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
      if (nid === 9 && Math.random() < 0.025) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.05) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.1; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if ((nid === 42 || nid === 230) && Math.random() < 0.02) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
      if (nid === 9 && Math.random() < 0.025) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.05) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.1; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 42 || nid === 230) && Math.random() < 0.02) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
      if (nid === 9 && Math.random() < 0.025) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.05) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.1; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 42 || nid === 230) && Math.random() < 0.02) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
      if (nid === 9 && Math.random() < 0.025) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.05) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.1; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
  },
};

registerMaterial(Gadolinium);
