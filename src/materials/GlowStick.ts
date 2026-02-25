import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 荧光棒 —— 化学发光棒
 * - 固体，低密度，不可移动
 * - 持续发光（颜色随时间变化）
 * - 遇水(2)加速发光衰减
 * - 高温(>200°)加速反应
 * - 寿命结束后变为玻璃(17)
 * - 视觉上呈亮绿/黄/蓝色荧光
 */

export const GlowStick: MaterialDef = {
  id: 154,
  name: '荧光棒',
  color() {
    const phase = (Date.now() * 0.001) % 3;
    let r: number, g: number, b: number;
    const bright = 0.7 + Math.random() * 0.3;
    if (phase < 1) {
      // 绿色
      r = Math.floor(30 * bright);
      g = Math.floor((200 + Math.random() * 50) * bright);
      b = Math.floor(40 * bright);
    } else if (phase < 2) {
      // 黄色
      r = Math.floor((220 + Math.random() * 30) * bright);
      g = Math.floor((200 + Math.random() * 40) * bright);
      b = Math.floor(20 * bright);
    } else {
      // 蓝色
      r = Math.floor(30 * bright);
      g = Math.floor((100 + Math.random() * 30) * bright);
      b = Math.floor((200 + Math.random() * 50) * bright);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    let decayRate = 0.0005;

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水加速衰减
      if (nid === 2) {
        decayRate *= 3;
      }
    }

    // 高温加速
    if (temp > 200) {
      decayRate *= 2;
    }

    // 寿命结束
    if (Math.random() < decayRate) {
      world.set(x, y, 17); // 玻璃
      world.wakeArea(x, y);
      return;
    }

    // 保持活跃（持续发光需要刷新颜色）
    world.wakeArea(x, y);
  },
};

registerMaterial(GlowStick);
