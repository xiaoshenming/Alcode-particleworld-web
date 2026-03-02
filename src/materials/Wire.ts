import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电线 —— 传导电信号的固体
 * - 不可移动，密度无限
 * - 接触雷电或火花时被激活（通电）
 * - 电流沿相邻电线传导，每帧扩展一格
 * - 通电状态持续数帧后恢复，末端释放火花
 * - 通电时颜色变亮（铜黄→亮黄）
 * 使用 World 内置 age 替代 Map<string,number>（wireCharge）
 * age=0: 未通电; age=N: 通电剩余N帧
 */

/** 通电持续帧数 */
const CHARGE_DURATION = 6;

/** 能激活电线的材质 */
const ACTIVATORS = new Set([16, 28]); // 雷电、火花

export const Wire: MaterialDef = {
  id: 44,
  name: '电线',
  color() {
    // 铜色（未通电状态）
    const t = Math.random();
    const r = 180 + Math.floor(t * 20);
    const g = 100 + Math.floor(t * 15);
    const b = 30 + Math.floor(t * 10);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    let charge = world.getAge(x, y);

    if (charge <= 0) {
      // 未通电：检查是否被雷电/火花激活（4方向显式展开，transmuted布尔，无HOF）
      let activated = false;
      if (!activated && world.inBounds(x, y - 1)) {
        const nid = world.get(x, y - 1);
        if (ACTIVATORS.has(nid) || (nid === 44 && world.getAge(x, y - 1) === CHARGE_DURATION)) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
      }
      if (!activated && world.inBounds(x, y + 1)) {
        const nid = world.get(x, y + 1);
        if (ACTIVATORS.has(nid) || (nid === 44 && world.getAge(x, y + 1) === CHARGE_DURATION)) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
      }
      if (!activated && world.inBounds(x - 1, y)) {
        const nid = world.get(x - 1, y);
        if (ACTIVATORS.has(nid) || (nid === 44 && world.getAge(x - 1, y) === CHARGE_DURATION)) { charge = CHARGE_DURATION; world.setAge(x, y, charge); activated = true; }
      }
      if (!activated && world.inBounds(x + 1, y)) {
        const nid = world.get(x + 1, y);
        if (ACTIVATORS.has(nid) || (nid === 44 && world.getAge(x + 1, y) === CHARGE_DURATION)) { charge = CHARGE_DURATION; world.setAge(x, y, charge); }
      }
    }

    if (charge > 0) {
      // 通电中：显示亮色（set()会重置age，需立即恢复为递减后的值）
      world.setTemp(x, y, 100);
      world.set(x, y, 44);
      world.setAge(x, y, charge - 1); // 恢复并递减

      charge--;

      // 通电结束时：在非电线邻居的空位释放火花
      if (charge <= 0) {
        world.setTemp(x, y, 20);
        world.set(x, y, 44); // 刷新为未通电颜色（age已为0，无需恢复）

        // 检查末端（只有一侧有电线），统计wire邻居和空位（4方向显式展开，无HOF）
        let wireNeighbors = 0;
        let emptyCount = 0;
        let emptyX = -1, emptyY = -1;
        if (world.inBounds(x, y - 1)) {
          if (world.get(x, y - 1) === 44) wireNeighbors++;
          else if (world.isEmpty(x, y - 1)) { emptyCount++; emptyX = x; emptyY = y - 1; }
        }
        if (world.inBounds(x, y + 1)) {
          if (world.get(x, y + 1) === 44) wireNeighbors++;
          else if (world.isEmpty(x, y + 1)) { emptyCount++; emptyX = x; emptyY = y + 1; }
        }
        if (world.inBounds(x - 1, y)) {
          if (world.get(x - 1, y) === 44) wireNeighbors++;
          else if (world.isEmpty(x - 1, y)) { emptyCount++; emptyX = x - 1; emptyY = y; }
        }
        if (world.inBounds(x + 1, y)) {
          if (world.get(x + 1, y) === 44) wireNeighbors++;
          else if (world.isEmpty(x + 1, y)) { emptyCount++; emptyX = x + 1; emptyY = y; }
        }

        // 末端（0或1个电线邻居）释放火花（随机选一个空位）
        if (wireNeighbors <= 1 && emptyCount > 0) {
          // 随机起始方向重新选择空位
          const start = Math.floor(Math.random() * emptyCount);
          let idx = 0;
          let sx = emptyX, sy = emptyY;
          if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) { if (idx === start) { sx = x; sy = y - 1; } idx++; }
          if (world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { if (idx === start) { sx = x; sy = y + 1; } idx++; }
          if (world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) { if (idx === start) { sx = x - 1; sy = y; } idx++; }
          if (world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) { if (idx === start) { sx = x + 1; sy = y; } }
          world.set(sx, sy, 28); // 火花
          world.markUpdated(sx, sy);
        }
      }
    }
  },
};

// 覆盖 color 以支持通电状态的亮色
Wire.color = function () {
  // 由于 color() 在 set() 时调用，无法直接获取坐标
  // 用随机概率模拟通电闪烁（通电的电线会频繁刷新颜色）
  const t = Math.random();
  // 基础铜色 + 偶尔亮黄（通电时 set 频率高，视觉上更亮）
  const r = 180 + Math.floor(t * 75);
  const g = 100 + Math.floor(t * 80);
  const b = 30 + Math.floor(t * 20);
  return (0xFF << 24) | (b << 16) | (g << 8) | r;
};

registerMaterial(Wire);
