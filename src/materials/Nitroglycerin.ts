import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 硝化甘油 —— 高度不稳定的爆炸物
 * - 液体，密度比水大
 * - 极度不稳定：遇火(6)/熔岩(11)/雷电(16)/火花(28)立即爆炸
 * - 高温(>60)自燃爆炸
 * - 爆炸产生大范围火(6)和烟(7)，并摧毁周围物质
 * - 受到撞击（快速移动的粒子）也可能爆炸
 * - 视觉上呈淡黄色油状液体
 */

export const Nitroglycerin: MaterialDef = {
  id: 109,
  name: '硝化甘油',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.55) {
      // 淡黄色
      r = 235 + Math.floor(Math.random() * 20);
      g = 225 + Math.floor(Math.random() * 20);
      b = 150 + Math.floor(Math.random() * 30);
    } else if (t < 0.85) {
      // 浅琥珀色
      r = 225 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 130 + Math.floor(Math.random() * 25);
    } else {
      // 油光反射
      r = 245 + Math.floor(Math.random() * 10);
      g = 240 + Math.floor(Math.random() * 10);
      b = 180 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温自燃爆炸
    if (temp > 60) {
      explode(x, y, world);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火/熔岩/雷电/火花/等离子体立即爆炸
      if ((nid === 6 || nid === 11 || nid === 16 || nid === 28 || nid === 55) && Math.random() < 0.8) {
        explode(x, y, world);
        return;
      }

      // 遇其他硝化甘油爆炸时连锁
      if (nid === 109) {
        const nTemp = world.getTemp(nx, ny);
        if (nTemp > 200) {
          explode(x, y, world);
          return;
        }
      }
    }

    // 液体流动：下落
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

      // 水平扩散
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
  },
};

/** 爆炸效果：大范围摧毁 + 火焰 + 烟雾 */
function explode(cx: number, cy: number, world: WorldAPI): void {
  const radius = 4;
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const nx = cx + dx, ny = cy + dy;
      if (!world.inBounds(nx, ny)) continue;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      const nid = world.get(nx, ny);

      // 中心区域：摧毁一切（除不可摧毁物）
      if (dist <= 2) {
        if (nid === 10 || nid === 17 || nid === 36) continue; // 金属/玻璃/混凝土抗爆
        if (Math.random() < 0.7) {
          world.set(nx, ny, Math.random() < 0.4 ? 6 : 7); // 火或烟
        } else {
          world.set(nx, ny, 0);
        }
      } else if (dist <= radius) {
        // 外围：点燃可燃物，产生火焰
        if (nid === 0) {
          if (Math.random() < 0.3) world.set(nx, ny, 6); // 火
        } else if (nid === 109) {
          // 连锁引爆其他硝化甘油
          world.addTemp(nx, ny, 300);
        }
      }

      world.addTemp(nx, ny, 200);
      world.markUpdated(nx, ny);
      world.wakeArea(nx, ny);
    }
  }
  // 确保自身被摧毁
  world.set(cx, cy, 6);
  world.wakeArea(cx, cy);
}

registerMaterial(Nitroglycerin);
