import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钬 —— 稀土金属，银白色带黄色光泽
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>1474° → 液态钬(387)
 * - 具有最强磁矩，接触磁铁(42)/电磁铁(230)产生火花
 * - 耐酸较弱（0.02）
 * - 导热
 */

export const Holmium: MaterialDef = {
  id: 386,
  name: '钬',
  category: '金属',
  description: '稀土金属，具有最强的磁矩，银白色带黄色光泽，用于磁极和激光',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白带黄
      r = 210 + Math.floor(Math.random() * 15);
      g = 205 + Math.floor(Math.random() * 15);
      b = 185 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 暗银黄
      r = 190 + Math.floor(Math.random() * 12);
      g = 185 + Math.floor(Math.random() * 12);
      b = 165 + Math.floor(Math.random() * 10);
    } else {
      // 亮银黄高光
      r = 225 + Math.floor(Math.random() * 18);
      g = 220 + Math.floor(Math.random() * 15);
      b = 200 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1474) {
      world.set(x, y, 387); // 液态钬
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if ((nid === 42 || nid === 230) && Math.random() < 0.03) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.12; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if ((nid === 42 || nid === 230) && Math.random() < 0.03) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.12; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 42 || nid === 230) && Math.random() < 0.03) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.12; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 42 || nid === 230) && Math.random() < 0.03) {
        let spawned = false;
        if (!spawned && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); spawned = true; }
        if (!spawned && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); spawned = true; }
        if (!spawned && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); spawned = true; }
        if (!spawned && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.12; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
  },
};

registerMaterial(Holmium);
