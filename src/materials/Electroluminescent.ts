import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电致发光材料 —— 通电发光的特殊材料
 * - 固体，密度 Infinity（不可移动）
 * - 接触电线(44)/电弧(145) → 发光变色
 * - 高温(>500°) → 分解为烟(7)
 * - 接触酸(9) → 溶解
 * - 默认暗灰，通电后明亮多彩
 */

export const Electroluminescent: MaterialDef = {
  id: 340,
  name: '电致发光材料',
  category: '特殊',
  description: '通电后发光变色的特殊材料',
  density: Infinity,
  color() {
    // 随机产生暗灰或明亮色（通电时 set 刷新会随机到亮色）
    if (Math.random() < 0.3) {
      // 明亮荧光色
      const hue = Math.random() * 360;
      const c = 0.9;
      const hh = hue / 60;
      const x2 = c * (1 - Math.abs(hh % 2 - 1));
      let r1 = 0, g1 = 0, b1 = 0;
      if (hh < 1) { r1 = c; g1 = x2; }
      else if (hh < 2) { r1 = x2; g1 = c; }
      else if (hh < 3) { g1 = c; b1 = x2; }
      else if (hh < 4) { g1 = x2; b1 = c; }
      else if (hh < 5) { r1 = x2; b1 = c; }
      else { r1 = c; b1 = x2; }
      const m = 0.3;
      const r = Math.floor((r1 + m) * 195);
      const g = Math.floor((g1 + m) * 195);
      const b = Math.floor((b1 + m) * 195);
      return (0xFF << 24) | (b << 16) | (g << 8) | r;
    }
    // 默认暗灰色（未通电状态）
    const base = 60 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | ((base + 5) << 16) | ((base + 3) << 8) | base;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 500) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    let powered = false;
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 检测通电（电线44、电弧145、静电121）
      if (nid === 44 || nid === 145 || nid === 121) {
        powered = true;
      }

      // 遇酸溶解
      if (nid === 9 && Math.random() < 0.05) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    if (powered) {
      // 通电发光：重新设置自身以刷新颜色，保持活跃
      world.set(x, y, 340);
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(Electroluminescent);
