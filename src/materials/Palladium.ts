import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钯 —— 贵金属催化剂
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 1555° → 变为液态钯(282)
 * - 催化特性：加速邻近化学反应（酸+金属反应加速）
 * - 吸氢：接触氢气(19)时吸收并升温
 * - 银白色带暖光泽
 */

export const Palladium: MaterialDef = {
  id: 281,
  name: '钯',
  category: '金属',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 银白
      const base = 190 + Math.floor(Math.random() * 20);
      r = base + 5;
      g = base;
      b = base - 5;
    } else if (phase < 0.7) {
      // 暖银
      const base = 200 + Math.floor(Math.random() * 15);
      r = base + 8;
      g = base + 2;
      b = base - 8;
    } else {
      // 高光
      const base = 215 + Math.floor(Math.random() * 20);
      r = base + 5;
      g = base;
      b = base - 3;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 1555) {
      world.set(x, y, 282);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 吸氢：吸收氢气并升温
      if (nid === 19 && Math.random() < 0.15) {
        world.set(nx, ny, 0);
        world.addTemp(x, y, 15);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
      }

      // 催化：加速邻近酸的反应（唤醒酸周围区域）
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.3) {
        world.wakeArea(nx, ny);
      }

      // 耐腐蚀（贵金属）
      if (nid === 9 && Math.random() < 0.002) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Palladium);
