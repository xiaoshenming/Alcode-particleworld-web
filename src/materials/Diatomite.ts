import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 硅藻土 —— 多孔轻质沉积物
 * - 粉末，受重力下落
 * - 极强吸水性：接触水(2)吸收变为泥浆(63)
 * - 吸收油(5)后变为焦油砂(74)
 * - 隔热性好：减缓热传导
 * - 遇火(6)不燃烧（耐火材料）
 * - 高温(>1200)烧结为玻璃(17)
 * - 视觉上呈灰白色轻质粉末
 */

export const Diatomite: MaterialDef = {
  id: 127,
  name: '硅藻土',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 灰白色
      r = 215 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 200 + Math.floor(Math.random() * 15);
    } else if (t < 0.7) {
      // 米白色
      r = 225 + Math.floor(Math.random() * 15);
      g = 215 + Math.floor(Math.random() * 15);
      b = 195 + Math.floor(Math.random() * 15);
    } else if (t < 0.9) {
      // 浅灰
      r = 200 + Math.floor(Math.random() * 15);
      g = 195 + Math.floor(Math.random() * 15);
      b = 185 + Math.floor(Math.random() * 15);
    } else {
      // 淡黄白
      r = 225 + Math.floor(Math.random() * 15);
      g = 220 + Math.floor(Math.random() * 10);
      b = 190 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.2,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温烧结为玻璃
    if (temp > 1200) {
      world.set(x, y, 17); // 玻璃
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 吸水变泥浆
      if (nid === 2 && Math.random() < 0.1) {
        world.set(nx, ny, 0);
        world.set(x, y, 63); // 泥浆
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 吸油变焦油砂
      if (nid === 5 && Math.random() < 0.08) {
        world.set(nx, ny, 0);
        world.set(x, y, 74); // 焦油砂
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 隔热：吸收邻居热量
      if (temp > 50 && Math.random() < 0.05) {
        world.addTemp(x, y, -2);
      }
    }

    // 粉末下落
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
    }
  },
};

registerMaterial(Diatomite);
