import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态金属 —— 熔融状态的金属
 * - 液体，高密度（比熔岩更重）
 * - 金属(10)高温(>1500)熔化生成
 * - 温度降到<800时凝固回金属(10)
 * - 持续发出高温，点燃周围可燃物
 * - 遇水(2)产生大量蒸汽(8)并快速冷却
 * - 遇冰(14)/雪(15)瞬间蒸发
 * - 流动缓慢（高粘度）
 * - 视觉上呈明亮的橙红色液态金属
 */

export const MoltenMetal: MaterialDef = {
  id: 113,
  name: '液态金属',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 亮橙红
      r = 255;
      g = 140 + Math.floor(Math.random() * 50);
      b = 30 + Math.floor(Math.random() * 40);
    } else if (t < 0.7) {
      // 黄橙色
      r = 255;
      g = 190 + Math.floor(Math.random() * 40);
      b = 50 + Math.floor(Math.random() * 40);
    } else if (t < 0.9) {
      // 暗红色
      r = 220 + Math.floor(Math.random() * 35);
      g = 90 + Math.floor(Math.random() * 40);
      b = 20 + Math.floor(Math.random() * 30);
    } else {
      // 白热点
      r = 255;
      g = 230 + Math.floor(Math.random() * 25);
      b = 150 + Math.floor(Math.random() * 50);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 12,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 保持高温
    if (temp < 1200) {
      world.setTemp(x, y, 1200);
    }

    // 冷却凝固为金属
    if (temp < 800) {
      world.set(x, y, 10); // 金属
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 加热周围
      world.addTemp(nx, ny, 8);

      // 遇水产生蒸汽并冷却
      if (nid === 2 && Math.random() < 0.3) {
        world.set(nx, ny, 8); // 蒸汽
        world.addTemp(x, y, -50);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 遇冰/雪瞬间蒸发
      if ((nid === 14 || nid === 15) && Math.random() < 0.4) {
        world.set(nx, ny, 8); // 蒸汽
        world.addTemp(x, y, -30);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 点燃可燃物
      if ((nid === 4 || nid === 5 || nid === 22 || nid === 25) && Math.random() < 0.15) {
        world.set(nx, ny, 6); // 火
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 熔化金属
      if (nid === 10 && Math.random() < 0.02) {
        world.set(nx, ny, 113); // 液态金属
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 缓慢自然冷却
    if (Math.random() < 0.02) {
      world.addTemp(x, y, -5);
    }

    // 液体流动（高粘度，缓慢）
    if (Math.random() < 0.6) { // 粘度限制
      if (world.inBounds(x, y + 1)) {
        const below = world.get(x, y + 1);
        if (below === 0) {
          world.swap(x, y, x, y + 1);
          world.markUpdated(x, y + 1);
          world.wakeArea(x, y + 1);
          return;
        }

        // 密度置换
        const belowDensity = world.getDensity(x, y + 1);
        if (belowDensity < this.density && belowDensity > 0) {
          world.swap(x, y, x, y + 1);
          world.markUpdated(x, y + 1);
          world.wakeArea(x, y + 1);
          return;
        }

        // 斜下流动
        const dir = Math.random() < 0.5 ? -1 : 1;
                {
          const d = dir;
          const sx = x + d;
          if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
            world.swap(x, y, sx, y + 1);
            world.markUpdated(sx, y + 1);
            world.wakeArea(sx, y + 1);
            return;
          }
        }
        {
          const d = -dir;
          const sx = x + d;
          if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
            world.swap(x, y, sx, y + 1);
            world.markUpdated(sx, y + 1);
            world.wakeArea(sx, y + 1);
            return;
          }
        }

        // 水平扩散（很慢）
        if (Math.random() < 0.3) {
                    {
            const d = dir;
            const sx = x + d;
            if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
              world.swap(x, y, sx, y);
              world.markUpdated(sx, y);
              world.wakeArea(sx, y);
              return;
            }
          }
          {
            const d = -dir;
            const sx = x + d;
            if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
              world.swap(x, y, sx, y);
              world.markUpdated(sx, y);
              world.wakeArea(sx, y);
              return;
            }
          }
        }
      }
    }
  },
};

registerMaterial(MoltenMetal);
