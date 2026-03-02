import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 闪电球 —— 罕见的球状闪电现象
 * - 气体，缓慢漂浮移动
 * - 随机方向漂移，偏好向上
 * - 接触导体（金属10/铜85/锡86/电线44）释放电弧
 * - 接触水(2)/盐水(24)产生蒸汽(8)并消失
 * - 接触可燃物（木头4/油5/火药22）点燃
 * - 有限寿命，随机消散为火花(28)
 * - 发出明亮的蓝白色光芒
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

export const BallLightning: MaterialDef = {
  id: 111,
  name: '闪电球',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 亮白蓝核心
      r = 200 + Math.floor(Math.random() * 55);
      g = 210 + Math.floor(Math.random() * 45);
      b = 255;
    } else if (t < 0.7) {
      // 电弧蓝
      r = 140 + Math.floor(Math.random() * 40);
      g = 170 + Math.floor(Math.random() * 40);
      b = 240 + Math.floor(Math.random() * 15);
    } else if (t < 0.9) {
      // 紫蓝辉光
      r = 170 + Math.floor(Math.random() * 40);
      g = 140 + Math.floor(Math.random() * 30);
      b = 235 + Math.floor(Math.random() * 20);
    } else {
      // 白色闪光
      r = 240 + Math.floor(Math.random() * 15);
      g = 240 + Math.floor(Math.random() * 15);
      b = 255;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.1,
  update(x: number, y: number, world: WorldAPI) {
    // 初始化寿命（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 80 + Math.floor(Math.random() * 120);
      world.setAge(x, y, life);
    }

    life--;

    // 寿命耗尽，消散为火花
    if (life <= 0) {
      world.set(x, y, Math.random() < 0.5 ? 28 : 0); // 火花或消失
      world.wakeArea(x, y);
      return;
    }

    // 加热周围
    world.setTemp(x, y, 150);

    // 检查8方向邻居（显式展开，无HOF）
    // 上
    if (world.inBounds(x, y - 1)) { const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 86 || nid === 44) && Math.random() < 0.1) { if (world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1) && Math.random() < 0.3) { world.set(nx, ny - 1, 28); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); } if (world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1) && Math.random() < 0.3) { world.set(nx, ny + 1, 28); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); } if (world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny) && Math.random() < 0.3) { world.set(nx - 1, ny, 28); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); } if (world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny) && Math.random() < 0.3) { world.set(nx + 1, ny, 28); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); } world.addTemp(nx, ny, 30); life -= 10; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.3) { world.set(nx, ny, 8); world.markUpdated(nx, ny); world.set(x, y, 28); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if ((nid === 4 || nid === 5 || nid === 22) && Math.random() < 0.2) { world.set(nx, ny, 6); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
    }
    // 下
    if (world.inBounds(x, y + 1)) { const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 86 || nid === 44) && Math.random() < 0.1) { if (world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1) && Math.random() < 0.3) { world.set(nx, ny - 1, 28); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); } if (world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1) && Math.random() < 0.3) { world.set(nx, ny + 1, 28); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); } if (world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny) && Math.random() < 0.3) { world.set(nx - 1, ny, 28); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); } if (world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny) && Math.random() < 0.3) { world.set(nx + 1, ny, 28); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); } world.addTemp(nx, ny, 30); life -= 10; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.3) { world.set(nx, ny, 8); world.markUpdated(nx, ny); world.set(x, y, 28); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if ((nid === 4 || nid === 5 || nid === 22) && Math.random() < 0.2) { world.set(nx, ny, 6); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
    }
    // 左
    if (world.inBounds(x - 1, y)) { const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 86 || nid === 44) && Math.random() < 0.1) { if (world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1) && Math.random() < 0.3) { world.set(nx, ny - 1, 28); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); } if (world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1) && Math.random() < 0.3) { world.set(nx, ny + 1, 28); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); } if (world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny) && Math.random() < 0.3) { world.set(nx - 1, ny, 28); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); } if (world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny) && Math.random() < 0.3) { world.set(nx + 1, ny, 28); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); } world.addTemp(nx, ny, 30); life -= 10; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.3) { world.set(nx, ny, 8); world.markUpdated(nx, ny); world.set(x, y, 28); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if ((nid === 4 || nid === 5 || nid === 22) && Math.random() < 0.2) { world.set(nx, ny, 6); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
    }
    // 右
    if (world.inBounds(x + 1, y)) { const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 86 || nid === 44) && Math.random() < 0.1) { if (world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1) && Math.random() < 0.3) { world.set(nx, ny - 1, 28); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); } if (world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1) && Math.random() < 0.3) { world.set(nx, ny + 1, 28); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); } if (world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny) && Math.random() < 0.3) { world.set(nx - 1, ny, 28); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); } if (world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny) && Math.random() < 0.3) { world.set(nx + 1, ny, 28); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); } world.addTemp(nx, ny, 30); life -= 10; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.3) { world.set(nx, ny, 8); world.markUpdated(nx, ny); world.set(x, y, 28); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if ((nid === 4 || nid === 5 || nid === 22) && Math.random() < 0.2) { world.set(nx, ny, 6); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
    }
    // 左上
    if (world.inBounds(x - 1, y - 1)) { const nx = x - 1, ny = y - 1; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 86 || nid === 44) && Math.random() < 0.1) { if (world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1) && Math.random() < 0.3) { world.set(nx, ny - 1, 28); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); } if (world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny) && Math.random() < 0.3) { world.set(nx - 1, ny, 28); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); } world.addTemp(nx, ny, 30); life -= 10; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.3) { world.set(nx, ny, 8); world.markUpdated(nx, ny); world.set(x, y, 28); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if ((nid === 4 || nid === 5 || nid === 22) && Math.random() < 0.2) { world.set(nx, ny, 6); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
    }
    // 右上
    if (world.inBounds(x + 1, y - 1)) { const nx = x + 1, ny = y - 1; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 86 || nid === 44) && Math.random() < 0.1) { if (world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1) && Math.random() < 0.3) { world.set(nx, ny - 1, 28); world.markUpdated(nx, ny - 1); world.wakeArea(nx, ny - 1); } if (world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny) && Math.random() < 0.3) { world.set(nx + 1, ny, 28); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); } world.addTemp(nx, ny, 30); life -= 10; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.3) { world.set(nx, ny, 8); world.markUpdated(nx, ny); world.set(x, y, 28); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if ((nid === 4 || nid === 5 || nid === 22) && Math.random() < 0.2) { world.set(nx, ny, 6); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
    }
    // 左下
    if (world.inBounds(x - 1, y + 1)) { const nx = x - 1, ny = y + 1; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 86 || nid === 44) && Math.random() < 0.1) { if (world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1) && Math.random() < 0.3) { world.set(nx, ny + 1, 28); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); } if (world.inBounds(nx - 1, ny) && world.isEmpty(nx - 1, ny) && Math.random() < 0.3) { world.set(nx - 1, ny, 28); world.markUpdated(nx - 1, ny); world.wakeArea(nx - 1, ny); } world.addTemp(nx, ny, 30); life -= 10; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.3) { world.set(nx, ny, 8); world.markUpdated(nx, ny); world.set(x, y, 28); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if ((nid === 4 || nid === 5 || nid === 22) && Math.random() < 0.2) { world.set(nx, ny, 6); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
    }
    // 右下
    if (world.inBounds(x + 1, y + 1)) { const nx = x + 1, ny = y + 1; const nid = world.get(nx, ny);
      if ((nid === 10 || nid === 85 || nid === 86 || nid === 44) && Math.random() < 0.1) { if (world.inBounds(nx, ny + 1) && world.isEmpty(nx, ny + 1) && Math.random() < 0.3) { world.set(nx, ny + 1, 28); world.markUpdated(nx, ny + 1); world.wakeArea(nx, ny + 1); } if (world.inBounds(nx + 1, ny) && world.isEmpty(nx + 1, ny) && Math.random() < 0.3) { world.set(nx + 1, ny, 28); world.markUpdated(nx + 1, ny); world.wakeArea(nx + 1, ny); } world.addTemp(nx, ny, 30); life -= 10; }
      if ((nid === 2 || nid === 24) && Math.random() < 0.3) { world.set(nx, ny, 8); world.markUpdated(nx, ny); world.set(x, y, 28); world.wakeArea(x, y); world.wakeArea(nx, ny); return; }
      if ((nid === 4 || nid === 5 || nid === 22) && Math.random() < 0.2) { world.set(nx, ny, 6); world.markUpdated(nx, ny); world.wakeArea(nx, ny); }
    }

    // 漂浮移动：偏好向上，随机方向（swap 自动迁移 age）
    const moveDir: [number, number][] = [];
    // 向上概率高
    if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) moveDir.push([0, -1], [0, -1]);
    // 左右
    if (world.inBounds(x - 1, y) && world.isEmpty(x - 1, y)) moveDir.push([-1, 0]);
    if (world.inBounds(x + 1, y) && world.isEmpty(x + 1, y)) moveDir.push([1, 0]);
    // 斜上
    if (world.inBounds(x - 1, y - 1) && world.isEmpty(x - 1, y - 1)) moveDir.push([-1, -1]);
    if (world.inBounds(x + 1, y - 1) && world.isEmpty(x + 1, y - 1)) moveDir.push([1, -1]);
    // 偶尔向下
    if (world.inBounds(x, y + 1) && world.isEmpty(x, y + 1) && Math.random() < 0.2) moveDir.push([0, 1]);

    if (moveDir.length > 0 && Math.random() < 0.4) {
      const [mx, my] = moveDir[Math.floor(Math.random() * moveDir.length)];
      const nx = x + mx, ny = y + my;
      world.swap(x, y, nx, ny); // swap 自动迁移 age
      world.setAge(nx, ny, life); // 更新生命值到新位置（age 被 swap 迁移后再更新 life）
      world.markUpdated(nx, ny);
      world.wakeArea(nx, ny);
    } else {
      world.setAge(x, y, life);
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(BallLightning);
