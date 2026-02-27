import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 水银 —— 液态金属
 * - 极高密度，会沉到几乎所有液体底部
 * - 流动性好，类似水但更重
 * - 有毒：接触植物/种子/蚂蚁会杀死它们
 * - 导电：接触电线时传导电流（变成激光束闪烁）
 * - 低温凝固为金属，极高温蒸发为毒气
 * - 银白色金属光泽
 */

/** 会被水银毒杀的有机材质 */
const TOXIC_TO = new Set([12, 13, 40, 49]); // 种子、植物、蚂蚁、苔藓

export const Mercury: MaterialDef = {
  id: 56,
  name: '水银',
  color() {
    // 银白色金属光泽，带反光变化
    const base = 180 + Math.floor(Math.random() * 50);
    const r = base - 10 + Math.floor(Math.random() * 20);
    const g = base - 5 + Math.floor(Math.random() * 15);
    const b = base + Math.floor(Math.random() * 10);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 8.0, // 极重，比熔岩还重
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温蒸发为毒气
    if (temp > 200) {
      world.set(x, y, 18); // 毒气
      return;
    }

    // 低温凝固为金属
    if (temp < -30) {
      world.set(x, y, 10); // 金属
      return;
    }

    // 检查四邻交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 毒杀有机物
      if (TOXIC_TO.has(nid) && Math.random() < 0.1) {
        world.set(nx, ny, 0); // 消灭
        world.markUpdated(nx, ny);
      }

      // 导电：接触电线时在另一侧产生火花
      if (nid === 44 && Math.random() < 0.05) {
        // 在水银的另一侧释放火花
        const ox = x - dx, oy = y - dy;
        if (world.inBounds(ox, oy) && world.isEmpty(ox, oy)) {
          world.set(ox, oy, 28); // 火花
          world.markUpdated(ox, oy);
        }
      }
    }

    if (y >= world.height - 1) return;

    // 下落（流动性好）
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换：比下方轻的材质交换
    const belowId = world.get(x, y + 1);
    const belowDensity = world.getDensity(x, y + 1);
    if (belowId !== 0 && belowDensity < Mercury.density && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
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
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }
  },
};

registerMaterial(Mercury);
