import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蒸汽云 —— 高温水蒸气凝结的浓密云团
 * - 气体，缓慢上升
 * - 比普通蒸汽(8)更持久，不会快速消散
 * - 遇冷(<5°)凝结为水(2)滴落
 * - 遇极冷(<-20°)凝结为雪(15)
 * - 吸收更多蒸汽(8)后体积增大
 * - 遇风力横向移动
 * - 视觉上呈浓白色半透明
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

export const SteamCloud: MaterialDef = {
  id: 123,
  name: '蒸汽云',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 浓白色
      r = 230 + Math.floor(Math.random() * 20);
      g = 232 + Math.floor(Math.random() * 18);
      b = 235 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      // 淡灰白
      r = 215 + Math.floor(Math.random() * 20);
      g = 218 + Math.floor(Math.random() * 18);
      b = 225 + Math.floor(Math.random() * 15);
    } else {
      // 微蓝白
      r = 210 + Math.floor(Math.random() * 15);
      g = 220 + Math.floor(Math.random() * 15);
      b = 235 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.15,
  update(x: number, y: number, world: WorldAPI) {
    // 初始化寿命（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 150 + Math.floor(Math.random() * 100);
      world.setAge(x, y, life);
    }

    life--;
    const temp = world.getTemp(x, y);

    // 寿命耗尽消散
    if (life <= 0) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 遇冷凝结
    if (temp < -20 && Math.random() < 0.1) {
      world.set(x, y, 15); // 雪
      world.wakeArea(x, y);
      return;
    }
    if (temp < 5 && Math.random() < 0.05) {
      world.set(x, y, 2); // 水
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 吸收蒸汽增加寿命
      if (nid === 8 && Math.random() < 0.15) {
        world.set(nx, ny, 123); // 转化为蒸汽云
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        life += 10;
      }
    }

    // 风力影响（swap 自动迁移 age）
    const wind = world.getWind();
    const windStr = world.getWindStrength();
    if (wind !== 0 && Math.random() < windStr * 0.4) {
      const nx = x + wind;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.setAge(nx, y, life);
        world.markUpdated(nx, y);
        world.wakeArea(nx, y);
        return;
      }
    }

    // 缓慢上升（swap 自动迁移 age）
    if (world.inBounds(x, y - 1) && Math.random() < 0.25) {
      const above = world.get(x, y - 1);
      if (above === 0) {
        world.swap(x, y, x, y - 1);
        world.setAge(x, y - 1, life);
        world.markUpdated(x, y - 1);
        world.wakeArea(x, y - 1);
        return;
      }
    }

    // 水平漂移（swap 自动迁移 age）
    if (Math.random() < 0.15) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.setAge(nx, y, life);
        world.markUpdated(nx, y);
        world.wakeArea(nx, y);
        return;
      }
    }

    world.setAge(x, y, life);
    world.wakeArea(x, y);
  },
};

registerMaterial(SteamCloud);
