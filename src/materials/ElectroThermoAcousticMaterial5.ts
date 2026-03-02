import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电热声材料(5) —— 电-热-声三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 深青铜色调
 * - 电场同时产生热效应和声波
 * - 酸液溶解 0.0005，热传导 0.06/0.07
 */

export const ElectroThermoAcousticMaterial5: MaterialDef = {
  id: 1240,
  name: '电热声材料(5)',
  category: '固体',
  description: '电-热-声三场耦合材料,电场同时产生热效应和声波',
  density: Infinity,
  color() {
    const r = 146 + Math.floor(Math.random() * 20);
    const g = 118 + Math.floor(Math.random() * 20);
    const b = 92 + Math.floor(Math.random() * 22);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 检查邻居（第一轮：酸液溶解+热传导，4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.0005) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.0005) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.0005) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.0005) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }

    // 电场同时产生热效应和声波（4方向查找电线，transmuted布尔替代break）
    let foundWire = false;
    if (!foundWire && world.inBounds(x, y - 1) && world.get(x, y - 1) === 44 && Math.random() < 0.05) {
      world.addTemp(x, y, 25); world.wakeArea(x, y);
      let sparked = false;
      if (!sparked && world.inBounds(x, y - 1) && world.get(x, y - 1) === 0 && Math.random() < 0.1) { world.set(x, y - 1, 51); world.wakeArea(x, y - 1); sparked = true; }
      if (!sparked && world.inBounds(x, y + 1) && world.get(x, y + 1) === 0 && Math.random() < 0.1) { world.set(x, y + 1, 51); world.wakeArea(x, y + 1); sparked = true; }
      if (!sparked && world.inBounds(x - 1, y) && world.get(x - 1, y) === 0 && Math.random() < 0.1) { world.set(x - 1, y, 51); world.wakeArea(x - 1, y); sparked = true; }
      if (!sparked && world.inBounds(x + 1, y) && world.get(x + 1, y) === 0 && Math.random() < 0.1) { world.set(x + 1, y, 51); world.wakeArea(x + 1, y); }
      foundWire = true;
    }
    if (!foundWire && world.inBounds(x, y + 1) && world.get(x, y + 1) === 44 && Math.random() < 0.05) {
      world.addTemp(x, y, 25); world.wakeArea(x, y);
      let sparked = false;
      if (!sparked && world.inBounds(x, y - 1) && world.get(x, y - 1) === 0 && Math.random() < 0.1) { world.set(x, y - 1, 51); world.wakeArea(x, y - 1); sparked = true; }
      if (!sparked && world.inBounds(x, y + 1) && world.get(x, y + 1) === 0 && Math.random() < 0.1) { world.set(x, y + 1, 51); world.wakeArea(x, y + 1); sparked = true; }
      if (!sparked && world.inBounds(x - 1, y) && world.get(x - 1, y) === 0 && Math.random() < 0.1) { world.set(x - 1, y, 51); world.wakeArea(x - 1, y); sparked = true; }
      if (!sparked && world.inBounds(x + 1, y) && world.get(x + 1, y) === 0 && Math.random() < 0.1) { world.set(x + 1, y, 51); world.wakeArea(x + 1, y); }
      foundWire = true;
    }
    if (!foundWire && world.inBounds(x - 1, y) && world.get(x - 1, y) === 44 && Math.random() < 0.05) {
      world.addTemp(x, y, 25); world.wakeArea(x, y);
      let sparked = false;
      if (!sparked && world.inBounds(x, y - 1) && world.get(x, y - 1) === 0 && Math.random() < 0.1) { world.set(x, y - 1, 51); world.wakeArea(x, y - 1); sparked = true; }
      if (!sparked && world.inBounds(x, y + 1) && world.get(x, y + 1) === 0 && Math.random() < 0.1) { world.set(x, y + 1, 51); world.wakeArea(x, y + 1); sparked = true; }
      if (!sparked && world.inBounds(x - 1, y) && world.get(x - 1, y) === 0 && Math.random() < 0.1) { world.set(x - 1, y, 51); world.wakeArea(x - 1, y); sparked = true; }
      if (!sparked && world.inBounds(x + 1, y) && world.get(x + 1, y) === 0 && Math.random() < 0.1) { world.set(x + 1, y, 51); world.wakeArea(x + 1, y); }
      foundWire = true;
    }
    if (!foundWire && world.inBounds(x + 1, y) && world.get(x + 1, y) === 44 && Math.random() < 0.05) {
      world.addTemp(x, y, 25); world.wakeArea(x, y);
      let sparked = false;
      if (!sparked && world.inBounds(x, y - 1) && world.get(x, y - 1) === 0 && Math.random() < 0.1) { world.set(x, y - 1, 51); world.wakeArea(x, y - 1); sparked = true; }
      if (!sparked && world.inBounds(x, y + 1) && world.get(x, y + 1) === 0 && Math.random() < 0.1) { world.set(x, y + 1, 51); world.wakeArea(x, y + 1); sparked = true; }
      if (!sparked && world.inBounds(x - 1, y) && world.get(x - 1, y) === 0 && Math.random() < 0.1) { world.set(x - 1, y, 51); world.wakeArea(x - 1, y); sparked = true; }
      if (!sparked && world.inBounds(x + 1, y) && world.get(x + 1, y) === 0 && Math.random() < 0.1) { world.set(x + 1, y, 51); world.wakeArea(x + 1, y); }
    }
  },
};

registerMaterial(ElectroThermoAcousticMaterial5);
