import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 硅 —— 半导体固体
 * - 固体，密度 Infinity（不可移动）
 * - 高温(>1414°)熔化为液态硅(189)
 * - 导电：遇电弧(145)传导（类似电线但效率低，概率性传导）
 * - 深灰色带金属光泽
 */

/** 硅的通电状态 */
const siliconCharge = new Map<string, number>();
const CHARGE_DURATION = 4;

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function getCharge(x: number, y: number): number {
  return siliconCharge.get(key(x, y)) ?? 0;
}

function setCharge(x: number, y: number, charge: number): void {
  if (charge <= 0) {
    siliconCharge.delete(key(x, y));
  } else {
    siliconCharge.set(key(x, y), charge);
  }
}

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

    // 导电逻辑
    let charge = getCharge(x, y);
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    if (charge <= 0) {
      // 未通电：检查是否被电弧/雷电/火花激活
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);

        if (ACTIVATORS.has(nid)) {
          charge = CHARGE_DURATION;
          setCharge(x, y, charge);
          break;
        }

        // 被相邻通电硅传导（概率性，效率低于电线）
        if (nid === 188 && getCharge(nx, ny) === CHARGE_DURATION && Math.random() < 0.5) {
          charge = CHARGE_DURATION;
          setCharge(x, y, charge);
          break;
        }

        // 被通电电线传导
        if (nid === 44 && Math.random() < 0.3) {
          charge = CHARGE_DURATION;
          setCharge(x, y, charge);
          break;
        }
      }
    }

    if (charge > 0) {
      // 通电中：升温 + 刷新颜色
      world.addTemp(x, y, 2);
      world.set(x, y, 188);

      charge--;
      setCharge(x, y, charge);

      // 通电结束时：末端释放火花
      if (charge <= 0) {
        let siliconNeighbors = 0;
        let emptyDirs: [number, number][] = [];
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          if (world.get(nx, ny) === 188 || world.get(nx, ny) === 44) {
            siliconNeighbors++;
          } else if (world.isEmpty(nx, ny)) {
            emptyDirs.push([dx, dy]);
          }
        }

        // 末端释放火花（概率性）
        if (siliconNeighbors <= 1 && emptyDirs.length > 0 && Math.random() < 0.6) {
          const [dx, dy] = emptyDirs[Math.floor(Math.random() * emptyDirs.length)];
          const sx = x + dx, sy = y + dy;
          world.set(sx, sy, 28); // 火花
          world.markUpdated(sx, sy);
        }
      }
    }
  },
};

registerMaterial(Silicon);
