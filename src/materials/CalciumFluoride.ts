import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 氟化钙 —— 萤石的主要成分
 * - 气体，密度 0.3（上浮）
 * - 有毒，接触生物材质造成伤害
 * - 遇水部分溶解
 * - 高温 >1418° 分解为烟
 * - 淡白色半透明气体
 */

export const CalciumFluoride: MaterialDef = {
  id: 428,
  name: '氟化钙',
  category: '气体',
  description: '萤石成分的气态形式，微毒，遇水部分溶解',
  density: 0.3,
  color() {
    const a = 0xCC + Math.floor(Math.random() * 0x33);
    const r = 220 + Math.floor(Math.random() * 20);
    const g = 225 + Math.floor(Math.random() * 15);
    const b = 235 + Math.floor(Math.random() * 15);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 1418) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 遇水溶解
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 2 && Math.random() < 0.05) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀植物/木头
      if ((nid === 4 || nid === 13) && Math.random() < 0.02) {
        world.set(nx, ny, 0);
        world.wakeArea(nx, ny);
      }
    }

    // 上浮
    if (y > 0) {
      const above = world.get(x, y - 1);
      if (above === 0) {
        world.swap(x, y, x, y - 1);
        world.wakeArea(x, y - 1);
        return;
      }
    }

    // 随机漂移
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.get(x + dir, y) === 0) {
        world.swap(x, y, x + dir, y);
        world.wakeArea(x + dir, y);
        return;
      }
    }

    // 自然消散
    if (Math.random() < 0.002) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(CalciumFluoride);
