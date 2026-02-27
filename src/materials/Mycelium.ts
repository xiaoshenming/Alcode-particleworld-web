import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 菌丝 —— 在有机物上蔓延的真菌网络
 * - 固体，不可移动
 * - 在泥土、木头、植物、种子表面缓慢蔓延
 * - 潮湿环境（邻近水）加速生长
 * - 可燃：遇火燃烧
 * - 高温（>80°）死亡变为泥土
 * - 酸液可杀死
 * - 会缓慢分解木头（木头→泥土）
 * - 白色/灰白色丝状外观
 */

/** 菌丝可以蔓延到的基质（有机物表面的空气格） */
const SUBSTRATE = new Set([20, 4, 13, 12, 46, 49]); // 泥土、木头、植物、种子、木炭、苔藓

/** 可点燃菌丝的材质 */
const IGNITER = new Set([6, 11, 55, 28]); // 火、熔岩、等离子体、火花

export const Mycelium: MaterialDef = {
  id: 70,
  name: '菌丝',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 白色丝状
      r = 220 + Math.floor(Math.random() * 30);
      g = 215 + Math.floor(Math.random() * 30);
      b = 210 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      // 灰白色
      r = 190 + Math.floor(Math.random() * 25);
      g = 185 + Math.floor(Math.random() * 25);
      b = 180 + Math.floor(Math.random() * 20);
    } else {
      // 淡黄白（老化菌丝）
      r = 210 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 20);
      b = 170 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温死亡 → 泥土
    if (temp > 80) {
      world.set(x, y, 20); // 泥土
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居
    const dirs = [...DIRS4];
    let hasSubstrate = false;
    let hasWater = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火燃烧
      if (IGNITER.has(nid)) {
        world.set(x, y, 6); // 火
        world.wakeArea(x, y);
        return;
      }

      // 酸液杀死
      if (nid === 9) {
        world.set(x, y, 0);
        world.set(nx, ny, 0);
        world.wakeArea(x, y);
        return;
      }

      // 检测基质和水
      if (SUBSTRATE.has(nid)) hasSubstrate = true;
      if (nid === 2 || nid === 24 || nid === 54) hasWater = true; // 水、盐水、沼泽
    }

    // 没有基质则缓慢死亡
    if (!hasSubstrate && Math.random() < 0.01) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 分解木头：相邻木头缓慢变为泥土
    if (Math.random() < 0.002) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.get(nx, ny) === 4) { // 木头
          world.set(nx, ny, 20); // 泥土
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
          break;
        }
      }
    }

    // 蔓延生长
    let growChance = 0.004;
    if (hasWater) growChance = 0.012; // 潮湿加速
    if (temp < 10) growChance *= 0.3; // 低温减速

    if (hasSubstrate && Math.random() < growChance) {
      // 向相邻空气格蔓延（必须旁边有基质）
      const shuffled = dirs.sort(() => Math.random() - 0.5);
      for (const [dx, dy] of shuffled) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (!world.isEmpty(nx, ny)) continue;

        // 检查目标位置是否也邻近基质
        let targetHasSubstrate = false;
        for (const [ddx, ddy] of dirs) {
          const nnx = nx + ddx, nny = ny + ddy;
          if (!world.inBounds(nnx, nny)) continue;
          if (SUBSTRATE.has(world.get(nnx, nny))) {
            targetHasSubstrate = true;
            break;
          }
        }

        if (targetHasSubstrate) {
          world.set(nx, ny, 70);
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
          return;
        }
      }
    }
  },
};

registerMaterial(Mycelium);
