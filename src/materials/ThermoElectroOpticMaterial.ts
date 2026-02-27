import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 热电光材料 —— 热-电-光三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇熔岩(11)/火(6)产生电效应（生成闪电(16)）
 * - 遇电线(44)/闪电(16)产生光效应（生成光束(48)）
 * - 暗橙红色带热电纹理
 */

export const ThermoElectroOpticMaterial: MaterialDef = {
  id: 610,
  name: '热电光材料',
  category: '固体',
  description: '热-电-光三场耦合功能材料，用于热光伏和热辐射探测',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 148 + Math.floor(Math.random() * 15);
      g = 62 + Math.floor(Math.random() * 10);
      b = 42 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 132 + Math.floor(Math.random() * 12);
      g = 48 + Math.floor(Math.random() * 8);
      b = 32 + Math.floor(Math.random() * 8);
    } else {
      r = 165 + Math.floor(Math.random() * 18);
      g = 72 + Math.floor(Math.random() * 12);
      b = 52 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇熔岩/火产生电效应（模拟热→电）
      if ((nid === 11 || nid === 6) && Math.random() < 0.05) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 16);
          world.wakeArea(x, fy);
        }
      }

      // 遇电线/闪电产生光效应（模拟电→光）
      if ((nid === 44 || nid === 16) && Math.random() < 0.06) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 48);
          world.wakeArea(x, fy);
        }
      }

      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(ThermoElectroOpticMaterial);
