import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 甘油 —— 无色透明粘稠液体
 * - 密度 2.0，粘稠流动（横向扩散概率 0.15）
 * - 遇硝酸(183)变为硝化甘油(109)（危险反应）
 * - 可燃但不易燃：遇火(6)缓慢燃烧（概率 0.02）
 * - 吸水：遇水(2)混合（水消失，甘油保留）
 */
export const Glycerin: MaterialDef = {
  id: 197,
  name: '甘油',
  color() {
    // 无色透明粘稠液体，略带光泽
    const r = 230 + Math.floor(Math.random() * 20);
    const g = 230 + Math.floor(Math.random() * 20);
    const b = 235 + Math.floor(Math.random() * 15);
    const a = 0xA0 + Math.floor(Math.random() * 0x20); // 半透明
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 超高温蒸发
    if (temp > 290) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻反应
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];

    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇硝酸(183) → 硝化甘油(109)！危险反应
      if (nid === 183 && Math.random() < 0.1) {
        world.set(x, y, 109);  // 甘油 → 硝化甘油
        world.set(nx, ny, 0);  // 硝酸消耗
        world.markUpdated(x, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇火(6)缓慢燃烧
      if (nid === 6 && Math.random() < 0.02) {
        world.set(x, y, 6); // 着火
        world.wakeArea(x, y);
        return;
      }

      // 吸水：遇水(2)混合，水消失
      if (nid === 2 && Math.random() < 0.08) {
        world.set(nx, ny, 0); // 水被吸收
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 粘稠流动：只有一定概率才移动（模拟高粘度）
    const moveChance = Math.min(0.5, 0.25 + (temp - 20) * 0.003);
    if (Math.random() > moveChance) {
      world.wakeArea(x, y); // 保持活跃
      return;
    }

    if (y >= world.height - 1) return;

    // 1. 直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 2. 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
        {
      const d = dir;
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
    {
      const d = -dir;
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 3. 水平流动（粘稠，横向扩散概率 0.15）
    if (Math.random() < 0.15) {
            {
        const d = dir;
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
      }
      {
        const d = -dir;
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
      }
    }

    // 4. 密度置换：甘油比水重，下沉
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < Glycerin.density && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Glycerin);
