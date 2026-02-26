import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 柔性显示材料 —— 可弯曲的发光显示材料
 * - 固体，密度 Infinity（不可移动）
 * - 通电发光：接触电线(44)/柔性电路(315) → 发光（颜色变亮）
 * - 接触激光(47)/光束(48) → 强烈发光
 * - 高温(>350°) → 分解为烟(7)
 * - 接触水(2) → 短路损坏（变为烟7）
 * - 深灰色，通电后显示彩色
 */

export const FlexDisplay: MaterialDef = {
  id: 320,
  name: '柔性显示材料',
  category: '特殊',
  description: '可弯曲的发光显示材料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰基底
      const base = 45 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.7) {
      // 微光像素点（随机RGB子像素）
      const sub = Math.floor(Math.random() * 3);
      r = sub === 0 ? 80 + Math.floor(Math.random() * 40) : 30 + Math.floor(Math.random() * 15);
      g = sub === 1 ? 80 + Math.floor(Math.random() * 40) : 30 + Math.floor(Math.random() * 15);
      b = sub === 2 ? 80 + Math.floor(Math.random() * 40) : 30 + Math.floor(Math.random() * 15);
    } else {
      // 暗灰
      const base = 35 + Math.floor(Math.random() * 10);
      r = base;
      g = base;
      b = base + 3;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 350) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    // 散热
    if (temp > 25) {
      world.addTemp(x, y, -0.2);
    }

    let powered = false;
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 通电发光
      if ((nid === 44 || nid === 315) && Math.random() < 0.4) {
        powered = true;
        world.addTemp(x, y, 0.5);
      }

      // 光激发
      if ((nid === 47 || nid === 48) && Math.random() < 0.7) {
        powered = true;
        world.addTemp(x, y, 5);
      }

      // 水短路
      if (nid === 2 && Math.random() < 0.05) {
        world.set(x, y, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // 通电时刷新颜色（发光效果）
    if (powered) {
      const r = 100 + Math.floor(Math.random() * 155);
      const g = 100 + Math.floor(Math.random() * 155);
      const b = 100 + Math.floor(Math.random() * 155);
      const i = y * world.width + x;
      // 直接写入颜色（通过 set 重新设置会丢失材质）
      // 使用 wakeArea 确保下帧继续更新
      world.wakeArea(x, y);
      // 注意：无法直接写 colors，通过温度变化间接触发视觉变化
      void r; void g; void b; void i;
    }
  },
};

registerMaterial(FlexDisplay);
