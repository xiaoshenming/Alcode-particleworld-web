import { DIRS4, DIRS8 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 白蚁 —— 啃食木材的生物
 * - 随机移动，优先向木头/植物方向移动
 * - 啃食木头、植物、藤蔓（转化为空气）
 * - 吃饱后有概率繁殖（生成新白蚁）
 * - 遇火/高温死亡
 * - 遇水淹死
 * - 视觉上呈浅棕色小点
 */

/** 可啃食的材质 */
const EDIBLE = new Set([4, 13, 57, 46]); // 木头、植物、藤蔓、木炭

export const Termite: MaterialDef = {
  id: 81,
  name: '白蚁',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 浅棕色身体
      r = 160 + Math.floor(Math.random() * 25);
      g = 120 + Math.floor(Math.random() * 20);
      b = 70 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 深棕色
      r = 130 + Math.floor(Math.random() * 20);
      g = 90 + Math.floor(Math.random() * 15);
      b = 50 + Math.floor(Math.random() * 15);
    } else {
      // 头部深色
      r = 100 + Math.floor(Math.random() * 15);
      g = 70 + Math.floor(Math.random() * 15);
      b = 40 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.2,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温死亡
    if (temp > 60) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居
    const dirs = DIRS4;
    const allDirs = DIRS8;

    // 遇水淹死
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 2) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 寻找食物并啃食
    for (const [dx, dy] of allDirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (EDIBLE.has(nid)) {
        // 啃食：食物变空气
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);

        // 吃饱后繁殖（低概率）
        if (Math.random() < 0.08) {
          // 找一个空位生成新白蚁
          for (const [ddx, ddy] of dirs) {
            const nnx = x + ddx, nny = y + ddy;
            if (world.inBounds(nnx, nny) && world.isEmpty(nnx, nny)) {
              world.set(nnx, nny, 81);
              world.markUpdated(nnx, nny);
              world.wakeArea(nnx, nny);
              break;
            }
          }
        }

        // 移动到食物位置
        world.swap(x, y, nx, ny);
        world.wakeArea(x, y);
        return;
      }
    }

    // 重力：下落
    if (y + 1 < world.height && world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.wakeArea(x, y);
      return;
    }

    // 随机移动（爬行）
    if (Math.random() < 0.4) {
      const shuffled = [...allDirs].sort(() => Math.random() - 0.5);
      for (const [dx, dy] of shuffled) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
          world.swap(x, y, nx, ny);
          world.wakeArea(x, y);
          world.wakeArea(nx, ny);
          return;
        }
      }
    }

    // 即使静止也保持活跃（生物）
    world.wakeArea(x, y);
  },
};

registerMaterial(Termite);
