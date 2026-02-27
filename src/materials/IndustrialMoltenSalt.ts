import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 工业熔盐 —— 高温储热用液态盐混合物
 * - 液体，高密度
 * - 极高温(>400°)才保持液态
 * - 温度降到<300°凝固为岩盐(112)
 * - 储热能力极强，缓慢散热
 * - 遇水(2)剧烈反应产生蒸汽(8)
 * - 遇金属(10)/铜(85)传热加速
 * - 视觉上呈明亮橙黄色
 */

export const IndustrialMoltenSalt: MaterialDef = {
  id: 131,
  name: '工业熔盐',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 明亮橙黄
      r = 240 + Math.floor(Math.random() * 15);
      g = 180 + Math.floor(Math.random() * 30);
      b = 40 + Math.floor(Math.random() * 20);
    } else if (t < 0.7) {
      // 亮橙色
      r = 245 + Math.floor(Math.random() * 10);
      g = 160 + Math.floor(Math.random() * 25);
      b = 30 + Math.floor(Math.random() * 15);
    } else {
      // 黄白色高温
      r = 250 + Math.floor(Math.random() * 5);
      g = 210 + Math.floor(Math.random() * 25);
      b = 80 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 4.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 温度过低凝固
    if (temp < 300) {
      world.set(x, y, 112); // 岩盐
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水剧烈反应
      if (nid === 2 && Math.random() < 0.2) {
        world.set(nx, ny, 8); // 蒸汽
        world.addTemp(x, y, -30);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 遇金属/铜传热
      if ((nid === 10 || nid === 85) && Math.random() < 0.1) {
        world.addTemp(nx, ny, 15);
        world.addTemp(x, y, -5);
      }
    }

    // 缓慢散热
    if (Math.random() < 0.02) {
      world.addTemp(x, y, -1);
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

registerMaterial(IndustrialMoltenSalt);
