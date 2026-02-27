import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

const FLAMMABLE = new Set([4, 5, 13]);

/**
 * 雷电 —— 短寿命高能粒子
 * 使用 World 内置 age 系统替代 Map<string,number>
 */
export const Lightning: MaterialDef = {
  id: 16,
  name: '雷电',
  color() {
    const t = Math.random();
    const r = 200 + Math.floor(t * 55);
    const g = 200 + Math.floor(t * 55);
    const b = 255;
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.05,
  update(x: number, y: number, world: WorldAPI) {
    const age = world.getAge(x, y);

    // 生命耗尽：age>4 后以概率消失，模拟 4~7 帧随机寿命
    if (age > 4 && Math.random() < 0.33) {
      world.set(x, y, 0);
      return;
    }

    // 检查邻居并反应
    const nxs = [x, x - 1, x + 1, x - 1, x + 1];
    const nys = [y + 1, y, y, y + 1, y + 1];
    for (let d = 0; d < 5; d++) {
      const nx = nxs[d], ny = nys[d];
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid === 1) { world.set(nx, ny, 17); world.markUpdated(nx, ny); }
      if (FLAMMABLE.has(nid)) { world.set(nx, ny, 6); world.markUpdated(nx, ny); }
      if (nid === 2) { world.set(nx, ny, 8); world.markUpdated(nx, ny); }
      if (nid === 14) { world.set(nx, ny, 2); world.markUpdated(nx, ny); }
    }

    // 向下移动，带随机横向偏移（锯齿形闪电路径）
    if (y < world.height - 1) {
      const dx = Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0;
      const nx = x + dx;
      const ny = y + 1;
      if (world.inBounds(nx, ny)) {
        const targetId = world.get(nx, ny);
        if (targetId === 0) {
          world.swap(x, y, nx, ny);
          world.markUpdated(nx, ny);
        } else if (targetId === 1) {
          world.set(nx, ny, 17);
          world.swap(x, y, nx, ny);
          world.markUpdated(nx, ny);
        } else if (FLAMMABLE.has(targetId)) {
          world.set(nx, ny, 6);
          world.set(x, y, 0);
        } else if (targetId === 2) {
          world.set(nx, ny, 8);
          world.set(x, y, 0);
        } else {
          world.set(x, y, 0);
        }
      }
    } else {
      world.set(x, y, 0);
    }
  },
};

registerMaterial(Lightning);
