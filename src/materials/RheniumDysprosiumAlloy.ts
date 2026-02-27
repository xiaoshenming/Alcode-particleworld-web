import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铼镝合金 —— 铼与镝的高温磁性合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >4500° → 液态铼镝(1047)
 * - 耐酸腐蚀
 * - 银灰偏冷色调光泽
 */

export const RheniumDysprosiumAlloy: MaterialDef = {
  id: 1046,
  name: '铼镝合金',
  category: '固体',
  description: '铼与镝的合金，结合铼的超高熔点与镝的强磁性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 172 + Math.floor(Math.random() * 20);
      g = 178 + Math.floor(Math.random() * 20);
      b = 188 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 182 + Math.floor(Math.random() * 10);
      g = 188 + Math.floor(Math.random() * 10);
      b = 198 + Math.floor(Math.random() * 10);
    } else {
      r = 172 + Math.floor(Math.random() * 8);
      g = 178 + Math.floor(Math.random() * 8);
      b = 188 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 超高熔点：温度>4500时熔化为液态铼镝
    if (temp > 4500) {
      world.set(x, y, 1047);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 与酸液反应（极耐腐蚀，概率很低）
      if (nid === 9 && Math.random() < 0.0002) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 温度传导
      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.09;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(RheniumDysprosiumAlloy);
