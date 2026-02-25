import { World } from './World';

/**
 * Canvas 渲染器
 * 将 World 的颜色数据通过 ImageData 渲染到 Canvas
 * 支持温度可视化叠加层
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;
  private pixels: Uint32Array;
  private scale: number;
  private gridWidth: number;
  private gridHeight: number;
  private tempCanvas: HTMLCanvasElement;
  private tempCtx: CanvasRenderingContext2D;
  /** 温度叠加层开关 */
  showTempOverlay = false;

  constructor(canvas: HTMLCanvasElement, gridWidth: number, gridHeight: number, scale: number) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');

    this.ctx = ctx;
    this.scale = scale;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    // 关闭抗锯齿，保持像素风格
    this.ctx.imageSmoothingEnabled = false;

    // 创建 1:1 的 ImageData
    this.imageData = new ImageData(gridWidth, gridHeight);
    this.pixels = new Uint32Array(this.imageData.data.buffer);

    // 复用临时 canvas 避免每帧创建
    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = gridWidth;
    this.tempCanvas.height = gridHeight;
    this.tempCtx = this.tempCanvas.getContext('2d')!;
  }

  /** 从 World 读取颜色数据并渲染到 Canvas */
  render(world: World): void {
    // 直接拷贝 world 的颜色数据到像素缓冲区
    this.pixels.set(world.colors);

    // 温度叠加层
    if (this.showTempOverlay) {
      this.applyTempOverlay(world);
    }

    // putImageData 到临时 canvas，再缩放绘制到主 canvas
    this.tempCtx.putImageData(this.imageData, 0, 0);
    this.ctx.drawImage(
      this.tempCanvas,
      0, 0,
      this.tempCanvas.width * this.scale,
      this.tempCanvas.height * this.scale,
    );
  }

  /** 将温度数据叠加到像素缓冲区（蓝=冷，红=热） */
  private applyTempOverlay(world: World): void {
    const temps = world.getTempBuffer();
    const w = this.gridWidth;
    const h = this.gridHeight;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const t = temps[i];
        // 只对偏离常温的格子叠加颜色
        const diff = t - 20;
        if (Math.abs(diff) < 2) continue;

        const pixel = this.pixels[i];
        // 提取原始 ABGR 分量
        let pr = pixel & 0xFF;
        let pg = (pixel >> 8) & 0xFF;
        let pb = (pixel >> 16) & 0xFF;
        const pa = (pixel >> 24) & 0xFF;

        if (diff > 0) {
          // 热：叠加红/橙色，强度随温度增加
          const intensity = Math.min(1, diff / 500);
          const alpha = intensity * 0.6;
          pr = Math.min(255, Math.round(pr * (1 - alpha) + 255 * alpha));
          pg = Math.min(255, Math.round(pg * (1 - alpha) + (100 * intensity) * alpha));
          pb = Math.min(255, Math.round(pb * (1 - alpha) + 0));
        } else {
          // 冷：叠加蓝色，强度随温度降低
          const intensity = Math.min(1, Math.abs(diff) / 200);
          const alpha = intensity * 0.6;
          pr = Math.min(255, Math.round(pr * (1 - alpha) + 0));
          pg = Math.min(255, Math.round(pg * (1 - alpha) + (100 * intensity) * alpha));
          pb = Math.min(255, Math.round(pb * (1 - alpha) + 255 * alpha));
        }

        this.pixels[i] = (pa << 24) | (pb << 16) | (pg << 8) | pr;
      }
    }
  }

  /** 绘制笔刷预览圆圈 */
  renderBrushPreview(cx: number, cy: number, brushSize: number): void {
    const r = Math.floor(brushSize / 2);
    const s = this.scale;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(
      (cx + 0.5) * s,
      (cy + 0.5) * s,
      (r + 0.5) * s,
      0, Math.PI * 2,
    );
    this.ctx.stroke();
  }
}
