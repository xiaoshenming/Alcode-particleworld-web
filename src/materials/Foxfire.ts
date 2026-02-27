import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 磷火 —— 沼泽中自燃的鬼火
 * - 气体，缓慢漂浮
 * - 自发光，蓝绿色幽灵般的火焰
 * - 不点燃其他物质（冷焰）
 * - 遇风飘散，有限寿命
 * - 沼泽(54)/沼气(95)附近自然生成概率高
 * - 遇水(2)熄灭消失
 * - 视觉上呈蓝绿色幽灵火焰
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

export const Foxfire: MaterialDef = {
  id: 125,
  name: '磷火',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 蓝绿色
      r = 40 + Math.floor(Math.random() * 30);
      g = 180 + Math.floor(Math.random() * 40);
      b = 200 + Math.floor(Math.random() * 40);
    } else if (t < 0.7) {
      // 幽绿色
      r = 50 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 40);
      b = 150 + Math.floor(Math.random() * 40);
    } else if (t < 0.9) {
      // 淡蓝色
      r = 80 + Math.floor(Math.random() * 30);
      g = 160 + Math.floor(Math.random() * 30);
      b = 220 + Math.floor(Math.random() * 30);
    } else {
      // 白色核心
      r = 200 + Math.floor(Math.random() * 40);
      g = 230 + Math.floor(Math.random() * 20);
      b = 230 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.08,
  update(x: number, y: number, world: WorldAPI) {
    // 初始化寿命（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 40 + Math.floor(Math.random() * 60);
      world.setAge(x, y, life);
    }

    life--;

    // 寿命耗尽消散
    if (life <= 0) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水熄灭
      if ((nid === 2 || nid === 24) && Math.random() < 0.3) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 沼泽/沼气附近延长寿命
      if ((nid === 54 || nid === 95) && Math.random() < 0.1) {
        life += 5;
      }
    }

    // 风力影响（swap 自动迁移 age）
    const wind = world.getWind();
    const windStr = world.getWindStrength();
    if (wind !== 0 && Math.random() < windStr * 0.5) {
      const nx = x + wind;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.setAge(nx, y, life);
        world.markUpdated(nx, y);
        world.wakeArea(nx, y);
        return;
      }
    }

    // 缓慢上升漂浮（swap 自动迁移 age）
    const moveDir: [number, number][] = [];
    if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) moveDir.push([0, -1], [0, -1]);
    if (world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) moveDir.push([-1, 0]);
    if (world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) moveDir.push([1, 0]);
    if (world.inBounds(x - 1, y - 1) && world.isEmpty(x - 1, y - 1)) moveDir.push([-1, -1]);
    if (world.inBounds(x + 1, y - 1) && world.isEmpty(x + 1, y - 1)) moveDir.push([1, -1]);

    if (moveDir.length > 0 && Math.random() < 0.3) {
      const [mx, my] = moveDir[Math.floor(Math.random() * moveDir.length)];
      const nx = x + mx, ny = y + my;
      world.swap(x, y, nx, ny);
      world.setAge(nx, ny, life);
      world.markUpdated(nx, ny);
      world.wakeArea(nx, ny);
    } else {
      world.setAge(x, y, life);
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(Foxfire);
