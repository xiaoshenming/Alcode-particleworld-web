import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电浆 —— 超高温电离气体
 * - 气体，密度 0.08（极轻）
 * - 短寿命：8~20帧后消失
 * - 导电：沿电线(44)传播，产生更多电浆
 * - 极高温(5000°)：熔化一切金属
 * - 遇水(2)产生蒸汽爆炸
 * - 亮紫蓝色发光，颜色闪烁剧烈
 * - 随机跳跃移动（类似闪电）
 */

/** 电浆寿命 */
const plasmaLife = new Map<string, number>();

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function getLife(x: number, y: number): number {
  return plasmaLife.get(key(x, y)) ?? 0;
}

function setLife(x: number, y: number, life: number): void {
  if (life <= 0) {
    plasmaLife.delete(key(x, y));
  } else {
    plasmaLife.set(key(x, y), life);
  }
}

/** 可被电浆熔化的金属材质 → 产物 */
const MELTABLE: Map<number, number> = new Map([
  [10, 113], // 金属 → 液态金属
  [85, 148], // 铜 → 液态铜
  [17, 92],  // 玻璃 → 液态玻璃
  [14, 2],   // 冰 → 水
  [15, 2],   // 雪 → 水
]);

/** 可被点燃的材质 */
const IGNITABLE = new Set([4, 5, 13, 22, 25, 26, 46]); // 木头、油、植物、火药、蜡、液蜡、木炭

export const ElectroPlasma: MaterialDef = {
  id: 202,
  name: '电浆',
  color() {
    // 亮紫蓝色剧烈闪烁
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 亮紫色
      r = 180 + Math.floor(Math.random() * 75);
      g = 80 + Math.floor(Math.random() * 60);
      b = 255;
    } else if (phase < 0.65) {
      // 亮蓝色
      r = 100 + Math.floor(Math.random() * 80);
      g = 150 + Math.floor(Math.random() * 80);
      b = 255;
    } else if (phase < 0.85) {
      // 白色闪光
      r = 230 + Math.floor(Math.random() * 25);
      g = 220 + Math.floor(Math.random() * 35);
      b = 255;
    } else {
      // 深紫
      r = 150 + Math.floor(Math.random() * 50);
      g = 50 + Math.floor(Math.random() * 40);
      b = 240 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.08,
  update(x: number, y: number, world: WorldAPI) {
    // 初始化寿命
    let life = getLife(x, y);
    if (life === 0) {
      life = 8 + Math.floor(Math.random() * 13); // 8~20 帧
      setLife(x, y, life);
    }

    // 刷新颜色（剧烈闪烁）
    world.set(x, y, 202);

    // 极高温
    world.setTemp(x, y, 5000);

    // 检查邻居交互（含对角线）
    const dirs: [number, number][] = [
      [0, -1], [0, 1], [-1, 0], [1, 0],
      [-1, -1], [1, -1], [-1, 1], [1, 1],
    ];

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 向周围传递极高温
      world.addTemp(nx, ny, 50);

      // 导电：沿电线传播，产生更多电浆
      if (nid === 44 && Math.random() < 0.4) {
        // 在电线的另一侧空位产生新电浆
        const fx = nx + dx, fy = ny + dy;
        if (world.inBounds(fx, fy) && world.isEmpty(fx, fy)) {
          world.set(fx, fy, 202);
          world.markUpdated(fx, fy);
          world.wakeArea(fx, fy);
        }
        continue;
      }

      // 遇水产生蒸汽爆炸
      if (nid === 2) {
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 爆炸扩散：周围水也变蒸汽
        for (const [ex, ey] of dirs) {
          const bx = nx + ex, by = ny + ey;
          if (world.inBounds(bx, by) && world.get(bx, by) === 2 && Math.random() < 0.5) {
            world.set(bx, by, 8);
            world.markUpdated(bx, by);
            world.wakeArea(bx, by);
          }
        }
        life -= 3; // 加速消亡
        continue;
      }

      // 熔化金属
      const meltTo = MELTABLE.get(nid);
      if (meltTo !== undefined && Math.random() < 0.3) {
        world.set(nx, ny, meltTo);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        continue;
      }

      // 点燃可燃物
      if (IGNITABLE.has(nid) && Math.random() < 0.5) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
      }
    }

    // 寿命递减
    life--;
    setLife(x, y, life);

    if (life <= 0) {
      // 消散：变为火花或空气
      world.set(x, y, Math.random() < 0.3 ? 28 : 0);
      setLife(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 随机跳跃移动（类似闪电，可跳1~2格）
    const jumpDist = Math.random() < 0.4 ? 2 : 1;
    const jdx = (Math.floor(Math.random() * 3) - 1) * jumpDist;
    const jdy = (Math.floor(Math.random() * 3) - 1) * jumpDist;
    const jx = x + jdx, jy = y + jdy;

    if (jx !== x || jy !== y) {
      if (world.inBounds(jx, jy) && world.isEmpty(jx, jy)) {
        world.swap(x, y, jx, jy);
        setLife(jx, jy, life);
        setLife(x, y, 0);
        world.markUpdated(jx, jy);
        world.wakeArea(jx, jy);
        return;
      }
    }

    // 备选：向上飘动
    if (y > 0 && world.isEmpty(x, y - 1)) {
      world.swap(x, y, x, y - 1);
      setLife(x, y - 1, life);
      setLife(x, y, 0);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(ElectroPlasma);
