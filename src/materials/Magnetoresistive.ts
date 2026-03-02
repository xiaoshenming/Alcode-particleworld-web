import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁阻材料 —— 在磁场中改变电阻的特殊材料
 * - 固体，密度 Infinity（不可移动）
 * - 接近磁铁(42)/电磁铁(230)/钕(371)时改变颜色（模拟电阻变化）
 * - 接近电线(44)时传导并产生火花
 * - 高温 >1400° → 熔岩(11)
 * - 深灰蓝色基底
 */

const MAGNET_SOURCES = new Set([42, 230, 371]);

export const Magnetoresistive: MaterialDef = {
  id: 380,
  name: '磁阻材料',
  category: '特殊',
  description: '在磁场中改变电阻的功能材料，用于磁传感器和硬盘读写头',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰蓝
      r = 60 + Math.floor(Math.random() * 15);
      g = 70 + Math.floor(Math.random() * 15);
      b = 95 + Math.floor(Math.random() * 18);
    } else if (phase < 0.7) {
      // 暗蓝灰
      r = 50 + Math.floor(Math.random() * 12);
      g = 58 + Math.floor(Math.random() * 12);
      b = 80 + Math.floor(Math.random() * 15);
    } else {
      // 亮蓝灰高光
      r = 80 + Math.floor(Math.random() * 18);
      g = 90 + Math.floor(Math.random() * 18);
      b = 120 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1400) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检测附近磁源（7x7区域双层for，不是for...of）
    let nearMagnet = false;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (MAGNET_SOURCES.has(world.get(nx, ny))) {
          nearMagnet = true;
          break;
        }
      }
      if (nearMagnet) break;
    }

    if (nearMagnet) {
      // 受磁场影响：刷新颜色（模拟电阻变化）
      if (Math.random() < 0.2) {
        world.set(x, y, 380);
        world.wakeArea(x, y);
      }

      // 接近电线时产生火花（磁阻效应导电）4方向显式展开，无HOF
      if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 44 && Math.random() < 0.03) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); sparked = true; }
        if (!sparked && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); sparked = true; }
        if (!sparked && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); sparked = true; }
        if (!sparked && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
      if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 44 && Math.random() < 0.03) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); sparked = true; }
        if (!sparked && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); sparked = true; }
        if (!sparked && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); sparked = true; }
        if (!sparked && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
      if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 44 && Math.random() < 0.03) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); sparked = true; }
        if (!sparked && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); sparked = true; }
        if (!sparked && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); sparked = true; }
        if (!sparked && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
      if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 44 && Math.random() < 0.03) {
        let sparked = false;
        if (!sparked && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 28); world.wakeArea(x, y - 1); sparked = true; }
        if (!sparked && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 28); world.wakeArea(x, y + 1); sparked = true; }
        if (!sparked && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 28); world.wakeArea(x - 1, y); sparked = true; }
        if (!sparked && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 28); world.wakeArea(x + 1, y); }
      }
    }

    // 耐酸（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 9 && Math.random() < 0.006) { world.set(x, y, 0); world.set(x, y - 1, 7); world.wakeArea(x, y); return; }
    if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 9 && Math.random() < 0.006) { world.set(x, y, 0); world.set(x, y + 1, 7); world.wakeArea(x, y); return; }
    if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 9 && Math.random() < 0.006) { world.set(x, y, 0); world.set(x - 1, y, 7); world.wakeArea(x, y); return; }
    if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 9 && Math.random() < 0.006) { world.set(x, y, 0); world.set(x + 1, y, 7); world.wakeArea(x, y); return; }
  },
};

registerMaterial(Magnetoresistive);
