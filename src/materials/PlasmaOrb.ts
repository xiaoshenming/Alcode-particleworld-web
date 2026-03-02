import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 等离子球 —— 装饰性等离子放电球
 * - 固体，不可移动
 * - 持续向周围空位释放等离子体(55)
 * - 接触电线(44)加速释放
 * - 接触水(2)短路爆炸产生蒸汽(8)+火花(28)
 * - 高温(>800)过载爆炸
 * - 视觉上呈深紫色发光球体
 */

export const PlasmaOrb: MaterialDef = {
  id: 128,
  name: '等离子球',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 深紫色
      r = 120 + Math.floor(Math.random() * 30);
      g = 40 + Math.floor(Math.random() * 20);
      b = 180 + Math.floor(Math.random() * 40);
    } else if (t < 0.7) {
      // 亮紫色
      r = 160 + Math.floor(Math.random() * 30);
      g = 60 + Math.floor(Math.random() * 30);
      b = 210 + Math.floor(Math.random() * 30);
    } else if (t < 0.9) {
      // 粉紫色
      r = 180 + Math.floor(Math.random() * 30);
      g = 80 + Math.floor(Math.random() * 20);
      b = 200 + Math.floor(Math.random() * 30);
    } else {
      // 白色核心
      r = 220 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 30);
      b = 240 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 过载爆炸（8方向显式展开，无HOF）
    if (temp > 800) {
      world.set(x, y, 55); // 等离子体
      if (world.inBounds(x-1,y-1) && (world.isEmpty(x-1,y-1)||world.get(x-1,y-1)===7)) { world.set(x-1,y-1,Math.random()<0.5?55:28); world.markUpdated(x-1,y-1); world.wakeArea(x-1,y-1); }
      if (world.inBounds(x,y-1) && (world.isEmpty(x,y-1)||world.get(x,y-1)===7)) { world.set(x,y-1,Math.random()<0.5?55:28); world.markUpdated(x,y-1); world.wakeArea(x,y-1); }
      if (world.inBounds(x+1,y-1) && (world.isEmpty(x+1,y-1)||world.get(x+1,y-1)===7)) { world.set(x+1,y-1,Math.random()<0.5?55:28); world.markUpdated(x+1,y-1); world.wakeArea(x+1,y-1); }
      if (world.inBounds(x-1,y) && (world.isEmpty(x-1,y)||world.get(x-1,y)===7)) { world.set(x-1,y,Math.random()<0.5?55:28); world.markUpdated(x-1,y); world.wakeArea(x-1,y); }
      if (world.inBounds(x+1,y) && (world.isEmpty(x+1,y)||world.get(x+1,y)===7)) { world.set(x+1,y,Math.random()<0.5?55:28); world.markUpdated(x+1,y); world.wakeArea(x+1,y); }
      if (world.inBounds(x-1,y+1) && (world.isEmpty(x-1,y+1)||world.get(x-1,y+1)===7)) { world.set(x-1,y+1,Math.random()<0.5?55:28); world.markUpdated(x-1,y+1); world.wakeArea(x-1,y+1); }
      if (world.inBounds(x,y+1) && (world.isEmpty(x,y+1)||world.get(x,y+1)===7)) { world.set(x,y+1,Math.random()<0.5?55:28); world.markUpdated(x,y+1); world.wakeArea(x,y+1); }
      if (world.inBounds(x+1,y+1) && (world.isEmpty(x+1,y+1)||world.get(x+1,y+1)===7)) { world.set(x+1,y+1,Math.random()<0.5?55:28); world.markUpdated(x+1,y+1); world.wakeArea(x+1,y+1); }
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居（4方向显式展开，无HOF）
    let hasWire = false;
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.05) { world.set(x, y, 28); world.set(nx, ny, 8); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 44) hasWire = true;
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.05) { world.set(x, y, 28); world.set(nx, ny, 8); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 44) hasWire = true;
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.05) { world.set(x, y, 28); world.set(nx, ny, 8); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 44) hasWire = true;
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.05) { world.set(x, y, 28); world.set(nx, ny, 8); world.markUpdated(nx, ny); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 44) hasWire = true;
    }

    // 释放等离子体（transmuted布尔，无HOF）
    const rate = hasWire ? 0.12 : 0.04;
    let plasmaReleased = false;
    if (!plasmaReleased && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1) && Math.random() < rate) { world.set(x, y - 1, 55); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); plasmaReleased = true; }
    if (!plasmaReleased && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1) && Math.random() < rate) { world.set(x, y + 1, 55); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); plasmaReleased = true; }
    if (!plasmaReleased && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y) && Math.random() < rate) { world.set(x - 1, y, 55); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); plasmaReleased = true; }
    if (!plasmaReleased && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y) && Math.random() < rate) { world.set(x + 1, y, 55); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }

    world.wakeArea(x, y);
  },
};

registerMaterial(PlasmaOrb);
