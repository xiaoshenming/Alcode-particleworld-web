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

    // 邻居交互（4方向显式展开，无HOF）
    let hasMoisture = false;
    let hasSubstrate = false;
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (IGNITORS.has(nid)) { world.set(x, y, 6); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.1) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (MOISTURE.has(nid)) hasMoisture = true;
      if (SUBSTRATE.has(nid)) hasSubstrate = true;
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (IGNITORS.has(nid)) { world.set(x, y, 6); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.1) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (MOISTURE.has(nid)) hasMoisture = true;
      if (SUBSTRATE.has(nid)) hasSubstrate = true;
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (IGNITORS.has(nid)) { world.set(x, y, 6); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.1) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (MOISTURE.has(nid)) hasMoisture = true;
      if (SUBSTRATE.has(nid)) hasSubstrate = true;
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (IGNITORS.has(nid)) { world.set(x, y, 6); world.wakeArea(x, y); return; }
      if (nid === 9 && Math.random() < 0.1) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if (MOISTURE.has(nid)) hasMoisture = true;
      if (SUBSTRATE.has(nid)) hasSubstrate = true;
    }

    // 潮湿环境中生长（transmuted布尔模拟随机起始找空格）
    if (hasMoisture && Math.random() < 0.008) {
      let placed = false;
      if (!placed && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 100); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); return; }
      if (!placed && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 100); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); return; }
      if (!placed && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 100); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); return; }
      if (!placed && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 100); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); return; }
    }

    // 在基质旁也能缓慢生长（transmuted布尔模拟随机起始找空格）
    if (hasSubstrate && Math.random() < 0.003) {
      let placed2 = false;
      if (!placed2 && world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { world.set(x, y - 1, 100); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); return; }
      if (!placed2 && world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 100); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); return; }
      if (!placed2 && world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { world.set(x - 1, y, 100); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); return; }
      if (!placed2 && world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { world.set(x + 1, y, 100); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); return; }
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
