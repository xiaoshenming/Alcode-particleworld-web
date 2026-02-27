import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 荧光粉 —— 受激发光的粉末
 * - 粉末，受重力下落
 * - 被激光(47)/光束(48)/雷电(16)/火花(28)激发后发光
 * - 发光状态持续一段时间后衰减
 * - 遇水(2)溶解为荧光液(80)
 * - 高温(>400)分解为烟(7)
 * - 视觉上呈黄绿色粉末
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未发光; age=N: 剩余发光帧=N
 */

export const Phosphor: MaterialDef = {
  id: 133,
  name: '荧光粉',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 黄绿色
      r = 180 + Math.floor(Math.random() * 30);
      g = 220 + Math.floor(Math.random() * 25);
      b = 60 + Math.floor(Math.random() * 30);
    } else if (t < 0.8) {
      // 亮绿色
      r = 140 + Math.floor(Math.random() * 30);
      g = 230 + Math.floor(Math.random() * 20);
      b = 80 + Math.floor(Math.random() * 25);
    } else {
      // 淡黄色
      r = 210 + Math.floor(Math.random() * 25);
      g = 220 + Math.floor(Math.random() * 20);
      b = 100 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 400) {
      world.set(x, y, 7); // 烟（age自动重置）
      world.wakeArea(x, y);
      return;
    }

    let glow = world.getAge(x, y);
    const dirs = DIRS4;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水溶解为荧光液
      if (nid === 2 && Math.random() < 0.06) {
        world.set(x, y, 80); // 荧光液（age自动重置）
        world.wakeArea(x, y);
        return;
      }

      // 被光源激发（覆盖/延长发光时间）
      if ((nid === 47 || nid === 48 || nid === 16 || nid === 28) && Math.random() < 0.2) {
        glow = 30 + Math.floor(Math.random() * 20);
        world.setAge(x, y, glow);
      }
    }

    // 发光衰减
    if (glow > 0) {
      world.setAge(x, y, glow - 1);
      world.wakeArea(x, y);
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

registerMaterial(Phosphor);
