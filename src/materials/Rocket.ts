import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 焰火弹 —— 可发射的烟花弹
 * - 粉末，受重力下落
 * - 遇火(6)/火花(28)/熔岩(11)/雷电(16)点燃
 * - 点燃后高速向上飞行
 * - 到达一定高度或碰到固体后爆炸
 * - 爆炸产生大量彩色火花(28)和烟(7)
 * - 视觉上呈深红色圆柱体
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未点燃; age=N: 剩余燃料=N（已点燃飞行中）
 */

export const Rocket: MaterialDef = {
  id: 119,
  name: '焰火弹',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 深红色
      r = 180 + Math.floor(Math.random() * 30);
      g = 30 + Math.floor(Math.random() * 20);
      b = 25 + Math.floor(Math.random() * 20);
    } else if (t < 0.8) {
      // 暗红色
      r = 150 + Math.floor(Math.random() * 30);
      g = 20 + Math.floor(Math.random() * 15);
      b = 20 + Math.floor(Math.random() * 15);
    } else {
      // 金色条纹
      r = 210 + Math.floor(Math.random() * 30);
      g = 170 + Math.floor(Math.random() * 30);
      b = 40 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.0,
  update(x: number, y: number, world: WorldAPI) {
    const fuel = world.getAge(x, y);

    // 已点燃状态（age > 0）：向上飞行
    if (fuel > 0) {
      // 燃料耗尽或碰到顶部 → 爆炸
      if (fuel <= 1 || y <= 2) {
        world.setAge(x, y, 0); // 清除燃料
        rocketExplode(x, y, world);
        return;
      }

      // 下方产生火焰尾迹
      if (world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) {
        world.set(x, y + 1, Math.random() < 0.6 ? 6 : 7); // 火或烟
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
      }

      // 向上移动 1~2 格（swap 自动迁移 age）
      const speed = fuel > 10 ? 2 : 1;
      let ny = y;
      for (let i = 0; i < speed; i++) {
        if (world.inBounds(x, ny - 1)) {
          const above = world.get(x, ny - 1);
          if (above === 0 || above === 7 || above === 8) {
            if (above !== 0) world.set(x, ny - 1, 0);
            world.swap(x, ny, x, ny - 1); // age 迁移到 (x, ny-1)
            world.markUpdated(x, ny - 1);
            world.wakeArea(x, ny);
            ny = ny - 1;
          } else {
            // 碰到固体 → 爆炸
            world.setAge(x, ny, 0);
            rocketExplode(x, ny, world);
            return;
          }
        } else {
          world.setAge(x, ny, 0);
          rocketExplode(x, ny, world);
          return;
        }
      }

      // 在最终位置更新剩余燃料
      world.setAge(x, ny, fuel - 1);
      world.wakeArea(x, ny);
      return;
    }

    // 未点燃状态：检查是否被点燃
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if ((nid === 6 || nid === 28 || nid === 11 || nid === 16) && Math.random() < 0.5) {
        // 点燃！设置燃料
        world.setAge(x, y, 20 + Math.floor(Math.random() * 15));
        world.wakeArea(x, y);
        return;
      }
    }

    // 高温自燃
    if (world.getTemp(x, y) > 100) {
      world.setAge(x, y, 20 + Math.floor(Math.random() * 15));
      world.wakeArea(x, y);
      return;
    }

    // 粉末下落（swap 自动迁移 age）
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

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
  },
};

/** 焰火弹爆炸：产生大量彩色火花 */
function rocketExplode(cx: number, cy: number, world: WorldAPI): void {
  const radius = 5;
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const nx = cx + dx, ny = cy + dy;
      if (!world.inBounds(nx, ny)) continue;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      if (world.isEmpty(nx, ny) || world.get(nx, ny) === 7 || world.get(nx, ny) === 8) {
        if (Math.random() < 0.5) {
          world.set(nx, ny, 28); // 火花
        } else if (Math.random() < 0.3) {
          world.set(nx, ny, 7); // 烟
        }
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }
  }
  world.set(cx, cy, 28); // 中心变火花
  world.wakeArea(cx, cy);
}

registerMaterial(Rocket);
