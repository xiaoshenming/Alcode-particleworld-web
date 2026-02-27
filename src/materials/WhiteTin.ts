import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 白锡 —— β-锡的粉末形态
 * - 固体粉末，密度 5.5，受重力影响可下落堆积
 * - 低温(<13°)缓慢转变为灰色粉末（干沙146），模拟"锡疫"现象
 * - 高温(>232°)熔化为液态金属(113)
 * - 银白色金属光泽
 */

/** 锡疫临界温度 */
const TIN_PEST_TEMP = 13;
/** 熔点 */
const MELTING_POINT = 232;

export const WhiteTin: MaterialDef = {
  id: 176,
  name: '白锡',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白色
      r = 200 + Math.floor(Math.random() * 20);
      g = 205 + Math.floor(Math.random() * 18);
      b = 215 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 偏蓝银色光泽
      r = 185 + Math.floor(Math.random() * 15);
      g = 195 + Math.floor(Math.random() * 15);
      b = 220 + Math.floor(Math.random() * 20);
    } else {
      // 亮银高光
      r = 220 + Math.floor(Math.random() * 20);
      g = 225 + Math.floor(Math.random() * 15);
      b = 235 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 5.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化 → 液态金属
    if (temp > MELTING_POINT) {
      world.set(x, y, 113); // 液态金属
      world.setTemp(x, y, MELTING_POINT);
      world.wakeArea(x, y);
      return;
    }

    // 低温锡疫：缓慢转变为灰色粉末（干沙）
    if (temp < TIN_PEST_TEMP) {
      // 温度越低，转变概率越高
      const severity = (TIN_PEST_TEMP - temp) / TIN_PEST_TEMP;
      if (Math.random() < 0.005 * (1 + severity * 3)) {
        world.set(x, y, 146); // 干沙（灰色粉末）
        world.wakeArea(x, y);
        // 锡疫具有传染性：唤醒邻居白锡
        const dirs = DIRS4;
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (world.inBounds(nx, ny) && world.get(nx, ny) === 176) {
            world.wakeArea(nx, ny);
          }
        }
        return;
      }
    }

    // 导热
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nTemp = world.getTemp(nx, ny);
      const diff = temp - nTemp;
      if (Math.abs(diff) > 1) {
        const transfer = diff * 0.12;
        world.addTemp(nx, ny, transfer);
        world.addTemp(x, y, -transfer);
      }
    }

    // 重力下落
    if (y + 1 < world.height) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }

      // 密度置换（沉入轻液体）
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < 5.5 && belowDensity < Infinity) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y);
        world.markUpdated(x, y + 1);
        return;
      }

      // 斜下堆积
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(WhiteTin);
