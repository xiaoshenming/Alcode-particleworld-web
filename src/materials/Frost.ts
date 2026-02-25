import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 霜 —— 附着在表面的薄冰层
 * - 固体，不受重力影响（附着在物体表面）
 * - 低温环境下自然扩散到相邻表面
 * - 温度>5° 融化为水
 * - 接触火/熔岩立即蒸发
 * - 接触水且温度<0° 时将水冻结为冰
 * - 视觉上呈白色半透明晶体
 */

/** 可附着霜的固体表面 */
const SURFACE = new Set([
  3, 4, 10, 17, 33, 34, 36, 60, 53, 64, 70, // 石头、木头、金属、玻璃、橡胶、水泥、混凝土、黑曜石、水晶、珊瑚、菌丝
]);

/** 热源（立即蒸发霜） */
const HOT_SOURCE = new Set([6, 11, 55]); // 火、熔岩、等离子体

export const Frost: MaterialDef = {
  id: 75,
  name: '霜',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number, a: number;
    if (phase < 0.5) {
      // 白色冰晶
      r = 220 + Math.floor(Math.random() * 30);
      g = 230 + Math.floor(Math.random() * 25);
      b = 245 + Math.floor(Math.random() * 10);
      a = 0xD0;
    } else if (phase < 0.8) {
      // 淡蓝色
      r = 200 + Math.floor(Math.random() * 25);
      g = 215 + Math.floor(Math.random() * 25);
      b = 240 + Math.floor(Math.random() * 15);
      a = 0xC0;
    } else {
      // 亮白高光
      r = 240 + Math.floor(Math.random() * 15);
      g = 245 + Math.floor(Math.random() * 10);
      b = 250 + Math.floor(Math.random() * 5);
      a = 0xE0;
    }
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 附着不动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 温度>5° 融化为水
    if (temp > 5) {
      world.set(x, y, 2); // 水
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    // 检查是否仍附着在表面（至少一个邻居是固体或霜）
    let attached = false;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) {
        attached = true; // 边界也算附着
        break;
      }
      const nid = world.get(nx, ny);
      if (SURFACE.has(nid) || nid === 75 || nid === 14) { // 固体、霜、冰
        attached = true;
        break;
      }
    }

    // 未附着则掉落为水
    if (!attached) {
      world.set(x, y, 2);
      world.wakeArea(x, y);
      return;
    }

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触热源蒸发
      if (HOT_SOURCE.has(nid)) {
        world.set(x, y, 8); // 蒸汽
        world.wakeArea(x, y);
        return;
      }

      // 接触水且低温 → 冻结水为冰
      if (nid === 2 && temp < 0 && Math.random() < 0.08) {
        world.set(nx, ny, 14); // 冰
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 低温扩散：在相邻空气处生成新霜（需要旁边有固体表面）
      if (nid === 0 && temp < -5 && Math.random() < 0.02) {
        // 检查该空气位置是否靠近固体
        let nearSurface = false;
        for (const [ddx, ddy] of dirs) {
          const nnx = nx + ddx, nny = ny + ddy;
          if (!world.inBounds(nnx, nny)) continue;
          const nnid = world.get(nnx, nny);
          if (SURFACE.has(nnid) || nnid === 14) {
            nearSurface = true;
            break;
          }
        }
        if (nearSurface) {
          world.set(nx, ny, 75);
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
        }
      }

      // 蒸汽在低温下凝结为霜
      if (nid === 8 && temp < -3 && Math.random() < 0.05) {
        world.set(nx, ny, 75);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 缓慢降温周围环境
    if (temp < 0) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.getTemp(nx, ny) > temp) {
          world.addTemp(nx, ny, -0.5);
        }
      }
    }
  },
};

registerMaterial(Frost);
