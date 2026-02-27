import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 光致变色材料 —— 受光照改变颜色的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 接触激光(47)/光束(48)/闪电(16)/火(6) → 刷新颜色（模拟变色）
 * - 接触萤火虫(52)/荧光液(80)/发光苔藓(225) → 也触发变色
 * - 高温(>400°) → 分解为烟(7)
 * - 耐酸：普通酸概率0.008
 * - 中等导热(概率0.05)
 * - 默认淡紫色，受光后变为随机暖色调
 */

export const PhotochromicMaterial: MaterialDef = {
  id: 305,
  name: '光致变色材料',
  category: '特殊',
  description: '受光照改变颜色的智能材料',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 淡紫色（默认态）
      r = 160 + Math.floor(Math.random() * 25);
      g = 130 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 25);
    } else if (phase < 0.65) {
      // 暖橙（受光态）
      r = 220 + Math.floor(Math.random() * 30);
      g = 150 + Math.floor(Math.random() * 40);
      b = 60 + Math.floor(Math.random() * 30);
    } else if (phase < 0.85) {
      // 亮黄绿（受光态）
      r = 180 + Math.floor(Math.random() * 30);
      g = 210 + Math.floor(Math.random() * 30);
      b = 70 + Math.floor(Math.random() * 30);
    } else {
      // 深蓝紫（暗态）
      r = 90 + Math.floor(Math.random() * 20);
      g = 70 + Math.floor(Math.random() * 20);
      b = 150 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 400) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    let illuminated = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 光源触发变色
      if (nid === 47 || nid === 48 || nid === 16 || nid === 6 ||
          nid === 52 || nid === 80 || nid === 225) {
        illuminated = true;
      }

      // 耐酸
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 中等导热
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 8) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // 受光照时刷新颜色
    if (illuminated) {
      world.set(x, y, 305);
    }
  },
};

registerMaterial(PhotochromicMaterial);
