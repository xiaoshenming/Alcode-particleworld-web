import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电线 —— 传导电信号的固体
 * - 不可移动，密度无限
 * - 接触雷电或火花时被激活（通电）
 * - 电流沿相邻电线传导，每帧扩展一格
 * - 通电状态持续数帧后恢复，末端释放火花
 * - 通电时颜色变亮（铜黄→亮黄）
 */

/** 电线通电状态：剩余通电帧数 */
const wireCharge = new Map<string, number>();

/** 通电持续帧数 */
const CHARGE_DURATION = 6;

/** 能激活电线的材质 */
const ACTIVATORS = new Set([16, 28]); // 雷电、火花

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function getCharge(x: number, y: number): number {
  return wireCharge.get(key(x, y)) ?? 0;
}

function setCharge(x: number, y: number, charge: number): void {
  if (charge <= 0) {
    wireCharge.delete(key(x, y));
  } else {
    wireCharge.set(key(x, y), charge);
  }
}

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
    let charge = getCharge(x, y);

    // 检查邻居是否有激活源
    const dirs: [number, number][] = [
      [0, -1], [0, 1], [-1, 0], [1, 0],
    ];

    if (charge <= 0) {
      // 未通电：检查是否被雷电/火花激活
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);

        if (ACTIVATORS.has(nid)) {
          charge = CHARGE_DURATION;
          setCharge(x, y, charge);
          break;
        }

        // 被相邻通电电线传导
        if (nid === 44 && getCharge(nx, ny) === CHARGE_DURATION) {
          charge = CHARGE_DURATION;
          setCharge(x, y, charge);
          break;
        }
      }
    }

    if (charge > 0) {
      // 通电中：显示亮色
      // 通过 set 刷新颜色（color() 会被调用，但我们需要亮色）
      // 用温度标记通电状态，让颜色函数区分
      world.setTemp(x, y, 100);
      world.set(x, y, 44);

      charge--;
      setCharge(x, y, charge);

      // 通电结束时：在非电线邻居的空位释放火花
      if (charge <= 0) {
        world.setTemp(x, y, 20);
        // 刷新为未通电颜色
        world.set(x, y, 44);

        // 检查是否是末端（只有一侧有电线）
        let wireNeighbors = 0;
        let emptyDirs: [number, number][] = [];
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          if (world.get(nx, ny) === 44) {
            wireNeighbors++;
          } else if (world.isEmpty(nx, ny)) {
            emptyDirs.push([dx, dy]);
          }
        }

        // 末端（0或1个电线邻居）释放火花
        if (wireNeighbors <= 1 && emptyDirs.length > 0) {
          const [dx, dy] = emptyDirs[Math.floor(Math.random() * emptyDirs.length)];
          const sx = x + dx, sy = y + dy;
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
