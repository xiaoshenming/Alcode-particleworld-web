import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 浮石 —— 火山�ite出的多孔轻质�ite石
 * - 固体粉末行为，可堆积
 * - 密度极低（比水轻），能浮在水面上
 * - 遇水(2)漂浮不下沉
 * - 遇熔岩(11)被重新熔化为熔岩
 * - 遇酸液(9)缓慢腐蚀
 * - 高温(>1200)重新熔化为熔岩(11)
 * - 视觉上呈灰白色多孔纹理
 */

export const Pumice: MaterialDef = {
  id: 115,
  name: '浮石',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 浅灰色
      r = 190 + Math.floor(Math.random() * 25);
      g = 185 + Math.floor(Math.random() * 25);
      b = 180 + Math.floor(Math.random() * 25);
    } else if (t < 0.7) {
      // 灰白色
      r = 210 + Math.floor(Math.random() * 20);
      g = 205 + Math.floor(Math.random() * 20);
      b = 200 + Math.floor(Math.random() * 20);
    } else if (t < 0.9) {
      // 暗灰孔洞
      r = 155 + Math.floor(Math.random() * 25);
      g = 150 + Math.floor(Math.random() * 25);
      b = 145 + Math.floor(Math.random() * 25);
    } else {
      // 米黄色
      r = 215 + Math.floor(Math.random() * 20);
      g = 205 + Math.floor(Math.random() * 15);
      b = 185 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温重新熔化为熔岩
    if (temp > 1200) {
      world.set(x, y, 11); // 熔岩
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇熔岩被熔化
      if (nid === 11 && Math.random() < 0.08) {
        world.set(x, y, 11); // 熔岩
        world.wakeArea(x, y);
        return;
      }

      // 遇酸液腐蚀
      if (nid === 9 && Math.random() < 0.03) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.03) {
      world.addTemp(x, y, -1);
    }

    // 检查下方
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);

      // 浮在水/盐水上（密度比水轻）
      if (below === 2 || below === 24 || below === 97) {
        // 不下沉，保持位置
        // 水平漂移
        if (Math.random() < 0.1) {
          const dir = Math.random() < 0.5 ? -1 : 1;
          const nx = x + dir;
          if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
            world.swap(x, y, nx, y);
            world.markUpdated(nx, y);
            world.wakeArea(nx, y);
          }
        }
        world.wakeArea(x, y);
        return;
      }

      // 正常下落（在空气中）
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 密度置换（不与水置换，因为浮在水上）
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0 && below !== 2 && below !== 24 && below !== 97) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下滑落
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

    // 如果在水中（上方有水），浮上去
    if (world.inBounds(x, y - 1)) {
      const above = world.get(x, y - 1);
      if ((above === 2 || above === 24 || above === 97) && Math.random() < 0.3) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        world.wakeArea(x, y - 1);
        return;
      }
    }
  },
};

registerMaterial(Pumice);
