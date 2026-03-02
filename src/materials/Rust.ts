import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铁锈 —— 金属氧化产物
 * - 固体粉末，受重力影响缓慢下落（类似沙子但更慢）
 * - 接触金属+水/酸时，会将金属转化为铁锈（腐蚀扩散）
 * - 遇酸液被溶解
 * - 遇熔岩/极高温还原为金属
 * - 不可燃
 */

/** 液态催化剂（加速腐蚀） */
const CATALYST = new Set([2, 24, 9]); // 水、盐水、酸液

export const Rust: MaterialDef = {
  id: 72,
  name: '铁锈',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深铁锈红
      r = 140 + Math.floor(Math.random() * 25);
      g = 50 + Math.floor(Math.random() * 20);
      b = 20 + Math.floor(Math.random() * 15);
    } else if (phase < 0.75) {
      // 橙褐色
      r = 170 + Math.floor(Math.random() * 25);
      g = 75 + Math.floor(Math.random() * 25);
      b = 25 + Math.floor(Math.random() * 15);
    } else {
      // 暗褐色斑点
      r = 110 + Math.floor(Math.random() * 20);
      g = 45 + Math.floor(Math.random() * 15);
      b = 15 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温还原为金属
    if (temp > 400) {
      world.set(x, y, 10); // 金属
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居：腐蚀扩散（4方向显式展开，无HOF）
    let hasCatalyst = false;
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (CATALYST.has(nid)) hasCatalyst = true;
      if (nid === 9 && Math.random() < 0.1) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (CATALYST.has(nid)) hasCatalyst = true;
      if (nid === 9 && Math.random() < 0.1) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (CATALYST.has(nid)) hasCatalyst = true;
      if (nid === 9 && Math.random() < 0.1) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (CATALYST.has(nid)) hasCatalyst = true;
      if (nid === 9 && Math.random() < 0.1) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }

    // 有催化剂时腐蚀相邻金属（4方向显式展开，无HOF）
    if (hasCatalyst) {
      if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 10 && Math.random() < 0.03) { world.set(x, y - 1, 72); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); }
      if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 10 && Math.random() < 0.03) { world.set(x, y + 1, 72); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); }
      if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 10 && Math.random() < 0.03) { world.set(x - 1, y, 72); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); }
      if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 10 && Math.random() < 0.03) { world.set(x + 1, y, 72); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
    }

    // 无催化剂时也有极低概率腐蚀（空气中的水分）- transmuted布尔替代break
    if (!hasCatalyst && Math.random() < 0.003) {
      let found = false;
      if (!found && world.inBounds(x, y - 1) && world.get(x, y - 1) === 10) { world.set(x, y - 1, 72); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); found = true; }
      if (!found && world.inBounds(x, y + 1) && world.get(x, y + 1) === 10) { world.set(x, y + 1, 72); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); found = true; }
      if (!found && world.inBounds(x - 1, y) && world.get(x - 1, y) === 10) { world.set(x - 1, y, 72); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); found = true; }
      if (!found && world.inBounds(x + 1, y) && world.get(x + 1, y) === 10) { world.set(x + 1, y, 72); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
    }

    if (y >= world.height - 1) return;

    // 粉末下落（比沙子慢）
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 5 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下滑落
    if (Math.random() < 0.4) {
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(Rust);
