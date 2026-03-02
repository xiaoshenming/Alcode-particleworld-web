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

    // 检查邻居（显式4方向，无HOF）
    let hasMoisture = false;
    if (!hasMoisture && world.inBounds(x, y - 1) && MOISTURE.has(world.get(x, y - 1))) { hasMoisture = true; }
    if (!hasMoisture && world.inBounds(x, y + 1) && MOISTURE.has(world.get(x, y + 1))) { hasMoisture = true; }
    if (!hasMoisture && world.inBounds(x - 1, y) && MOISTURE.has(world.get(x - 1, y))) { hasMoisture = true; }
    if (!hasMoisture && world.inBounds(x + 1, y) && MOISTURE.has(world.get(x + 1, y))) { hasMoisture = true; }

    // 没有水源则不生长
    if (!hasMoisture) return;

    // 缓慢蔓延：向邻近的空气格子生长（前提是该空气格子旁边有基底）
    if (Math.random() > 0.01) return; // 1% 概率尝试生长

    // 随机起始方向，4方向显式展开（无HOF）
    const start = Math.floor(Math.random() * 4);
    for (let i = 0; i < 4; i++) {
      const idx = (start + i) % 4;
      const dx = idx === 0 ? 0 : idx === 1 ? 0 : idx === 2 ? -1 : 1;
      const dy = idx === 0 ? -1 : idx === 1 ? 1 : idx === 2 ? 0 : 0;
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) !== 0) continue; // 只能长到空气位置

      // 检查目标位置是否邻近基底（显式4方向，无HOF）
      let nearSubstrate = false;
      if (!nearSubstrate && world.inBounds(nx, ny - 1) && SUBSTRATE.has(world.get(nx, ny - 1))) { nearSubstrate = true; }
      if (!nearSubstrate && world.inBounds(nx, ny + 1) && SUBSTRATE.has(world.get(nx, ny + 1))) { nearSubstrate = true; }
      if (!nearSubstrate && world.inBounds(nx - 1, ny) && SUBSTRATE.has(world.get(nx - 1, ny))) { nearSubstrate = true; }
      if (!nearSubstrate && world.inBounds(nx + 1, ny) && SUBSTRATE.has(world.get(nx + 1, ny))) { nearSubstrate = true; }

      if (nearSubstrate) {
        world.set(nx, ny, 49); // 生长苔藓
        world.markUpdated(nx, ny);
        return;
      }
    }
  },
};

registerMaterial(Moss);
