import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 骨头 —— 坚硬的有机固体
 * - 固体，不可移动，密度高
 * - 耐火但极高温下会�ite化为灰烬(变为沙子)
 * - 酸液缓慢腐蚀
 * - 遇水(2)长时间浸泡后变为化石（石头）
 * - 蚂蚁(40)/白蚁(81)不会啃食
 * - 视觉上呈米白色/象牙色
 */

export const Bone: MaterialDef = {
  id: 105,
  name: '骨头',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 象牙白
      r = 230 + Math.floor(Math.random() * 20);
      g = 215 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 20);
    } else if (t < 0.8) {
      // 米黄色
      r = 215 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 20);
      b = 165 + Math.floor(Math.random() * 20);
    } else if (t < 0.95) {
      // 浅灰色关节
      r = 195 + Math.floor(Math.random() * 20);
      g = 185 + Math.floor(Math.random() * 20);
      b = 175 + Math.floor(Math.random() * 15);
    } else {
      // 暗色裂纹
      r = 160 + Math.floor(Math.random() * 20);
      g = 145 + Math.floor(Math.random() * 15);
      b = 120 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温灰化为沙子
    if (temp > 300) {
      world.set(x, y, 1); // 沙子（灰烬）
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    let waterCount = 0;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸液腐蚀
      if (nid === 9 && Math.random() < 0.04) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 熔岩接触加热
      if (nid === 11) {
        world.addTemp(x, y, 10);
      }

      // 统计水源
      if (nid === 2 || nid === 97) {
        waterCount++;
      }
    }

    // 长时间浸泡在水中 → 石化（极低概率）
    if (waterCount >= 2 && Math.random() < 0.0005) {
      world.set(x, y, 3); // 石头（化石化）
      world.wakeArea(x, y);
      return;
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.05) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Bone);
