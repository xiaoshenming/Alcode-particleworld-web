import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蘑菇 —— 在潮湿环境生长的真菌
 * - 固体，不可移动
 * - 在水(2)/蒸馏水(97)/泥土(20)/泥浆(63)旁缓慢生长
 * - 孢子(93)落在泥土/泥浆上时生成蘑菇
 * - 成熟后释放孢子(93)
 * - 可燃：遇火/熔岩燃烧
 * - 酸液腐蚀
 * - 视觉上呈棕红色伞状
 */

/** 潮湿源 */
const MOISTURE = new Set([2, 97, 24, 45]); // 水、蒸馏水、盐水、蜂蜜

/** 可生长基质 */
const SUBSTRATE = new Set([20, 63, 4]); // 泥土、泥浆、木头

/** 点火源 */
const IGNITORS = new Set([6, 11, 28, 55]); // 火、熔岩、火花、等离子体

export const Mushroom: MaterialDef = {
  id: 100,
  name: '蘑菇',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 棕红色伞盖
      r = 160 + Math.floor(Math.random() * 40);
      g = 80 + Math.floor(Math.random() * 30);
      b = 50 + Math.floor(Math.random() * 20);
    } else if (t < 0.7) {
      // 浅棕色
      r = 180 + Math.floor(Math.random() * 30);
      g = 130 + Math.floor(Math.random() * 30);
      b = 80 + Math.floor(Math.random() * 20);
    } else if (t < 0.9) {
      // 白色菌柄
      r = 210 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 30);
      b = 190 + Math.floor(Math.random() * 20);
    } else {
      // 深棕色斑点
      r = 120 + Math.floor(Math.random() * 30);
      g = 60 + Math.floor(Math.random() * 20);
      b = 30 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温燃烧
    if (temp > 120) {
      world.set(x, y, 6); // 火
      world.wakeArea(x, y);
      return;
    }

    // 低温休眠（不生长不释放孢子）
    if (temp < 0) return;

    // 邻居交互
    const dirs = DIRS4;
    let hasMoisture = false;
    let hasSubstrate = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火燃烧
      if (IGNITORS.has(nid)) {
        world.set(x, y, 6); // 火
        world.wakeArea(x, y);
        return;
      }

      // 酸液腐蚀
      if (nid === 9 && Math.random() < 0.1) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      if (MOISTURE.has(nid)) hasMoisture = true;
      if (SUBSTRATE.has(nid)) hasSubstrate = true;
    }

    // 潮湿环境中生长
    if (hasMoisture && Math.random() < 0.008) {
      const start = Math.floor(Math.random() * dirs.length);
      for (let i = 0; i < dirs.length; i++) {
        const [dx, dy] = dirs[(start + i) % dirs.length];
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.isEmpty(nx, ny)) {
          world.set(nx, ny, 100); // 新蘑菇
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
          return;
        }
      }
    }

    // 在基质旁也能缓慢生长
    if (hasSubstrate && Math.random() < 0.003) {
      const start2 = Math.floor(Math.random() * dirs.length);
      for (let i = 0; i < dirs.length; i++) {
        const [dx, dy] = dirs[(start2 + i) % dirs.length];
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.isEmpty(nx, ny)) {
          world.set(nx, ny, 100);
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
          return;
        }
      }
    }

    // 成熟后释放孢子（向上方释放）
    if (Math.random() < 0.002) {
      if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 93); // 孢子
        world.markUpdated(x, y - 1);
        world.wakeArea(x, y - 1);
      }
    }
  },
};

registerMaterial(Mushroom);
