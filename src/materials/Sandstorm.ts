import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 沙尘暴 —— 携带沙粒的狂风
 * - 气体类，向上飘浮并强烈横向移动
 * - 受风力影响方向
 * - 经过沙子/泥土时卷起粒子（将其变为沙尘暴）
 * - 一段时间后衰减，沉降为沙子
 * - 遮挡视线（视觉上呈浑浊黄褐色）
 * - 遇水被冲刷（变为泥浆）
 */

/** 可被卷起的材质 */
const LIFTABLE = new Set([1, 20, 21]); // 沙子、泥土、黏土

export const Sandstorm: MaterialDef = {
  id: 84,
  name: '沙尘暴',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 黄褐色
      r = 190 + Math.floor(Math.random() * 30);
      g = 160 + Math.floor(Math.random() * 25);
      b = 90 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 深土黄
      r = 170 + Math.floor(Math.random() * 25);
      g = 140 + Math.floor(Math.random() * 20);
      b = 70 + Math.floor(Math.random() * 20);
    } else {
      // 浅黄（高亮沙粒）
      r = 210 + Math.floor(Math.random() * 30);
      g = 190 + Math.floor(Math.random() * 25);
      b = 120 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.2, // 很轻，气体类
  update(x: number, y: number, world: WorldAPI) {
    // 自然衰减 → 沉降为沙子
    if (Math.random() < 0.008) {
      world.set(x, y, 1); // 沙子
      world.wakeArea(x, y);
      return;
    }

    const wind = world.getWind();
    const windStr = world.getWindStrength();

    // 邻居交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水变泥浆
      if (nid === 2) {
        world.set(x, y, 63); // 泥浆
        world.wakeArea(x, y);
        return;
      }

      // 卷起沙子/泥土
      if (LIFTABLE.has(nid) && Math.random() < 0.04) {
        world.set(nx, ny, 84); // 变为沙尘暴
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 向上飘浮
    if (y - 1 >= 0 && world.isEmpty(x, y - 1) && Math.random() < 0.4) {
      world.swap(x, y, x, y - 1);
      world.wakeArea(x, y);
      world.wakeArea(x, y - 1);
      return;
    }

    // 强烈横向移动（受风力影响）
    const baseDir = wind !== 0 ? wind : (Math.random() < 0.5 ? -1 : 1);
    const moveChance = 0.5 + windStr * 0.3;

    if (Math.random() < moveChance) {
      // 尝试移动 1~2 格
      const steps = Math.random() < windStr ? 2 : 1;
      for (let s = 1; s <= steps; s++) {
        const nx = x + baseDir * s;
        if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
          world.swap(x, y, nx, y);
          world.wakeArea(x, y);
          world.wakeArea(nx, y);
          return;
        }
      }
    }

    // 斜向移动
    if (Math.random() < 0.3) {
      const dir = wind !== 0 ? wind : (Math.random() < 0.5 ? -1 : 1);
      const ny = y + (Math.random() < 0.6 ? -1 : 1);
      const nx = x + dir;
      if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
        world.swap(x, y, nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 保持活跃
    world.wakeArea(x, y);
  },
};

registerMaterial(Sandstorm);
