import { DIRS8 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 火 —— 短生命周期，向上蔓延，点燃可燃物，遇水熄灭
 * 使用颜色 alpha 通道以外的随机值模拟闪烁
 * 使用 World 内置 age 替代 Map<string,number>
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

/** 可燃材质 ID 集合 */
const FLAMMABLE = new Set([4, 5, 13, 25, 26, 46, 49]); // 木头、油、植物、蜡、液蜡、木炭、苔藓

export const Fire: MaterialDef = {
  id: 6,
  name: '火',
  color() {
    const t = Math.random();
    // 火焰颜色从黄到红渐变
    const r = 255;
    const g = Math.floor(80 + t * 175);
    const b = Math.floor(t * 40);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.1, // 极轻，几乎像气体
  update(x: number, y: number, world: WorldAPI) {
    // 火产生热量
    world.setTemp(x, y, 200);

    // 获取/初始化生命值（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 30 + Math.floor(Math.random() * 40); // 30~70 帧寿命
    }

    // 生命递减
    life--;

    // 刷新颜色（闪烁效果）：set()会重置age，需立即恢复
    world.set(x, y, 6);
    world.setAge(x, y, life);

    // 生命耗尽 → 变成空气（小概率变成烟）
    if (life <= 0) {
      if (Math.random() < 0.3) {
        world.set(x, y, 7); // 烟
      } else {
        world.set(x, y, 0); // 空气
      }
      return;
    }

    // 检查四周邻居，进行化学反应
    for (const [dx, dy] of DIRS8) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const neighborId = world.get(nx, ny);

      // 火 + 水 → 蒸汽（火熄灭）
      if (neighborId === 2) {
        world.set(x, y, 8); // 当前火变蒸汽
        world.set(nx, ny, 8); // 水变蒸汽
        return;
      }

      // 点燃可燃物（概率性蔓延）
      if (FLAMMABLE.has(neighborId) && Math.random() < 0.05) {
        // 木头燃烧有概率产生木炭
        if (neighborId === 4 && Math.random() < 0.4) {
          world.set(nx, ny, 46); // 木炭
        } else {
          world.set(nx, ny, 6); // 点燃
        }
        world.markUpdated(nx, ny);
      }
    }

    // 火焰偶尔向上飘动（swap 自动迁移 age）
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.2) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(Fire);
