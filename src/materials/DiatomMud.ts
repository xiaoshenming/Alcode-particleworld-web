import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 硅藻泥 —— 多孔吸附性建材
 * - 固体，密度 Infinity（不可移动）
 * - 吸附特性：接触毒气(18)、甲醛(218)、烟(7)时将其消除
 * - 吸水性：接触水变为湿润状态（颜色变深），但不溶解
 * - 耐火：>800° 才分解
 * - 米白色/浅灰色，多孔质感
 */

/** 可被吸附的气体 */
const ABSORBABLE = new Set([18, 218, 7, 8]); // 毒气、甲醛、烟、蒸汽

export const DiatomMud: MaterialDef = {
  id: 224,
  name: '硅藻泥',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 米白色
      r = 215 + Math.floor(Math.random() * 20);
      g = 205 + Math.floor(Math.random() * 20);
      b = 185 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 浅灰色
      r = 195 + Math.floor(Math.random() * 20);
      g = 190 + Math.floor(Math.random() * 20);
      b = 180 + Math.floor(Math.random() * 20);
    } else {
      // 多孔暗点
      r = 175 + Math.floor(Math.random() * 20);
      g = 168 + Math.floor(Math.random() * 20);
      b = 155 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 800) {
      world.set(x, y, 7); // 变烟
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻：吸附气体
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 吸附有害气体
      if (ABSORBABLE.has(nid) && Math.random() < 0.1) {
        world.set(nx, ny, 0); // 气体被吸附消除
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 遇酸缓慢腐蚀
      if ((nid === 9 || nid === 173) && Math.random() < 0.01) {
        world.set(x, y, 63); // 变泥浆
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(DiatomMud);
