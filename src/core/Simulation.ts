import { World } from './World';
import { getMaterial } from '../materials/registry';

/** 天气类型 */
export type WeatherType = 'clear' | 'rain' | 'snow' | 'sandstorm' | 'acid';

/** 天气配置 */
const WEATHER_CONFIG: Record<WeatherType, { materialId: number; rate: number; label: string }> = {
  clear:     { materialId: 0,  rate: 0,    label: '晴天' },
  rain:      { materialId: 2,  rate: 0.08, label: '雨天' },
  snow:      { materialId: 15, rate: 0.04, label: '雪天' },
  sandstorm: { materialId: 84, rate: 0.06, label: '沙尘暴' },
  acid:      { materialId: 9,  rate: 0.03, label: '酸雨' },
};

/** 天气类型循环顺序 */
const WEATHER_CYCLE: WeatherType[] = ['clear', 'rain', 'snow', 'sandstorm', 'acid'];

/** 边界模式 */
export type BoundaryMode = 'wall' | 'wrap' | 'open';

/** 边界模式循环顺序 */
const BOUNDARY_CYCLE: BoundaryMode[] = ['wall', 'wrap', 'open'];

/** 边界模式标签 */
const BOUNDARY_LABELS: Record<BoundaryMode, string> = {
  wall: '实墙',
  wrap: '环绕',
  open: '开放',
};

/**
 * 模拟引擎 —— 每帧更新活跃粒子
 * 从底部向上扫描，确保重力方向的粒子先被处理
 * 使用活跃标记跳过静止粒子，提升性能
 */
export class Simulation {
  private world: World;
  /** 当前天气 */
  private _weather: WeatherType = 'clear';
  /** 当前边界模式 */
  private _boundary: BoundaryMode = 'wall';

  constructor(world: World) {
    this.world = world;
  }

  /** 获取当前天气 */
  getWeather(): WeatherType { return this._weather; }

  /** 设置天气 */
  setWeather(w: WeatherType): void { this._weather = w; }

  /** 循环切换天气 */
  cycleWeather(): WeatherType {
    const idx = WEATHER_CYCLE.indexOf(this._weather);
    this._weather = WEATHER_CYCLE[(idx + 1) % WEATHER_CYCLE.length];
    return this._weather;
  }

  /** 获取天气显示标签 */
  getWeatherLabel(): string {
    return WEATHER_CONFIG[this._weather].label;
  }

  /** 获取当前边界模式 */
  getBoundary(): BoundaryMode { return this._boundary; }

  /** 设置边界模式 */
  setBoundary(b: BoundaryMode): void { this._boundary = b; }

  /** 循环切换边界模式 */
  cycleBoundary(): BoundaryMode {
    const idx = BOUNDARY_CYCLE.indexOf(this._boundary);
    this._boundary = BOUNDARY_CYCLE[(idx + 1) % BOUNDARY_CYCLE.length];
    return this._boundary;
  }

  /** 获取边界模式标签 */
  getBoundaryLabel(): string {
    return BOUNDARY_LABELS[this._boundary];
  }

  /** 执行一帧模拟 */
  update(): void {
    const { width, height } = this.world;
    this.world.resetUpdated();

    // 天气粒子生成
    this.spawnWeatherParticles();

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

    // 粒子年龄递增
    this.world.tickAge();

    // 边界处理
    if (this._boundary !== 'wall') {
      this.processBoundary();
    }
  }

  /** 处理边界模式 */
  private processBoundary(): void {
    const { width, height } = this.world;

    if (this._boundary === 'open') {
      // 开放模式：清除底部边缘粒子
      for (let x = 0; x < width; x++) {
        if (!this.world.isEmpty(x, height - 1)) {
          this.world.set(x, height - 1, 0);
          this.world.wakeArea(x, height - 1);
        }
      }
      // 清除左右边缘
      for (let y = 0; y < height; y++) {
        if (!this.world.isEmpty(0, y)) {
          this.world.set(0, y, 0);
          this.world.wakeArea(0, y);
        }
        if (!this.world.isEmpty(width - 1, y)) {
          this.world.set(width - 1, y, 0);
          this.world.wakeArea(width - 1, y);
        }
      }
    } else if (this._boundary === 'wrap') {
      // 环绕模式：底部粒子传送到顶部
      for (let x = 0; x < width; x++) {
        const botId = this.world.get(x, height - 1);
        if (botId !== 0 && this.world.isEmpty(x, 0)) {
          this.world.set(x, 0, botId);
          this.world.setTemp(x, 0, this.world.getTemp(x, height - 1));
          this.world.set(x, height - 1, 0);
          this.world.wakeArea(x, 0);
          this.world.wakeArea(x, height - 1);
        }
      }
      // 左右环绕
      for (let y = 0; y < height; y++) {
        const leftId = this.world.get(0, y);
        const rightId = this.world.get(width - 1, y);
        // 左边缘有粒子且右边缘空 → 传送到右边
        if (leftId !== 0 && rightId === 0) {
          this.world.set(width - 1, y, leftId);
          this.world.setTemp(width - 1, y, this.world.getTemp(0, y));
          this.world.set(0, y, 0);
          this.world.wakeArea(0, y);
          this.world.wakeArea(width - 1, y);
        }
      }
    }
  }

  /** 在世界顶部生成天气粒子 */
  private spawnWeatherParticles(): void {
    const config = WEATHER_CONFIG[this._weather];
    if (config.rate <= 0) return;

    const { width } = this.world;
    for (let x = 0; x < width; x++) {
      if (Math.random() < config.rate && this.world.isEmpty(x, 0)) {
        this.world.set(x, 0, config.materialId);
        this.world.markUpdated(x, 0);
      }
    }
  }
}
