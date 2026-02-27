import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电流变液 —— 智能流体
 * - 液体，密度 2.5
 * - 正常状态：液体行为，向下流动
 * - 接触电线(44)或激光(47)时：变为半固态，暂停流动（模拟电场效应）
 * - 接触火(6)时蒸发为烟(7)
 * - 半透明黄绿色
 */

export const ElectrorheologicalFluid: MaterialDef = {
  id: 385,
  name: '电流变液',
  category: '特殊',
  description: '在电场作用下粘度急剧变化的智能流体，可在液态和半固态间切换',
  density: 2.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 黄绿色
      r = 160 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 25);
      b = 80 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗黄绿
      r = 140 + Math.floor(Math.random() * 15);
      g = 180 + Math.floor(Math.random() * 20);
      b = 65 + Math.floor(Math.random() * 15);
    } else {
      // 亮黄绿高光
      r = 180 + Math.floor(Math.random() * 18);
      g = 220 + Math.floor(Math.random() * 20);
      b = 95 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    // 检测周围是否有电场源（电线44 或 激光47）
    let nearElectric = false;
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触火蒸发为烟
      if (nid === 6 && Math.random() < 0.15) {
        world.set(x, y, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 检测电场源
      if (nid === 44 || nid === 47) {
        nearElectric = true;
      }
    }

    // 电场效应：半固态，不流动
    if (nearElectric) {
      // 在电场中冻结，不执行液体运动
      // 但仍然唤醒区域以便电场消失后恢复
      world.wakeArea(x, y);
      return;
    }

    // === 液体运动 ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      if (below !== 0) {
        const bDensity = world.getDensity(x, y + 1);
        if (bDensity !== Infinity && bDensity < 2.5) {
          world.swap(x, y, x, y + 1);
          world.markUpdated(x, y + 1);
          return;
        }
      }
    }

    if (Math.random() < 0.4) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    if (y < world.height - 1) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
        world.swap(x, y, x + dir, y + 1);
        world.markUpdated(x + dir, y + 1);
        return;
      }
    }
  },
};

registerMaterial(ElectrorheologicalFluid);
