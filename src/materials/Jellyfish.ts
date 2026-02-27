import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 荧光水母 —— 发光的水生生物
 * - 液体/生物，密度 1.2（略重于水，在水中缓慢下沉）
 * - 发光：蓝绿色荧光脉动效果，需要 wakeArea 保持活跃
 * - 在水(2)中存活并缓慢游动（随机方向移动，只在水中移动）
 * - 离开水后死亡：不在水旁边时缓慢变为泡沫(51)
 * - 遇酸(9)立即溶解
 * - 半透明蓝绿色发光体
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 在水中（无死亡计时）; age=N: 离水死亡倒计时剩余N帧
 */

export const Jellyfish: MaterialDef = {
  id: 205,
  name: '荧光水母',
  color() {
    // 半透明蓝绿色发光，脉动效果
    const pulse = Math.random();
    let r: number, g: number, b: number;
    if (pulse < 0.4) {
      // 亮蓝绿
      r = 30 + Math.floor(Math.random() * 40);
      g = 200 + Math.floor(Math.random() * 55);
      b = 220 + Math.floor(Math.random() * 35);
    } else if (pulse < 0.7) {
      // 深蓝绿
      r = 20 + Math.floor(Math.random() * 25);
      g = 160 + Math.floor(Math.random() * 40);
      b = 190 + Math.floor(Math.random() * 40);
    } else if (pulse < 0.9) {
      // 亮白闪光（发光高峰）
      r = 120 + Math.floor(Math.random() * 60);
      g = 240 + Math.floor(Math.random() * 15);
      b = 250 + Math.floor(Math.random() * 5);
    } else {
      // 暗蓝绿（发光低谷）
      r = 10 + Math.floor(Math.random() * 15);
      g = 120 + Math.floor(Math.random() * 30);
      b = 150 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.2,
  update(x: number, y: number, world: WorldAPI) {
    // 保持活跃以维持发光脉动
    world.wakeArea(x, y);

    // 先读 timer（在 set 之前，避免 age 被重置）
    let timer = world.getAge(x, y);

    // 刷新颜色（脉动闪烁）：set()会重置age，需立即恢复
    world.set(x, y, 205);
    world.setAge(x, y, timer);

    // 检查四邻
    const dirs = DIRS4;
    let nearWater = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸立即溶解
      if (nid === 9) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      if (nid === 2) {
        nearWater = true;
      }
    }

    // 离水死亡机制
    if (!nearWater) {
      if (timer === 0) {
        timer = 30 + Math.floor(Math.random() * 20); // 30~50帧后死亡
      }
      timer--;
      world.setAge(x, y, timer);

      if (timer <= 0) {
        world.set(x, y, 51); // 变为泡沫
        world.wakeArea(x, y);
        return;
      }

      // 离水时受重力下落（swap 自动迁移 age）
      if (y < world.height - 1 && world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      return;
    }

    // 在水中：重置死亡计时
    world.setAge(x, y, 0);

    // 在水中缓慢游动（随机方向，只移动到水格子中，swap 自动迁移 age）
    if (Math.random() < 0.3) {
      // 随机方向，轻微向上偏好（水母喜欢上浮）
      const moveX = Math.floor(Math.random() * 3) - 1;
      const moveY = Math.random() < 0.3 ? -1 : Math.floor(Math.random() * 3) - 1;

      const nx = x + moveX, ny = y + moveY;
      if (world.inBounds(nx, ny) && world.get(nx, ny) === 2) {
        // 与水交换位置（在水中游动）
        world.swap(x, y, nx, ny);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 密度略重于水，缓慢下沉
    if (y < world.height - 1 && world.get(x, y + 1) === 2 && Math.random() < 0.05) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Jellyfish);
