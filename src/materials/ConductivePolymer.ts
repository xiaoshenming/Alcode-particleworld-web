import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 导电聚合物 —— 有机导电材料
 * - 固体，密度 Infinity（不可移动）
 * - 导电：接触电线(44)/闪电(16)时传递能量给邻居
 * - 可燃：高温(>200°)起火
 * - 酸可腐蚀
 * - 深蓝黑色带微光
 */

export const ConductivePolymer: MaterialDef = {
  id: 280,
  name: '导电聚合物',
  category: '特殊',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深蓝黑
      r = 20 + Math.floor(Math.random() * 15);
      g = 25 + Math.floor(Math.random() * 15);
      b = 45 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗蓝
      r = 15 + Math.floor(Math.random() * 10);
      g = 20 + Math.floor(Math.random() * 12);
      b = 55 + Math.floor(Math.random() * 25);
    } else {
      // 微光高亮
      r = 40 + Math.floor(Math.random() * 20);
      g = 50 + Math.floor(Math.random() * 20);
      b = 80 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 可燃：高温起火
    if (temp > 200) {
      world.set(x, y, 6); // 火
      world.wakeArea(x, y);
      return;
    }

    let powered = false;

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 检测电源
      if (nid === 44 || nid === 16 || nid === 145) {
        powered = true;
      }

      // 酸腐蚀
      if (nid === 9 && Math.random() < 0.025) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸
      if ((nid === 173 || nid === 183) && Math.random() < 0.05) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }
    }

    // 通电时传递能量给邻居
    if (powered) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);

        // 唤醒邻近电线和导电材料
        if (nid === 44 || nid === 280) {
          world.wakeArea(nx, ny);
        }

        // 加热邻居（电阻热）
        if (nid !== 0 && Math.random() < 0.05) {
          world.addTemp(nx, ny, 1);
        }
      }

      // 通电闪光
      if (Math.random() < 0.2) {
        world.set(x, y, 280);
      }
    }

    // 低导热
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 8) {
          const diff = (nt - temp) * 0.04;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(ConductivePolymer);
