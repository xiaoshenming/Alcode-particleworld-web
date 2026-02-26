import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 量子点材料 —— 纳米级半导体发光材料
 * - 固体，密度 3.5
 * - 粉末行为（可下落堆积）
 * - 周期性变色发光（RGB循环）
 * - 高温(>600°) → 分解为烟(7)
 * - 接触酸(9) → 溶解
 * - 多彩荧光色
 */

export const QuantumDot: MaterialDef = {
  id: 335,
  name: '量子点材料',
  category: '特殊',
  description: '纳米半导体发光材料，周期性变色',
  density: 3.5,
  color() {
    // 随机荧光色：在亮色范围内随机选择色相
    const hue = Math.random() * 360;
    const s = 0.8 + Math.random() * 0.2;
    const l = 0.55 + Math.random() * 0.2;
    // HSL → RGB
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hh = hue / 60;
    const x2 = c * (1 - Math.abs(hh % 2 - 1));
    let r1 = 0, g1 = 0, b1 = 0;
    if (hh < 1) { r1 = c; g1 = x2; }
    else if (hh < 2) { r1 = x2; g1 = c; }
    else if (hh < 3) { g1 = c; b1 = x2; }
    else if (hh < 4) { g1 = x2; b1 = c; }
    else if (hh < 5) { r1 = x2; b1 = c; }
    else { r1 = c; b1 = x2; }
    const m = l - c / 2;
    const r = Math.floor((r1 + m) * 255);
    const g = Math.floor((g1 + m) * 255);
    const b = Math.floor((b1 + m) * 255);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 600) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    // 周期性重新着色（发光变色效果）
    if (Math.random() < 0.03) {
      // 重新设置自身以刷新颜色
      world.set(x, y, 335);
      world.wakeArea(x, y);
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸溶解
      if (nid === 9 && Math.random() < 0.1) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 粉末下落
    if (y >= world.height - 1) return;

    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下滑落
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
  },
};

registerMaterial(QuantumDot);
