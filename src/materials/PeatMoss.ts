import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 泥炭苔 —— 强吸水性苔藓
 * - 固体，密度 Infinity（不可移动）
 * - 强吸水：遇水(2)吸收（水消失，自身保留）
 * - 吸水后膨胀：用温度字段计数，每吸一次+10，>100时变为泥炭(142)
 * - 可燃：遇火(6)缓慢燃烧
 * - 深绿棕色，苔藓质感
 */

export const PeatMoss: MaterialDef = {
  id: 203,
  name: '泥炭苔',
  color() {
    // 深绿棕色，苔藓质感
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深绿棕
      r = 45 + Math.floor(Math.random() * 15);
      g = 65 + Math.floor(Math.random() * 20);
      b = 20 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 暗棕带绿
      r = 55 + Math.floor(Math.random() * 12);
      g = 50 + Math.floor(Math.random() * 18);
      b = 18 + Math.floor(Math.random() * 10);
    } else {
      // 亮绿苔藓斑点
      r = 35 + Math.floor(Math.random() * 10);
      g = 80 + Math.floor(Math.random() * 25);
      b = 25 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const dirs = DIRS4;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 强吸水：遇水吸收，水消失
      if (nid === 2) {
        world.set(nx, ny, 0); // 水消失
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);

        // 用温度字段计数吸水量，每次+10
        world.addTemp(x, y, 10);
        world.wakeArea(x, y);

        // 吸水饱和（>100）变为泥炭
        if (world.getTemp(x, y) > 100) {
          world.set(x, y, 142); // 泥炭
          world.wakeArea(x, y);
          return;
        }

        // 刷新颜色（吸水后颜色略变深）
        world.set(x, y, 203);
        return;
      }

      // 可燃：遇火缓慢燃烧
      if (nid === 6 && Math.random() < 0.03) {
        // 干燥时更易燃（温度低=吸水少=更干）
        const moisture = world.getTemp(x, y);
        if (moisture < 50 || Math.random() < 0.01) {
          world.set(x, y, 6); // 着火
          world.wakeArea(x, y);
          return;
        }
      }
    }
  },
};

registerMaterial(PeatMoss);
