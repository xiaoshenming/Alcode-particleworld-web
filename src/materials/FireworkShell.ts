import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 检查目标位置是否可以被当前密度的粒子穿过 */
function canDisplace(x: number, y: number, myDensity: number, world: WorldAPI): boolean {
  if (world.isEmpty(x, y)) return true;
  return world.getDensity(x, y) < myDensity;
}

/**
 * 烟花弹 —— 深灰色粉末，点燃后向上飞行并爆炸
 * - 粉末，可下落堆积
 * - 遇火(6)/火花(28)/熔岩(11)点燃
 * - 点燃后向上飞行（通过温度字段存储飞行状态）
 *   - 温度 > 100 表示已点燃在飞行，每帧上移并增温
 *   - 温度 > 300 时爆炸：产生大量彩色火花(28)和烟(7)
 */

/** 点燃触发源 */
const IGNITE = new Set([6, 28, 11]); // 火、火花、熔岩

export const FireworkShell: MaterialDef = {
  id: 165,
  name: '烟花弹',
  color() {
    // 深灰色外壳
    const v = 70 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (v << 16) | (v << 8) | v;
  },
  density: 2.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // === 已点燃状态：飞行中 ===
    if (temp > 100) {
      // 温度超过 300：爆炸
      if (temp > 300) {
        world.set(x, y, 0); // 清除本体

        // 爆炸：产生火花和烟
        const radius = 5 + Math.floor(Math.random() * 3); // 半径 5~7
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const dist = dx * dx + dy * dy;
            if (dist > radius * radius) continue;
            if (Math.random() < 0.35) continue; // 随机稀疏

            const nx = x + dx;
            const ny = y + dy;
            if (!world.inBounds(nx, ny)) continue;
            if (!world.isEmpty(nx, ny)) continue;

            // 外圈产生烟，内圈产生火花
            if (dist > (radius - 1) * (radius - 1) && Math.random() < 0.5) {
              world.set(nx, ny, 7); // 烟
            } else {
              world.set(nx, ny, 28); // 火花
            }
            world.markUpdated(nx, ny);
          }
        }
        return;
      }

      // 飞行中：增加温度（接近爆炸）
      world.addTemp(x, y, 8 + Math.floor(Math.random() * 5));

      // 尾部留下火焰/烟
      if (y < world.height - 1 && world.isEmpty(x, y + 1)) {
        if (Math.random() < 0.5) {
          world.set(x, y + 1, 6); // 火
        } else if (Math.random() < 0.3) {
          world.set(x, y + 1, 7); // 烟
        }
      }

      // 向上飞行
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);

        // 轻微左右摆动
        if (Math.random() < 0.2) {
          const dx = Math.random() < 0.5 ? -1 : 1;
          const nx = x + dx;
          if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
            world.swap(x, y - 1, nx, y - 1);
            world.markUpdated(nx, y - 1);
          }
        }
      } else {
        // 撞到障碍物，直接爆炸
        world.setTemp(x, y, 301);
      }
      return;
    }

    // === 未点燃状态 ===

    // 检查邻居是否有点燃源
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];
    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      if (IGNITE.has(world.get(nx, ny))) {
        // 点燃！设置温度进入飞行状态
        world.setTemp(x, y, 110);
        return;
      }
    }

    // 粉末物理：下落
    if (y >= world.height - 1) return;

    if (canDisplace(x, y + 1, FireworkShell.density, world)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && canDisplace(nx, y + 1, FireworkShell.density, world)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
  },
};

registerMaterial(FireworkShell);
