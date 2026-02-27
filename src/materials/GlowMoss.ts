import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 发光苔藓 —— 生物发光的苔藓植物
 * - 固体/生物，密度 Infinity（附着不动）
 * - 发出柔和的蓝绿色光芒（需要 wakeArea 保持活跃）
 * - 需要水分：邻近有水(2)时缓慢生长扩散
 * - 干燥环境下缓慢枯萎（变为干草134）
 * - 可燃：遇火着火
 * - 遇酸溶解
 */

export const GlowMoss: MaterialDef = {
  id: 225,
  name: '发光苔藓',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 亮蓝绿色发光
      r = 30 + Math.floor(Math.random() * 30);
      g = 180 + Math.floor(Math.random() * 50);
      b = 140 + Math.floor(Math.random() * 40);
    } else if (phase < 0.7) {
      // 深绿色基底
      r = 20 + Math.floor(Math.random() * 25);
      g = 130 + Math.floor(Math.random() * 40);
      b = 90 + Math.floor(Math.random() * 30);
    } else if (phase < 0.9) {
      // 发光高峰（亮白绿）
      r = 80 + Math.floor(Math.random() * 50);
      g = 220 + Math.floor(Math.random() * 30);
      b = 180 + Math.floor(Math.random() * 40);
    } else {
      // 暗绿（发光低谷）
      r = 15 + Math.floor(Math.random() * 15);
      g = 100 + Math.floor(Math.random() * 30);
      b = 70 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    // 保持活跃以维持发光
    world.wakeArea(x, y);
    world.set(x, y, 225); // 刷新颜色（脉动）

    // 检查四邻
    const dirs = DIRS4;
    let nearWater = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火着火
      if (nid === 6 && Math.random() < 0.1) {
        world.set(x, y, 6);
        world.wakeArea(x, y);
        return;
      }

      // 遇酸溶解
      if (nid === 9 && Math.random() < 0.08) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      if (nid === 2) {
        nearWater = true;
      }
    }

    // 有水时缓慢生长
    if (nearWater && Math.random() < 0.005) {
      // 随机方向扩散
      const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
      const nx = x + dx, ny = y + dy;
      if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
        world.set(nx, ny, 225);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 无水时缓慢枯萎
    if (!nearWater && Math.random() < 0.002) {
      world.set(x, y, 134); // 变干草
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(GlowMoss);
