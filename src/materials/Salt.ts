import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 检查目标位置是否可以被当前密度的粒子穿过 */
function canDisplace(x: number, y: number, myDensity: number, world: WorldAPI): boolean {
  if (world.isEmpty(x, y)) return true;
  return world.getDensity(x, y) < myDensity;
}

/**
 * 盐 —— 粉末类，白色晶体
 * - 接触水 → 溶解为盐水（概率性）
 * - 接触熔岩 → 变为熔盐
 * - 物理行为类似沙子
 */
export const Salt: MaterialDef = {
  id: 23,
  name: '盐',
  color() {
    const v = 220 + Math.floor(Math.random() * 35);
    return (0xFF << 24) | (v << 16) | (v << 8) | v; // 白色微变
  },
  density: 3,
  update(x: number, y: number, world: WorldAPI) {
    // 检查邻居：溶解反应（显式4方向，无HOF）
    // 盐 + 水 → 盐水；盐 + 熔岩 → 熔盐
    if (world.inBounds(x, y - 1)) {
      const nid = world.get(x, y - 1);
      if (nid === 2 && Math.random() < 0.08) { world.set(x, y - 1, 24); world.set(x, y, 0); return; }
      if (nid === 11 && Math.random() < 0.2) { world.set(x, y, 83); world.setTemp(x, y, 350); world.wakeArea(x, y); return; }
      if ((nid === 6 || nid === 8) && Math.random() < 0.15) { world.addTemp(x, y, 20); } // 火/蒸汽加热盐
    }
    if (world.inBounds(x, y + 1)) {
      const nid = world.get(x, y + 1);
      if (nid === 2 && Math.random() < 0.08) { world.set(x, y + 1, 24); world.set(x, y, 0); return; }
      if (nid === 11 && Math.random() < 0.2) { world.set(x, y, 83); world.setTemp(x, y, 350); world.wakeArea(x, y); return; }
      if ((nid === 6 || nid === 8) && Math.random() < 0.15) { world.addTemp(x, y, 20); } // 火/蒸汽加热盐
    }
    if (world.inBounds(x - 1, y)) {
      const nid = world.get(x - 1, y);
      if (nid === 2 && Math.random() < 0.08) { world.set(x - 1, y, 24); world.set(x, y, 0); return; }
      if (nid === 11 && Math.random() < 0.2) { world.set(x, y, 83); world.setTemp(x, y, 350); world.wakeArea(x, y); return; }
      if ((nid === 6 || nid === 8) && Math.random() < 0.15) { world.addTemp(x, y, 20); } // 火/蒸汽加热盐
    }
    if (world.inBounds(x + 1, y)) {
      const nid = world.get(x + 1, y);
      if (nid === 2 && Math.random() < 0.08) { world.set(x + 1, y, 24); world.set(x, y, 0); return; }
      if (nid === 11 && Math.random() < 0.2) { world.set(x, y, 83); world.setTemp(x, y, 350); world.wakeArea(x, y); return; }
      if ((nid === 6 || nid === 8) && Math.random() < 0.15) { world.addTemp(x, y, 20); } // 火/蒸汽加热盐
    }

    // 高温融化为熔盐
    const temp = world.getTemp(x, y);
    if (temp > 300 && Math.random() < 0.1) {
      world.set(x, y, 83); // 熔盐
      world.wakeArea(x, y);
      return;
    }

    if (y >= world.height - 1) return;

    // 粉末物理：下落 + 斜下
    if (canDisplace(x, y + 1, Salt.density, world)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    const dir = Math.random() < 0.5 ? -1 : 1;
        {
      const d = dir;
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && canDisplace(nx, y + 1, Salt.density, world)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
    {
      const d = -dir;
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && canDisplace(nx, y + 1, Salt.density, world)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
  },
};

registerMaterial(Salt);
