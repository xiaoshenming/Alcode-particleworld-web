import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 熔盐 —— 高温液态盐
 * - 液体，流动性好
 * - 盐(id=23)加热到 >300° 时融化生成
 * - 温度降到 <250° 时重新结晶为盐
 * - 极高温（>600°）蒸发为蒸汽
 * - 接触水时剧烈反应（产生蒸汽和盐水）
 * - 接触金属时缓慢腐蚀
 * - 视觉上呈橙红色发光液体
 */

export const MoltenSalt: MaterialDef = {
  id: 83,
  name: '熔盐',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 橙红色
      r = 230 + Math.floor(Math.random() * 25);
      g = 120 + Math.floor(Math.random() * 30);
      b = 30 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 亮橙色
      r = 240 + Math.floor(Math.random() * 15);
      g = 160 + Math.floor(Math.random() * 30);
      b = 40 + Math.floor(Math.random() * 25);
    } else {
      // 白热高光
      r = 250 + Math.floor(Math.random() * 5);
      g = 200 + Math.floor(Math.random() * 30);
      b = 100 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.2, // 比水重
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 维持高温（熔盐自身是热源）
    if (temp < 300) {
      world.addTemp(x, y, 2);
    }

    // 极高温蒸发
    if (temp > 600) {
      world.set(x, y, 8); // 蒸汽
      world.wakeArea(x, y);
      return;
    }

    // 冷却结晶为盐
    if (temp < 250 && Math.random() < 0.05) {
      world.set(x, y, 23); // 盐
      world.wakeArea(x, y);
      return;
    }

    // 向周围传热
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 传热给邻居
      if (world.getTemp(nx, ny) < temp) {
        world.addTemp(nx, ny, 1.5);
        world.addTemp(x, y, -0.5);
      }

      // 接触水 → 剧烈反应
      if (nid === 2) {
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 自身有概率变盐水
        if (Math.random() < 0.15) {
          world.set(x, y, 24); // 盐水
          world.setTemp(x, y, 50);
          world.wakeArea(x, y);
          return;
        }
      }

      // 腐蚀金属（缓慢）
      if (nid === 10 && Math.random() < 0.003) {
        world.set(nx, ny, 72); // 铁锈
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 重力下落
    if (y + 1 < world.height) {
      const belowId = world.get(x, y + 1);
      if (belowId === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < MoltenSalt.density && belowDensity < Infinity) {
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

    // 水平流动
    if (Math.random() < 0.4) {
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

registerMaterial(MoltenSalt);
