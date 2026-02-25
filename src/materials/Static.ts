import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 静电 —— 摩擦产生的电荷积累
 * - 气体，快速消散
 * - 接触金属(10)/铜(85)/电线(44)传导并产生火花(28)
 * - 接触水(2)/盐水(24)立即消散
 * - 吸引轻质粒子（花粉114/纤维91/孢子93）
 * - 积累到一定密度时放电为雷电(16)
 * - 有限寿命，自然消散
 * - 视觉上呈淡蓝色闪烁
 */

let charges: Map<string, number> = new Map();

export const Static: MaterialDef = {
  id: 121,
  name: '静电',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 淡蓝白
      r = 180 + Math.floor(Math.random() * 40);
      g = 200 + Math.floor(Math.random() * 30);
      b = 240 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      // 电弧蓝
      r = 150 + Math.floor(Math.random() * 30);
      g = 180 + Math.floor(Math.random() * 30);
      b = 230 + Math.floor(Math.random() * 25);
    } else {
      // 白色闪光
      r = 230 + Math.floor(Math.random() * 25);
      g = 235 + Math.floor(Math.random() * 20);
      b = 250 + Math.floor(Math.random() * 5);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.05,
  update(x: number, y: number, world: WorldAPI) {
    const key = `${x},${y}`;
    if (!charges.has(key)) {
      charges.set(key, 15 + Math.floor(Math.random() * 20));
    }

    let life = charges.get(key)!;
    life--;

    // 寿命耗尽消散
    if (life <= 0) {
      charges.delete(key);
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    let neighborStatic = 0;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触导体产生火花
      if ((nid === 10 || nid === 85 || nid === 44) && Math.random() < 0.15) {
        charges.delete(key);
        world.set(x, y, 28); // 火花
        world.wakeArea(x, y);
        return;
      }

      // 接触水/盐水消散
      if ((nid === 2 || nid === 24) && Math.random() < 0.4) {
        charges.delete(key);
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 吸引轻质粒子
      if ((nid === 114 || nid === 91 || nid === 93) && Math.random() < 0.1) {
        world.swap(nx, ny, x, y);
        charges.delete(key);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 计数相邻静电
      if (nid === 121) neighborStatic++;
    }

    // 高密度放电为雷电
    if (neighborStatic >= 3 && Math.random() < 0.2) {
      charges.delete(key);
      world.set(x, y, 16); // 雷电
      world.wakeArea(x, y);
      return;
    }

    charges.delete(key);

    // 随机漂移
    const moveDir: [number, number][] = [];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
        moveDir.push([dx, dy]);
      }
    }

    if (moveDir.length > 0 && Math.random() < 0.3) {
      const [mx, my] = moveDir[Math.floor(Math.random() * moveDir.length)];
      const nx = x + mx, ny = y + my;
      world.swap(x, y, nx, ny);
      world.markUpdated(nx, ny);
      world.wakeArea(nx, ny);
      charges.set(`${nx},${ny}`, life);
    } else {
      charges.set(key, life);
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(Static);
