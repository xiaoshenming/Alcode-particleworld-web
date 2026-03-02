import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 镁 —— 极易燃的银白色金属粉末
 * - 固体粉末，密度 2.5，可下落堆积
 * - 极易燃：遇火(6)/火花(28)剧烈燃烧，产生极亮白光
 * - 燃烧温度极高：点燃后设置温度 3000+
 * - 遇水(2)也能燃烧（产生氢气19 + 火6）
 * - 遇酸(9)产生氢气(19)
 * - 银白色金属粉末
 */

/** 点火源 */
const IGNITION = new Set([6, 28]); // 火、火花

export const Magnesium: MaterialDef = {
  id: 185,
  name: '镁',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 银白色
      r = 200 + Math.floor(Math.random() * 25);
      g = 200 + Math.floor(Math.random() * 25);
      b = 210 + Math.floor(Math.random() * 25);
    } else if (t < 0.8) {
      // 亮银高光
      r = 220 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 20);
      b = 230 + Math.floor(Math.random() * 20);
    } else {
      // 略暗银灰
      r = 180 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温自燃（温度>500自动点燃）
    if (temp > 500) {
      // 剧烈燃烧：变为火，设置极高温度，周围产生火花
      world.set(x, y, 6); // 火
      world.setTemp(x, y, 3200);
      world.wakeArea(x, y);
      // 周围产生火花（极亮白光效果）
      // 4方向显式展开（上下左右，无HOF）
    if (world.inBounds(x, y - 1)) {
        const nx = x, ny = y - 1;
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny) && Math.random() < 0.5) {
          world.set(nx, ny, 28); // 火花
          world.setTemp(nx, ny, 3000);
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
        }
          }
    if (world.inBounds(x, y + 1)) {
        const nx = x, ny = y + 1;
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny) && Math.random() < 0.5) {
          world.set(nx, ny, 28); // 火花
          world.setTemp(nx, ny, 3000);
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
        }
          }
    if (world.inBounds(x - 1, y)) {
        const nx = x - 1, ny = y;
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny) && Math.random() < 0.5) {
          world.set(nx, ny, 28); // 火花
          world.setTemp(nx, ny, 3000);
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
        }
          }
    if (world.inBounds(x + 1, y)) {
        const nx = x + 1, ny = y;
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny) && Math.random() < 0.5) {
          world.set(nx, ny, 28); // 火花
          world.setTemp(nx, ny, 3000);
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
        }
          }
      return;
    }

    // 邻居交互（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (IGNITION.has(nid) && Math.random() < 0.6) {
        world.set(x, y, 6); world.setTemp(x, y, 3200); world.wakeArea(x, y);
        if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1) && Math.random() < 0.4) { world.set(x, y - 1, 28); world.setTemp(x, y - 1, 3000); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); }
        if (world.inBounds(x, y + 1) && world.isEmpty(x, y + 1) && Math.random() < 0.4) { world.set(x, y + 1, 28); world.setTemp(x, y + 1, 3000); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); }
        if (world.inBounds(x - 1, y) && world.isEmpty(x - 1, y) && Math.random() < 0.4) { world.set(x - 1, y, 28); world.setTemp(x - 1, y, 3000); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); }
        if (world.inBounds(x + 1, y) && world.isEmpty(x + 1, y) && Math.random() < 0.4) { world.set(x + 1, y, 28); world.setTemp(x + 1, y, 3000); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
        return;
      }
      if (nid === 2 && Math.random() < 0.08) { world.set(x, y, 6); world.set(nx, ny, 19); world.setTemp(x, y, 3000); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 9 && Math.random() < 0.06) { world.set(x, y, 0); world.set(nx, ny, 19); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (IGNITION.has(nid) && Math.random() < 0.6) {
        world.set(x, y, 6); world.setTemp(x, y, 3200); world.wakeArea(x, y);
        if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1) && Math.random() < 0.4) { world.set(x, y - 1, 28); world.setTemp(x, y - 1, 3000); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); }
        if (world.inBounds(x, y + 1) && world.isEmpty(x, y + 1) && Math.random() < 0.4) { world.set(x, y + 1, 28); world.setTemp(x, y + 1, 3000); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); }
        if (world.inBounds(x - 1, y) && world.isEmpty(x - 1, y) && Math.random() < 0.4) { world.set(x - 1, y, 28); world.setTemp(x - 1, y, 3000); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); }
        if (world.inBounds(x + 1, y) && world.isEmpty(x + 1, y) && Math.random() < 0.4) { world.set(x + 1, y, 28); world.setTemp(x + 1, y, 3000); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
        return;
      }
      if (nid === 2 && Math.random() < 0.08) { world.set(x, y, 6); world.set(nx, ny, 19); world.setTemp(x, y, 3000); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 9 && Math.random() < 0.06) { world.set(x, y, 0); world.set(nx, ny, 19); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (IGNITION.has(nid) && Math.random() < 0.6) {
        world.set(x, y, 6); world.setTemp(x, y, 3200); world.wakeArea(x, y);
        if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1) && Math.random() < 0.4) { world.set(x, y - 1, 28); world.setTemp(x, y - 1, 3000); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); }
        if (world.inBounds(x, y + 1) && world.isEmpty(x, y + 1) && Math.random() < 0.4) { world.set(x, y + 1, 28); world.setTemp(x, y + 1, 3000); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); }
        if (world.inBounds(x - 1, y) && world.isEmpty(x - 1, y) && Math.random() < 0.4) { world.set(x - 1, y, 28); world.setTemp(x - 1, y, 3000); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); }
        if (world.inBounds(x + 1, y) && world.isEmpty(x + 1, y) && Math.random() < 0.4) { world.set(x + 1, y, 28); world.setTemp(x + 1, y, 3000); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
        return;
      }
      if (nid === 2 && Math.random() < 0.08) { world.set(x, y, 6); world.set(nx, ny, 19); world.setTemp(x, y, 3000); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 9 && Math.random() < 0.06) { world.set(x, y, 0); world.set(nx, ny, 19); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (IGNITION.has(nid) && Math.random() < 0.6) {
        world.set(x, y, 6); world.setTemp(x, y, 3200); world.wakeArea(x, y);
        if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1) && Math.random() < 0.4) { world.set(x, y - 1, 28); world.setTemp(x, y - 1, 3000); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); }
        if (world.inBounds(x, y + 1) && world.isEmpty(x, y + 1) && Math.random() < 0.4) { world.set(x, y + 1, 28); world.setTemp(x, y + 1, 3000); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); }
        if (world.inBounds(x - 1, y) && world.isEmpty(x - 1, y) && Math.random() < 0.4) { world.set(x - 1, y, 28); world.setTemp(x - 1, y, 3000); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); }
        if (world.inBounds(x + 1, y) && world.isEmpty(x + 1, y) && Math.random() < 0.4) { world.set(x + 1, y, 28); world.setTemp(x + 1, y, 3000); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
        return;
      }
      if (nid === 2 && Math.random() < 0.08) { world.set(x, y, 6); world.set(nx, ny, 19); world.setTemp(x, y, 3000); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 9 && Math.random() < 0.06) { world.set(x, y, 0); world.set(nx, ny, 19); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
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
      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < this.density && Math.random() < 0.4) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下堆积
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

registerMaterial(Magnesium);
