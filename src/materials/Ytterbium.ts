import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 镱 —— 稀土金属，银白色偏暗
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>824° → 液态镱(382)
 * - 接触酸液(9)有概率被腐蚀
 * - 导热
 */

export const Ytterbium: MaterialDef = {
  id: 381,
  name: '镱',
  category: '金属',
  description: '稀土金属，银白色，质软，用于光纤通信和激光材料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白偏暗
      r = 185 + Math.floor(Math.random() * 15);
      g = 188 + Math.floor(Math.random() * 15);
      b = 195 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 暗银灰
      r = 165 + Math.floor(Math.random() * 12);
      g = 168 + Math.floor(Math.random() * 12);
      b = 178 + Math.floor(Math.random() * 10);
    } else {
      // 亮银高光
      r = 200 + Math.floor(Math.random() * 18);
      g = 204 + Math.floor(Math.random() * 15);
      b = 212 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 824) {
      world.set(x, y, 382); // 液态镱
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触酸液被腐蚀
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Ytterbium);
