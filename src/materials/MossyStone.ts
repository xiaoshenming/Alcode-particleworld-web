import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 苔藓石 —— 长满苔藓的石头
 * - 固体，不可移动
 * - 石头(3)接触苔藓(49)后自然生成
 * - 潮湿环境（水/蒸汽附近）苔藓会扩散到相邻石头
 * - 高温(>200)烧掉苔藓变回石头(3)
 * - 酸液(9)腐蚀
 * - 遇种子(12)促进植物(13)生长
 * - 视觉上呈灰绿色石头纹理
 */

export const MossyStone: MaterialDef = {
  id: 110,
  name: '苔藓石',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 苔藓绿
      r = 70 + Math.floor(Math.random() * 25);
      g = 110 + Math.floor(Math.random() * 30);
      b = 55 + Math.floor(Math.random() * 20);
    } else if (t < 0.7) {
      // 灰绿色
      r = 95 + Math.floor(Math.random() * 20);
      g = 115 + Math.floor(Math.random() * 20);
      b = 85 + Math.floor(Math.random() * 15);
    } else if (t < 0.9) {
      // 石头灰底色
      r = 110 + Math.floor(Math.random() * 20);
      g = 110 + Math.floor(Math.random() * 15);
      b = 100 + Math.floor(Math.random() * 15);
    } else {
      // 深绿苔藓斑块
      r = 45 + Math.floor(Math.random() * 20);
      g = 85 + Math.floor(Math.random() * 25);
      b = 35 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温烧掉苔藓变回石头
    if (temp > 200) {
      world.set(x, y, 3); // 石头
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居（4方向显式展开，无HOF）
    let hasWater = false;
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.05) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid === 6 && Math.random() < 0.15) { world.set(x, y, 3); world.wakeArea(x, y); return; }
      if (nid === 11) { world.addTemp(x, y, 10); }
      if (nid === 2 || nid === 8 || nid === 97) { hasWater = true; }
      if (nid === 3 && hasWater && Math.random() < 0.002) { world.set(nx, ny, 110); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
      if (nid === 12 && Math.random() < 0.01) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 13); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 13); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 13); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 13); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); }
      }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.05) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid === 6 && Math.random() < 0.15) { world.set(x, y, 3); world.wakeArea(x, y); return; }
      if (nid === 11) { world.addTemp(x, y, 10); }
      if (nid === 2 || nid === 8 || nid === 97) { hasWater = true; }
      if (nid === 3 && hasWater && Math.random() < 0.002) { world.set(nx, ny, 110); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
      if (nid === 12 && Math.random() < 0.01) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 13); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 13); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 13); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 13); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); }
      }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.05) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid === 6 && Math.random() < 0.15) { world.set(x, y, 3); world.wakeArea(x, y); return; }
      if (nid === 11) { world.addTemp(x, y, 10); }
      if (nid === 2 || nid === 8 || nid === 97) { hasWater = true; }
      if (nid === 3 && hasWater && Math.random() < 0.002) { world.set(nx, ny, 110); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
      if (nid === 12 && Math.random() < 0.01) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 13); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 13); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 13); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 13); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); }
      }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.05) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (nid === 6 && Math.random() < 0.15) { world.set(x, y, 3); world.wakeArea(x, y); return; }
      if (nid === 11) { world.addTemp(x, y, 10); }
      if (nid === 2 || nid === 8 || nid === 97) { hasWater = true; }
      if (nid === 3 && hasWater && Math.random() < 0.002) { world.set(nx, ny, 110); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
      if (nid === 12 && Math.random() < 0.01) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 13); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 13); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 13); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 13); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); }
      }
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.04) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(MossyStone);
