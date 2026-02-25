import { World } from './World';

/**
 * Canvas 渲染器
 * 将 World 的颜色数据通过 ImageData 渲染到 Canvas
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;
  private pixels: Uint32Array;
  private scale: number;
  private tempCanvas: HTMLCanvasElement;
  private tempCtx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, gridWidth: number, gridHeight: number, scale: number) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');

    this.ctx = ctx;
    this.scale = scale;

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

    // putImageData 到临时 canvas，再缩放绘制到主 canvas
    this.tempCtx.putImageData(this.imageData, 0, 0);
    this.ctx.drawImage(
      this.tempCanvas,
      0, 0,
      this.tempCanvas.width * this.scale,
      this.tempCanvas.height * this.scale,
    );
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
