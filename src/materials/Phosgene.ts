import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 光气（碳酰氯 COCl2）—— 剧毒窒息性气体
 * - 气体，密度 0.6（比空气重，下沉）
 * - 剧毒：杀灭所有生物材质
 * - 遇水缓慢分解为酸液(9)
 * - 遇高温(>300°)分解为一氧化碳(233)和氯气(238)
 * - 无色微绿（几乎不可见）
 */

/** 可被光气毒杀的生物 */
const TOXIC_TARGETS = new Set([40, 49, 52, 57, 70, 93, 100, 156, 225]); // 蚂蚁、苔藓、萤火虫、藤蔓、菌丝、孢子、蘑菇、水草、发光苔藓

export const Phosgene: MaterialDef = {
  id: 253,
  name: '光气',
  color() {
    const base = 200 + Math.floor(Math.random() * 35);
    const r = base - 10;
    const g = base + 5;
    const b = base - 5;
    const a = 0x40 + Math.floor(Math.random() * 0x25);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.6,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解为CO和Cl2
    if (temp > 300) {
      // 随机分解为一氧化碳或氯气
      world.set(x, y, Math.random() < 0.5 ? 233 : 238);
      world.wakeArea(x, y);
      return;
    }

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

      // 遇水分解为酸液
      if (nid === 2 && Math.random() < 0.04) {
        world.set(nx, ny, 9);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        world.set(x, y, 0);
        return;
      }

      // 剧毒：杀灭生物
      if (TOXIC_TARGETS.has(nid) && Math.random() < 0.08) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // === 气体运动（比空气重，下沉） ===
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.25) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
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

    // 偶尔上升
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.05) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(Phosgene);
