/**
 * Canvas 渲染器
 * 将网格数据通过 ImageData 渲染到 Canvas
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;
  private pixels: Uint32Array;
  private gridWidth: number;
  private gridHeight: number;
  private scale: number;

  constructor(canvas: HTMLCanvasElement, gridWidth: number, gridHeight: number, scale: number) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');

    this.ctx = ctx;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.scale = scale;

    // 关闭抗锯齿，保持像素风格
    this.ctx.imageSmoothingEnabled = false;

    // 创建 1:1 的 ImageData，之后缩放绘制
    this.imageData = new ImageData(gridWidth, gridHeight);
    this.pixels = new Uint32Array(this.imageData.data.buffer);

    // 填充背景色
    this.clear();
  }

  /** 清空画布为背景色 */
  clear(): void {
    // 深蓝灰背景 #16213e -> ABGR 格式
    this.pixels.fill(0xFF3E2116);
  }

  /** 渲染当前帧到 Canvas */
  render(): void {
    this.clear();

    // 先将 ImageData 绘制到一个临时 canvas 或直接缩放
    // 使用 putImageData 写入原始尺寸，再用 drawImage 缩放
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.gridWidth;
    tempCanvas.height = this.gridHeight;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(this.imageData, 0, 0);

    this.ctx.drawImage(tempCanvas, 0, 0, this.gridWidth * this.scale, this.gridHeight * this.scale);
  }

  /** 获取像素缓冲区，供外部写入颜色 */
  getPixels(): Uint32Array {
    return this.pixels;
  }
}
