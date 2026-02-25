import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 激光 —— 发射器（固体），每帧向下发射光束
 * 光束瞬时传播，遇到非空气/非光束粒子停止
 * 光束可点燃可燃物、融化冰
 */

/** 光束材质 ID */
const LASER_BEAM_ID = 48;

/** 光束可穿透的材质（空气和光束自身） */
function isTransparent(id: number): boolean {
  return id === 0 || id === LASER_BEAM_ID || id === 17; // 空气、光束、玻璃
}

/** 可被激光点燃的材质 */
const LASER_IGNITABLE = new Set([4, 5, 13, 22, 25, 26, 46]); // 木头、油、植物、火药、蜡、液蜡、木炭

export const Laser: MaterialDef = {
  id: 47,
  name: '激光',
  color() {
    const r = 255;
    const g = 20 + Math.floor(Math.random() * 20);
    const b = 20 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 发射器不动
  update(x: number, y: number, world: WorldAPI) {
    // 向下发射光束
    for (let dy = 1; dy < world.height - y; dy++) {
      const by = y + dy;
      const targetId = world.get(x, by);

      if (isTransparent(targetId)) {
        // 放置光束粒子
        world.set(x, by, LASER_BEAM_ID);
        world.markUpdated(x, by);
        world.addTemp(x, by, 5); // 光束产生热量
      } else {
        // 遇到障碍物：对目标产生效果
        if (LASER_IGNITABLE.has(targetId)) {
          // 点燃可燃物
          if (Math.random() < 0.1) {
            world.set(x, by, 6); // 火
          }
        } else if (targetId === 14) {
          // 融化冰
          if (Math.random() < 0.05) {
            world.set(x, by, 2); // 水
          }
        } else if (targetId === 15) {
          // 融化雪
          if (Math.random() < 0.1) {
            world.set(x, by, 2); // 水
          }
        }
        world.addTemp(x, by, 3);
        break; // 光束被阻挡
      }
    }
  },
};

/** 光束 —— 短寿命粒子，每帧由发射器重新生成 */
export const LaserBeam: MaterialDef = {
  id: LASER_BEAM_ID,
  name: '光束',
  color() {
    const r = 255;
    const g = 50 + Math.floor(Math.random() * 60);
    const b = 50 + Math.floor(Math.random() * 30);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0,
  update(x: number, y: number, world: WorldAPI) {
    // 光束每帧自动消失，由发射器重新生成
    // 检查上方是否有发射器或光束（光束链）
    let hasSource = false;
    for (let dy = 1; dy <= y; dy++) {
      const aboveId = world.get(x, y - dy);
      if (aboveId === 47) { // 找到发射器
        hasSource = true;
        break;
      }
      if (aboveId !== LASER_BEAM_ID) break; // 光束链断了
    }

    if (!hasSource) {
      world.set(x, y, 0); // 没有光源，消失
    }
  },
};

registerMaterial(Laser);
registerMaterial(LaserBeam);
