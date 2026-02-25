import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蒸汽 —— 气体，比烟更轻，向上快速飘散
 * 遇冷（到达顶部或生命耗尽）凝结为水
 */

const steamLife = new Map<string, number>();

function getLife(x: number, y: number): number {
  return steamLife.get(`${x},${y}`) ?? 0;
}

function setLife(x: number, y: number, life: number): void {
  if (life <= 0) {
    steamLife.delete(`${x},${y}`);
  } else {
    steamLife.set(`${x},${y}`, life);
  }
}

export const Steam: MaterialDef = {
  id: 8,
  name: '蒸汽',
  color() {
    const v = 200 + Math.floor(Math.random() * 40);
    return (0xBB << 24) | (v << 16) | (v << 8) | v; // 半透明白色
  },
  density: 0.02, // 比烟还轻
  update(x: number, y: number, world: WorldAPI) {
    // 初始化生命值
    let life = getLife(x, y);
    if (life === 0) {
      life = 80 + Math.floor(Math.random() * 80); // 80~160 帧
      setLife(x, y, life);
    }

    life--;
    setLife(x, y, life);

    // 生命耗尽 → 凝结为水滴（30%概率）或消失
    if (life <= 0) {
      if (Math.random() < 0.3) {
        world.set(x, y, 2); // 凝结为水
      } else {
        world.set(x, y, 0);
      }
      return;
    }

    // 快速上升
    if (y > 0) {
      // 尝试上升 1~2 格
      const rise = Math.random() < 0.4 ? 2 : 1;
      for (let d = rise; d >= 1; d--) {
        const ny = y - d;
        if (ny >= 0 && world.isEmpty(x, ny)) {
          world.swap(x, y, x, ny);
          setLife(x, ny, life);
          setLife(x, y, 0);
          world.markUpdated(x, ny);
          return;
        }
      }

      // 斜上方
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          world.swap(x, y, nx, y - 1);
          setLife(nx, y - 1, life);
          setLife(x, y, 0);
          world.markUpdated(nx, y - 1);
          return;
        }
      }
    }

    // 水平漂移（蒸汽扩散更快）
    if (Math.random() < 0.5) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        setLife(nx, y, life);
        setLife(x, y, 0);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(Steam);
