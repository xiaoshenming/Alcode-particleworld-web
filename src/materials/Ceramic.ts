import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 陶瓷 —— 烧制固体
 * - 固体，不受重力影响
 * - 耐高温（>1500°才融化）
 * - 耐酸（比金属强得多）
 * - 隔热性好（几乎不传热）
 * - 脆性：被爆炸/雷电击中会碎裂为沙子
 * - 由黏土(21)高温烧制而成
 * - 视觉上呈米白色带釉面光泽
 */

export const Ceramic: MaterialDef = {
  id: 90,
  name: '陶瓷',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 米白色
      r = 225 + Math.floor(Math.random() * 20);
      g = 215 + Math.floor(Math.random() * 15);
      b = 195 + Math.floor(Math.random() * 15);
    } else if (phase < 0.7) {
      // 淡棕色
      r = 210 + Math.floor(Math.random() * 15);
      g = 195 + Math.floor(Math.random() * 15);
      b = 170 + Math.floor(Math.random() * 15);
    } else {
      // 釉面高光
      r = 240 + Math.floor(Math.random() * 15);
      g = 235 + Math.floor(Math.random() * 10);
      b = 220 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温融化
    if (temp > 1500) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, 1500);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    // 隔热：极低传热率
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nTemp = world.getTemp(nx, ny);
      const diff = temp - nTemp;
      if (Math.abs(diff) > 5) {
        // 陶瓷隔热，仅传递 3% 温差
        const transfer = diff * 0.03;
        world.addTemp(nx, ny, transfer);
        world.addTemp(x, y, -transfer);
      }
    }

    // 邻居交互
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 雷电击碎（脆性）
      if (nid === 16 && Math.random() < 0.25) {
        world.set(x, y, 1); // 碎裂为沙子
        world.wakeArea(x, y);
        return;
      }

      // 耐酸（极低腐蚀率）
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 黏土在高温邻居旁烧制为陶瓷
      if (nid === 21 && temp > 200 && Math.random() < 0.02) {
        world.set(nx, ny, 90); // 黏土→陶瓷
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 等离子体/爆炸击碎
      if (nid === 55 && Math.random() < 0.3) {
        world.set(x, y, 1); // 碎裂为沙子
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Ceramic);
