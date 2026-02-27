import { DIRS8 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 萤火虫 —— 发光的飞行生物粒子
 * - 在空气中随机飞行，偏好向上和水平移动
 * - 夜间发光效果（颜色在黄绿之间闪烁）
 * - 遇到水会淹死，遇到火会烧死
 * - 有限寿命，死后消失
 * - 被植物/种子吸引（偏向靠近）
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

/** 致命材质 */
const DEADLY = new Set([2, 6, 9, 11, 24]); // 水、火、酸液、熔岩、盐水

/** 吸引萤火虫的材质 */
const ATTRACTIVE = new Set([12, 13]); // 种子、植物

export const Firefly: MaterialDef = {
  id: 52,
  name: '萤火虫',
  color() {
    // 黄绿色闪烁发光
    const phase = Math.random();
    const r = 180 + Math.floor(phase * 75);
    const g = 220 + Math.floor(Math.random() * 35);
    const b = 10 + Math.floor(Math.random() * 30);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.1, // 极轻，飞行
  update(x: number, y: number, world: WorldAPI) {
    // 初始化寿命（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 200 + Math.floor(Math.random() * 300); // 200~500 帧
    }

    // 刷新颜色（闪烁效果）：set()会重置age，需立即恢复
    world.set(x, y, 52);
    world.setAge(x, y, life);

    // 检查致命环境
    const dirs = DIRS8;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (DEADLY.has(world.get(nx, ny))) {
        world.set(x, y, 0); // 死亡
        return;
      }
    }

    // 寿命递减
    life--;
    world.setAge(x, y, life);
    if (life <= 0) {
      world.set(x, y, 0);
      return;
    }

    // 寻找附近植物（吸引方向）
    let attractX = 0, attractY = 0;
    const scanR = 6;
    for (let dy = -scanR; dy <= scanR; dy++) {
      for (let dx = -scanR; dx <= scanR; dx++) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (ATTRACTIVE.has(world.get(nx, ny))) {
          const dist = Math.abs(dx) + Math.abs(dy);
          if (dist > 0) {
            attractX += dx / dist;
            attractY += dy / dist;
          }
        }
      }
    }

    // 计算移动方向：随机 + 吸引力 + 轻微向上偏好
    let moveX = 0, moveY = 0;

    if (Math.random() < 0.6) {
      // 随机飞行
      moveX = Math.floor(Math.random() * 3) - 1;
      moveY = Math.floor(Math.random() * 3) - 1;
      // 轻微向上偏好
      if (Math.random() < 0.3) moveY = -1;
    }

    // 叠加吸引力
    if (Math.abs(attractX) > 0.5) moveX += attractX > 0 ? 1 : -1;
    if (Math.abs(attractY) > 0.5) moveY += attractY > 0 ? 1 : -1;

    // 限制移动范围
    moveX = Math.max(-1, Math.min(1, moveX));
    moveY = Math.max(-1, Math.min(1, moveY));

    const nx = x + moveX, ny = y + moveY;
    if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
      world.swap(x, y, nx, ny); // swap 自动迁移 age
      world.markUpdated(nx, ny);
    }
  },
};

registerMaterial(Firefly);
