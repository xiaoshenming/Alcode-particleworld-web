import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 传送门 —— 成对传送粒子
 * - 放置的传送门自动与最近的未配对传送门配对
 * - 接触传送门的粒子会从配对传送门的空位出现
 * - 不可移动，不受重力影响
 * - 传送门自身不会被传送
 */

/** 传送门配对关系：key → 配对 key */
const portalPairs = new Map<string, string>();
/** 所有未配对的传送门位置（Set 保证 O(1) 查找） */
const unpairedSet = new Set<string>();

/** 不可传送的材质 */
const NO_TELEPORT = new Set([0, 37, 38, 39, 41]); // 空气、克隆体、虚空、喷泉、传送门自身

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function parseKey(k: string): [number, number] {
  const parts = k.split(',');
  return [parseInt(parts[0]), parseInt(parts[1])];
}

/** 注册一个新传送门，尝试与未配对的传送门配对 */
export function registerPortal(x: number, y: number): void {
  const k = key(x, y);
  if (portalPairs.has(k)) return; // 已配对

  // 尝试与未配对集合中的第一个配对
  if (unpairedSet.size > 0) {
    const partner = unpairedSet.values().next().value!;
    unpairedSet.delete(partner);
    portalPairs.set(k, partner);
    portalPairs.set(partner, k);
  } else {
    unpairedSet.add(k);
  }
}

/** 移除传送门（被销毁时） */
export function removePortal(x: number, y: number): void {
  const k = key(x, y);
  const partner = portalPairs.get(k);
  if (partner) {
    portalPairs.delete(k);
    portalPairs.delete(partner);
    // 配对方变为未配对
    unpairedSet.add(partner);
  } else {
    // 从未配对集合移除
    unpairedSet.delete(k);
  }
}

/** 清空所有传送门状态（世界重置时调用） */
export function clearAllPortals(): void {
  portalPairs.clear();
  unpairedSet.clear();
}

export const Portal: MaterialDef = {
  id: 41,
  name: '传送门',
  color() {
    // 亮紫蓝色，闪烁效果
    const t = Math.random();
    const r = 100 + Math.floor(t * 50);
    const g = 50 + Math.floor(t * 80);
    const b = 200 + Math.floor(t * 55);
    return (0xFF << 24) | (Math.min(255, b) << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const k = key(x, y);

    // 确保已注册
    if (!portalPairs.has(k) && !unpairedSet.has(k)) {
      registerPortal(x, y);
    }

    // 刷新颜色（闪烁）
    world.set(x, y, 41);

    // 没有配对 → 无法传送
    const partnerKey = portalPairs.get(k);
    if (!partnerKey) return;

    const [px, py] = parseKey(partnerKey);

    // 验证配对方仍然是传送门
    if (!world.inBounds(px, py) || world.get(px, py) !== 41) {
      removePortal(x, y);
      return;
    }

    // 检查四周邻居，传送接触到的粒子
    const dirs = DIRS4;

    for (const [dx, dy] of dirs) {
      const sx = x + dx, sy = y + dy;
      if (!world.inBounds(sx, sy)) continue;

      const matId = world.get(sx, sy);
      if (matId === 0 || NO_TELEPORT.has(matId)) continue;
      if (world.isUpdated(sx, sy)) continue;

      // 每帧只传送一个粒子，30% 概率触发
      if (Math.random() > 0.3) continue;

      // 在配对传送门周围找空位放置
      const exitDirs = [...DIRS4];
      const shuffled = exitDirs.sort(() => Math.random() - 0.5);

      for (const [edx, edy] of shuffled) {
        const ex = px + edx, ey = py + edy;
        if (!world.inBounds(ex, ey)) continue;
        if (!world.isEmpty(ex, ey)) continue;

        // 传送：源位置清空，目标位置放置材质
        world.set(sx, sy, 0);
        world.set(ex, ey, matId);
        world.markUpdated(ex, ey);
        return; // 每帧最多传送一个
      }
    }
  },
};

registerMaterial(Portal);
