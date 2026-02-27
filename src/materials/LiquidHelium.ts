import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态氦 —— 超低温超流体
 * - 液体，极低密度（比氢气稍重）
 * - 持续降低周围温度
 * - 超流体特性：可以向上攀爬容器壁
 * - 遇常温物质快速蒸发为空气
 * - 遇水(2)瞬间冻结为冰(14)
 * - 遇熔岩(11)/火(6)立即蒸发
 * - 视觉上呈极淡的透明蓝色
 */

export const LiquidHelium: MaterialDef = {
  id: 108,
  name: '液态氦',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.6) {
      // 极淡蓝色
      r = 200 + Math.floor(Math.random() * 30);
      g = 220 + Math.floor(Math.random() * 25);
      b = 245 + Math.floor(Math.random() * 10);
    } else if (t < 0.85) {
      // 淡紫蓝
      r = 210 + Math.floor(Math.random() * 25);
      g = 210 + Math.floor(Math.random() * 20);
      b = 240 + Math.floor(Math.random() * 15);
    } else {
      // 近透明白
      r = 230 + Math.floor(Math.random() * 20);
      g = 235 + Math.floor(Math.random() * 15);
      b = 248 + Math.floor(Math.random() * 7);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.3,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 温度过高直接蒸发
    if (temp > 0) {
      if (Math.random() < 0.15) {
        world.set(x, y, 0); // 蒸发消失
        world.wakeArea(x, y);
        return;
      }
    }

    // 持续降温自身和周围
    world.setTemp(x, y, -270);
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      world.addTemp(nx, ny, -15);
      const nid = world.get(nx, ny);

      // 遇火/熔岩立即蒸发
      if ((nid === 6 || nid === 11) && Math.random() < 0.5) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 遇水冻结为冰
      if (nid === 2 && Math.random() < 0.3) {
        world.set(nx, ny, 14); // 冰
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 遇蒸汽冻结为雪
      if (nid === 8 && Math.random() < 0.4) {
        world.set(nx, ny, 15); // 雪
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 超流体特性：有概率向上移动（攀爬容器壁）
    if (world.inBounds(x, y - 1)) {
      const above = world.get(x, y - 1);
      if (above === 0) {
        // 检查是否靠近固体壁面
        const hasWallLeft = world.inBounds(x - 1, y) && world.getDensity(x - 1, y) === Infinity;
        const hasWallRight = world.inBounds(x + 1, y) && world.getDensity(x + 1, y) === Infinity;
        if ((hasWallLeft || hasWallRight) && Math.random() < 0.15) {
          world.swap(x, y, x, y - 1);
          world.markUpdated(x, y - 1);
          world.wakeArea(x, y - 1);
          return;
        }
      }
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
      for (const d of [dir, -dir]) {
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }

      // 水平扩散（超流体扩散更快）
      for (const d of [dir, -dir]) {
        for (let dist = 1; dist <= 2; dist++) {
          const sx = x + d * dist;
          if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
            world.swap(x, y, sx, y);
            world.markUpdated(sx, y);
            world.wakeArea(sx, y);
            return;
          }
          if (world.inBounds(sx, y) && !world.isEmpty(sx, y)) break;
        }
      }
    }
  },
};

registerMaterial(LiquidHelium);
