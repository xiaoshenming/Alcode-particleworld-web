import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 硅 —— 半导体固体
 * - 固体，密度 Infinity（不可移动）
 * - 高温(>1414°)熔化为液态硅(189)
 * - 导电：遇电弧(145)传导（类似电线但效率低，概率性传导）
 * - 深灰色带金属光泽
 * 使用 World 内置 age 替代 Map<string,number>（固体无需迁移）
 * age=0: 未通电; age=N: 通电剩余N帧
 */

const CHARGE_DURATION = 4;

/** 能激活硅导电的材质 */
const ACTIVATORS = new Set([145, 16, 28]); // 电弧、雷电、火花

export const Silicon: MaterialDef = {
  id: 188,
  name: '硅',
  color() {
    // 深灰色带金属光泽
    const t = Math.random();
    const base = 80 + Math.floor(t * 25);
    const r = base + Math.floor(Math.random() * 8);
    const g = base + Math.floor(Math.random() * 8);
    const b = base + 5 + Math.floor(Math.random() * 12);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化为液态硅
    if (temp > 1414) {
      world.set(x, y, 189); // 液态硅
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 导电逻辑（age=0: 未通电; age=N: 通电剩余N帧）
    let charge = world.getAge(x, y);

    if (charge <= 0) {
      // 未通电：检查是否被电弧/雷电/火花激活（4方向显式展开，transmuted布尔，无HOF）
      let activated = false;
      if (!activated && world.inBounds(x, y - 1)) {
        const nid = world.get(x, y - 1);
        if (ACTIVATORS.has(nid)) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
        else if (nid === 188 && world.getAge(x, y - 1) === CHARGE_DURATION && Math.random() < 0.5) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
        else if (nid === 44 && Math.random() < 0.3) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
      }
      if (!activated && world.inBounds(x, y + 1)) {
        const nid = world.get(x, y + 1);
        if (ACTIVATORS.has(nid)) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
        else if (nid === 188 && world.getAge(x, y + 1) === CHARGE_DURATION && Math.random() < 0.5) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
        else if (nid === 44 && Math.random() < 0.3) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
      }
      if (!activated && world.inBounds(x - 1, y)) {
        const nid = world.get(x - 1, y);
        if (ACTIVATORS.has(nid)) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
        else if (nid === 188 && world.getAge(x - 1, y) === CHARGE_DURATION && Math.random() < 0.5) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
        else if (nid === 44 && Math.random() < 0.3) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
      }
      if (!activated && world.inBounds(x + 1, y)) {
        const nid = world.get(x + 1, y);
        if (ACTIVATORS.has(nid)) { charge = CHARGE_DURATION; world.setAge(x, y, charge); }
        else if (nid === 188 && world.getAge(x + 1, y) === CHARGE_DURATION && Math.random() < 0.5) { charge = CHARGE_DURATION; world.setAge(x, y, charge); }
        else if (nid === 44 && Math.random() < 0.3) { charge = CHARGE_DURATION; world.setAge(x, y, charge); }
      }
    }

    if (charge > 0) {
      // 通电中：升温 + 刷新颜色（set()会重置age，需立即恢复为递减后的值）
      world.addTemp(x, y, 2);
      world.set(x, y, 188);
      world.setAge(x, y, charge - 1); // 恢复并递减

      charge--;

      // 通电结束时：末端释放火花
      if (charge <= 0) {
        // 统计邻居类型和空位（4方向显式展开，无HOF）
        let siliconNeighbors = 0;
        let emptyCount = 0;
        if (world.inBounds(x, y - 1)) {
          if (world.get(x, y - 1) === 188 || world.get(x, y - 1) === 44) siliconNeighbors++;
          else if (world.isEmpty(x, y - 1)) emptyCount++;
        }
        if (world.inBounds(x, y + 1)) {
          if (world.get(x, y + 1) === 188 || world.get(x, y + 1) === 44) siliconNeighbors++;
          else if (world.isEmpty(x, y + 1)) emptyCount++;
        }
        if (world.inBounds(x - 1, y)) {
          if (world.get(x - 1, y) === 188 || world.get(x - 1, y) === 44) siliconNeighbors++;
          else if (world.isEmpty(x - 1, y)) emptyCount++;
        }
        if (world.inBounds(x + 1, y)) {
          if (world.get(x + 1, y) === 188 || world.get(x + 1, y) === 44) siliconNeighbors++;
          else if (world.isEmpty(x + 1, y)) emptyCount++;
        }

        // 末端释放火花（概率性），随机选一个空位
        if (siliconNeighbors <= 1 && emptyCount > 0 && Math.random() < 0.6) {
          const start = Math.floor(Math.random() * emptyCount);
          let idx = 0;
          let sx = x, sy = y;
          if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { if (idx === start) { sx = x; sy = y - 1; } idx++; }
          if (world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { if (idx === start) { sx = x; sy = y + 1; } idx++; }
          if (world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { if (idx === start) { sx = x - 1; sy = y; } idx++; }
          if (world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { if (idx === start) { sx = x + 1; sy = y; } }
          if (sx !== x || sy !== y) { world.set(sx, sy, 28); world.markUpdated(sx, sy); }
        }
      }
    }
  },
};

registerMaterial(Silicon);
