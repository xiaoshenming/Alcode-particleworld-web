import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 云 —— 飘浮的水汽团
 * - 气体，缓慢向上飘浮并随风横移
 * - 遇冷（<-5°）凝结为雪
 * - 遇热（>40°）蒸发消散
 * - 积累足够密度时随机降雨（生成水滴）
 * - 蒸汽上升到高处自然聚合为云
 * - 视觉上呈白色/灰色半透明团状
 */

export const Cloud: MaterialDef = {
  id: 76,
  name: '云',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number, a: number;
    if (phase < 0.5) {
      // 白色云团
      r = 220 + Math.floor(Math.random() * 30);
      g = 225 + Math.floor(Math.random() * 25);
      b = 230 + Math.floor(Math.random() * 20);
      a = 0xA0;
    } else if (phase < 0.8) {
      // 浅灰色
      r = 190 + Math.floor(Math.random() * 30);
      g = 195 + Math.floor(Math.random() * 30);
      b = 205 + Math.floor(Math.random() * 25);
      a = 0xB0;
    } else {
      // 亮白高光
      r = 240 + Math.floor(Math.random() * 15);
      g = 242 + Math.floor(Math.random() * 13);
      b = 248 + Math.floor(Math.random() * 7);
      a = 0x90;
    }
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.05, // 极轻，比烟还轻
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温蒸发消散
    if (temp > 40) {
      world.set(x, y, 8); // 蒸汽
      world.wakeArea(x, y);
      return;
    }

    // 低温凝结为雪
    if (temp < -5 && Math.random() < 0.03) {
      world.set(x, y, 15); // 雪
      world.wakeArea(x, y);
      return;
    }

    // 降雨：下方是空气时有小概率生成水滴
    if (y + 1 < world.height && world.isEmpty(x, y + 1) && Math.random() < 0.003) {
      world.set(x, y + 1, 2); // 水
      world.markUpdated(x, y + 1);
      world.wakeArea(x, y + 1);
      // 云本身有概率消散
      if (Math.random() < 0.15) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 飘浮运动：缓慢上升 + 随风横移
    const wind = world.getWind();
    const windStr = world.getWindStrength();

    // 上升趋势
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.15) {
      world.swap(x, y, x, y - 1);
      world.wakeArea(x, y);
      world.wakeArea(x, y - 1);
      return;
    }

    // 横向飘移（受风力影响）
    let dx = 0;
    if (wind !== 0 && Math.random() < 0.3 * windStr) {
      dx = wind;
    } else if (Math.random() < 0.1) {
      dx = Math.random() < 0.5 ? -1 : 1;
    }

    if (dx !== 0) {
      const nx = x + dx;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
        return;
      }
    }

    // 吸收相邻蒸汽（蒸汽聚合为云）
    const dirs = DIRS4;
    for (const [ddx, ddy] of dirs) {
      const nx = x + ddx, ny = y + ddy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 8 && Math.random() < 0.05) { // 蒸汽
        world.set(nx, ny, 76); // 变为云
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(Cloud);
