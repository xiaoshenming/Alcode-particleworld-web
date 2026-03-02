import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声磁热材料(4) —— 声-磁-热三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 声波同时产生磁效应和热效应
 * - 深褐紫色调
 */

export const AcoustoMagnetoThermalMaterial4: MaterialDef = {
  id: 1250,
  name: '声磁热材料(4)',
  category: '固体',
  description: '声-磁-热三场耦合材料，声波同时产生磁效应和热效应',
  density: Infinity,
  color() {
    const r = 138 + Math.floor(Math.random() * 20);
    const g = 112 + Math.floor(Math.random() * 20);
    const b = 128 + Math.floor(Math.random() * 22);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 检查邻居（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.0005) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.05) {
        if (Math.random() < 0.03) {
          let sparked = false;
          if (!sparked && world.inBounds(x, y - 1) && world.get(x, y - 1) === 0) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); sparked = true; }
          if (!sparked && world.inBounds(x, y + 1) && world.get(x, y + 1) === 0) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); sparked = true; }
          if (!sparked && world.inBounds(x - 1, y) && world.get(x - 1, y) === 0) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); sparked = true; }
          if (!sparked && world.inBounds(x + 1, y) && world.get(x + 1, y) === 0) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
        }
        if (Math.random() < 0.02) { world.addTemp(x, y, 5); world.wakeArea(x, y); }
      }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.0005) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.05) {
        if (Math.random() < 0.03) {
          let sparked = false;
          if (!sparked && world.inBounds(x, y - 1) && world.get(x, y - 1) === 0) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); sparked = true; }
          if (!sparked && world.inBounds(x, y + 1) && world.get(x, y + 1) === 0) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); sparked = true; }
          if (!sparked && world.inBounds(x - 1, y) && world.get(x - 1, y) === 0) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); sparked = true; }
          if (!sparked && world.inBounds(x + 1, y) && world.get(x + 1, y) === 0) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
        }
        if (Math.random() < 0.02) { world.addTemp(x, y, 5); world.wakeArea(x, y); }
      }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.0005) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.05) {
        if (Math.random() < 0.03) {
          let sparked = false;
          if (!sparked && world.inBounds(x, y - 1) && world.get(x, y - 1) === 0) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); sparked = true; }
          if (!sparked && world.inBounds(x, y + 1) && world.get(x, y + 1) === 0) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); sparked = true; }
          if (!sparked && world.inBounds(x - 1, y) && world.get(x - 1, y) === 0) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); sparked = true; }
          if (!sparked && world.inBounds(x + 1, y) && world.get(x + 1, y) === 0) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
        }
        if (Math.random() < 0.02) { world.addTemp(x, y, 5); world.wakeArea(x, y); }
      }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.0005) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid !== 0 && Math.random() < 0.05) {
        if (Math.random() < 0.03) {
          let sparked = false;
          if (!sparked && world.inBounds(x, y - 1) && world.get(x, y - 1) === 0) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); sparked = true; }
          if (!sparked && world.inBounds(x, y + 1) && world.get(x, y + 1) === 0) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); sparked = true; }
          if (!sparked && world.inBounds(x - 1, y) && world.get(x - 1, y) === 0) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); sparked = true; }
          if (!sparked && world.inBounds(x + 1, y) && world.get(x + 1, y) === 0) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
        }
        if (Math.random() < 0.02) { world.addTemp(x, y, 5); world.wakeArea(x, y); }
      }
      if (nid !== 0 && Math.random() < 0.06) { const nt = world.getTemp(nx, ny); if (Math.abs(temp - nt) > 5) { const diff = (nt - temp) * 0.07; world.addTemp(x, y, diff); world.addTemp(nx, ny, -diff); } }
    }
  },
};

registerMaterial(AcoustoMagnetoThermalMaterial4);
