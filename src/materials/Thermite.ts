import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铝热剂 —— 极高温燃烧粉末
 * - 粉末固体，受重力影响（像沙子堆积）
 * - 未点燃时稳定，不自燃
 * - 遇火/熔岩/雷电点燃后极高温燃烧（>2000°）
 * - 燃烧产生熔岩和液态玻璃
 * - 可以熔穿金属、石头等高熔点材料
 * - 燃烧蔓延：点燃相邻铝热剂
 * - 遇水不灭（铝热剂水中也能燃烧）
 * - 视觉上呈深灰色带红褐色铁锈斑点
 */

export const Thermite: MaterialDef = {
  id: 94,
  name: '铝热剂',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰色（铝粉）
      r = 100 + Math.floor(Math.random() * 20);
      g = 100 + Math.floor(Math.random() * 20);
      b = 105 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 红褐色（铁锈）
      r = 140 + Math.floor(Math.random() * 30);
      g = 60 + Math.floor(Math.random() * 20);
      b = 30 + Math.floor(Math.random() * 15);
    } else {
      // 银灰高光
      r = 140 + Math.floor(Math.random() * 20);
      g = 140 + Math.floor(Math.random() * 20);
      b = 145 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温触发燃烧反应
    if (temp > 300) {
      // 铝热反应：产生极高温 + 熔融产物
      if (Math.random() < 0.12) {
        // 随机产生熔岩或液态玻璃
        if (Math.random() < 0.6) {
          world.set(x, y, 11); // 熔岩
          world.setTemp(x, y, 2000);
        } else {
          world.set(x, y, 92); // 液态玻璃
          world.setTemp(x, y, 1500);
        }
        world.wakeArea(x, y);
        // 向周围传递极高温（4方向显式展开，无HOF）
        if (world.inBounds(x, y - 1)) { world.addTemp(x, y - 1, 400); world.wakeArea(x, y - 1); }
        if (world.inBounds(x, y + 1)) { world.addTemp(x, y + 1, 400); world.wakeArea(x, y + 1); }
        if (world.inBounds(x - 1, y)) { world.addTemp(x - 1, y, 400); world.wakeArea(x - 1, y); }
        if (world.inBounds(x + 1, y)) { world.addTemp(x + 1, y, 400); world.wakeArea(x + 1, y); }
        return;
      }
      // 还没反应完，继续升温
      world.addTemp(x, y, 50);
    }

    // 邻居交互（4方向显式展开，无HOF，continue→else if）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.2) { world.setTemp(x, y, 500); world.wakeArea(x, y); }
      else if (nid === 11 && Math.random() < 0.3) { world.setTemp(x, y, 600); world.wakeArea(x, y); }
      else if (nid === 16 && Math.random() < 0.4) { world.setTemp(x, y, 800); world.wakeArea(x, y); }
      else if (nid === 55 && Math.random() < 0.5) { world.setTemp(x, y, 1000); world.wakeArea(x, y); }
      else if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.2) { world.setTemp(x, y, 500); world.wakeArea(x, y); }
      else if (nid === 11 && Math.random() < 0.3) { world.setTemp(x, y, 600); world.wakeArea(x, y); }
      else if (nid === 16 && Math.random() < 0.4) { world.setTemp(x, y, 800); world.wakeArea(x, y); }
      else if (nid === 55 && Math.random() < 0.5) { world.setTemp(x, y, 1000); world.wakeArea(x, y); }
      else if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.2) { world.setTemp(x, y, 500); world.wakeArea(x, y); }
      else if (nid === 11 && Math.random() < 0.3) { world.setTemp(x, y, 600); world.wakeArea(x, y); }
      else if (nid === 16 && Math.random() < 0.4) { world.setTemp(x, y, 800); world.wakeArea(x, y); }
      else if (nid === 55 && Math.random() < 0.5) { world.setTemp(x, y, 1000); world.wakeArea(x, y); }
      else if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 6 && Math.random() < 0.2) { world.setTemp(x, y, 500); world.wakeArea(x, y); }
      else if (nid === 11 && Math.random() < 0.3) { world.setTemp(x, y, 600); world.wakeArea(x, y); }
      else if (nid === 16 && Math.random() < 0.4) { world.setTemp(x, y, 800); world.wakeArea(x, y); }
      else if (nid === 55 && Math.random() < 0.5) { world.setTemp(x, y, 1000); world.wakeArea(x, y); }
      else if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }

    // 重力下落（粉末堆积）
    if (y + 1 < world.height) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 斜下滑落
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }

      // 密度置换（沉入轻液体）
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < 3.5 && belowDensity !== Infinity && Math.random() < 0.3) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        world.wakeArea(x, y + 1);
      }
    }
  },
};

registerMaterial(Thermite);
