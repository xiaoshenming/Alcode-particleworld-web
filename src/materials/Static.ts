import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 静电 —— 摩擦产生的电荷积累
 * - 气体，快速消散
 * - 接触金属(10)/铜(85)/电线(44)传导并产生火花(28)
 * - 接触水(2)/盐水(24)立即消散
 * - 吸引轻质粒子（花粉114/纤维91/孢子93）
 * - 积累到一定密度时放电为雷电(16)
 * - 有限寿命，自然消散
 * - 视觉上呈淡蓝色闪烁
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

export const Static: MaterialDef = {
  id: 121,
  name: '静电',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 淡蓝白
      r = 180 + Math.floor(Math.random() * 40);
      g = 200 + Math.floor(Math.random() * 30);
      b = 240 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      // 电弧蓝
      r = 150 + Math.floor(Math.random() * 30);
      g = 180 + Math.floor(Math.random() * 30);
      b = 230 + Math.floor(Math.random() * 25);
    } else {
      // 白色闪光
      r = 230 + Math.floor(Math.random() * 25);
      g = 235 + Math.floor(Math.random() * 20);
      b = 250 + Math.floor(Math.random() * 5);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.05,
  update(x: number, y: number, world: WorldAPI) {
    // 初始化寿命（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 15 + Math.floor(Math.random() * 20);
      world.setAge(x, y, life);
    }

    life--;

    // 寿命耗尽消散
    if (life <= 0) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互（4方向显式展开，无HOF）
    let neighborStatic = 0;
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 44) && Math.random() < 0.15) { world.set(x, y, 28); world.wakeArea(x, y); return; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.4) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if ((nid === 114 || nid === 91 || nid === 93) && Math.random() < 0.1) { world.swap(nx, ny, x, y); world.setAge(nx, ny, life); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 121) neighborStatic++;
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 44) && Math.random() < 0.15) { world.set(x, y, 28); world.wakeArea(x, y); return; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.4) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if ((nid === 114 || nid === 91 || nid === 93) && Math.random() < 0.1) { world.swap(nx, ny, x, y); world.setAge(nx, ny, life); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 121) neighborStatic++;
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 44) && Math.random() < 0.15) { world.set(x, y, 28); world.wakeArea(x, y); return; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.4) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if ((nid === 114 || nid === 91 || nid === 93) && Math.random() < 0.1) { world.swap(nx, ny, x, y); world.setAge(nx, ny, life); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 121) neighborStatic++;
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 44) && Math.random() < 0.15) { world.set(x, y, 28); world.wakeArea(x, y); return; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.4) { world.set(x, y, 0); world.wakeArea(x, y); return; }
      if ((nid === 114 || nid === 91 || nid === 93) && Math.random() < 0.1) { world.swap(nx, ny, x, y); world.setAge(nx, ny, life); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if (nid === 121) neighborStatic++;
    }

    // 高密度放电为雷电
    if (neighborStatic >= 3 && Math.random() < 0.2) {
      world.set(x, y, 16); // 雷电
      world.wakeArea(x, y);
      return;
    }

    // 随机漂移：随机起始方向遍历空位（无HOF，无临时数组）
    if (Math.random() < 0.3) {
      const start = Math.floor(Math.random() * 4);
      const dxs = [0, 0, -1, 1];
      const dys = [-1, 1, 0, 0];
      for (let i = 0; i < 4; i++) {
        const di = (start + i) % 4;
        const nx = x + dxs[di], ny = y + dys[di];
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
          world.swap(x, y, nx, ny);
          world.setAge(nx, ny, life);
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
          return;
        }
      }
    }
    world.setAge(x, y, life);
    world.wakeArea(x, y);
  },
};

registerMaterial(Static);
