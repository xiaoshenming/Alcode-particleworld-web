import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氯气 —— 黄绿色有毒气体
 * - 气体，密度 0.55（比空气重，会下沉）
 * - 强氧化性：腐蚀金属(10)、铜(85)、锡(86)
 * - 剧毒：杀灭蚂蚁(40)、萤火虫(52)、苔藓(49)等生物
 * - 遇水生成酸液(9)
 * - 遇氨气(223)反应生成烟(白烟效果)
 * - 黄绿色
 */

/** 可被氯气腐蚀的金属 */
const CORRODE_TARGETS = new Set([10, 85, 86, 44]); // 金属、铜、锡、电线

/** 可被氯气毒杀的生物 */
const TOXIC_TARGETS = new Set([40, 52, 49, 70, 93, 100, 156]); // 蚂蚁、萤火虫、苔藓、菌丝、孢子、蘑菇、水草

export const Chlorine: MaterialDef = {
  id: 238,
  name: '氯气',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 黄绿色
      r = 140 + Math.floor(Math.random() * 30);
      g = 190 + Math.floor(Math.random() * 30);
      b = 50 + Math.floor(Math.random() * 25);
    } else {
      // 深黄绿
      r = 120 + Math.floor(Math.random() * 25);
      g = 170 + Math.floor(Math.random() * 25);
      b = 35 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.55,
  update(x: number, y: number, world: WorldAPI) {
    // 自然消散
    if (Math.random() < 0.004) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水生成酸液
      if (nid === 2 && Math.random() < 0.08) {
        world.set(nx, ny, 9); // 酸液
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        world.set(x, y, 0);
        return;
      }

      // 遇氨气反应生成白烟
      if (nid === 223 && Math.random() < 0.15) {
        world.set(nx, ny, 7); // 烟
        world.markUpdated(nx, ny);
        world.set(x, y, 7);
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀金属
      if (CORRODE_TARGETS.has(nid) && Math.random() < 0.02) {
        world.set(nx, ny, 72); // 铁锈
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        world.set(x, y, 0);
        return;
      }

      // 毒杀生物
      if (TOXIC_TARGETS.has(nid) && Math.random() < 0.06) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // === 气体运动（比空气重，倾向下沉） ===
    // 下沉
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.2) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 横向扩散（主要运动方式）
    if (Math.random() < 0.35) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 偶尔上升扩散
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.08) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(Chlorine);
