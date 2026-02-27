import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 柔性电路 —— 可弯曲的电子电路材料
 * - 固体，密度 Infinity（不可移动）
 * - 导电：接触电线(44)传导电信号，唤醒邻居电线
 * - 接触激光(47)/光束(48) → 发光（设置高温+20）
 * - 高温(>400°) → 分解为烟(7)+火花(28)
 * - 接触水(2) → 短路产生火花(28)
 * - 铜绿色带金色线路纹理
 */

export const FlexCircuit: MaterialDef = {
  id: 315,
  name: '柔性电路',
  category: '特殊',
  description: '可弯曲的电子电路材料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 铜绿基板
      r = 30 + Math.floor(Math.random() * 15);
      g = 90 + Math.floor(Math.random() * 25);
      b = 60 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 金色线路
      r = 200 + Math.floor(Math.random() * 30);
      g = 170 + Math.floor(Math.random() * 25);
      b = 50 + Math.floor(Math.random() * 20);
    } else {
      // 暗绿
      r = 20 + Math.floor(Math.random() * 10);
      g = 65 + Math.floor(Math.random() * 15);
      b = 45 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 400) {
      if (Math.random() < 0.5) {
        world.set(x, y, 7); // 烟
      } else {
        world.set(x, y, 28); // 火花
      }
      world.wakeArea(x, y);
      return;
    }

    // 缓慢散热
    if (temp > 25) {
      world.addTemp(x, y, -0.3);
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 导电：传导电线信号
      if (nid === 44 && Math.random() < 0.3) {
        world.wakeArea(nx, ny);
        world.addTemp(x, y, 1);
      }

      // 光激发
      if ((nid === 47 || nid === 48) && Math.random() < 0.6) {
        world.addTemp(x, y, 20);
        world.wakeArea(x, y);
      }

      // 水短路
      if (nid === 2 && Math.random() < 0.1) {
        world.set(nx, ny, 28); // 火花
        world.setTemp(nx, ny, 150);
        world.addTemp(x, y, 30);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(FlexCircuit);
