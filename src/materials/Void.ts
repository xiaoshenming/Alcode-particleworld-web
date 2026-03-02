import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 虚空 —— 吞噬一切的黑洞
 * 不可移动，持续消灭周围接触到的任何材质
 * 只有虚空自身和克隆体不会被吞噬
 */

/** 不可吞噬的材质 */
const IMMUNE = new Set([0, 38]); // 空气、虚空自身

export const Void: MaterialDef = {
  id: 38,
  name: '虚空',
  color() {
    // 深黑色带微弱紫色光晕
    const t = Math.random();
    const r = Math.floor(5 + t * 15);
    const g = 0;
    const b = Math.floor(10 + t * 25);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    // 扫描周围 8 个方向，吞噬所有非免疫材质（8方向显式展开，无HOF）
    if (world.inBounds(x - 1, y - 1)) {
      const nx = x - 1, ny = y - 1;
      const nid = world.get(nx, ny);
      if (!IMMUNE.has(nid)) { world.set(nx, ny, 0); world.markUpdated(nx, ny); }
    }
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1;
      const nid = world.get(nx, ny);
      if (!IMMUNE.has(nid)) { world.set(nx, ny, 0); world.markUpdated(nx, ny); }
    }
    if (world.inBounds(x + 1, y - 1)) {
      const nx = x + 1, ny = y - 1;
      const nid = world.get(nx, ny);
      if (!IMMUNE.has(nid)) { world.set(nx, ny, 0); world.markUpdated(nx, ny); }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y;
      const nid = world.get(nx, ny);
      if (!IMMUNE.has(nid)) { world.set(nx, ny, 0); world.markUpdated(nx, ny); }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y;
      const nid = world.get(nx, ny);
      if (!IMMUNE.has(nid)) { world.set(nx, ny, 0); world.markUpdated(nx, ny); }
    }
    if (world.inBounds(x - 1, y + 1)) {
      const nx = x - 1, ny = y + 1;
      const nid = world.get(nx, ny);
      if (!IMMUNE.has(nid)) { world.set(nx, ny, 0); world.markUpdated(nx, ny); }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1;
      const nid = world.get(nx, ny);
      if (!IMMUNE.has(nid)) { world.set(nx, ny, 0); world.markUpdated(nx, ny); }
    }
    if (world.inBounds(x + 1, y + 1)) {
      const nx = x + 1, ny = y + 1;
      const nid = world.get(nx, ny);
      if (!IMMUNE.has(nid)) { world.set(nx, ny, 0); world.markUpdated(nx, ny); }
    }
  },
};

registerMaterial(Void);
