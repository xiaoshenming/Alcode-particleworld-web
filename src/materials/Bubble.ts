import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 泡泡 —— 轻盈上浮的气泡
 * - 极低密度，持续上浮
 * - 碰到固体或边界时破裂消失
 * - 有限寿命，自然破裂
 * - 在水中上浮更快，出水后缓慢飘升
 * - 风力影响水平漂移
 * - 彩虹色薄膜效果
 * 使用 World 内置 age 替代 Map<number,number>（swap自动迁移age）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

/** 固体材质（碰到就破裂） */
const SOLID = new Set([3, 4, 10, 17, 33, 34, 36, 60]); // 石头、木头、金属、玻璃、橡胶、水泥、混凝土、黑曜石

/** 水系材质 */
const WATER_LIKE = new Set([2, 24]); // 水、盐水

export const Bubble: MaterialDef = {
  id: 73,
  name: '泡泡',
  color() {
    // 彩虹薄膜效果：随机偏色
    const hue = Math.random();
    let r: number, g: number, b: number;
    if (hue < 0.25) {
      r = 200 + Math.floor(Math.random() * 40);
      g = 220 + Math.floor(Math.random() * 30);
      b = 245 + Math.floor(Math.random() * 10);
    } else if (hue < 0.5) {
      r = 220 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 40);
      b = 240 + Math.floor(Math.random() * 15);
    } else if (hue < 0.75) {
      r = 240 + Math.floor(Math.random() * 15);
      g = 210 + Math.floor(Math.random() * 30);
      b = 220 + Math.floor(Math.random() * 30);
    } else {
      r = 230 + Math.floor(Math.random() * 25);
      g = 235 + Math.floor(Math.random() * 20);
      b = 250 + Math.floor(Math.random() * 5);
    }
    // 半透明
    return (0xA0 << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.05, // 极轻
  update(x: number, y: number, world: WorldAPI) {
    // 初始化寿命（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 60 + Math.floor(Math.random() * 140); // 60~200 帧
      world.setAge(x, y, life);
    }

    // 寿命递减
    life--;
    if (life <= 0) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }
    world.setAge(x, y, life);

    // 高温破裂
    if (world.getTemp(x, y) > 50) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居：碰到固体破裂
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (SOLID.has(nid)) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 到达顶部边界破裂
    if (y <= 0) {
      world.set(x, y, 0);
      return;
    }

    // 上浮（swap 自动迁移 age）
    const aboveId = world.get(x, y - 1);
    if (world.isEmpty(x, y - 1)) {
      // 空气中上浮（较慢，有概率）
      if (Math.random() < 0.6) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        return;
      }
    } else if (WATER_LIKE.has(aboveId)) {
      // 水中上浮（快速）
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 风力影响水平漂移
    const wind = world.getWind();
    const windStr = world.getWindStrength();
    let drift = 0;
    if (wind !== 0 && Math.random() < windStr * 0.5) {
      drift = wind;
    } else if (Math.random() < 0.15) {
      drift = Math.random() < 0.5 ? -1 : 1;
    }

    if (drift !== 0) {
      const nx = x + drift;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    // 斜上浮
    if (y > 0) {
      const d = Math.random() < 0.5 ? -1 : 1;
      for (const sd of [d, -d]) {
        const nx = x + sd;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          world.swap(x, y, nx, y - 1);
          world.markUpdated(nx, y - 1);
          return;
        }
      }
    }

    world.wakeArea(x, y);
  },
};

registerMaterial(Bubble);
