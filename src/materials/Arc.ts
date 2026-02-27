import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 电弧 —— 高温等离子体放电
 * - 气体，极低密度，向上飘
 * - 短寿命：几帧后消失
 * - 极高温：点燃可燃物(木4/油5/火药22/氢气19)
 * - 熔化金属(10)为熔融金属(113)
 * - 与电线(44)交互产生更多电弧
 * - 视觉上呈亮白蓝色闪电效果
 */

export const Arc: MaterialDef = {
  id: 145,
  name: '电弧',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.3) {
      // 亮白
      r = 230 + Math.floor(Math.random() * 25);
      g = 235 + Math.floor(Math.random() * 20);
      b = 250;
    } else if (t < 0.6) {
      // 蓝白
      r = 180 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 25);
      b = 245 + Math.floor(Math.random() * 10);
    } else {
      // 紫蓝
      r = 160 + Math.floor(Math.random() * 30);
      g = 150 + Math.floor(Math.random() * 30);
      b = 240 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.05,
  update(x: number, y: number, world: WorldAPI) {
    // 短寿命
    if (Math.random() < 0.25) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 设置高温
    world.setTemp(x, y, 3000);

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 点燃可燃物
      if ((nid === 4 || nid === 5 || nid === 22 || nid === 19) && Math.random() < 0.3) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 熔化金属
      if (nid === 10 && Math.random() < 0.05) {
        world.set(nx, ny, 113); // 熔融金属
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 与电线交互产生更多电弧
      if (nid === 44 && Math.random() < 0.1) {
        // 在电线另一侧产生电弧
        const fx = nx + dx, fy = ny + dy;
        if (world.inBounds(fx, fy) && world.isEmpty(fx, fy)) {
          world.set(fx, fy, 145);
          world.markUpdated(fx, fy);
          world.wakeArea(fx, fy);
        }
      }

      // 加热邻居
      if (nid !== 0) {
        world.addTemp(nx, ny, 50);
      }
    }

    // 随机移动（闪电般跳跃）
    const moveDir = Math.floor(Math.random() * 4);
    const moves: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    const [mx, my] = moves[moveDir];
    const nx = x + mx, ny = y + my;
    if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
      world.swap(x, y, nx, ny);
      world.markUpdated(nx, ny);
      world.wakeArea(nx, ny);
    }
  },
};

registerMaterial(Arc);
