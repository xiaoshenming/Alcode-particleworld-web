import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 苔藓 —— 在潮湿的石头/泥土表面缓慢生长
 * 需要邻近水源才能蔓延，可燃，高温枯死
 */

/** 苔藓可以附着生长的基底材质 */
const SUBSTRATE = new Set([3, 20, 21, 36]); // 石头、泥土、黏土、混凝土

/** 水系材质（提供湿度） */
const MOISTURE = new Set([2, 24, 35]); // 水、盐水、湿水泥

export const Moss: MaterialDef = {
  id: 49,
  name: '苔藓',
  color() {
    const r = 30 + Math.floor(Math.random() * 25);
    const g = 100 + Math.floor(Math.random() * 50);
    const b = 20 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固体，不移动
  update(x: number, y: number, world: WorldAPI) {
    // 高温枯死（>80°变成泥土）
    if (world.getTemp(x, y) > 80) {
      world.set(x, y, 20); // 泥土
      return;
    }

    // 检查邻居
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1],
      [x - 1, y], [x + 1, y],
    ];

    let hasMoisture = false;
    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      if (MOISTURE.has(world.get(nx, ny))) {
        hasMoisture = true;
        break;
      }
    }

    // 没有水源则不生长
    if (!hasMoisture) return;

    // 缓慢蔓延：向邻近的空气格子生长（前提是该空气格子旁边有基底）
    if (Math.random() > 0.01) return; // 1% 概率尝试生长

    // 随机选一个方向
    const shuffled = neighbors.sort(() => Math.random() - 0.5);
    for (const [nx, ny] of shuffled) {
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) !== 0) continue; // 只能长到空气位置

      // 检查目标位置是否邻近基底
      let nearSubstrate = false;
      for (const [sx, sy] of [[nx, ny - 1], [nx, ny + 1], [nx - 1, ny], [nx + 1, ny]] as [number, number][]) {
        if (!world.inBounds(sx, sy)) continue;
        if (SUBSTRATE.has(world.get(sx, sy))) {
          nearSubstrate = true;
          break;
        }
      }

      if (nearSubstrate) {
        world.set(nx, ny, 49); // 生长苔藓
        world.markUpdated(nx, ny);
        return;
      }
    }
  },
};

registerMaterial(Moss);
