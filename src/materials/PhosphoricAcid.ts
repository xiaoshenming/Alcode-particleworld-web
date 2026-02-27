import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 磷酸 —— 腐蚀性液体
 * - 液体，中等密度
 * - 腐蚀金属(10)/铜(85)/锡(86)产生铁锈(72)
 * - 比酸(9)温和，腐蚀速度慢
 * - 遇碱性物质（盐23/石灰124）中和消失
 * - 遇水(2)稀释消失
 * - 视觉上呈无色微黄液体
 */

export const PhosphoricAcid: MaterialDef = {
  id: 159,
  name: '磷酸',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 210 + Math.floor(Math.random() * 15);
      g = 215 + Math.floor(Math.random() * 15);
      b = 200 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      r = 220 + Math.floor(Math.random() * 10);
      g = 225 + Math.floor(Math.random() * 10);
      b = 210 + Math.floor(Math.random() * 10);
    } else {
      r = 200 + Math.floor(Math.random() * 15);
      g = 208 + Math.floor(Math.random() * 12);
      b = 195 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.3,
  update(x: number, y: number, world: WorldAPI) {
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 腐蚀金属
      if ((nid === 10 || nid === 85 || nid === 86) && Math.random() < 0.008) {
        world.set(nx, ny, 72); // 铁锈
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 遇碱中和
      if ((nid === 23 || nid === 124) && Math.random() < 0.03) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 遇水稀释
      if (nid === 2 && Math.random() < 0.01) {
        world.set(x, y, 2); // 变为水
        world.wakeArea(x, y);
        return;
      }
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

registerMaterial(PhosphoricAcid);
