import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 明矾 —— 白色半透明晶体，固体不可移动
 * - 遇水(2)缓慢溶解（水变为盐水24）
 * - 净水作用：遇泥浆(63)/沼泽(54)使其变为水(2)
 * - 高温(>770°)分解为干沙(146)
 */
export const Alum: MaterialDef = {
  id: 196,
  name: '明矾',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number, a: number;
    if (phase < 0.6) {
      // 白色半透明
      r = 225 + Math.floor(Math.random() * 20);
      g = 225 + Math.floor(Math.random() * 20);
      b = 230 + Math.floor(Math.random() * 20);
      a = 0xD0;
    } else {
      // 略带淡紫色调的晶体面
      r = 215 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 235 + Math.floor(Math.random() * 15);
      a = 0xC8;
    }
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固体不可移动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温(>770°)分解为干沙
    if (temp > 770) {
      world.set(x, y, 146); // 干沙
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻（显式4方向，无HOF）
    // 水溶解：遇水→水变盐水，明矾有概率消失
    if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 2 && Math.random() < 0.03) {
      world.set(x, y - 1, 24); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1);
      if (Math.random() < 0.15) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 2 && Math.random() < 0.03) {
      world.set(x, y + 1, 24); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1);
      if (Math.random() < 0.15) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 2 && Math.random() < 0.03) {
      world.set(x - 1, y, 24); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y);
      if (Math.random() < 0.15) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 2 && Math.random() < 0.03) {
      world.set(x + 1, y, 24); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y);
      if (Math.random() < 0.15) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    // 净水：泥浆→水
    if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 63 && Math.random() < 0.05) { world.set(x, y - 1, 2); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); }
    if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 63 && Math.random() < 0.05) { world.set(x, y + 1, 2); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); }
    if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 63 && Math.random() < 0.05) { world.set(x - 1, y, 2); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); }
    if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 63 && Math.random() < 0.05) { world.set(x + 1, y, 2); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
    // 净水：沼泽→水
    if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 54 && Math.random() < 0.05) { world.set(x, y - 1, 2); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); }
    if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 54 && Math.random() < 0.05) { world.set(x, y + 1, 2); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); }
    if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 54 && Math.random() < 0.05) { world.set(x - 1, y, 2); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); }
    if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 54 && Math.random() < 0.05) { world.set(x + 1, y, 2); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
  },
};

registerMaterial(Alum);
