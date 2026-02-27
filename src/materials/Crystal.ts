import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 水晶 —— 从盐水/水中缓慢结晶生长的固体
 * - 不可移动，密度无限
 * - 邻近盐水时缓慢生长（向空气方向扩展）
 * - 低温加速结晶，高温融化回盐水
 * - 激光/雷电可击碎水晶变成沙子
 * - 视觉上呈紫色/蓝色半透明晶体
 */

/** 可触发结晶的液体 */
const CRYSTAL_SOURCE = new Set([24, 23]); // 盐水、盐

export const Crystal: MaterialDef = {
  id: 53,
  name: '水晶',
  color() {
    // 紫蓝色晶体，带随机色调变化
    const phase = Math.random();
    const r = 140 + Math.floor(phase * 60);
    const g = 80 + Math.floor(Math.random() * 50);
    const b = 200 + Math.floor(Math.random() * 55);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温融化（>150°变成盐水）
    if (temp > 150) {
      world.set(x, y, 24); // 盐水
      return;
    }

    // 被雷电击碎
    const dirs = [...DIRS4];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid === 16) { // 雷电
        world.set(x, y, 1); // 沙子
        return;
      }
    }

    // 结晶生长：检查邻居是否有盐水/盐
    let hasSource = false;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (CRYSTAL_SOURCE.has(world.get(nx, ny))) {
        hasSource = true;
        break;
      }
    }

    if (!hasSource) return;

    // 生长概率：低温加速
    const growChance = temp < 10 ? 0.03 : temp < 20 ? 0.015 : 0.005;
    if (Math.random() > growChance) return;

    // 向空气方向生长
    const shuffled = dirs.sort(() => Math.random() - 0.5);
    for (const [dx, dy] of shuffled) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.isEmpty(nx, ny)) {
        world.set(nx, ny, 53);
        world.markUpdated(nx, ny);
        return;
      }
    }
  },
};

registerMaterial(Crystal);
