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
  /** 年龄叠加层开关 */
  showAgeOverlay = false;
  /** 轨迹叠加层开关 */
  showTrailOverlay = false;
  /** 温度计 HUD 开关 */
  showThermometer = false;
  /** 压力叠加层开关 */
  showPressureOverlay = false;
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

    // 年龄叠加层
    if (this.showAgeOverlay) {
      this.applyAgeOverlay(world);
    }

    // 轨迹叠加层
    if (this.showTrailOverlay) {
      this.applyTrailOverlay(world);
    }

    // 压力叠加层
    if (this.showPressureOverlay) {
      this.applyPressureOverlay(world);
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

  /** 年龄叠加层 —— 新粒子亮绿，老粒子暗紫，帮助观察粒子流动 */
  private applyAgeOverlay(world: World): void {
    const ages = world.getAgeBuffer();
    const cells = world.cells;
    const w = this.gridWidth;
    const h = this.gridHeight;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (cells[i] === 0) continue;

        const age = ages[i];
        // 归一化：0~2000帧映射到 0~1
        const t = Math.min(1, age / 2000);

        const pixel = this.pixels[i];
        let pr = pixel & 0xFF;
        let pg = (pixel >> 8) & 0xFF;
        let pb = (pixel >> 16) & 0xFF;
        const pa = (pixel >> 24) & 0xFF;

        // 新粒子(t≈0)：亮绿  老粒子(t≈1)：暗紫
        let hr: number, hg: number, hb: number;
        if (t < 0.33) {
          // 亮绿 → 黄
          const s = t / 0.33;
          hr = Math.round(s * 255);
          hg = 255;
          hb = 0;
        } else if (t < 0.66) {
          // 黄 → 橙红
          const s = (t - 0.33) / 0.33;
          hr = 255;
          hg = Math.round(255 - s * 180);
          hb = 0;
        } else {
          // 橙红 → 暗紫
          const s = (t - 0.66) / 0.34;
          hr = Math.round(255 - s * 120);
          hg = Math.round(75 - s * 75);
          hb = Math.round(s * 180);
        }

        const alpha = 0.4;
        pr = Math.min(255, Math.round(pr * (1 - alpha) + hr * alpha));
        pg = Math.min(255, Math.round(pg * (1 - alpha) + hg * alpha));
        pb = Math.min(255, Math.round(pb * (1 - alpha) + hb * alpha));

        this.pixels[i] = (pa << 24) | (pb << 16) | (pg << 8) | pr;
      }
    }
  }

  /** 轨迹叠加层 —— 粒子经过的路径显示为青色尾迹 */
  private applyTrailOverlay(world: World): void {
    const trail = world.getTrailBuffer();
    const cells = world.cells;
    const w = this.gridWidth;
    const h = this.gridHeight;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const t = trail[i];
        if (t === 0) continue;
        // 只在空气格子上显示轨迹（粒子本身不需要）
        if (cells[i] !== 0) continue;

        const intensity = t / 255;
        const pixel = this.pixels[i];
        let pr = pixel & 0xFF;
        let pg = (pixel >> 8) & 0xFF;
        let pb = (pixel >> 16) & 0xFF;
        const pa = (pixel >> 24) & 0xFF;

        // 青色尾迹
        const alpha = intensity * 0.6;
        pr = Math.min(255, Math.round(pr * (1 - alpha) + 80 * alpha));
        pg = Math.min(255, Math.round(pg * (1 - alpha) + 230 * alpha));
        pb = Math.min(255, Math.round(pb * (1 - alpha) + 255 * alpha));

        this.pixels[i] = (pa << 24) | (pb << 16) | (pg << 8) | pr;
      }
    }
  }

  /** 压力叠加层：低压蓝色 → 中压黄色 → 高压红色 */
  private applyPressureOverlay(world: World): void {
    const pressure = world.getPressureBuffer();
    const cells = world.cells;
    const w = this.gridWidth;
    const h = this.gridHeight;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (cells[i] === 0) continue; // 空气不显示压力
        const p = pressure[i];
        if (p === 0) continue;

        // 归一化压力 (0~50 映射到 0~1)
        const norm = Math.min(1, p / 50);
        let cr: number, cg: number, cb: number;
        if (norm < 0.5) {
          // 蓝 → 黄
          const t = norm * 2;
          cr = Math.round(50 * (1 - t) + 255 * t);
          cg = Math.round(100 * (1 - t) + 230 * t);
          cb = Math.round(255 * (1 - t) + 50 * t);
        } else {
          // 黄 → 红
          const t = (norm - 0.5) * 2;
          cr = 255;
          cg = Math.round(230 * (1 - t) + 30 * t);
          cb = Math.round(50 * (1 - t) + 20 * t);
        }

        const pixel = this.pixels[i];
        let pr = pixel & 0xFF;
        let pg = (pixel >> 8) & 0xFF;
        let pb = (pixel >> 16) & 0xFF;
        const pa = (pixel >> 24) & 0xFF;

        const alpha = 0.45;
        pr = Math.min(255, Math.round(pr * (1 - alpha) + cr * alpha));
        pg = Math.min(255, Math.round(pg * (1 - alpha) + cg * alpha));
        pb = Math.min(255, Math.round(pb * (1 - alpha) + cb * alpha));

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

  /** 绘制选区框（虚线矩形） */
  renderSelectionRect(rx: number, ry: number, rw: number, rh: number): void {
    const s = this.scale;
    this.ctx.save();
    this.ctx.translate(this.viewPanX, this.viewPanY);
    this.ctx.scale(this.viewZoom, this.viewZoom);
    this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
    this.ctx.lineWidth = 1.5 / this.viewZoom;
    this.ctx.setLineDash([4 / this.viewZoom, 3 / this.viewZoom]);
    this.ctx.strokeRect(rx * s, ry * s, rw * s, rh * s);
    this.ctx.setLineDash([]);
    // 半透明填充
    this.ctx.fillStyle = 'rgba(100, 200, 255, 0.08)';
    this.ctx.fillRect(rx * s, ry * s, rw * s, rh * s);
    this.ctx.restore();
  }

  /** 绘制浮动选区预览 */
  renderFloatingSelection(fx: number, fy: number, fw: number, fh: number, cells: Uint16Array): void {
    const s = this.scale;
    this.ctx.save();
    this.ctx.translate(this.viewPanX, this.viewPanY);
    this.ctx.scale(this.viewZoom, this.viewZoom);

    // 绘制粒子（简化：用材质颜色填充像素）
    this.ctx.fillStyle = 'rgba(200, 220, 255, 0.5)';
    for (let dy = 0; dy < fh; dy++) {
      for (let dx = 0; dx < fw; dx++) {
        if (cells[dy * fw + dx] === 0) continue;
        this.ctx.fillRect((fx + dx) * s, (fy + dy) * s, s, s);
      }
    }

    // 外框
    this.ctx.strokeStyle = 'rgba(255, 200, 100, 0.9)';
    this.ctx.lineWidth = 1.5 / this.viewZoom;
    this.ctx.setLineDash([3 / this.viewZoom, 3 / this.viewZoom]);
    this.ctx.strokeRect(fx * s, fy * s, fw * s, fh * s);
    this.ctx.setLineDash([]);
    this.ctx.restore();
  }

  /** 绘制选区模式提示 */
  renderSelectionHint(text: string): void {
    this.ctx.save();
    this.ctx.font = '12px monospace';
    const metrics = this.ctx.measureText(text);
    const pad = 6;
    const bx = 8, by = 32;
    const bw = metrics.width + pad * 2;
    const bh = 18;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(bx, by, bw, bh);
    this.ctx.fillStyle = 'rgba(100, 200, 255, 0.95)';
    this.ctx.fillText(text, bx + pad, by + 13);
    this.ctx.restore();
  }

  /** 绘制鼠标旁温度计 HUD（温度条 + 材质名 + 温度值） */
  renderThermometer(screenX: number, screenY: number, temp: number, matName: string): void {
    this.ctx.save();

    // 温度计位置：鼠标右上方偏移
    const tx = screenX + 16;
    const ty = screenY - 60;

    // 温度条参数
    const barW = 6;
    const barH = 48;
    const bx = tx;
    const by = ty;

    // 背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    this.ctx.beginPath();
    this.ctx.roundRect(bx - 4, by - 18, barW + 80, barH + 26, 4);
    this.ctx.fill();

    // 材质名
    this.ctx.font = '11px monospace';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.fillText(matName, bx + barW + 6, by - 4);

    // 温度条背景
    this.ctx.fillStyle = 'rgba(40, 40, 50, 0.8)';
    this.ctx.fillRect(bx, by, barW, barH);

    // 温度映射到填充比例：-200° ~ 3000° → 0 ~ 1
    const tNorm = Math.max(0, Math.min(1, (temp + 200) / 3200));
    const fillH = tNorm * barH;

    // 温度条颜色渐变
    let r: number, g: number, b: number;
    if (tNorm < 0.1) {
      // 深蓝（极冷）
      r = 30; g = 60; b = 200;
    } else if (tNorm < 0.25) {
      // 蓝 → 青
      const s = (tNorm - 0.1) / 0.15;
      r = 30; g = Math.round(60 + s * 180); b = 200;
    } else if (tNorm < 0.4) {
      // 青 → 绿
      const s = (tNorm - 0.25) / 0.15;
      r = 30; g = 240; b = Math.round(200 - s * 180);
    } else if (tNorm < 0.6) {
      // 绿 → 黄
      const s = (tNorm - 0.4) / 0.2;
      r = Math.round(30 + s * 225); g = 240; b = 20;
    } else if (tNorm < 0.8) {
      // 黄 → 橙
      const s = (tNorm - 0.6) / 0.2;
      r = 255; g = Math.round(240 - s * 100); b = 20;
    } else {
      // 橙 → 红
      const s = (tNorm - 0.8) / 0.2;
      r = 255; g = Math.round(140 - s * 120); b = Math.round(20 + s * 30);
    }

    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    this.ctx.fillRect(bx, by + barH - fillH, barW, fillH);

    // 温度条边框
    this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeRect(bx, by, barW, barH);

    // 温度数值
    this.ctx.font = '11px monospace';
    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    const tempStr = `${temp.toFixed(1)}°`;
    this.ctx.fillText(tempStr, bx + barW + 6, by + 12);

    // 常温标记线（20°）
    const roomY = by + barH - ((20 + 200) / 3200) * barH;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.setLineDash([2, 2]);
    this.ctx.beginPath();
    this.ctx.moveTo(bx, roomY);
    this.ctx.lineTo(bx + barW, roomY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    this.ctx.restore();
  }
}
