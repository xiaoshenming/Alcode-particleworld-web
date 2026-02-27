import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钍 —— 弱放射性金属，可作核燃料
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>1750° → 液态钍(417)
 * - 自发热：每帧缓慢升温（放射性衰变）
 * - 耐酸中等（概率0.005）
 * - 良好导热
 * - 银白色微带暖色调
 */

export const Thorium: MaterialDef = {
  id: 416,
  name: '钍',
  category: '金属',
  description: '弱放射性金属，可作核燃料，自发缓慢升温',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白微暖
      r = 200 + Math.floor(Math.random() * 15);
      g = 195 + Math.floor(Math.random() * 12);
      b = 188 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 暗银
      r = 175 + Math.floor(Math.random() * 12);
      g = 170 + Math.floor(Math.random() * 10);
      b = 162 + Math.floor(Math.random() * 10);
    } else {
      // 亮银高光
      r = 222 + Math.floor(Math.random() * 12);
      g = 218 + Math.floor(Math.random() * 10);
      b = 210 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1750) {
      world.set(x, y, 417); // 液态钍
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 放射性自发热（缓慢升温）
    if (Math.random() < 0.15) {
      world.addTemp(x, y, 0.5);
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸中等
      if (nid === 9 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 良好导热
      if (nid !== 0 && Math.random() < 0.09) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.12;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Thorium);
