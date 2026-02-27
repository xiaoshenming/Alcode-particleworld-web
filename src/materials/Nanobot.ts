import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 纳米机器人 —— 自复制微型机器
 * - 粉末，密度 2.0（会下落）
 * - 自复制：消耗邻近金属(10)/铜(85)/锡(86)来复制自身
 * - 分解有机物：消灭苔藓(49)、菌丝(70)、藤蔓(57)等
 * - 遇水短路：接触水(2)有概率被摧毁
 * - 遇电磁脉冲（雷电16）被摧毁
 * - 有限寿命：小概率自然失活
 * - 银灰色带微闪
 */

/** 可被纳米机器人消耗复制的金属 */
const CONSUME_METALS = new Set([10, 85, 86, 44, 72]); // 金属、铜、锡、电线、铁锈

/** 可被纳米机器人分解的有机物 */
const ORGANIC_TARGETS = new Set([49, 57, 70, 93, 100, 156, 225, 13]); // 苔藓、藤蔓、菌丝、孢子、蘑菇、水草、发光苔藓、植物

export const Nanobot: MaterialDef = {
  id: 255,
  name: '纳米机器人',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银灰
      const base = 150 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 5;
      b = base + 10;
    } else if (phase < 0.8) {
      // 深灰
      const base = 120 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 3;
      b = base + 8;
    } else {
      // 微闪光
      r = 180 + Math.floor(Math.random() * 30);
      g = 195 + Math.floor(Math.random() * 30);
      b = 210 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.0,
  update(x: number, y: number, world: WorldAPI) {
    // 有限寿命
    if (Math.random() < 0.003) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水短路
      if (nid === 2 && Math.random() < 0.1) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 遇雷电被摧毁
      if (nid === 16 && Math.random() < 0.5) {
        world.set(x, y, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 消耗金属自复制
      if (CONSUME_METALS.has(nid) && Math.random() < 0.02) {
        world.set(nx, ny, 255); // 复制
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 分解有机物
      if (ORGANIC_TARGETS.has(nid) && Math.random() < 0.04) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // === 粉末下落 ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      if (world.getDensity(x, y + 1) < 2.0 && below !== 255) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 斜下滑落
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (!world.inBounds(nx, y)) continue;
      if (y < world.height - 1 && world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 随机横向移动（模拟自主运动）
    if (Math.random() < 0.15) {
      const d = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + d, y) && world.isEmpty(x + d, y)) {
        world.swap(x, y, x + d, y);
        world.markUpdated(x + d, y);
      }
    }
  },
};

registerMaterial(Nanobot);
