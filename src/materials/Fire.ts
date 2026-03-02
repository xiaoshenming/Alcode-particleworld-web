import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 火 —— 短生命周期，向上蔓延，点燃可燃物，遇水熄灭
 * 使用颜色 alpha 通道以外的随机值模拟闪烁
 * 使用 World 内置 age 替代 Map<string,number>
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

/** 可燃材质 ID 集合 */
const FLAMMABLE = new Set([4, 5, 13, 25, 26, 46, 49, 45, 87, 134]); // 木头、油、植物、蜡、液蜡、木炭、苔藓、蜂蜜、血液、干草

export const Fire: MaterialDef = {
  id: 6,
  name: '火',
  color() {
    const t = Math.random();
    // 火焰颜色：焰心白/蓝（t接近0）→ 橙黄（中间）→ 深红（t接近1）
    // 随机模拟火焰内外温度分布
    if (t < 0.15) {
      // 焰心：白热/淡蓝（极高温）
      const v = Math.floor(200 + t * 300);
      return (0xFF << 24) | (Math.min(255, v) << 16) | (Math.min(255, v) << 8) | 255;
    }
    // 外焰：红橙黄渐变
    const r = 255;
    const g = Math.floor(60 + t * 195);
    const b = Math.floor(t * 30);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.1, // 极轻，几乎像气体
  update(x: number, y: number, world: WorldAPI) {
    // 火产生热量
    world.setTemp(x, y, 200);

    // 获取/初始化生命值（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 30 + Math.floor(Math.random() * 40); // 30~70 帧寿命
    }

    // 生命递减
    life--;

    // 刷新颜色（闪烁效果）：set()会重置age，需立即恢复
    world.set(x, y, 6);
    world.setAge(x, y, life);

    // 生命耗尽 → 变成空气（小概率变成烟）
    if (life <= 0) {
      if (Math.random() < 0.3) {
        world.set(x, y, 7); // 烟
      } else {
        world.set(x, y, 0); // 空气
      }
      return;
    }

    // 检查四周邻居，进行化学反应（显式8方向，无HOF）
    // 火 + 水 → 蒸汽（立即return）
    if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 2) { world.set(x, y, 8); world.set(x, y - 1, 8); return; }
    if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 2) { world.set(x, y, 8); world.set(x, y + 1, 8); return; }
    if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 2) { world.set(x, y, 8); world.set(x - 1, y, 8); return; }
    if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 2) { world.set(x, y, 8); world.set(x + 1, y, 8); return; }
    if (world.inBounds(x - 1, y - 1) && world.get(x - 1, y - 1) === 2) { world.set(x, y, 8); world.set(x - 1, y - 1, 8); return; }
    if (world.inBounds(x + 1, y - 1) && world.get(x + 1, y - 1) === 2) { world.set(x, y, 8); world.set(x + 1, y - 1, 8); return; }
    if (world.inBounds(x - 1, y + 1) && world.get(x - 1, y + 1) === 2) { world.set(x, y, 8); world.set(x - 1, y + 1, 8); return; }
    if (world.inBounds(x + 1, y + 1) && world.get(x + 1, y + 1) === 2) { world.set(x, y, 8); world.set(x + 1, y + 1, 8); return; }
    // 点燃可燃物（不return）
    if (world.inBounds(x, y - 1) && FLAMMABLE.has(world.get(x, y - 1)) && Math.random() < 0.05) {
      const nid0 = world.get(x, y - 1);
      if (nid0 === 4 && Math.random() < 0.4) { world.set(x, y - 1, 46); } // 木头→木炭
      else if (nid0 === 45 || nid0 === 87 || nid0 === 134) { world.set(x, y - 1, 7); } // 蜂蜜/血液/干草→焦烟
      else { world.set(x, y - 1, 6); }
      world.markUpdated(x, y - 1);
    }
    if (world.inBounds(x, y + 1) && FLAMMABLE.has(world.get(x, y + 1)) && Math.random() < 0.05) {
      const nid1 = world.get(x, y + 1);
      if (nid1 === 4 && Math.random() < 0.4) { world.set(x, y + 1, 46); }
      else if (nid1 === 45 || nid1 === 87 || nid1 === 134) { world.set(x, y + 1, 7); }
      else { world.set(x, y + 1, 6); }
      world.markUpdated(x, y + 1);
    }
    if (world.inBounds(x - 1, y) && FLAMMABLE.has(world.get(x - 1, y)) && Math.random() < 0.05) {
      const nid2 = world.get(x - 1, y);
      if (nid2 === 4 && Math.random() < 0.4) { world.set(x - 1, y, 46); }
      else if (nid2 === 45 || nid2 === 87 || nid2 === 134) { world.set(x - 1, y, 7); }
      else { world.set(x - 1, y, 6); }
      world.markUpdated(x - 1, y);
    }
    if (world.inBounds(x + 1, y) && FLAMMABLE.has(world.get(x + 1, y)) && Math.random() < 0.05) {
      const nid3 = world.get(x + 1, y);
      if (nid3 === 4 && Math.random() < 0.4) { world.set(x + 1, y, 46); }
      else if (nid3 === 45 || nid3 === 87 || nid3 === 134) { world.set(x + 1, y, 7); }
      else { world.set(x + 1, y, 6); }
      world.markUpdated(x + 1, y);
    }
    if (world.inBounds(x - 1, y - 1) && FLAMMABLE.has(world.get(x - 1, y - 1)) && Math.random() < 0.05) {
      const nid4 = world.get(x - 1, y - 1);
      if (nid4 === 4 && Math.random() < 0.4) { world.set(x - 1, y - 1, 46); }
      else if (nid4 === 45 || nid4 === 87 || nid4 === 134) { world.set(x - 1, y - 1, 7); }
      else { world.set(x - 1, y - 1, 6); }
      world.markUpdated(x - 1, y - 1);
    }
    if (world.inBounds(x + 1, y - 1) && FLAMMABLE.has(world.get(x + 1, y - 1)) && Math.random() < 0.05) {
      const nid5 = world.get(x + 1, y - 1);
      if (nid5 === 4 && Math.random() < 0.4) { world.set(x + 1, y - 1, 46); }
      else if (nid5 === 45 || nid5 === 87 || nid5 === 134) { world.set(x + 1, y - 1, 7); }
      else { world.set(x + 1, y - 1, 6); }
      world.markUpdated(x + 1, y - 1);
    }
    if (world.inBounds(x - 1, y + 1) && FLAMMABLE.has(world.get(x - 1, y + 1)) && Math.random() < 0.05) {
      const nid6 = world.get(x - 1, y + 1);
      if (nid6 === 4 && Math.random() < 0.4) { world.set(x - 1, y + 1, 46); }
      else if (nid6 === 45 || nid6 === 87 || nid6 === 134) { world.set(x - 1, y + 1, 7); }
      else { world.set(x - 1, y + 1, 6); }
      world.markUpdated(x - 1, y + 1);
    }
    if (world.inBounds(x + 1, y + 1) && FLAMMABLE.has(world.get(x + 1, y + 1)) && Math.random() < 0.05) {
      const nid7 = world.get(x + 1, y + 1);
      if (nid7 === 4 && Math.random() < 0.4) { world.set(x + 1, y + 1, 46); }
      else if (nid7 === 45 || nid7 === 87 || nid7 === 134) { world.set(x + 1, y + 1, 7); }
      else { world.set(x + 1, y + 1, 6); }
      world.markUpdated(x + 1, y + 1);
    }

    // 火焰偶尔向上飘动（swap 自动迁移 age）
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.2) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(Fire);
