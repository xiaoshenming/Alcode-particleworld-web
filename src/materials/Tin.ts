import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 锡 —— 低熔点金属
 * - 固体，不受重力影响
 * - 低熔点（>230°）融化为液态锡（流动行为）
 * - 导热性中等
 * - 遇酸液缓慢腐蚀
 * - 可与铜(85)相邻形成合金效果（视觉变化）
 * - 视觉上呈银灰色带蓝调
 */

/** 液态锡的 ID 复用熔岩行为，但我们让它有独特的融化态 */
const MELTING_POINT = 230;

export const Tin: MaterialDef = {
  id: 86,
  name: '锡',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银灰色
      r = 175 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 偏蓝银色
      r = 160 + Math.floor(Math.random() * 15);
      g = 170 + Math.floor(Math.random() * 15);
      b = 195 + Math.floor(Math.random() * 20);
    } else {
      // 亮银高光
      r = 200 + Math.floor(Math.random() * 20);
      g = 205 + Math.floor(Math.random() * 15);
      b = 215 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固体不动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低熔点融化 → 变为熔岩（液态金属）
    if (temp > MELTING_POINT) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, MELTING_POINT);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    // 导热：中等速率传热
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nTemp = world.getTemp(nx, ny);
      const diff = temp - nTemp;
      if (Math.abs(diff) > 1) {
        const transfer = diff * 0.15;
        world.addTemp(nx, ny, transfer);
        world.addTemp(x, y, -transfer);
      }
    }

    // 邻居交互
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸液缓慢腐蚀
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 接触雷电可导电（比铜弱）
      if (nid === 16 && Math.random() < 0.15) {
        for (const [ddx, ddy] of dirs) {
          const nnx = x + ddx, nny = y + ddy;
          if (nnx === nx && nny === ny) continue;
          if (!world.inBounds(nnx, nny)) continue;
          if (world.isEmpty(nnx, nny)) {
            world.set(nnx, nny, 16);
            world.markUpdated(nnx, nny);
            world.wakeArea(nnx, nny);
            break;
          }
        }
      }
    }
  },
};

registerMaterial(Tin);
