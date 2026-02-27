import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 荧光藻 —— 发光的水生微生物
 * - 液体/半固体，低密度
 * - 在水(2)/盐水(24)中缓慢繁殖
 * - 受到扰动（邻居变化）时发出更亮的光
 * - 离开水会逐渐干枯变为泥土(20)
 * - 遇酸(9)死亡
 * - 视觉上呈蓝绿色荧光，有闪烁效果
 */

export const GlowAlgae: MaterialDef = {
  id: 140,
  name: '荧光藻',
  color() {
    const t = Math.random();
    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 蓝绿荧光
      r = Math.floor((20 + Math.random() * 15) * pulse);
      g = Math.floor((180 + Math.random() * 30) * pulse);
      b = Math.floor((160 + Math.random() * 30) * pulse);
    } else if (t < 0.7) {
      // 亮绿
      r = Math.floor((30 + Math.random() * 15) * pulse);
      g = Math.floor((200 + Math.random() * 40) * pulse);
      b = Math.floor((120 + Math.random() * 25) * pulse);
    } else {
      // 青色
      r = Math.floor((15 + Math.random() * 10) * pulse);
      g = Math.floor((160 + Math.random() * 30) * pulse);
      b = Math.floor((190 + Math.random() * 30) * pulse);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.6,
  update(x: number, y: number, world: WorldAPI) {
    let inWater = false;
    const dirs = DIRS4;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 检测是否在水中
      if (nid === 2 || nid === 24) {
        inWater = true;

        // 在水中繁殖
        if (Math.random() < 0.002) {
          world.set(nx, ny, 140);
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
        }
      }

      // 遇酸死亡
      if (nid === 9 && Math.random() < 0.1) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 离开水逐渐干枯
    if (!inWater && Math.random() < 0.008) {
      world.set(x, y, 20); // 泥土
      world.wakeArea(x, y);
      return;
    }

    // 液体流动（在水中悬浮，不在水中则下沉）
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0 && below !== 2 && below !== 24) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 在水中随机漂浮
      if (inWater && Math.random() < 0.2) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        const sx = x + dir;
        if (world.inBounds(sx, y) && (world.get(sx, y) === 2 || world.get(sx, y) === 24)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          world.wakeArea(sx, y);
          return;
        }
        // 上浮
        if (Math.random() < 0.15 && world.inBounds(x, y - 1) && (world.get(x, y - 1) === 2 || world.get(x, y - 1) === 24)) {
          world.swap(x, y, x, y - 1);
          world.markUpdated(x, y - 1);
          world.wakeArea(x, y - 1);
          return;
        }
      }

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
  },
};

registerMaterial(GlowAlgae);
