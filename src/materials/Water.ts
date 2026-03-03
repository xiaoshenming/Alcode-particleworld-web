import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 水 —— 液体类，受重力影响，可水平流动
 * 化学反应：
 * - 接触熔岩 → 蒸汽+黑曜石（与 Lava.ts 互补的双向反应）
 * - 接触盐   → 溶解为盐水（与 Salt.ts 互补，水端处理）
 * - 接触酸液 → 酸被稀释（以小概率将酸液变为普通水，模拟稀释）
 * - 接触金属 → 极低概率使金属生锈(72)（长期浸泡腐蚀：Fe + H₂O + O₂ → Fe₂O₃）
 */
export const Water: MaterialDef = {
  id: 2,
  name: '水',
  color() {
    const r = 30 + Math.floor(Math.random() * 10);
    const g = 100 + Math.floor(Math.random() * 20);
    const b = 200 + Math.floor(Math.random() * 30);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2,
  update(x: number, y: number, world: WorldAPI) {
    // 高温蒸发：温度超过 80° 变蒸汽
    if (world.getTemp(x, y) > 80) {
      world.set(x, y, 8); // 蒸汽
      world.setTemp(x, y, 60);
      return;
    }

    // 低温结冰：温度低于 -10° 变冰
    if (world.getTemp(x, y) < -10) {
      world.set(x, y, 14); // 冰
      return;
    }

    // 接触等离子体(55)：直接蒸发为蒸汽（剧烈高温接触反应，双向链补全）
    if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 55) { world.set(x, y, 8); world.wakeArea(x, y); return; }
    if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 55) { world.set(x, y, 8); world.wakeArea(x, y); return; }
    if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 55) { world.set(x, y, 8); world.wakeArea(x, y); return; }
    if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 55) { world.set(x, y, 8); world.wakeArea(x, y); return; }

    // 接触熔岩：水被蒸发，熔岩急冷变黑曜石（水端的互动，与 Lava.ts 的双向反应）
    // 检查四邻方向，若有熔岩则以小概率触发
    if (Math.random() < 0.15) {
      if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 11) {
        world.set(x, y, 8);    // 水变蒸汽
        world.set(x, y + 1, 60); // 熔岩急冷为黑曜石
        return;
      }
      if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 11) {
        world.set(x, y, 8);
        world.set(x, y - 1, 60);
        return;
      }
      if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 11) {
        world.set(x, y, 8);
        world.set(x - 1, y, 60);
        return;
      }
      if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 11) {
        world.set(x, y, 8);
        world.set(x + 1, y, 60);
        return;
      }
    }

    // 接触盐：水溶解盐→盐水（水端处理，与 Salt.ts 互补双向反应）
    // 水接触到盐时，把水自身变为盐水，盐被消耗
    if (Math.random() < 0.06) {
      if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 23) {
        world.set(x, y, 24); world.set(x, y - 1, 0); return; // 水变盐水，盐消失
      }
      if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 23) {
        world.set(x, y, 24); world.set(x, y + 1, 0); return;
      }
      if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 23) {
        world.set(x, y, 24); world.set(x - 1, y, 0); return;
      }
      if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 23) {
        world.set(x, y, 24); world.set(x + 1, y, 0); return;
      }
    }

    // 接触酸液：酸被水稀释（以低概率将酸液变回普通水，模拟大量水稀释酸）
    if (Math.random() < 0.008) {
      if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 9) {
        world.set(x, y - 1, 2); return; // 酸变水（被稀释）
      }
      if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 9) {
        world.set(x, y + 1, 2); return;
      }
      if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 9) {
        world.set(x - 1, y, 2); return;
      }
      if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 9) {
        world.set(x + 1, y, 2); return;
      }
    }

    // 接触金属：长期浸泡腐蚀（极低概率，模拟 Fe + H₂O + O₂ → Fe₂O₃/铁锈）
    // 概率0.0008/帧，约1250帧后一定生锈（~20秒），符合现实中水中铁生锈需要时间的物理
    if (Math.random() < 0.0008) {
      if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 10) { world.set(x, y - 1, 72); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); return; }
      if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 10) { world.set(x, y + 1, 72); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); return; }
      if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 10) { world.set(x - 1, y, 72); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); return; }
      if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 10) { world.set(x + 1, y, 72); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); return; }
    }

    if (y >= world.height - 1) return;

    // 1. 尝试直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 2. 尝试斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    const nx1 = x + dir;
    const nx2 = x - dir;

    if (world.inBounds(nx1, y + 1) && world.isEmpty(nx1, y + 1)) {
      world.swap(x, y, nx1, y + 1);
      world.markUpdated(nx1, y + 1);
      return;
    }
    if (world.inBounds(nx2, y + 1) && world.isEmpty(nx2, y + 1)) {
      world.swap(x, y, nx2, y + 1);
      world.markUpdated(nx2, y + 1);
      return;
    }

    // 3. 水平流动（液体特有行为）
    const spread = 3 + Math.floor(Math.random() * 3); // 流动距离
    for (let d = 1; d <= spread; d++) {
      const sx = x + dir * d;
      if (!world.inBounds(sx, y)) break;
      if (world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
      if (!world.isEmpty(sx, y)) break; // 遇到障碍停止
    }
    // 反方向尝试
    for (let d = 1; d <= spread; d++) {
      const sx = x - dir * d;
      if (!world.inBounds(sx, y)) break;
      if (world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
      if (!world.isEmpty(sx, y)) break;
    }
  },
};

registerMaterial(Water);
