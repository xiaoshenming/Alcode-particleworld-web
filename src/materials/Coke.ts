import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 焦炭 —— 煤炭高温干馏产物
 * - 粉末，受重力下落
 * - 高热值燃料：遇火(6)/火花(28)/熔岩(11)点燃
 * - 燃烧时间长，持续产生高温
 * - 燃烧产生烟(7)，最终变为灰烬（沙子1）
 * - 遇水(2)不熄灭（与木炭不同）
 * - 视觉上呈深灰黑色多孔块状
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未燃烧; age=N: 燃烧剩余N帧
 */

export const Cite: MaterialDef = {
  id: 129,
  name: '焦炭',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 深灰黑
      r = 45 + Math.floor(Math.random() * 15);
      g = 42 + Math.floor(Math.random() * 12);
      b = 38 + Math.floor(Math.random() * 12);
    } else if (t < 0.8) {
      // 暗灰
      r = 60 + Math.floor(Math.random() * 15);
      g = 55 + Math.floor(Math.random() * 12);
      b = 50 + Math.floor(Math.random() * 12);
    } else {
      // 银灰光泽
      r = 80 + Math.floor(Math.random() * 15);
      g = 78 + Math.floor(Math.random() * 12);
      b = 75 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.2,
  update(x: number, y: number, world: WorldAPI) {
    const burnLife = world.getAge(x, y);

    // 燃烧状态（age > 0）
    if (burnLife > 0) {
      if (burnLife <= 1) {
        // 燃尽变灰烬
        world.set(x, y, 1); // 沙子（age自动重置为0）
        world.wakeArea(x, y);
        return;
      }

      // 持续产生高温
      world.addTemp(x, y, 15);

      // 产生烟
      if (Math.random() < 0.08) {
        const smokeDir: [number, number][] = [[0, -1], [-1, -1], [1, -1]];
        for (const [dx, dy] of smokeDir) {
          const nx = x + dx, ny = y + dy;
          if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
            world.set(nx, ny, 7); // 烟
            world.markUpdated(nx, ny);
            world.wakeArea(nx, ny);
            break;
          }
        }
      }

      // 点燃相邻可燃物
      const dirs4: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [dx, dy] of dirs4) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        // 点燃相邻未燃烧的焦炭
        if (nid === 129 && world.getAge(nx, ny) === 0 && Math.random() < 0.02) {
          world.setAge(nx, ny, 80 + Math.floor(Math.random() * 40));
          world.wakeArea(nx, ny);
        }
        // 点燃木头/油
        if ((nid === 4 || nid === 5) && Math.random() < 0.03) {
          world.set(nx, ny, 6); // 火
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
        }
      }

      world.setAge(x, y, burnLife - 1);
      world.wakeArea(x, y);
      return;
    }

    // 未燃烧：检查点燃
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if ((nid === 6 || nid === 28 || nid === 11) && Math.random() < 0.05) {
        world.setAge(x, y, 100 + Math.floor(Math.random() * 50));
        world.wakeArea(x, y);
        return;
      }
    }

    // 高温自燃
    if (world.getTemp(x, y) > 200) {
      world.setAge(x, y, 100 + Math.floor(Math.random() * 50));
      world.wakeArea(x, y);
      return;
    }

    // 粉末下落（swap 自动迁移 age）
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(Cite);
