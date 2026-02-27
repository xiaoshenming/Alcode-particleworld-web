import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铜 —— 导电金属
 * - 固体，不受重力影响
 * - 可导电：接触电线(id=44)时传递电信号
 * - 遇水缓慢氧化生成铜绿（变为铁锈色）
 * - 遇酸液被腐蚀（比金属快）
 * - 高温（>1000°）融化为液态（变为熔岩行为）
 * - 导热性好，快速传热
 * - 视觉上呈橙铜色金属光泽
 */

export const Copper: MaterialDef = {
  id: 85,
  name: '铜',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 橙铜色
      r = 185 + Math.floor(Math.random() * 25);
      g = 115 + Math.floor(Math.random() * 20);
      b = 60 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 深铜色
      r = 160 + Math.floor(Math.random() * 20);
      g = 95 + Math.floor(Math.random() * 15);
      b = 45 + Math.floor(Math.random() * 15);
    } else {
      // 亮铜高光
      r = 210 + Math.floor(Math.random() * 25);
      g = 140 + Math.floor(Math.random() * 20);
      b = 75 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固体不动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温融化
    if (temp > 1000) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, 1000);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;

    // 导热：快速传热给邻居
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nTemp = world.getTemp(nx, ny);
      const diff = temp - nTemp;
      if (Math.abs(diff) > 1) {
        // 铜导热快，传递 30% 温差
        const transfer = diff * 0.3;
        world.addTemp(nx, ny, transfer);
        world.addTemp(x, y, -transfer);
      }
    }

    // 邻居交互
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水缓慢氧化（铜绿 → 用铁锈表示）
      if (nid === 2 && Math.random() < 0.001) {
        world.set(x, y, 72); // 铁锈
        world.wakeArea(x, y);
        return;
      }

      // 遇酸液腐蚀（比普通金属快）
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 导电：接触电线时传递信号（唤醒电线区域）
      if (nid === 44) {
        world.wakeArea(nx, ny);
      }

      // 接触雷电导电扩散
      if (nid === 16 && Math.random() < 0.3) {
        // 沿铜传导：找另一侧的邻居释放雷电
        for (const [ddx, ddy] of dirs) {
          const nnx = x + ddx, nny = y + ddy;
          if (nnx === nx && nny === ny) continue; // 跳过来源
          if (!world.inBounds(nnx, nny)) continue;
          if (world.isEmpty(nnx, nny)) {
            world.set(nnx, nny, 16); // 雷电
            world.markUpdated(nnx, nny);
            world.wakeArea(nnx, nny);
            break;
          }
        }
      }
    }
  },
};

registerMaterial(Copper);
