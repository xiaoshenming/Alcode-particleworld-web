import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 硅胶 —— 多孔吸附材料
 * - 固体，中等密度，不可移动
 * - 吸水：吸收邻近的水(2)/蒸汽(8)
 * - 吸满水后变色（视觉反馈）
 * - 高温(>300°)释放吸收的水分为蒸汽(8)
 * - 视觉上呈半透明白色/蓝色小珠
 */

export const SilicaGel: MaterialDef = {
  id: 143,
  name: '硅胶',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 白色半透明
      r = 220 + Math.floor(Math.random() * 20);
      g = 225 + Math.floor(Math.random() * 20);
      b = 230 + Math.floor(Math.random() * 15);
    } else if (t < 0.7) {
      // 蓝色指示剂
      r = 100 + Math.floor(Math.random() * 20);
      g = 140 + Math.floor(Math.random() * 20);
      b = 200 + Math.floor(Math.random() * 25);
    } else {
      // 浅粉（吸水后）
      r = 210 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 15);
      b = 190 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 吸收水
      if (nid === 2 && Math.random() < 0.05) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 吸收蒸汽
      if (nid === 8 && Math.random() < 0.08) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 高温释放蒸汽
      if (temp > 300 && nid === 0 && Math.random() < 0.03) {
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        world.addTemp(x, y, -10);
      }
    }
  },
};

registerMaterial(SilicaGel);
