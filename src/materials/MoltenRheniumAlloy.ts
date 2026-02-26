import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铼合金 —— 铼合金的熔融态
 * - 液体，密度 12（极重液态金属）
 * - 冷却 <3100° → 凝固为铼合金(301)
 * - 极高温发光：橙白色
 * - 接触水(2)产生剧烈蒸汽爆炸
 */

export const MoltenRheniumAlloy: MaterialDef = {
  id: 302,
  name: '液态铼合金',
  category: '熔融金属',
  description: '铼合金的熔融态，极高温液态金属',
  density: 12,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 亮橙白
      r = 255;
      g = 210 + Math.floor(Math.random() * 30);
      b = 160 + Math.floor(Math.random() * 40);
    } else if (phase < 0.8) {
      // 白热
      r = 255;
      g = 240 + Math.floor(Math.random() * 15);
      b = 200 + Math.floor(Math.random() * 30);
    } else {
      // 橙红
      r = 255;
      g = 180 + Math.floor(Math.random() * 30);
      b = 100 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 3100) {
      world.set(x, y, 301);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 加热周围
    world.addTemp(x, y, -2);

    // 重力下落
    if (y < world.height - 1) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }

    // 邻居交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水产生蒸汽爆炸
      if (nid === 2) {
        world.set(nx, ny, 8); // 蒸汽
        world.setTemp(nx, ny, 200);
        world.wakeArea(nx, ny);
        // 周围也产生蒸汽
        if (Math.random() < 0.5) {
          world.addTemp(x, y, -100);
        }
      }

      // 加热邻居
      if (nid !== 0 && Math.random() < 0.15) {
        world.addTemp(nx, ny, 30);
      }
    }

    // 缓慢水平流动
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(MoltenRheniumAlloy);
