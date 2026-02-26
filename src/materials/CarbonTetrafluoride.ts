import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 四氟化碳 —— 惰性气体，温室气体
 * - 气体，密度 -0.5（上浮较慢）
 * - 极其稳定，几乎不与任何物质反应
 * - 高温 >600° 才缓慢分解为毒气
 * - 无色无味气体
 */

export const CarbonTetrafluoride: MaterialDef = {
  id: 408,
  name: '四氟化碳',
  category: '化学',
  description: '极稳定的惰性气体，最强温室气体之一，大气寿命超5万年',
  density: -0.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 近透明微蓝
      r = 210 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 15);
      b = 235 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 淡蓝白
      r = 200 + Math.floor(Math.random() * 15);
      g = 210 + Math.floor(Math.random() * 12);
      b = 225 + Math.floor(Math.random() * 12);
    } else {
      // 近白
      r = 230 + Math.floor(Math.random() * 15);
      g = 235 + Math.floor(Math.random() * 12);
      b = 245 + Math.floor(Math.random() * 10);
    }
    return (0xAA << 24) | (b << 16) | (g << 8) | r; // 半透明
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温分解
    if (temp > 600) {
      world.set(x, y, 18); // 毒气
      world.wakeArea(x, y);
      return;
    }

    // === 气体运动（上浮） ===
    if (y > 0) {
      const above = world.get(x, y - 1);
      if (above === 0) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        return;
      }
      const aDensity = world.getDensity(x, y - 1);
      if (aDensity > 0) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        return;
      }
    }

    // 随机横向扩散
    if (Math.random() < 0.5) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 极缓慢消散（极稳定）
    if (Math.random() < 0.0003) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(CarbonTetrafluoride);
