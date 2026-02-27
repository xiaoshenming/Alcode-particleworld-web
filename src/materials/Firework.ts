import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 烟花 —— 点燃后上升，到达一定高度爆炸产生彩色火花
 * - 放置后静止，接触火/高温点燃
 * - 点燃后快速上升 30~60 格
 * - 上升结束后爆炸：在周围产生大量火花(28)
 * 使用 World 内置 age 替代 Map<string,number>
 * age=0: 未点燃; age=N: 已点燃，剩余上升帧数=N
 */

export const Firework: MaterialDef = {
  id: 27,
  name: '烟花',
  color() {
    const r = 180 + Math.floor(Math.random() * 20);
    const g = 50 + Math.floor(Math.random() * 20);
    const b = 50 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 暗红色
  },
  density: 3, // 未点燃时像粉末
  update(x: number, y: number, world: WorldAPI) {
    // age=0: 未点燃; age>0: 已点燃，剩余上升帧数
    let state = world.getAge(x, y);

    // 未点燃状态：检查是否被点燃
    if (state === 0) {
      const neighbors: [number, number][] = [
        [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
      ];
      let ignited = false;
      for (const [nx, ny] of neighbors) {
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if (nid === 6 || nid === 11) { // 火或熔岩
          ignited = true;
          break;
        }
      }
      if (world.getTemp(x, y) > 100) ignited = true;

      if (ignited) {
        // 点燃！设置上升帧数
        state = 30 + Math.floor(Math.random() * 30); // 30~60 帧
        world.setAge(x, y, state);
      } else {
        // 未点燃：粉末物理（���落），swap 自动迁移 age
        if (y < world.height - 1 && world.isEmpty(x, y + 1)) {
          world.swap(x, y, x, y + 1);
          world.markUpdated(x, y + 1);
        }
        return;
      }
    }

    // 已点燃：上升
    state--;

    // 刷新颜色（尾焰闪烁）：set()会重置age，需立即恢复
    world.set(x, y, 27);
    world.setAge(x, y, state);

    // 尾部留下火焰
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.6) {
      world.set(x, y + 1, 6); // 火
    }

    // 上升（swap 自动迁移 age）
    if (state > 0 && y > 0) {
      if (world.isEmpty(x, y - 1)) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);

        // 轻微左右摆动
        if (Math.random() < 0.2) {
          const dx = Math.random() < 0.5 ? -1 : 1;
          const nx = x + dx;
          // 注意：烟花已经移到 y-1 了
          if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
            world.swap(x, y - 1, nx, y - 1);
            world.markUpdated(nx, y - 1);
          }
        }
        return;
      }
      // 撞到障碍物也爆炸
    }

    // 爆炸！
    world.set(x, y, 0);

    // 在周围产生火花
    const radius = 4 + Math.floor(Math.random() * 3); // 爆炸半径 4~6
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const dist = dx * dx + dy * dy;
        if (dist > radius * radius) continue;
        // 不是每个格子都产生火花，有随机性
        if (Math.random() < 0.4) continue;

        const nx = x + dx;
        const ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (!world.isEmpty(nx, ny)) continue;

        world.set(nx, ny, 28); // 火花
        world.markUpdated(nx, ny);
      }
    }
  },
};

registerMaterial(Firework);
