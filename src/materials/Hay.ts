import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 干草 —— 干燥的植物纤维
 * - 粉末，受重力下落（轻质）
 * - 极易燃：遇火(6)/火花(28)/熔岩(11)立即点燃
 * - 燃烧快速，产生大量烟(7)
 * - 遇水(2)变为湿草（植物13）
 * - 受风力影响飘散
 * - 视觉上呈枯黄色
 */

export const Hay: MaterialDef = {
  id: 134,
  name: '干草',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 枯黄色
      r = 195 + Math.floor(Math.random() * 25);
      g = 170 + Math.floor(Math.random() * 20);
      b = 80 + Math.floor(Math.random() * 20);
    } else if (t < 0.7) {
      // 浅棕黄
      r = 185 + Math.floor(Math.random() * 20);
      g = 155 + Math.floor(Math.random() * 20);
      b = 70 + Math.floor(Math.random() * 15);
    } else if (t < 0.9) {
      // 淡黄
      r = 210 + Math.floor(Math.random() * 20);
      g = 185 + Math.floor(Math.random() * 20);
      b = 95 + Math.floor(Math.random() * 15);
    } else {
      // 深棕
      r = 160 + Math.floor(Math.random() * 20);
      g = 130 + Math.floor(Math.random() * 15);
      b = 60 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.6,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温自燃
    if (temp > 80) {
      world.set(x, y, 6); // 火
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极易燃
      if ((nid === 6 || nid === 28 || nid === 11) && Math.random() < 0.3) {
        world.set(x, y, 6); // 火
        world.wakeArea(x, y);
        return;
      }

      // 遇水变植物
      if (nid === 2 && Math.random() < 0.05) {
        world.set(x, y, 13); // 植物
        world.wakeArea(x, y);
        return;
      }
    }

    // 风力影响
    const wind = world.getWind();
    const windStr = world.getWindStrength();
    if (wind !== 0 && Math.random() < windStr * 0.3) {
      const nx = x + wind;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        world.wakeArea(nx, y);
        return;
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

registerMaterial(Hay);
