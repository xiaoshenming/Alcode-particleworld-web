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
  /** 密度热力图开关 */
  showDensityMap = false;
  /** 网格线开关 */
  showGrid = false;
  /** 镜像线开关 */
  showMirrorLine = false;
  /** 小地图开关（缩放时自动显示） */
  showMinimap = true;
  /** 视图缩放倍率 (1.0 = 原始) */
  viewZoom = 1.0;
  /** 视图平移偏移（像素坐标） */
  viewPanX = 0;
  viewPanY = 0;

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

    // 密度热力图叠加层
    if (this.showDensityMap) {
      this.applyDensityOverlay(world);
    }

    // putImageData 到临时 canvas，再缩放绘制到主 canvas
    this.tempCtx.putImageData(this.imageData, 0, 0);

    // 清除画布并应用视图变换
    const canvasW = this.gridWidth * this.scale;
    const canvasH = this.gridHeight * this.scale;
    this.ctx.clearRect(0, 0, canvasW, canvasH);
    this.ctx.save();
    this.ctx.translate(this.viewPanX, this.viewPanY);
    this.ctx.scale(this.viewZoom, this.viewZoom);
    this.ctx.drawImage(
      this.tempCanvas,
      0, 0,
      this.tempCanvas.width * this.scale,
      this.tempCanvas.height * this.scale,
    );

    // 网格线
    if (this.showGrid && this.scale * this.viewZoom >= 3) {
      this.drawGrid();
    }

    // 镜像中轴线
    if (this.showMirrorLine) {
      const cx = this.gridWidth * this.scale / 2;
      this.ctx.strokeStyle = 'rgba(255, 200, 80, 0.5)';
      this.ctx.lineWidth = 1 / this.viewZoom;
      this.ctx.setLineDash([4 / this.viewZoom, 4 / this.viewZoom]);
      this.ctx.beginPath();
      this.ctx.moveTo(cx, 0);
      this.ctx.lineTo(cx, this.gridHeight * this.scale);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    this.ctx.restore();

    // 小地图（缩放/平移非默认时显示）
    if (this.showMinimap && (this.viewZoom !== 1.0 || this.viewPanX !== 0 || this.viewPanY !== 0)) {
      this.drawMinimap(canvasW, canvasH);
    }
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

  /** 密度热力图叠加层 —— 将世界分成 10x10 区块，统计粒子密度并用颜色渐变显示 */
  private applyDensityOverlay(world: World): void {
    const w = this.gridWidth;
    const h = this.gridHeight;
    const blockSize = 10;
    const bw = Math.ceil(w / blockSize);
    const bh = Math.ceil(h / blockSize);
    const cells = world.cells;

    // 统计每个区块的粒子数
    const density = new Uint16Array(bw * bh);
    for (let y = 0; y < h; y++) {
      const by = Math.floor(y / blockSize);
      for (let x = 0; x < w; x++) {
        if (cells[y * w + x] !== 0) {
          density[by * bw + Math.floor(x / blockSize)]++;
        }
      }
    }

    // 找最大密度用于归一化
    let maxDensity = 1;
    for (let i = 0; i < density.length; i++) {
      if (density[i] > maxDensity) maxDensity = density[i];
    }

    // 叠加颜色：蓝(低) → 绿(中) → 黄(中高) → 红(高)
    for (let y = 0; y < h; y++) {
      const by = Math.floor(y / blockSize);
      for (let x = 0; x < w; x++) {
        const bx = Math.floor(x / blockSize);
        const d = density[by * bw + bx] / maxDensity;
        if (d < 0.01) continue; // 空区域跳过

        const i = y * w + x;
        const pixel = this.pixels[i];
        let pr = pixel & 0xFF;
        let pg = (pixel >> 8) & 0xFF;
        let pb = (pixel >> 16) & 0xFF;
        const pa = (pixel >> 24) & 0xFF;

        // 热力图颜色映射
        let hr: number, hg: number, hb: number;
        if (d < 0.25) {
          // 蓝 → 青
          const t = d / 0.25;
          hr = 0; hg = Math.round(t * 200); hb = Math.round(200 + t * 55);
        } else if (d < 0.5) {
          // 青 → 绿
          const t = (d - 0.25) / 0.25;
          hr = 0; hg = Math.round(200 + t * 55); hb = Math.round(255 - t * 255);
        } else if (d < 0.75) {
          // 绿 → 黄
          const t = (d - 0.5) / 0.25;
          hr = Math.round(t * 255); hg = 255; hb = 0;
        } else {
          // 黄 → 红
          const t = (d - 0.75) / 0.25;
          hr = 255; hg = Math.round(255 - t * 255); hb = 0;
        }

        const alpha = 0.35 + d * 0.25;
        pr = Math.min(255, Math.round(pr * (1 - alpha) + hr * alpha));
        pg = Math.min(255, Math.round(pg * (1 - alpha) + hg * alpha));
        pb = Math.min(255, Math.round(pb * (1 - alpha) + hb * alpha));

        this.pixels[i] = (pa << 24) | (pb << 16) | (pg << 8) | pr;
      }
    }
  }

  /** 绘制网格线 */
  private drawGrid(): void {
    const s = this.scale;
    const w = this.gridWidth * s;
    const h = this.gridHeight * s;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    for (let x = 0; x <= this.gridWidth; x++) {
      const px = x * s;
      this.ctx.moveTo(px, 0);
      this.ctx.lineTo(px, h);
    }
    for (let y = 0; y <= this.gridHeight; y++) {
      const py = y * s;
      this.ctx.moveTo(0, py);
      this.ctx.lineTo(w, py);
    }
    this.ctx.stroke();
  }

  /** 绘制笔刷预览 */
  renderBrushPreview(cx: number, cy: number, brushSize: number, shape: string = 'circle', gradient: boolean = false, angle: number = 0): void {
    const r = Math.floor(brushSize / 2);
    const s = this.scale;
    this.ctx.save();
    this.ctx.translate(this.viewPanX, this.viewPanY);
    this.ctx.scale(this.viewZoom, this.viewZoom);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 1 / this.viewZoom;

    if (shape === 'spray') {
      // 喷雾预览：虚线圆 + 内部散点
      this.ctx.setLineDash([3, 3]);
      this.ctx.beginPath();
      this.ctx.arc(
        (cx + 0.5) * s,
        (cy + 0.5) * s,
        (r + 0.5) * s,
        0, Math.PI * 2,
      );
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      // 散点指示
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      const dots = Math.min(12, Math.max(4, r * 3));
      for (let i = 0; i < dots; i++) {
        const angle = (i / dots) * Math.PI * 2;
        const dist = (r * 0.5 + (i % 3) * r * 0.15) * s;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        this.ctx.fillRect(
          (cx + 0.5) * s + dx - 1,
          (cy + 0.5) * s + dy - 1,
          2, 2,
        );
      }
    } else if (shape === 'square') {
      const centerX = (cx + 0.5) * s;
      const centerY = (cy + 0.5) * s;
      const halfSize = (r + 0.5) * s;
      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(angle);
      this.ctx.beginPath();
      this.ctx.rect(-halfSize, -halfSize, halfSize * 2, halfSize * 2);
      this.ctx.stroke();
      this.ctx.restore();
    } else {
      // circle (default) and line use circle preview at cursor
      this.ctx.beginPath();
      this.ctx.arc(
        (cx + 0.5) * s,
        (cy + 0.5) * s,
        (r + 0.5) * s,
        0, Math.PI * 2,
      );
      this.ctx.stroke();
    }

    // 渐变模式指示：内圈虚线
    if (gradient && r > 1 && shape !== 'spray') {
      this.ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
      this.ctx.setLineDash([2, 3]);
      this.ctx.beginPath();
      this.ctx.arc(
        (cx + 0.5) * s,
        (cy + 0.5) * s,
        (r * 0.5) * s,
        0, Math.PI * 2,
      );
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
    this.ctx.restore();
  }

  /** 绘制线条预览（从起点到当前光标） */
  renderLinePreview(x0: number, y0: number, x1: number, y1: number): void {
    const s = this.scale;
    this.ctx.save();
    this.ctx.translate(this.viewPanX, this.viewPanY);
    this.ctx.scale(this.viewZoom, this.viewZoom);
    this.ctx.strokeStyle = 'rgba(255, 255, 100, 0.7)';
    this.ctx.lineWidth = 1.5 / this.viewZoom;
    this.ctx.setLineDash([4 / this.viewZoom, 4 / this.viewZoom]);
    this.ctx.beginPath();
    this.ctx.moveTo((x0 + 0.5) * s, (y0 + 0.5) * s);
    this.ctx.lineTo((x1 + 0.5) * s, (y1 + 0.5) * s);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();
  }

  /** 将屏幕坐标转换为网格坐标（考虑缩放平移） */
  screenToGrid(screenX: number, screenY: number): [number, number] {
    const gx = Math.floor((screenX - this.viewPanX) / (this.scale * this.viewZoom));
    const gy = Math.floor((screenY - this.viewPanY) / (this.scale * this.viewZoom));
    return [gx, gy];
  }

  /** 绘制右下角小地图 */
  private drawMinimap(canvasW: number, canvasH: number): void {
    const margin = 8;
    const mapW = 120;
    const mapH = Math.round(mapW * this.gridHeight / this.gridWidth);

    const mx = canvasW - mapW - margin;
    const my = canvasH - mapH - margin;

    // 半透明背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(mx - 1, my - 1, mapW + 2, mapH + 2);

    // 绘制缩略世界
    this.ctx.drawImage(this.tempCanvas, mx, my, mapW, mapH);

    // 计算当前视口在世界中的范围
    const worldW = this.gridWidth * this.scale;
    const worldH = this.gridHeight * this.scale;
    const vx = -this.viewPanX / (this.viewZoom * worldW);
    const vy = -this.viewPanY / (this.viewZoom * worldH);
    const vw = canvasW / (this.viewZoom * worldW);
    const vh = canvasH / (this.viewZoom * worldH);

    // 视口矩形
    this.ctx.strokeStyle = 'rgba(255, 255, 100, 0.8)';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(
      mx + vx * mapW,
      my + vy * mapH,
      Math.max(4, vw * mapW),
      Math.max(3, vh * mapH),
    );
  }

  /** 小地图点击定位：传入屏幕坐标，返回是否命中小地图 */
  minimapClick(screenX: number, screenY: number): boolean {
    if (!this.showMinimap) return false;
    if (this.viewZoom === 1.0 && this.viewPanX === 0 && this.viewPanY === 0) return false;

    const canvasW = this.gridWidth * this.scale;
    const canvasH = this.gridHeight * this.scale;
    const margin = 8;
    const mapW = 120;
    const mapH = Math.round(mapW * this.gridHeight / this.gridWidth);
    const mx = canvasW - mapW - margin;
    const my = canvasH - mapH - margin;

    if (screenX < mx || screenX > mx + mapW || screenY < my || screenY > my + mapH) return false;

    // 点击位置对应世界中的归一化坐标
    const nx = (screenX - mx) / mapW;
    const ny = (screenY - my) / mapH;

    // 将该点居中到视口
    const worldW = this.gridWidth * this.scale;
    const worldH = this.gridHeight * this.scale;
    this.viewPanX = canvasW / 2 - nx * worldW * this.viewZoom;
    this.viewPanY = canvasH / 2 - ny * worldH * this.viewZoom;

    return true;
  }

  /** 绘制粒子轨迹线条 */
  renderTrail(trail: Array<{x: number; y: number}>): void {
    if (trail.length < 2) return;
    const s = this.scale;
    this.ctx.save();
    this.ctx.translate(this.viewPanX, this.viewPanY);
    this.ctx.scale(this.viewZoom, this.viewZoom);

    for (let i = 1; i < trail.length; i++) {
      const alpha = i / trail.length; // 越新越亮
      this.ctx.strokeStyle = `rgba(255, 255, 100, ${alpha * 0.8})`;
      this.ctx.lineWidth = s * 0.5;
      this.ctx.beginPath();
      this.ctx.moveTo((trail[i - 1].x + 0.5) * s, (trail[i - 1].y + 0.5) * s);
      this.ctx.lineTo((trail[i].x + 0.5) * s, (trail[i].y + 0.5) * s);
      this.ctx.stroke();
    }

    // 当前位置高亮圆点
    const last = trail[trail.length - 1];
    this.ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
    this.ctx.beginPath();
    this.ctx.arc((last.x + 0.5) * s, (last.y + 0.5) * s, s * 0.8, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /** 在画布左上角绘制追踪信息 */
  renderTrackInfo(gx: number, gy: number, matName: string): void {
    const text = gx < 0 ? `[L] ${matName}` : `追踪: ${matName} (${gx}, ${gy})`;
    this.ctx.save();
    this.ctx.font = '13px monospace';
    const metrics = this.ctx.measureText(text);
    const pad = 6;
    const bx = 8, by = 8;
    const bw = metrics.width + pad * 2;
    const bh = 20;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(bx, by, bw, bh);
    this.ctx.fillStyle = gx < 0 ? 'rgba(200, 200, 200, 0.9)' : 'rgba(255, 255, 100, 0.95)';
    this.ctx.fillText(text, bx + pad, by + 15);
    this.ctx.restore();
  }

  /** 重置视图缩放和平移 */
  resetView(): void {
    this.viewZoom = 1.0;
    this.viewPanX = 0;
    this.viewPanY = 0;
  }
}
