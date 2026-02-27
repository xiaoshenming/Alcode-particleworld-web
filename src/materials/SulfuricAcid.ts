import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 硫酸 —— 强腐蚀性液体
 * - 液体，密度 3.0（比水重很多）
 * - 强腐蚀：溶解金属(10)/木头(4)/植物(13)/石头(3)，比普通酸(9)更强
 * - 遇水(2)剧烈放热反应（产生蒸汽，升温）
 * - 遇有机物(木4/植物13)碳化为木炭(46)
 * - 深黄色油状液体
 */

/** 可被硫酸腐蚀的材质（比普通酸范围更广） */
const CORRODIBLE = new Set([3, 4, 10, 13, 33, 34, 36, 49, 57, 172]); // 石头、木头、金属、植物、橡胶、水泥、混凝土、苔藓、藤蔓、干枯藤蔓

/** 有机物（碳化为木炭） */
const ORGANIC = new Set([4, 13, 49, 57, 172]); // 木头、植物、苔藓、藤蔓、干枯藤蔓

/** 硫酸免疫材质 */
const IMMUNE = new Set([0, 17, 32, 173]); // 空气、玻璃、钻石、硫酸自身

export const SulfuricAcid: MaterialDef = {
  id: 173,
  name: '硫酸',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深黄色油状
      r = 180 + Math.floor(Math.random() * 30);
      g = 150 + Math.floor(Math.random() * 25);
      b = 10 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 暗琥珀色
      r = 150 + Math.floor(Math.random() * 25);
      g = 120 + Math.floor(Math.random() * 20);
      b = 5 + Math.floor(Math.random() * 10);
    } else {
      // 浅黄高光
      r = 210 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 20);
      b = 20 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3.0,
  update(x: number, y: number, world: WorldAPI) {
    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (IMMUNE.has(nid)) continue;

      // 遇水：剧烈放热反应
      if (nid === 2 && Math.random() < 0.15) {
        world.set(nx, ny, 8); // 蒸汽
        world.addTemp(x, y, 50); // 大幅升温
        world.addTemp(nx, ny, 30);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        // 硫酸有概率被稀释消耗
        if (Math.random() < 0.3) {
          world.set(x, y, 0);
          return;
        }
        continue;
      }

      // 有机物碳化为木炭
      if (ORGANIC.has(nid) && Math.random() < 0.08) {
        world.set(nx, ny, 46); // 木炭
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 硫酸自身有概率消耗
        if (Math.random() < 0.4) {
          world.set(x, y, 7); // 烟
          world.wakeArea(x, y);
          return;
        }
        continue;
      }

      // 强腐蚀：溶解固体（比普通酸概率更高）
      if (CORRODIBLE.has(nid) && Math.random() < 0.06) {
        world.set(nx, ny, 0);
        world.wakeArea(nx, ny);
        if (Math.random() < 0.3) {
          world.set(x, y, 7); // 烟（自身消耗）
          world.wakeArea(x, y);
          return;
        }
        continue;
      }
    }

    // 重力下落
    if (y + 1 < world.height) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 密度置换（硫酸很重，沉入大部分液体下方）
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < SulfuricAcid.density && belowDensity < Infinity) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下流动
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
    }

    // 水平流动（油状，流动较慢）
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
      }
    }
  },
};

registerMaterial(SulfuricAcid);
