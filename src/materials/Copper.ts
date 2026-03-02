import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铜 —— 导电金属
 * - 固体，不受重力影响
 * - 可导电：接触电线(id=44)时传递电信号
 * - 遇水缓慢氧化生成铜绿（变为铁锈色）
 * - 遇酸液被腐蚀（比金属快）
 * - 高温（>1000°）融化为液态（变为熔岩行为）
 * - 导热性好，快速传热
 * - 视觉上呈橙铜色金属光泽
 */

export const Copper: MaterialDef = {
  id: 85,
  name: '铜',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 橙铜色
      r = 185 + Math.floor(Math.random() * 25);
      g = 115 + Math.floor(Math.random() * 20);
      b = 60 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 深铜色
      r = 160 + Math.floor(Math.random() * 20);
      g = 95 + Math.floor(Math.random() * 15);
      b = 45 + Math.floor(Math.random() * 15);
    } else {
      // 亮铜高光
      r = 210 + Math.floor(Math.random() * 25);
      g = 140 + Math.floor(Math.random() * 20);
      b = 75 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固体不动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温融化
    if (temp > 1000) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, 1000);
      world.wakeArea(x, y);
      return;
    }

    // 导热：快速传热给邻居（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nTemp = world.getTemp(x, y - 1); const diff = temp - nTemp;
      if (Math.abs(diff) > 1) { const transfer = diff * 0.3; world.addTemp(x, y - 1, transfer); world.addTemp(x, y, -transfer); }
    }
    if (world.inBounds(x, y + 1)) {
      const nTemp = world.getTemp(x, y + 1); const diff = temp - nTemp;
      if (Math.abs(diff) > 1) { const transfer = diff * 0.3; world.addTemp(x, y + 1, transfer); world.addTemp(x, y, -transfer); }
    }
    if (world.inBounds(x - 1, y)) {
      const nTemp = world.getTemp(x - 1, y); const diff = temp - nTemp;
      if (Math.abs(diff) > 1) { const transfer = diff * 0.3; world.addTemp(x - 1, y, transfer); world.addTemp(x, y, -transfer); }
    }
    if (world.inBounds(x + 1, y)) {
      const nTemp = world.getTemp(x + 1, y); const diff = temp - nTemp;
      if (Math.abs(diff) > 1) { const transfer = diff * 0.3; world.addTemp(x + 1, y, transfer); world.addTemp(x, y, -transfer); }
    }

    // 邻居交互（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.001) { world.set(x, y, 72); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 44) { world.wakeArea(nx, ny); }
      if (nid === 16 && Math.random() < 0.3) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 16); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); sparked = true; }
        if (!sparked && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 16); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); sparked = true; }
        if (!sparked && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 16); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
      }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.001) { world.set(x, y, 72); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 44) { world.wakeArea(nx, ny); }
      if (nid === 16 && Math.random() < 0.3) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 16); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); sparked = true; }
        if (!sparked && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 16); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); sparked = true; }
        if (!sparked && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 16); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
      }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.001) { world.set(x, y, 72); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 44) { world.wakeArea(nx, ny); }
      if (nid === 16 && Math.random() < 0.3) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 16); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); sparked = true; }
        if (!sparked && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 16); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); sparked = true; }
        if (!sparked && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 16); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
      }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.001) { world.set(x, y, 72); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.set(nx, ny, 7); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 44) { world.wakeArea(nx, ny); }
      if (nid === 16 && Math.random() < 0.3) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 16); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); sparked = true; }
        if (!sparked && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 16); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); sparked = true; }
        if (!sparked && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 16); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); }
      }
    }
  },
};

registerMaterial(Copper);
