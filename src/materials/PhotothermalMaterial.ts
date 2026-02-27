import { DIRS4, DIRS_DIAG } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光热材料 —— 受光照升温的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 检测周围激光(47)/光束(48) → 升温发热
 * - 暗处缓慢冷却
 * - 高温时向周围传热，可点燃可燃物
 * - 过热(>1500°) → 熔化为熔岩(11)
 * - 深灰色，受热时偏红
 */

/** 可被点燃的材质 */
const FLAMMABLE = new Set([4, 5, 22, 25, 26, 46, 91, 134, 172]); // 木、油、火药、蜡、液蜡、木炭、纤维、干草、干藤

export const PhotothermalMaterial: MaterialDef = {
  id: 365,
  name: '光热材料',
  category: '特殊',
  description: '受光照升温发热的智能材料，暗处冷却',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深灰
      r = 95 + Math.floor(Math.random() * 18);
      g = 88 + Math.floor(Math.random() * 15);
      b = 82 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 暗灰
      r = 78 + Math.floor(Math.random() * 15);
      g = 72 + Math.floor(Math.random() * 12);
      b = 68 + Math.floor(Math.random() * 10);
    } else {
      // 微红高光（暗示吸光特性）
      r = 115 + Math.floor(Math.random() * 20);
      g = 90 + Math.floor(Math.random() * 12);
      b = 80 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 过热熔化
    if (temp > 1500) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    const diag = DIRS_DIAG;
    const allDirs = [...dirs, ...diag];
    let illuminated = false;

    // 检测周围是否有光源（激光47/光束48），扩大检测范围
    for (const [dx, dy] of allDirs) {
      for (let dist = 1; dist <= 3; dist++) {
        const nx = x + dx * dist, ny = y + dy * dist;
        if (!world.inBounds(nx, ny)) break;
        const nid = world.get(nx, ny);
        if (nid === 47 || nid === 48) {
          illuminated = true;
          break;
        }
        if (nid !== 0) break; // 被遮挡则停止
      }
      if (illuminated) break;
    }

    if (illuminated) {
      // 受光照升温
      world.addTemp(x, y, 20);
    } else {
      // 暗处冷却
      if (temp > 20) {
        world.addTemp(x, y, -0.8);
      }
    }

    // 高温时向周围传热 + 点燃可燃物
    if (temp > 80) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);

        // 传热
        if (nid !== 0) {
          const nt = world.getTemp(nx, ny);
          if (temp > nt + 5) {
            const diff = (temp - nt) * 0.15;
            world.addTemp(nx, ny, diff);
            world.addTemp(x, y, -diff * 0.3);
          }
        }

        // 高温点燃可燃物
        if (temp > 300 && FLAMMABLE.has(nid) && Math.random() < 0.05) {
          world.set(nx, ny, 6); // 火
          world.wakeArea(nx, ny);
        }
      }
    }

    // 耐酸中等
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(PhotothermalMaterial);
