import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 白磷火 —— 白磷燃烧产生的剧烈火焰
 * - 气体/火焰，密度 0.15
 * - 短寿命：10~30帧后变为烟(7)
 * - 极高温(2000°+)：点燃一切可燃物
 * - 遇水不灭（白磷火特性），但会产生蒸汽
 * - 黄绿色火焰，颜色闪烁
 * - 向上飘动，随机左右
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

/** 可燃材质 ID 集合 */
const FLAMMABLE = new Set([4, 5, 13, 22, 25, 26, 46, 49, 62, 134]); // 木头、油、植物、火药、蜡、液蜡、木炭、苔藓、白磷、干草

export const PhosphorusFire: MaterialDef = {
  id: 194,
  name: '白磷火',
  color() {
    // 黄绿色火焰，闪烁效果
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 亮黄绿
      r = 180 + Math.floor(Math.random() * 40);
      g = 230 + Math.floor(Math.random() * 25);
      b = 30 + Math.floor(Math.random() * 40);
    } else if (t < 0.7) {
      // 绿白色（高温核心）
      r = 200 + Math.floor(Math.random() * 55);
      g = 255;
      b = 100 + Math.floor(Math.random() * 60);
    } else {
      // 暗绿色（边缘）
      r = 100 + Math.floor(Math.random() * 50);
      g = 180 + Math.floor(Math.random() * 40);
      b = 20 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.15,
  update(x: number, y: number, world: WorldAPI) {
    // 白磷火产生极高温
    world.setTemp(x, y, 2000);

    // 初始化/递减生命值（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 10 + Math.floor(Math.random() * 21); // 10~30 帧
      world.setAge(x, y, life);
    }
    life--;
    world.setAge(x, y, life);

    // 刷新颜色（闪烁）：set()会重置age，需立即恢复
    world.set(x, y, 194);
    world.setAge(x, y, life);

    // 生命耗尽 → 变为烟
    if (life <= 0) {
      world.set(x, y, 7); // 烟
      return;
    }

    // 检查邻居进行反应
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1],
      [x - 1, y], [x + 1, y],
      [x - 1, y - 1], [x + 1, y - 1],
      [x - 1, y + 1], [x + 1, y + 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水不灭！但产生蒸汽（白磷火特性）
      if (nid === 2) {
        world.set(nx, ny, 8); // 水变蒸汽
        world.markUpdated(nx, ny);
        // 白磷火不熄灭，继续燃烧
        continue;
      }

      // 点燃可燃物（高概率，因为温度极高）
      if (FLAMMABLE.has(nid) && Math.random() < 0.15) {
        world.set(nx, ny, 6); // 点燃
        world.markUpdated(nx, ny);
      }

      // 点燃金属类（极高温可以点燃某些金属）
      if (nid === 62 && Math.random() < 0.2) {
        world.set(nx, ny, 194); // 白磷引燃更多白磷火
        world.markUpdated(nx, ny);
      }
    }

    // 向上飘动（swap 自动迁移 age）
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.5) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上方飘动
    if (y > 0 && Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }

    // 随机水平漂移
    if (Math.random() < 0.2) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(PhosphorusFire);
