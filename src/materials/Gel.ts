import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 凝胶 —— 半固体弹性材质
 * - 受重力影响，但流动性极低（粘稠）
 * - 其他粒子穿过时被减速（粘滞效果）
 * - 吸收水分：接触水时膨胀（水变凝胶）
 * - 高温（>150°）融化为液态，蒸发为蒸汽
 * - 低温（<-20°）冻结变硬（不再流动）
 * - 酸液可溶解
 * - 视觉上呈半透明蓝紫色
 */

export const Gel: MaterialDef = {
  id: 82,
  name: '凝胶',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 蓝紫色主体
      r = 120 + Math.floor(Math.random() * 30);
      g = 100 + Math.floor(Math.random() * 25);
      b = 200 + Math.floor(Math.random() * 40);
    } else if (phase < 0.7) {
      // 淡蓝色
      r = 100 + Math.floor(Math.random() * 25);
      g = 130 + Math.floor(Math.random() * 30);
      b = 210 + Math.floor(Math.random() * 35);
    } else {
      // 高光透明感
      r = 150 + Math.floor(Math.random() * 40);
      g = 145 + Math.floor(Math.random() * 35);
      b = 230 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5, // 比水重，比沙轻
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温蒸发
    if (temp > 150) {
      world.set(x, y, 8); // 蒸汽
      world.wakeArea(x, y);
      return;
    }

    // 低温冻结 → 不流动，只做邻居检查
    const frozen = temp < -20;

    // 邻居交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 吸收水分膨胀
      if (nid === 2 && Math.random() < 0.03) {
        world.set(nx, ny, 82);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 酸液溶解
      if (nid === 9 && Math.random() < 0.04) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    if (frozen) return;

    // 缓慢重力下落（粘稠）
    if (y + 1 < world.height && Math.random() < 0.15) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 斜下滑落（极低概率）
      if (Math.random() < 0.3) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        for (const d of [dir, -dir]) {
          const nx = x + d;
          if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1) && world.isEmpty(nx, y)) {
            world.swap(x, y, nx, y + 1);
            world.wakeArea(x, y);
            world.wakeArea(nx, y + 1);
            return;
          }
        }
      }
    }

    // 极缓慢水平扩散
    if (Math.random() < 0.03) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
      }
    }
  },
};

registerMaterial(Gel);
