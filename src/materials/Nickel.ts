import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 镍 —— 银白色耐腐蚀金属
 * - 固体，密度 Infinity（不可移动）
 * - 高温(>1455°)熔化为液态镍(217)
 * - 良好耐腐蚀性：仅硝酸缓慢腐蚀
 * - 磁性：可被磁铁(42)吸引（简化为邻近磁铁时不被破坏）
 * - 银白色带微黄色调
 */

export const Nickel: MaterialDef = {
  id: 216,
  name: '镍',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 银白色
      const base = 175 + Math.floor(Math.random() * 25);
      r = base + 3;
      g = base + 1;
      b = base;
    } else if (phase < 0.85) {
      // 微黄色调
      const base = 165 + Math.floor(Math.random() * 20);
      r = base + 10;
      g = base + 5;
      b = base - 5;
    } else {
      // 高光
      const base = 200 + Math.floor(Math.random() * 30);
      r = base + 2;
      g = base;
      b = base - 3;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1455) {
      world.set(x, y, 217); // 液态镍
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 仅硝酸缓慢腐蚀
      if (nid === 183 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 其他酸无效，酸自身消耗
      if ((nid === 9 || nid === 173 || nid === 159) && Math.random() < 0.006) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(Nickel);
