import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 彩虹液 —— 流动时不断变换颜色的神奇液体
 * - 液体，受重力影响，密度与水相近
 * - 颜色随时间/位置循环变化（彩虹色谱）
 * - 接触植物(13)/种子(12)促进生长
 * - 遇炼金石(30)转化为荧光液(80)
 * - 蒸发后产生彩色烟雾(7)
 */

export const RainbowLiquid: MaterialDef = {
  id: 104,
  name: '彩虹液',
  color() {
    // HSL 色相循环，产生彩虹效果
    const hue = (Date.now() / 10 + Math.random() * 60) % 360;
    const s = 0.85 + Math.random() * 0.15;
    const l = 0.5 + Math.random() * 0.15;

    // HSL → RGB 转换
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hh = hue / 60;
    const xx = c * (1 - Math.abs(hh % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (hh < 1) { r = c; g = xx; }
    else if (hh < 2) { r = xx; g = c; }
    else if (hh < 3) { g = c; b = xx; }
    else if (hh < 4) { g = xx; b = c; }
    else if (hh < 5) { r = xx; b = c; }
    else { r = c; b = xx; }

    const ri = Math.floor((r + m) * 255);
    const gi = Math.floor((g + m) * 255);
    const bi = Math.floor((b + m) * 255);
    return (0xFF << 24) | (bi << 16) | (gi << 8) | ri;
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温蒸发为烟
    if (temp > 100) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 低温冻结为水晶
    if (temp < -20) {
      world.set(x, y, 53); // 水晶
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (nid === 30 && Math.random() < 0.03) { world.set(x, y, 80); world.wakeArea(x, y); return; }
      if ((nid === 12 || nid === 13) && Math.random() < 0.02) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 13); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 13); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 13); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 13); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); }
        world.set(x, y, 0); world.wakeArea(x, y); return;
      }
      if (nid === 9 && Math.random() < 0.08) { world.set(x, y, 0); world.set(nx, ny, 0); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (nid === 30 && Math.random() < 0.03) { world.set(x, y, 80); world.wakeArea(x, y); return; }
      if ((nid === 12 || nid === 13) && Math.random() < 0.02) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 13); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 13); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 13); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 13); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); }
        world.set(x, y, 0); world.wakeArea(x, y); return;
      }
      if (nid === 9 && Math.random() < 0.08) { world.set(x, y, 0); world.set(nx, ny, 0); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 30 && Math.random() < 0.03) { world.set(x, y, 80); world.wakeArea(x, y); return; }
      if ((nid === 12 || nid === 13) && Math.random() < 0.02) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 13); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 13); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 13); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 13); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); }
        world.set(x, y, 0); world.wakeArea(x, y); return;
      }
      if (nid === 9 && Math.random() < 0.08) { world.set(x, y, 0); world.set(nx, ny, 0); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (nid === 30 && Math.random() < 0.03) { world.set(x, y, 80); world.wakeArea(x, y); return; }
      if ((nid === 12 || nid === 13) && Math.random() < 0.02) {
        let spawned = false;
        if (!spawned && world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) { world.set(nx, ny - 1, 13); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); spawned = true; }
        if (!spawned && world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1)) { world.set(nx, ny + 1, 13); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); spawned = true; }
        if (!spawned && world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny)) { world.set(nx - 1, ny, 13); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); spawned = true; }
        if (!spawned && world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny)) { world.set(nx + 1, ny, 13); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); }
        world.set(x, y, 0); world.wakeArea(x, y); return;
      }
      if (nid === 9 && Math.random() < 0.08) { world.set(x, y, 0); world.set(nx, ny, 0); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
    }

    // 液体流动：下落
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
      if (belowDensity < this.density && belowDensity > 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下流动
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

      // 水平扩散
            {
        const d = dir;
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          world.wakeArea(sx, y);
          return;
        }
      }
      {
        const d = -dir;
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          world.wakeArea(sx, y);
          return;
        }
      }
    }
  },
};

registerMaterial(RainbowLiquid);
