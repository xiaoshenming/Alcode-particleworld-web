import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 荧光粉 —— 受激发光的粉末
 * - 粉末，受重力下落
 * - 被激光(47)/光束(48)/雷电(16)/火花(28)激发后发光
 * - 发光状态持续一段时间后衰减
 * - 遇水(2)溶解为荧光液(80)
 * - 高温(>400)分解为烟(7)
 * - 视觉上呈黄绿色粉末
 */

let glowStates: Map<string, number> = new Map();

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
      glowStates.delete(`${x},${y}`);
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    const key = `${x},${y}`;
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水溶解为荧光液
      if (nid === 2 && Math.random() < 0.06) {
        glowStates.delete(key);
        world.set(x, y, 80); // 荧光液
        world.wakeArea(x, y);
        return;
      }

      // 被光源激发
      if ((nid === 47 || nid === 48 || nid === 16 || nid === 28) && Math.random() < 0.2) {
        glowStates.set(key, 30 + Math.floor(Math.random() * 20));
      }
    }

    // 发光衰减
    const glow = glowStates.get(key);
    if (glow !== undefined) {
      if (glow <= 0) {
        glowStates.delete(key);
      } else {
        glowStates.set(key, glow - 1);
      }
      world.wakeArea(x, y);
    }

    // 粉末下落
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        const oldKey = key;
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        const g = glowStates.get(oldKey);
        if (g !== undefined) {
          glowStates.delete(oldKey);
          glowStates.set(`${x},${y + 1}`, g);
        }
        return;
      }

      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          const oldKey = key;
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          const g = glowStates.get(oldKey);
          if (g !== undefined) {
            glowStates.delete(oldKey);
            glowStates.set(`${sx},${y + 1}`, g);
          }
          return;
        }
      }
    }
  },
};

registerMaterial(Phosphor);
