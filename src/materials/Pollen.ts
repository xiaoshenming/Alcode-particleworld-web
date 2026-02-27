import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 花粉 —— 植物散播的微小颗粒
 * - 粉末，极轻，受风力影响大
 * - 缓慢下落，风中飘散
 * - 落在泥土(20)/沼泽(54)/苔藓石(110)上生长为植物(13)
 * - 落在水(2)上漂浮并缓慢溶解
 * - 遇火(6)瞬间燃烧（粉尘爆炸）
 * - 高浓度花粉遇火花(28)引发连锁燃烧
 * - 视觉上呈淡黄色微粒
 */

export const Pollen: MaterialDef = {
  id: 114,
  name: '花粉',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 淡黄色
      r = 230 + Math.floor(Math.random() * 25);
      g = 210 + Math.floor(Math.random() * 30);
      b = 100 + Math.floor(Math.random() * 40);
    } else if (t < 0.8) {
      // 金黄色
      r = 240 + Math.floor(Math.random() * 15);
      g = 195 + Math.floor(Math.random() * 25);
      b = 60 + Math.floor(Math.random() * 30);
    } else {
      // 浅绿黄
      r = 210 + Math.floor(Math.random() * 20);
      g = 215 + Math.floor(Math.random() * 25);
      b = 90 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.15,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温燃烧
    if (temp > 80) {
      world.set(x, y, 6); // 火
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火/火花瞬间燃烧
      if ((nid === 6 || nid === 28 || nid === 55) && Math.random() < 0.8) {
        world.set(x, y, 6); // 火
        world.wakeArea(x, y);
        return;
      }

      // 遇熔岩燃烧
      if (nid === 11) {
        world.set(x, y, 6);
        world.wakeArea(x, y);
        return;
      }
    }

    // 检查下方
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);

      // 落在泥土/沼泽/苔藓石上生长为植物
      if ((below === 20 || below === 54 || below === 110) && Math.random() < 0.02) {
        world.set(x, y, 13); // 植物
        world.wakeArea(x, y);
        return;
      }

      // 落在水上漂浮
      if (below === 2) {
        if (Math.random() < 0.01) {
          world.set(x, y, 0); // 溶解消失
          world.wakeArea(x, y);
          return;
        }
        // 水平漂移
        const wind = world.getWind();
        const drift = wind !== 0 ? wind : (Math.random() < 0.5 ? -1 : 1);
        const nx = x + drift;
        if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
          world.swap(x, y, nx, y);
          world.markUpdated(nx, y);
          world.wakeArea(nx, y);
          return;
        }
        world.wakeArea(x, y);
        return;
      }

      // 正常下落
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下滑落
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
    }

    // 风力飘散
    const wind = world.getWind();
    const windStr = world.getWindStrength();
    if (wind !== 0 && Math.random() < windStr * 0.6) {
      const nx = x + wind;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        world.wakeArea(nx, y);
        return;
      }
    }

    // 无风时随机飘动
    if (Math.random() < 0.15) {
      const drift = Math.random() < 0.5 ? -1 : 1;
      const nx = x + drift;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        world.wakeArea(nx, y);
      }
    }
  },
};

registerMaterial(Pollen);
