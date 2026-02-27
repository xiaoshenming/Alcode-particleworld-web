import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 五氟化磷 —— 有毒无色气体
 * - 气体，密度 -0.5（向上飘）
 * - 遇水(2)剧烈反应 → 氟化氢(208) + 磷酸(159)
 * - 有毒：杀灭生物
 * - 腐蚀金属
 * - 无色微白
 */

/** 可被毒杀的生物 */
const TOXIC_TARGETS = new Set([40, 52, 49, 70, 93, 100, 156]); // 蚂蚁、萤火虫、苔藓、菌丝、孢子、蘑菇、水草

/** 可被腐蚀的金属 */
const CORRODE_TARGETS = new Set([10, 85, 86, 44]); // 金属、铜、锡、电线

export const PhosphorusPentafluoride: MaterialDef = {
  id: 363,
  name: '五氟化磷',
  category: '气体',
  description: '有毒气体，遇水剧烈反应生成氟化氢和磷酸',
  density: -0.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 近无色微白
      r = 220 + Math.floor(Math.random() * 20);
      g = 222 + Math.floor(Math.random() * 18);
      b = 225 + Math.floor(Math.random() * 15);
    } else {
      // 淡灰白
      r = 205 + Math.floor(Math.random() * 20);
      g = 208 + Math.floor(Math.random() * 18);
      b = 212 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    // 自然消散
    if (Math.random() < 0.003) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水剧烈反应 → 氟化氢(208) + 磷酸(159)
      if (nid === 2 && Math.random() < 0.15) {
        world.set(nx, ny, 208); // 氟化氢
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        world.set(x, y, 159); // 磷酸
        world.markUpdated(x, y);
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

    // === 气体运动（负密度，向上飘） ===
    // 上升
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.3) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 横向扩散
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 斜上扩散
    if (y > 0 && Math.random() < 0.15) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y - 1) && world.isEmpty(x + dir, y - 1)) {
        world.swap(x, y, x + dir, y - 1);
        world.markUpdated(x + dir, y - 1);
        return;
      }
    }
  },
};

registerMaterial(PhosphorusPentafluoride);
