import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 白磷 —— 极易自燃的化学物质
 * - 粉末状固体，受重力下落（类似沙子）
 * - 接触空气（周围有空格）时自动升温，达到阈值自燃
 * - 燃烧产生剧毒烟雾（毒气）
 * - 水可以暂时抑制自燃（降温）
 * - 淡黄/白色半透明外观，燃烧时发出绿色光
 */

export const Phosphorus: MaterialDef = {
  id: 62,
  name: '白磷',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 淡黄白色
      r = 230 + Math.floor(Math.random() * 25);
      g = 225 + Math.floor(Math.random() * 20);
      b = 180 + Math.floor(Math.random() * 30);
    } else if (phase < 0.85) {
      // 蜡黄色
      r = 210 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 20);
      b = 140 + Math.floor(Math.random() * 25);
    } else {
      // 微绿光泽（磷光）
      r = 200 + Math.floor(Math.random() * 20);
      g = 230 + Math.floor(Math.random() * 25);
      b = 170 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 自燃：温度超过 40° 就着火
    if (temp > 40) {
      // 燃烧产生毒气
      world.set(x, y, Math.random() < 0.4 ? 6 : 18); // 火或毒气
      world.wakeArea(x, y);
      return;
    }

    // 检测周围是否暴露在空气中（自燃条件）
    let airCount = 0;
    let waterContact = false;
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 0) airCount++;
      if (nid === 2 || nid === 24) waterContact = true; // 水或盐水

      // 被火直接点燃
      if (nid === 6 || nid === 11 || nid === 55) { // 火、熔岩、等离子体
        world.set(x, y, 6);
        world.wakeArea(x, y);
        return;
      }
    }

    // 暴露在空气中自动升温（白磷自燃特性）
    if (airCount > 0 && !waterContact) {
      world.addTemp(x, y, airCount * 0.8);
    }

    // 水接触降温
    if (waterContact) {
      world.addTemp(x, y, -3);
    }

    // 重力下落（粉末行为）
    if (y < world.height - 1) {
      const belowId = world.get(x, y + 1);
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      // 密度置换（沉入液体）
      if (belowId !== 0 && world.getDensity(x, y + 1) < 1.8) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y);
        world.markUpdated(x, y + 1);
        return;
      }
      // 滑落
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(Phosphorus);
