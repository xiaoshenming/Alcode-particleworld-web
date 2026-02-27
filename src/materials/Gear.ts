import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 齿轮 —— 机械固体
 * - 固体，不受重力影响
 * - 接触粉末/沙子时将其向一侧推动（传送带效果）
 * - 接触电线/雷电时激活，推动力增强
 * - 高温（>800°）融化为熔岩
 * - 遇酸液缓慢腐蚀
 * - 视觉上呈深灰色带金属齿纹
 */

/** 可被齿轮推动的粉末类材质 */
const PUSHABLE = new Set([1, 15, 20, 21, 22, 23, 66, 79]); // 沙、雪、泥土、黏土、火药、盐、硫磺、钠

export const Gear: MaterialDef = {
  id: 88,
  name: '齿轮',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰钢色
      r = 85 + Math.floor(Math.random() * 15);
      g = 90 + Math.floor(Math.random() * 15);
      b = 95 + Math.floor(Math.random() * 15);
    } else if (phase < 0.7) {
      // 中灰色
      r = 110 + Math.floor(Math.random() * 15);
      g = 112 + Math.floor(Math.random() * 15);
      b = 115 + Math.floor(Math.random() * 15);
    } else {
      // 齿纹亮色
      r = 140 + Math.floor(Math.random() * 20);
      g = 135 + Math.floor(Math.random() * 20);
      b = 125 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温融化
    if (temp > 800) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, 800);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;

    // 检测是否被电力激活（邻居有电线或雷电）
    let powered = false;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid === 44 || nid === 16) { // 电线或雷电
        powered = true;
        break;
      }
    }

    // 推动概率：通电时更强
    const pushChance = powered ? 0.4 : 0.12;
    // 推动方向基于位置的奇偶性（模拟齿轮旋转方向）
    const pushDir = (x + y) % 2 === 0 ? 1 : -1;

    // 推动上方的粉末（传送带效果）
    const aboveY = y - 1;
    if (world.inBounds(x, aboveY)) {
      const aboveId = world.get(x, aboveY);
      if (PUSHABLE.has(aboveId) && Math.random() < pushChance) {
        const targetX = x + pushDir;
        if (world.inBounds(targetX, aboveY) && world.isEmpty(targetX, aboveY)) {
          world.swap(x, aboveY, targetX, aboveY);
          world.wakeArea(x, aboveY);
          world.wakeArea(targetX, aboveY);
        }
      }
    }

    // 邻居交互
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 推动相邻粉末
      if (PUSHABLE.has(nid) && Math.random() < pushChance) {
        const targetX = nx + pushDir;
        const targetY = ny;
        if (world.inBounds(targetX, targetY) && world.isEmpty(targetX, targetY)) {
          world.swap(nx, ny, targetX, targetY);
          world.wakeArea(nx, ny);
          world.wakeArea(targetX, targetY);
        }
      }

      // 遇酸液腐蚀
      if (nid === 9 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }
  },
};

registerMaterial(Gear);
