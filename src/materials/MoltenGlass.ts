import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态玻璃 —— 高温熔融态玻璃
 * - 液体，受重力影响，流动缓慢（高粘度）
 * - 冷却到 <600° 凝固为玻璃(17)
 * - 自带高温（1200°），会点燃可燃物
 * - 遇水急速冷却，产生蒸汽
 * - 可以熔化沙子（沙子是玻璃原料）
 * - 视觉上呈亮橙红色，带黄色高光
 */

export const MoltenGlass: MaterialDef = {
  id: 92,
  name: '液态玻璃',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 亮橙色
      r = 240 + Math.floor(Math.random() * 15);
      g = 140 + Math.floor(Math.random() * 40);
      b = 20 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 深橙红
      r = 220 + Math.floor(Math.random() * 20);
      g = 100 + Math.floor(Math.random() * 30);
      b = 10 + Math.floor(Math.random() * 15);
    } else {
      // 黄白高光
      r = 255;
      g = 200 + Math.floor(Math.random() * 40);
      b = 80 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 4.5, // 比熔岩略轻
  update(x: number, y: number, world: WorldAPI) {
    let temp = world.getTemp(x, y);

    // 保持高温
    if (temp < 800) {
      world.setTemp(x, y, 800);
      temp = 800;
    }

    // 自然冷却
    world.addTemp(x, y, -0.5);

    // 冷却凝固为玻璃
    if (temp < 600 && Math.random() < 0.08) {
      world.set(x, y, 17); // 玻璃
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水急速冷却 + 产生蒸汽
      if (nid === 2) {
        world.addTemp(x, y, -200);
        world.set(nx, ny, 8); // 蒸汽
        world.wakeArea(nx, ny);
        world.wakeArea(x, y);
        continue;
      }

      // 熔化沙子为液态玻璃
      if (nid === 1 && Math.random() < 0.03) {
        world.set(nx, ny, 92); // 沙→液态玻璃
        world.setTemp(nx, ny, 800);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        continue;
      }

      // 点燃可燃物（木头、纤维、火药等）
      if ((nid === 4 || nid === 91 || nid === 22 || nid === 5) && Math.random() < 0.15) {
        world.set(nx, ny, 6); // 火
        world.setTemp(nx, ny, 150);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        continue;
      }

      // 传热给邻居
      const nTemp = world.getTemp(nx, ny);
      if (temp > nTemp) {
        const transfer = (temp - nTemp) * 0.08;
        world.addTemp(nx, ny, transfer);
        world.addTemp(x, y, -transfer);
      }
    }

    // 缓慢重力下落（高粘度）
    if (y + 1 < world.height && Math.random() < 0.3) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < 4.5 && belowDensity !== Infinity && Math.random() < 0.2) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下流动
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
    }

    // 极缓慢水平扩散
    if (Math.random() < 0.05) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
      }
    }
  },
};

registerMaterial(MoltenGlass);
