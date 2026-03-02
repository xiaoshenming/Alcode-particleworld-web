import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 锡 —— 低熔点金属
 * - 固体，不受重力影响
 * - 低熔点（>230°）融化为液态锡（流动行为）
 * - 导热性中等
 * - 遇酸液缓慢腐蚀
 * - 可与铜(85)相邻形成合金效果（视觉变化）
 * - 视觉上呈银灰色带蓝调
 */

/** 液态锡的 ID 复用熔岩行为，但我们让它有独特的融化态 */
const MELTING_POINT = 230;

export const Tin: MaterialDef = {
  id: 86,
  name: '锡',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银灰色
      r = 175 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 偏蓝银色
      r = 160 + Math.floor(Math.random() * 15);
      g = 170 + Math.floor(Math.random() * 15);
      b = 195 + Math.floor(Math.random() * 20);
    } else {
      // 亮银高光
      r = 200 + Math.floor(Math.random() * 20);
      g = 205 + Math.floor(Math.random() * 15);
      b = 215 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固体不动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低熔点融化 → 变为熔岩（液态金属）
    if (temp > MELTING_POINT) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, MELTING_POINT);
      world.wakeArea(x, y);
      return;
    }

    // 导热：中等速率传热（4方向显式���开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nTemp = world.getTemp(x, y - 1); const diff = temp - nTemp;
      if (Math.abs(diff) > 1) { const transfer = diff * 0.15; world.addTemp(x, y - 1, transfer); world.addTemp(x, y, -transfer); }
    }
    if (world.inBounds(x, y + 1)) {
      const nTemp = world.getTemp(x, y + 1); const diff = temp - nTemp;
      if (Math.abs(diff) > 1) { const transfer = diff * 0.15; world.addTemp(x, y + 1, transfer); world.addTemp(x, y, -transfer); }
    }
    if (world.inBounds(x - 1, y)) {
      const nTemp = world.getTemp(x - 1, y); const diff = temp - nTemp;
      if (Math.abs(diff) > 1) { const transfer = diff * 0.15; world.addTemp(x - 1, y, transfer); world.addTemp(x, y, -transfer); }
    }
    if (world.inBounds(x + 1, y)) {
      const nTemp = world.getTemp(x + 1, y); const diff = temp - nTemp;
      if (Math.abs(diff) > 1) { const transfer = diff * 0.15; world.addTemp(x + 1, y, transfer); world.addTemp(x, y, -transfer); }
    }

    // 邻居交互（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.008) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 16 && Math.random() < 0.15) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 16); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); sparked = true; }
        if (!sparked && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 16); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); sparked = true; }
        if (!sparked && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 16); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
      }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.008) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 16 && Math.random() < 0.15) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 16); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); sparked = true; }
        if (!sparked && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 16); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); sparked = true; }
        if (!sparked && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 16); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
      }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.008) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 16 && Math.random() < 0.15) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 16); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); sparked = true; }
        if (!sparked && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 16); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); sparked = true; }
        if (!sparked && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 16); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
      }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.008) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 16 && Math.random() < 0.15) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 16); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); sparked = true; }
        if (!sparked && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 16); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); sparked = true; }
        if (!sparked && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 16); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); }
      }
    }
  },
};

registerMaterial(Tin);
