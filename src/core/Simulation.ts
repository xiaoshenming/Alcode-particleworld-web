import { World } from './World';
import { getMaterial } from '../materials/registry';

/**
 * 模拟引擎 —— 每帧更新活跃粒子
 * 从底部向上扫描，确保重力方向的粒子先被处理
 * 使用活跃标记跳过静止粒子，提升性能
 */
export class Simulation {
  private world: World;

  constructor(world: World) {
    this.world = world;
  }

  /** 执行一帧模拟 */
  update(): void {
    const { width, height } = this.world;
    this.world.resetUpdated();

    // 从底部向上遍历（重力方向）
    for (let y = height - 1; y >= 0; y--) {
      // 随机扫描方向，避免左右偏向
      const leftToRight = Math.random() < 0.5;
      for (let i = 0; i < width; i++) {
        const x = leftToRight ? i : width - 1 - i;

        // 跳过空气和已更新的粒子
        const cellId = this.world.get(x, y);
        if (cellId === 0) continue;
        if (this.world.isUpdated(x, y)) continue;

        // 跳过非活跃粒子（静止的沙堆、石头等）
        if (!this.world.isAwake(x, y)) continue;

        const mat = getMaterial(cellId);
        if (mat) {
          mat.update(x, y, this.world);
        }
      }
    }

    // 温度扩散
    this.world.diffuseTemperature();
  }
}
