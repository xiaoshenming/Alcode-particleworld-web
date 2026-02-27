import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态氧 —— 极低温液化氧气
 * - 液体，低密度
 * - 温度>-183°蒸发为空气(0)
 * - 极强助燃：遇火(6)/火花(28)/熔岩(11)剧烈爆炸
 * - 遇木头(4)/油(5)/火药(22)使其更易燃
 * - 冷冻周围：降低邻居温度
 * - 视觉上呈淡蓝色透明液体
 */

export const LiquidOxygen: MaterialDef = {
  id: 139,
  name: '液态氧',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 淡蓝色
      r = 160 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 20);
      b = 235 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      // 浅蓝
      r = 175 + Math.floor(Math.random() * 15);
      g = 210 + Math.floor(Math.random() * 15);
      b = 240 + Math.floor(Math.random() * 10);
    } else {
      // 近白蓝
      r = 190 + Math.floor(Math.random() * 15);
      g = 220 + Math.floor(Math.random() * 15);
      b = 245 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温蒸发
    if (temp > -183 + 273) { // 约90K → 常温就会蒸发
      if (Math.random() < 0.08) {
        world.set(x, y, 0); // 蒸发
        world.wakeArea(x, y);
        return;
      }
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火/火花/熔岩 → 爆炸（产生火+烟）
      if ((nid === 6 || nid === 28 || nid === 11) && Math.random() < 0.3) {
        world.set(x, y, 6); // 火
        // 扩散爆炸
        for (const [ex, ey] of dirs) {
          const bx = x + ex, by = y + ey;
          if (world.inBounds(bx, by) && (world.isEmpty(bx, by) || world.get(bx, by) === 139)) {
            world.set(bx, by, Math.random() < 0.5 ? 6 : 7);
            world.markUpdated(bx, by);
            world.wakeArea(bx, by);
          }
        }
        world.wakeArea(x, y);
        return;
      }

      // 遇可燃物使其点燃（概率性）
      if ((nid === 4 || nid === 5 || nid === 22) && Math.random() < 0.01) {
        world.set(nx, ny, 6); // 点燃
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 冷冻邻居
      if (nid !== 0 && Math.random() < 0.1) {
        world.addTemp(nx, ny, -3);
      }
    }

    // 缓慢升温
    if (Math.random() < 0.05) {
      world.addTemp(x, y, 1);
    }

    // 液体流动
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

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

      if (Math.random() < 0.4) {
        for (const d of [dir, -dir]) {
          const sx = x + d;
          if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
            world.swap(x, y, sx, y);
            world.markUpdated(sx, y);
            world.wakeArea(sx, y);
            return;
          }
        }
      }
    }
  },
};

registerMaterial(LiquidOxygen);
