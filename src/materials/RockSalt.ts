import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 岩盐 —— 天然盐矿结晶
 * - 固体，不可移动
 * - 遇水(2)缓慢溶解为盐水(24)
 * - 遇酸液(9)产生毒气(18)并溶解
 * - 高温(>800)熔化为熔盐(83)
 * - 遇熔岩(11)直接熔化
 * - 阻挡苔藓(49)和藤蔓(57)生长
 * - 视觉上呈半透明粉白色晶体
 */

export const RockSalt: MaterialDef = {
  id: 112,
  name: '岩盐',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 粉白色
      r = 230 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 215 + Math.floor(Math.random() * 20);
    } else if (t < 0.7) {
      // 淡橙粉
      r = 225 + Math.floor(Math.random() * 25);
      g = 195 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 20);
    } else if (t < 0.9) {
      // 透明白
      r = 240 + Math.floor(Math.random() * 15);
      g = 235 + Math.floor(Math.random() * 15);
      b = 235 + Math.floor(Math.random() * 15);
    } else {
      // 深粉色脉络
      r = 210 + Math.floor(Math.random() * 20);
      g = 170 + Math.floor(Math.random() * 20);
      b = 175 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化为熔盐
    if (temp > 800) {
      world.set(x, y, 83); // 熔盐
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水缓慢溶解为盐水
      if (nid === 2 && Math.random() < 0.008) {
        world.set(x, y, 24); // 盐水
        world.wakeArea(x, y);
        return;
      }

      // 遇酸液产生毒气并溶解
      if (nid === 9 && Math.random() < 0.03) {
        world.set(x, y, 18); // 毒气
        world.set(nx, ny, 0); // 酸液消耗
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇熔岩直接熔化
      if (nid === 11 && Math.random() < 0.1) {
        world.set(x, y, 83); // 熔盐
        world.wakeArea(x, y);
        return;
      }

      // 阻挡苔藓和藤蔓（它们不会蔓延到岩盐上）
      // 这是被动效果，不需要主动处理

      // 遇蒸馏水溶解更慢
      if (nid === 97 && Math.random() < 0.004) {
        world.set(x, y, 24); // 盐水
        world.wakeArea(x, y);
        return;
      }
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.03) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(RockSalt);
