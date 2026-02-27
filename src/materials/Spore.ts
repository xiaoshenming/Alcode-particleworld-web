import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 孢子 —— 空气中飘散的生物粒子
 * - 气体，比空气略重，缓慢下沉
 * - 受风力影响飘散
 * - 落在泥土(20)/沼泽(54)上生长为菌丝(70)
 * - 落在水中溶解
 * - 遇火/高温被杀死（消失）
 * - 有限寿命，一段时间后自然消亡
 * - 视觉上呈黄绿色微小颗粒
 */

export const Spore: MaterialDef = {
  id: 93,
  name: '孢子',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 黄绿色
      r = 160 + Math.floor(Math.random() * 30);
      g = 180 + Math.floor(Math.random() * 30);
      b = 50 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗绿
      r = 120 + Math.floor(Math.random() * 20);
      g = 150 + Math.floor(Math.random() * 25);
      b = 40 + Math.floor(Math.random() * 15);
    } else {
      // 亮黄高光
      r = 200 + Math.floor(Math.random() * 30);
      g = 210 + Math.floor(Math.random() * 20);
      b = 70 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.15, // 比空气略重，缓慢下沉
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温杀死
    if (temp > 60 && Math.random() < 0.15) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 自然消亡（有限寿命）
    if (Math.random() < 0.003) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 落在泥土/沼泽上生长为菌丝
      if ((nid === 20 || nid === 54) && dy === 1 && Math.random() < 0.1) {
        world.set(x, y, 70); // 菌丝
        world.wakeArea(x, y);
        return;
      }

      // 落在苔藓上增殖
      if (nid === 49 && Math.random() < 0.05) {
        world.set(x, y, 70); // 菌丝
        world.wakeArea(x, y);
        return;
      }

      // 遇水溶解
      if (nid === 2 && Math.random() < 0.1) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 遇火被杀
      if (nid === 6 && Math.random() < 0.3) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 酸液杀死
      if (nid === 9 && Math.random() < 0.2) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 缓慢下沉
    if (y + 1 < world.height && Math.random() < 0.15) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }
    }

    // 风力飘散
    const wind = world.getWind();
    const windStr = world.getWindStrength();
    if (wind !== 0 && Math.random() < windStr * 0.4) {
      const nx = x + wind;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
        return;
      }
    }

    // 随机飘动（布朗运动）
    if (Math.random() < 0.2) {
      const dx = Math.random() < 0.5 ? -1 : 1;
      const dy = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dx, ny = y + dy;
      if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
        world.swap(x, y, nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(Spore);
