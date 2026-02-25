import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 压电陶瓷 —— 受压产生电能的特殊陶瓷
 * - 固体，密度 Infinity（不可移动）
 * - 压电效应：上方有重物时，向邻近电线(44)传递电能
 *   - 检测上方是否有固体/液体压力
 *   - 有压力时激活邻近电线
 * - 高温(>350°)失去压电性（居里温度）
 * - 耐酸：普通酸无效
 * - 米白色带微晶纹理
 */

/** 可施加压力的材质类型（密度 > 1 的固体/液体） */
const isPressure = (id: number, world: WorldAPI, px: number, py: number): boolean => {
  if (id === 0) return false;
  return world.getDensity(px, py) >= 1.5;
};

export const PiezoelectricCeramic: MaterialDef = {
  id: 235,
  name: '压电陶瓷',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 米白色
      r = 220 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 淡黄白
      r = 230 + Math.floor(Math.random() * 15);
      g = 220 + Math.floor(Math.random() * 15);
      b = 195 + Math.floor(Math.random() * 15);
    } else {
      // 微晶闪光
      r = 240 + Math.floor(Math.random() * 15);
      g = 235 + Math.floor(Math.random() * 15);
      b = 215 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 超过居里温度失去压电性
    if (temp > 350) return;

    // 检测上方压力
    let hasPressure = false;
    if (y > 0 && world.inBounds(x, y - 1)) {
      const aboveId = world.get(x, y - 1);
      if (isPressure(aboveId, world, x, y - 1)) {
        hasPressure = true;
      }
    }

    if (!hasPressure) return;

    // 有压力时，激活邻近电线
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 激活电线
      if (nid === 44) {
        world.addTemp(nx, ny, 5);
        world.wakeArea(nx, ny);
      }
    }

    // 周期性唤醒以持续检测
    if (Math.random() < 0.3) {
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(PiezoelectricCeramic);
