import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 三氟化氮 —— 强氧化性气体，半导体清洗剂
 * - 气体，密度 -0.3（比空气略重，缓慢上升）
 * - 高温(>200°)时分解为氟气(278)
 * - 接触火(6)/熔岩(11)/等离子体(55) → 剧烈燃烧产生火花(28)
 * - 腐蚀有机物：木头(4)/植物(13)/藤蔓(57) → 烟(7)
 * - 有生命周期，最终消散
 * - 无色微黄绿
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

export const NitrogenTrifluoride: MaterialDef = {
  id: 303,
  name: '三氟化氮',
  category: '气体',
  description: '强氧化性气体，半导体清洗剂',
  density: -0.3,
  color() {
    const v = 220 + Math.floor(Math.random() * 30);
    const g = v;
    const r = v - 15;
    const b = v - 25;
    return (0xAA << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 100 + Math.floor(Math.random() * 100);
      world.setAge(x, y, life);
    }

    life--;
    world.setAge(x, y, life);

    if (life <= 0) {
      world.set(x, y, 0);
      return;
    }

    const temp = world.getTemp(x, y);

    // 高温分解为氟气
    if (temp > 200) {
      world.set(x, y, 278); // 氟气
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触高温源 → 剧烈燃烧
      if ((nid === 6 || nid === 11 || nid === 55) && Math.random() < 0.6) {
        world.set(x, y, 28); // 火花
        world.addTemp(x, y, 80);
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀有机物
      if ((nid === 4 || nid === 13 || nid === 57) && Math.random() < 0.05) {
        world.set(nx, ny, 7); // 烟
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 缓慢上升（swap 自动迁移 age）
    if (y > 0 && world.isEmpty(x, y - 1)) {
      if (Math.random() < 0.4) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        return;
      }
    }

    // 斜上方
    if (y > 0) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1) && Math.random() < 0.3) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }

    // 水平漂移
    if (Math.random() < 0.4) {
      const windDir = world.getWind();
      const windStr = world.getWindStrength();
      let dir: number;
      if (windDir !== 0 && Math.random() < windStr) {
        dir = windDir;
      } else {
        dir = Math.random() < 0.5 ? -1 : 1;
      }
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(NitrogenTrifluoride);
