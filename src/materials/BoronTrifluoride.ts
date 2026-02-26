import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 三氟化硼 —— 无色有毒气体，强路易斯酸
 * - 气体，密度 -0.3
 * - 遇水(2) → 产生酸液(9)
 * - 腐蚀金属：接触铁(169)/铜(85)/锡(86) → 锈(72)
 * - 高温(>600°) → 分解为烟(7)
 * - 无色微带刺激性
 */

export const BoronTrifluoride: MaterialDef = {
  id: 353,
  name: '三氟化硼',
  category: '气体',
  description: '无色有毒气体，强路易斯酸，遇水生成酸',
  density: -0.3,
  color() {
    const r = 200 + Math.floor(Math.random() * 30);
    const g = 210 + Math.floor(Math.random() * 25);
    const b = 215 + Math.floor(Math.random() * 25);
    const a = 25 + Math.floor(Math.random() * 15);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 600) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水生成酸
      if (nid === 2 && Math.random() < 0.1) {
        world.set(nx, ny, 9); // 酸液
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀金属
      if ((nid === 10 || nid === 85 || nid === 86) && Math.random() < 0.008) {
        world.set(nx, ny, 72); // 锈
        world.wakeArea(nx, ny);
      }
    }

    // 上升
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.6) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上
    const dir = Math.random() < 0.5 ? -1 : 1;
    if (y > 0) {
      const nx = x + dir;
      if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }

    // 水平扩散
    for (let d = 1; d <= 2; d++) {
      const nx = x + (Math.random() < 0.5 ? d : -d);
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    // 缓慢消散
    if (Math.random() < 0.001) {
      world.set(x, y, 0);
    }
  },
};

registerMaterial(BoronTrifluoride);
