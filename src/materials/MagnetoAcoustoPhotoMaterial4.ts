import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

export const MagnetoAcoustoPhotoMaterial4: MaterialDef = {
  id: 1235,
  name: '磁声光材料(4)',
  category: '固体',
  description: '磁-声-光三场耦合材料,磁场同时产生声波和光效应',
  density: Infinity,
  color() {
    const r = 118 + Math.floor(Math.random() * 20);
    const g = 108 + Math.floor(Math.random() * 20);
    const b = 148 + Math.floor(Math.random() * 22);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    // 4方向显式展开（上下左右，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1;
      const nid = world.get(nx, ny);
      // 酸液溶解
      if (nid === 9 && Math.random() < 0.0005) {
        world.set(x, y, 0);
        return;
      }
      // 热传导
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1;
      const nid = world.get(nx, ny);
      // 酸液溶解
      if (nid === 9 && Math.random() < 0.0005) {
        world.set(x, y, 0);
        return;
      }
      // 热传导
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y;
      const nid = world.get(nx, ny);
      // 酸液溶解
      if (nid === 9 && Math.random() < 0.0005) {
        world.set(x, y, 0);
        return;
      }
      // 热传导
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y;
      const nid = world.get(nx, ny);
      // 酸液溶解
      if (nid === 9 && Math.random() < 0.0005) {
        world.set(x, y, 0);
        return;
      }
      // 热传导
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
        }
  },
};
registerMaterial(MagnetoAcoustoPhotoMaterial4);
