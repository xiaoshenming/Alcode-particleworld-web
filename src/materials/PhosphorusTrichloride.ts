import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 三氯化磷 —— 有毒腐蚀性液体
 * - 液体，密度 1.57
 * - 接触水(2) → 剧烈反应生成酸液(9)+烟(7)
 * - 高温(>76°) → 蒸发为毒气(18)
 * - 腐蚀金属(10) → 概率生成铁锈(72)
 * - 无色至淡黄色液体
 */

export const PhosphorusTrichloride: MaterialDef = {
  id: 343,
  name: '三氯化磷',
  category: '化学',
  description: '有毒腐蚀性液体，遇水剧烈反应',
  density: 1.57,
  color() {
    const r = 210 + Math.floor(Math.random() * 30);
    const g = 215 + Math.floor(Math.random() * 25);
    const b = 170 + Math.floor(Math.random() * 30);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温蒸发为毒气
    if (temp > 76) {
      world.set(x, y, 18);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水剧烈反应
      if (nid === 2 && Math.random() < 0.3) {
        world.set(x, y, 9); // 酸液
        world.set(nx, ny, 7); // 烟
        world.addTemp(x, y, 30);
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀金属
      if (nid === 10 && Math.random() < 0.02) {
        world.set(nx, ny, 72); // 铁锈
        world.wakeArea(nx, ny);
      }
    }

    if (y >= world.height - 1) return;

    // 重力下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换（比水重）
    if (y < world.height - 1) {
      const belowId = world.get(x, y + 1);
      if (belowId === 2) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 水平流动
    for (let d = 1; d <= 3; d++) {
      const nx = x + (Math.random() < 0.5 ? d : -d);
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }
  },
};

registerMaterial(PhosphorusTrichloride);
