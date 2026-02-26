import { InputHandler, BrushShape } from './InputHandler';
import { getMaterialsByCategory, getMaterial } from '../materials/registry';
import type { MaterialDef } from '../materials/types';
import { matchMaterial } from '../utils/pinyin';

/** 笔刷预设配置 */
interface BrushPreset {
  name: string;
  materialId: number;
  brushSize: number;
  brushShape: BrushShape;
  sprayDensity: number;
  gradientBrush: boolean;
}

export interface ToolbarCallbacks {
  onPause: () => void;
  onClear: () => void;
  onSave: () => void;
  onLoad: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleTempOverlay: () => void;
  onToggleGrid: () => void;
  onScreenshot: () => void;
  onToggleMirror?: () => void;
  onSnapshotA?: () => string;
  onSnapshotB?: () => string;
  getParticleCount: () => number;
  isPaused: () => boolean;
  getSpeed: () => number;
  setSpeed: (speed: number) => void;
  setWind: (dir: number, strength: number) => void;
  onCycleWeather?: () => string;
  onToggleRecord?: () => boolean; // 返回是否正在录制
  onExportFile?: () => void;
  onImportFile?: () => void;
}

/**
 * 工具栏 —— 动态分类材质面板 + 笔刷 + 控制按钮
 * 支持可折叠分类，自动从 registry 获取全部材质
 */
export class Toolbar {
  private container: HTMLElement;
  private input: InputHandler;
  private callbacks: ToolbarCallbacks;
  private particleCountEl!: HTMLSpanElement;
  private pauseBtn!: HTMLButtonElement;
  private brushLabel!: HTMLSpanElement;
  private brushSlider!: HTMLInputElement;
  private brushShapeBtns: HTMLButtonElement[] = [];
  private sprayDensityLabel!: HTMLSpanElement;
  private sprayDensitySlider!: HTMLInputElement;
  private sprayDensityRow!: HTMLElement;
  private gradientBtn!: HTMLButtonElement;
  private speedLabel!: HTMLSpanElement;
  private speedSlider!: HTMLInputElement;
  private tempOverlayBtn!: HTMLButtonElement;
  private gridBtn!: HTMLButtonElement;
  private eraserBtn!: HTMLButtonElement;
  private fillBtn!: HTMLButtonElement;
  private replaceBtn!: HTMLButtonElement;
  private randomBtn!: HTMLButtonElement;
  private mirrorBtn!: HTMLButtonElement;
  /** 记录每个分类的折叠状态 */
  private collapsedCategories = new Set<string>();
  /** 收藏夹材质 ID 列表 */
  private favorites: number[] = [];
  /** 收藏夹按钮容器 */
  private favBtnsDiv!: HTMLElement;
  /** 收藏夹分类容器 */
  private favDiv!: HTMLElement;
  /** 搜索输入框 */
  private searchInput!: HTMLInputElement;
  /** 材质悬浮卡片 */
  private tooltip!: HTMLElement;
  private tooltipTimer: ReturnType<typeof setTimeout> | null = null;
  /** 笔刷预设 */
  private presets: BrushPreset[] = [];
  private presetBtnsDiv!: HTMLElement;
  private presetDiv!: HTMLElement;
  /** 快照对比 */
  private snapshotA: string | null = null;
  private snapshotB: string | null = null;
  private snapABtn!: HTMLButtonElement;
  private snapBBtn!: HTMLButtonElement;
  private snapCompareBtn!: HTMLButtonElement;
  private snapshotOverlay: HTMLElement | null = null;
  /** 天气按钮 */
  private weatherBtn!: HTMLButtonElement;
  /** 录制按钮 */
  private recordBtn!: HTMLButtonElement;

  constructor(input: InputHandler, callbacks: ToolbarCallbacks) {
    this.input = input;
    this.callbacks = callbacks;
    this.container = document.createElement('div');
    this.container.id = 'toolbar';
    document.body.appendChild(this.container);
    // 默认折叠非常用分类
    this.collapsedCategories.add('熔融金属');
    this.collapsedCategories.add('矿石');
    this.collapsedCategories.add('特殊');
    this.loadFavorites();
    this.loadPresets();
    this.buildTooltip();
    this.build();
  }

  /** 每帧调用，更新粒子计数 */
  updateStats(): void {
    this.particleCountEl.textContent = String(this.callbacks.getParticleCount());
    this.pauseBtn.textContent = this.callbacks.isPaused() ? '继续' : '暂停';
    this.pauseBtn.classList.toggle('active', this.callbacks.isPaused());
  }

  /** 刷新材质选中状态（快捷键切换后调用） */
  refreshMaterialSelection(): void {
    const currentId = this.input.getMaterial();
    this.container.querySelectorAll('.material-btn').forEach(b => {
      const btn = b as HTMLButtonElement;
      btn.classList.toggle('active', btn.dataset['materialId'] === String(currentId));
    });
    this.refreshEraser();
  }

  /** 刷新橡皮擦按钮状态 */
  refreshEraser(): void {
    this.eraserBtn.classList.toggle('active', this.input.getMaterial() === 0);
  }

  /** 聚焦搜索框 (Ctrl+F) */
  focusSearch(): void {
    this.searchInput.focus();
    this.searchInput.select();
  }

  /** 刷新笔刷大小显示 */
  refreshBrushSize(): void {
    const size = this.input.getBrushSize();
    this.brushLabel.textContent = `笔刷: ${size}`;
    this.brushSlider.value = String(size);
  }

  /** 刷新笔刷形状按钮状态 */
  refreshBrushShape(): void {
    const current = this.input.getBrushShape();
    for (const btn of this.brushShapeBtns) {
      const shape = btn.title.includes('圆') ? 'circle' : btn.title.includes('方') ? 'square' : btn.title.includes('线') ? 'line' : 'spray';
      btn.classList.toggle('active', shape === current);
    }
    // 喷雾密度行仅在喷雾模式下显示
    if (this.sprayDensityRow) {
      this.sprayDensityRow.style.display = current === 'spray' ? '' : 'none';
    }
  }

  /** 刷新速度显示 */
  refreshSpeed(speed: number): void {
    this.speedLabel.textContent = `速度: ${speed}x`;
    this.speedSlider.value = String(speed);
  }

  /** 刷新温度叠加层按钮状态 */
  refreshTempOverlay(active: boolean): void {
    this.tempOverlayBtn.classList.toggle('active', active);
    this.tempOverlayBtn.textContent = active ? '温度: 开' : '温度: 关';
  }

  /** 刷新网格线按钮状态 */
  refreshGrid(active: boolean): void {
    this.gridBtn.classList.toggle('active', active);
    this.gridBtn.textContent = active ? '网格: 开' : '网格: 关';
  }

  /** 刷新绘制模式按钮状态 */
  refreshDrawMode(): void {
    const mode = this.input.getDrawMode();
    this.fillBtn.classList.toggle('active', mode === 'fill');
    this.fillBtn.textContent = mode === 'fill' ? '填充: 开' : '填充';
    this.replaceBtn.classList.toggle('active', mode === 'replace');
    this.replaceBtn.textContent = mode === 'replace' ? '替换: 开' : '替换';
  }

  /** 刷新随机模式按钮状态 */
  refreshRandomMode(): void {
    const on = this.input.getRandomMode();
    this.randomBtn.classList.toggle('active', on);
    this.randomBtn.textContent = on ? '随机: 开' : '随机';
  }

  /** 刷新镜像模式按钮状态 */
  refreshMirrorMode(): void {
    const on = this.input.getMirrorMode();
    this.mirrorBtn.classList.toggle('active', on);
    this.mirrorBtn.textContent = on ? '镜像: 开' : '镜像';
  }

  /** 刷新喷雾密度显示 */
  refreshSprayDensity(): void {
    const val = Math.round(this.input.getSprayDensity() * 100);
    this.sprayDensityLabel.textContent = `密度: ${val}%`;
    this.sprayDensitySlider.value = String(val);
  }

  /** 刷新渐变笔刷按钮状态 */
  refreshGradientBrush(): void {
    const on = this.input.getGradientBrush();
    this.gradientBtn.classList.toggle('active', on);
    this.gradientBtn.textContent = on ? '渐变: 开' : '渐变';
  }

  /** 刷新天气按钮状态 */
  refreshWeather(label: string): void {
    this.weatherBtn.textContent = `天气: ${label}`;
    this.weatherBtn.classList.toggle('active', label !== '晴天');
  }

  /** 刷新录制按钮状态 */
  refreshRecord(recording: boolean): void {
    this.recordBtn.textContent = recording ? '停止录制' : '录制 GIF';
    this.recordBtn.classList.toggle('active', recording);
  }

  /** 加载收藏夹 */
  private loadFavorites(): void {
    try {
      const data = localStorage.getItem('pw-favorites');
      if (data) this.favorites = JSON.parse(data);
    } catch { /* ignore */ }
  }

  /** 保存收藏夹 */
  private saveFavorites(): void {
    localStorage.setItem('pw-favorites', JSON.stringify(this.favorites));
  }

  /** 切换收藏状态 */
  private toggleFavorite(id: number): void {
    const idx = this.favorites.indexOf(id);
    if (idx >= 0) {
      this.favorites.splice(idx, 1);
    } else {
      this.favorites.push(id);
    }
    this.saveFavorites();
    this.refreshFavorites();
  }

  /** 构建悬浮卡片 DOM */
  private buildTooltip(): void {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'material-tooltip';
    document.body.appendChild(this.tooltip);
  }

  /** 显示材质悬浮卡片 */
  private showTooltip(mat: MaterialDef, anchor: HTMLElement): void {
    if (this.tooltipTimer) clearTimeout(this.tooltipTimer);
    this.tooltipTimer = setTimeout(() => {
      const color = mat.color();
      const r = color & 0xFF;
      const g = (color >> 8) & 0xFF;
      const b = (color >> 16) & 0xFF;
      const densityStr = mat.density === Infinity ? '∞' : mat.density.toFixed(1);
      const cat = mat.category || '';

      // 清空旧内容
      while (this.tooltip.firstChild) this.tooltip.removeChild(this.tooltip.firstChild);

      // 头部：色块 + 名称
      const header = document.createElement('div');
      header.className = 'material-tooltip-header';
      const swatch = document.createElement('div');
      swatch.className = 'material-tooltip-swatch';
      swatch.style.backgroundColor = `rgb(${r},${g},${b})`;
      const nameEl = document.createElement('span');
      nameEl.className = 'material-tooltip-name';
      nameEl.textContent = mat.name;
      header.appendChild(swatch);
      header.appendChild(nameEl);
      this.tooltip.appendChild(header);

      // 详情
      const detail = document.createElement('div');
      detail.className = 'material-tooltip-detail';
      detail.textContent = `ID: ${mat.id} · 密度: ${densityStr}${cat ? ` · ${cat}` : ''}`;
      this.tooltip.appendChild(detail);

      // 描述
      if (mat.description) {
        const desc = document.createElement('div');
        desc.className = 'material-tooltip-desc';
        desc.textContent = mat.description;
        this.tooltip.appendChild(desc);
      }

      // 定位：在按钮右侧显示
      const rect = anchor.getBoundingClientRect();
      let left = rect.right + 8;
      let top = rect.top;

      // 如果超出右边界，改为左侧显示
      if (left + 220 > window.innerWidth) {
        left = rect.left - 228;
      }
      // 如果超出底部，向上偏移
      if (top + 100 > window.innerHeight) {
        top = window.innerHeight - 110;
      }

      this.tooltip.style.left = `${left}px`;
      this.tooltip.style.top = `${top}px`;
      this.tooltip.classList.add('visible');
    }, 300);
  }

  /** 隐藏悬浮卡片 */
  private hideTooltip(): void {
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }
    this.tooltip.classList.remove('visible');
  }

  /** 加载笔刷预设 */
  private loadPresets(): void {
    try {
      const data = localStorage.getItem('pw-brush-presets');
      if (data) this.presets = JSON.parse(data);
    } catch { /* ignore */ }
  }

  /** 保存笔刷预设 */
  private savePresets(): void {
    localStorage.setItem('pw-brush-presets', JSON.stringify(this.presets));
  }

  /** 保存当前笔刷为预设 */
  private saveCurrentAsPreset(): void {
    const mat = getMaterial(this.input.getMaterial());
    const defaultName = mat ? mat.name : `预设${this.presets.length + 1}`;
    const name = prompt('预设名称:', defaultName);
    if (!name) return;

    this.presets.push({
      name,
      materialId: this.input.getMaterial(),
      brushSize: this.input.getBrushSize(),
      brushShape: this.input.getBrushShape(),
      sprayDensity: this.input.getSprayDensity(),
      gradientBrush: this.input.getGradientBrush(),
    });
    this.savePresets();
    this.refreshPresets();
  }

  /** 应用笔刷预设 */
  private applyPreset(preset: BrushPreset): void {
    this.input.setMaterial(preset.materialId);
    this.input.setBrushSize(preset.brushSize);
    this.input.setBrushShape(preset.brushShape);
    this.input.setSprayDensity(preset.sprayDensity);
    this.input.setGradientBrush(preset.gradientBrush);
    this.refreshMaterialSelection();
    this.refreshBrushSize();
    this.refreshBrushShape();
    this.refreshSprayDensity();
    this.refreshGradientBrush();
  }

  /** 删除笔刷预设 */
  private deletePreset(index: number): void {
    this.presets.splice(index, 1);
    this.savePresets();
    this.refreshPresets();
  }

  /** 刷新笔刷预设 UI */
  private refreshPresets(): void {
    while (this.presetBtnsDiv.firstChild) {
      this.presetBtnsDiv.removeChild(this.presetBtnsDiv.firstChild);
    }
    if (this.presets.length === 0) {
      this.presetDiv.style.display = 'none';
      return;
    }
    this.presetDiv.style.display = '';
    for (let i = 0; i < this.presets.length; i++) {
      const preset = this.presets[i];
      const btn = document.createElement('button');
      btn.className = 'ctrl-btn preset-btn';
      btn.textContent = preset.name;
      const mat = getMaterial(preset.materialId);
      if (mat) {
        const color = mat.color();
        const r = color & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = (color >> 16) & 0xFF;
        btn.style.borderLeftColor = `rgb(${r},${g},${b})`;
        btn.style.borderLeftWidth = '3px';
      }
      btn.title = `点击应用 · 右键删除`;
      btn.addEventListener('click', () => this.applyPreset(preset));
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.deletePreset(i);
      });
      this.presetBtnsDiv.appendChild(btn);
    }
  }

  /** 更新对比按钮状态 */
  private updateCompareBtn(): void {
    this.snapCompareBtn.disabled = !(this.snapshotA && this.snapshotB);
  }

  /** 显示快照对比浮层 */
  private showSnapshotCompare(): void {
    if (!this.snapshotA || !this.snapshotB) return;

    // 移除已有浮层
    if (this.snapshotOverlay) {
      this.snapshotOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'snapshot-overlay';

    const content = document.createElement('div');
    content.className = 'snapshot-content';

    const titleEl = document.createElement('div');
    titleEl.className = 'snapshot-title';
    titleEl.textContent = '快照对比 (Esc 关闭)';
    content.appendChild(titleEl);

    const imgRow = document.createElement('div');
    imgRow.className = 'snapshot-images';

    const wrapA = document.createElement('div');
    wrapA.className = 'snapshot-wrap';
    const labelA = document.createElement('div');
    labelA.className = 'snapshot-label';
    labelA.textContent = '快照 A';
    const imgA = document.createElement('img');
    imgA.src = this.snapshotA;
    imgA.alt = '快照A';
    wrapA.appendChild(labelA);
    wrapA.appendChild(imgA);

    const wrapB = document.createElement('div');
    wrapB.className = 'snapshot-wrap';
    const labelB = document.createElement('div');
    labelB.className = 'snapshot-label';
    labelB.textContent = '快照 B';
    const imgB = document.createElement('img');
    imgB.src = this.snapshotB;
    imgB.alt = '快照B';
    wrapB.appendChild(labelB);
    wrapB.appendChild(imgB);

    imgRow.appendChild(wrapA);
    imgRow.appendChild(wrapB);
    content.appendChild(imgRow);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ctrl-btn snapshot-close';
    closeBtn.textContent = '关闭';
    closeBtn.addEventListener('click', () => this.closeSnapshotCompare());
    content.appendChild(closeBtn);

    overlay.appendChild(content);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeSnapshotCompare();
    });

    document.body.appendChild(overlay);
    this.snapshotOverlay = overlay;

    const onEsc = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        this.closeSnapshotCompare();
        document.removeEventListener('keydown', onEsc);
      }
    };
    document.addEventListener('keydown', onEsc);
  }

  /** 关闭快照对比浮层 */
  private closeSnapshotCompare(): void {
    if (this.snapshotOverlay) {
      this.snapshotOverlay.remove();
      this.snapshotOverlay = null;
    }
  }

  /** 刷新收藏夹 UI */
  private refreshFavorites(): void {
    while (this.favBtnsDiv.firstChild) {
      this.favBtnsDiv.removeChild(this.favBtnsDiv.firstChild);
    }
    if (this.favorites.length === 0) {
      this.favDiv.style.display = 'none';
      return;
    }
    this.favDiv.style.display = '';
    for (const id of this.favorites) {
      const mat = getMaterial(id);
      if (!mat) continue;
      const btn = this.createMaterialBtn(mat);
      this.favBtnsDiv.appendChild(btn);
    }
  }

  /** 创建材质按钮 */
  private createMaterialBtn(mat: MaterialDef): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'material-btn';
    btn.textContent = mat.name;
    btn.dataset['materialId'] = String(mat.id);
    btn.title = `${mat.name} (ID: ${mat.id})`;

    const color = mat.color();
    const r = color & 0xFF;
    const g = (color >> 8) & 0xFF;
    const b = (color >> 16) & 0xFF;
    btn.style.backgroundColor = `rgb(${r},${g},${b})`;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    btn.style.color = luma > 128 ? '#000' : '#fff';

    if (mat.id === this.input.getMaterial()) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      this.input.setMaterial(mat.id);
      this.container.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });

    // 右键添加/移除收藏
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.toggleFavorite(mat.id);
    });

    // 悬浮显示材质信息卡片
    btn.addEventListener('mouseenter', () => {
      this.showTooltip(mat, btn);
    });
    btn.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });

    return btn;
  }

  private build(): void {
    const categorized = getMaterialsByCategory();

    // 搜索框
    const searchDiv = document.createElement('div');
    searchDiv.className = 'search-box';
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = '搜索材质 (名称/拼音/ID)...';
    this.searchInput.className = 'search-input';
    this.searchInput.setAttribute('aria-label', '搜索材质');
    searchDiv.appendChild(this.searchInput);
    this.container.appendChild(searchDiv);

    // 分类材质区
    const matsPanel = document.createElement('div');
    matsPanel.className = 'materials-panel';

    // 搜索结果区（默认隐藏）
    const searchResults = document.createElement('div');
    searchResults.className = 'category search-results';
    searchResults.style.display = 'none';
    const searchLabel = document.createElement('div');
    searchLabel.className = 'category-header';
    const searchLabelText = document.createElement('span');
    searchLabelText.className = 'category-label';
    searchLabelText.textContent = '搜索结果';
    searchLabel.appendChild(searchLabelText);
    searchResults.appendChild(searchLabel);
    const searchBtns = document.createElement('div');
    searchBtns.className = 'category-btns';
    searchResults.appendChild(searchBtns);
    matsPanel.appendChild(searchResults);

    // 收藏夹区域
    this.favDiv = document.createElement('div');
    this.favDiv.className = 'category favorites';
    if (this.favorites.length === 0) this.favDiv.style.display = 'none';
    const favHeader = document.createElement('div');
    favHeader.className = 'category-header';
    const favLabel = document.createElement('span');
    favLabel.className = 'category-label';
    favLabel.textContent = '收藏夹';
    favHeader.appendChild(favLabel);
    this.favDiv.appendChild(favHeader);
    this.favBtnsDiv = document.createElement('div');
    this.favBtnsDiv.className = 'category-btns';
    this.favDiv.appendChild(this.favBtnsDiv);
    matsPanel.appendChild(this.favDiv);

    // 收集所有材质用于搜索
    const allMats: MaterialDef[] = [];
    const categoryDivs: HTMLElement[] = [];

    for (const [catName, mats] of categorized) {
      allMats.push(...mats);
      const catDiv = document.createElement('div');
      catDiv.className = 'category';
      categoryDivs.push(catDiv);

      // 可折叠的分类标题
      const catHeader = document.createElement('div');
      catHeader.className = 'category-header';
      const isCollapsed = this.collapsedCategories.has(catName);

      const catArrow = document.createElement('span');
      catArrow.className = 'category-arrow';
      catArrow.textContent = isCollapsed ? '▶' : '▼';

      const catLabel = document.createElement('span');
      catLabel.className = 'category-label';
      catLabel.textContent = `${catName} (${mats.length})`;

      catHeader.appendChild(catArrow);
      catHeader.appendChild(catLabel);
      catDiv.appendChild(catHeader);

      const btnsDiv = document.createElement('div');
      btnsDiv.className = 'category-btns';
      if (isCollapsed) btnsDiv.style.display = 'none';

      for (const mat of mats) {
        btnsDiv.appendChild(this.createMaterialBtn(mat));
      }

      // 点击标题折叠/展开
      catHeader.addEventListener('click', () => {
        const collapsed = btnsDiv.style.display === 'none';
        btnsDiv.style.display = collapsed ? '' : 'none';
        catArrow.textContent = collapsed ? '▼' : '▶';
        if (collapsed) {
          this.collapsedCategories.delete(catName);
        } else {
          this.collapsedCategories.add(catName);
        }
      });

      catDiv.appendChild(btnsDiv);
      matsPanel.appendChild(catDiv);
    }
    this.container.appendChild(matsPanel);

    // 搜索逻辑
    this.searchInput.addEventListener('input', () => {
      const query = this.searchInput.value.trim().toLowerCase();
      if (!query) {
        // 清空搜索：显示分类，隐藏搜索结果
        searchResults.style.display = 'none';
        searchBtns.innerHTML = '';
        for (const div of categoryDivs) div.style.display = '';
        return;
      }
      // 有搜索词：隐藏分类，显示搜索结果
      for (const div of categoryDivs) div.style.display = 'none';
      searchBtns.innerHTML = '';
      const matched = allMats.filter(m => matchMaterial(m, query));
      searchLabelText.textContent = `搜索结果 (${matched.length})`;
      for (const mat of matched) {
        searchBtns.appendChild(this.createMaterialBtn(mat));
      }
      searchResults.style.display = matched.length > 0 ? '' : 'none';
    });

    // Esc 清空搜索
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.searchInput.value = '';
        this.searchInput.dispatchEvent(new Event('input'));
        this.searchInput.blur();
      }
    });

    // 分隔线
    const sep = document.createElement('div');
    sep.className = 'toolbar-sep';
    this.container.appendChild(sep);

    // 控制区：笔刷 + 按钮 + 统计
    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';

    // 笔刷大小
    const brushDiv = document.createElement('div');
    brushDiv.className = 'control-row';
    const brushLabel = document.createElement('span');
    brushLabel.className = 'control-label';
    brushLabel.textContent = `笔刷: ${this.input.getBrushSize()}`;
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '1';
    slider.max = '10';
    slider.value = String(this.input.getBrushSize());
    slider.setAttribute('aria-label', '笔刷大小');
    slider.addEventListener('input', () => {
      const size = parseInt(slider.value);
      this.input.setBrushSize(size);
      brushLabel.textContent = `笔刷: ${size}`;
    });
    this.brushLabel = brushLabel;
    this.brushSlider = slider;
    brushDiv.appendChild(brushLabel);
    brushDiv.appendChild(slider);
    controlPanel.appendChild(brushDiv);

    // 笔刷形状
    const shapeDiv = document.createElement('div');
    shapeDiv.className = 'control-row';
    const shapeLabel = document.createElement('span');
    shapeLabel.className = 'control-label';
    shapeLabel.textContent = '形状:';
    shapeDiv.appendChild(shapeLabel);

    const shapes: { shape: BrushShape; label: string }[] = [
      { shape: 'circle', label: '●' },
      { shape: 'square', label: '■' },
      { shape: 'line', label: '╱' },
      { shape: 'spray', label: '✦' },
    ];
    for (const { shape, label } of shapes) {
      const btn = document.createElement('button');
      btn.className = 'ctrl-btn brush-shape-btn';
      btn.textContent = label;
      btn.title = shape === 'circle' ? '圆形笔刷' : shape === 'square' ? '方形笔刷' : shape === 'line' ? '线条笔刷' : '喷雾笔刷';
      if (shape === this.input.getBrushShape()) btn.classList.add('active');
      btn.addEventListener('click', () => {
        this.input.setBrushShape(shape);
        this.refreshBrushShape();
      });
      this.brushShapeBtns.push(btn);
      shapeDiv.appendChild(btn);
    }
    controlPanel.appendChild(shapeDiv);

    // 喷雾密度控制（仅在喷雾模式下显示）
    const sprayDensityDiv = document.createElement('div');
    sprayDensityDiv.className = 'control-row';
    sprayDensityDiv.style.display = this.input.getBrushShape() === 'spray' ? '' : 'none';
    const sprayDensityLabel = document.createElement('span');
    sprayDensityLabel.className = 'control-label';
    sprayDensityLabel.textContent = `密度: ${Math.round(this.input.getSprayDensity() * 100)}%`;
    const sprayDensitySlider = document.createElement('input');
    sprayDensitySlider.type = 'range';
    sprayDensitySlider.min = '10';
    sprayDensitySlider.max = '100';
    sprayDensitySlider.value = String(Math.round(this.input.getSprayDensity() * 100));
    sprayDensitySlider.setAttribute('aria-label', '喷雾密度');
    sprayDensitySlider.addEventListener('input', () => {
      const val = parseInt(sprayDensitySlider.value);
      this.input.setSprayDensity(val / 100);
      sprayDensityLabel.textContent = `密度: ${val}%`;
    });
    this.sprayDensityLabel = sprayDensityLabel;
    this.sprayDensitySlider = sprayDensitySlider;
    this.sprayDensityRow = sprayDensityDiv;
    sprayDensityDiv.appendChild(sprayDensityLabel);
    sprayDensityDiv.appendChild(sprayDensitySlider);
    controlPanel.appendChild(sprayDensityDiv);

    // 渐变笔刷按钮
    const gradientBtn = document.createElement('button');
    gradientBtn.textContent = '渐变';
    gradientBtn.title = '渐变笔刷 (G)';
    gradientBtn.setAttribute('aria-label', '渐变笔刷');
    gradientBtn.classList.toggle('active', this.input.getGradientBrush());
    gradientBtn.addEventListener('click', () => {
      this.input.setGradientBrush(!this.input.getGradientBrush());
      this.refreshGradientBrush();
    });
    this.gradientBtn = gradientBtn;
    shapeDiv.appendChild(gradientBtn);

    // 笔刷预设区域
    const presetSep = document.createElement('div');
    presetSep.className = 'toolbar-sep';
    controlPanel.appendChild(presetSep);

    this.presetDiv = document.createElement('div');
    this.presetDiv.className = 'preset-section';
    if (this.presets.length === 0) this.presetDiv.style.display = 'none';

    const presetHeader = document.createElement('div');
    presetHeader.className = 'control-row';
    const presetLabel = document.createElement('span');
    presetLabel.className = 'control-label';
    presetLabel.textContent = '预设:';
    presetHeader.appendChild(presetLabel);
    this.presetDiv.appendChild(presetHeader);

    this.presetBtnsDiv = document.createElement('div');
    this.presetBtnsDiv.className = 'preset-btns';
    this.presetDiv.appendChild(this.presetBtnsDiv);
    controlPanel.appendChild(this.presetDiv);

    // 保存预设按钮
    const savePresetRow = document.createElement('div');
    savePresetRow.className = 'control-row';
    const savePresetBtn = document.createElement('button');
    savePresetBtn.className = 'ctrl-btn';
    savePresetBtn.textContent = '保存预设';
    savePresetBtn.title = '将当前笔刷配置保存为预设';
    savePresetBtn.addEventListener('click', () => this.saveCurrentAsPreset());
    savePresetRow.appendChild(savePresetBtn);
    controlPanel.appendChild(savePresetRow);

    this.refreshPresets();

    const presetSep2 = document.createElement('div');
    presetSep2.className = 'toolbar-sep';
    controlPanel.appendChild(presetSep2);

    // 快照对比区域
    const snapRow = document.createElement('div');
    snapRow.className = 'control-row snapshot-row';

    this.snapABtn = document.createElement('button');
    this.snapABtn.className = 'ctrl-btn';
    this.snapABtn.textContent = '快照A';
    this.snapABtn.title = '捕获当前世界为快照A';
    this.snapABtn.addEventListener('click', () => {
      if (this.callbacks.onSnapshotA) {
        this.snapshotA = this.callbacks.onSnapshotA();
        this.snapABtn.classList.add('active');
        this.updateCompareBtn();
      }
    });

    this.snapBBtn = document.createElement('button');
    this.snapBBtn.className = 'ctrl-btn';
    this.snapBBtn.textContent = '快照B';
    this.snapBBtn.title = '捕获当前世界为快照B';
    this.snapBBtn.addEventListener('click', () => {
      if (this.callbacks.onSnapshotB) {
        this.snapshotB = this.callbacks.onSnapshotB();
        this.snapBBtn.classList.add('active');
        this.updateCompareBtn();
      }
    });

    this.snapCompareBtn = document.createElement('button');
    this.snapCompareBtn.className = 'ctrl-btn';
    this.snapCompareBtn.textContent = '对比';
    this.snapCompareBtn.title = '并排对比快照A与快照B';
    this.snapCompareBtn.disabled = true;
    this.snapCompareBtn.addEventListener('click', () => this.showSnapshotCompare());

    snapRow.appendChild(this.snapABtn);
    snapRow.appendChild(this.snapBBtn);
    snapRow.appendChild(this.snapCompareBtn);
    controlPanel.appendChild(snapRow);

    const snapSep = document.createElement('div');
    snapSep.className = 'toolbar-sep';
    controlPanel.appendChild(snapSep);

    // 按钮行
    const btnRow = document.createElement('div');
    btnRow.className = 'control-row';

    this.pauseBtn = document.createElement('button');
    this.pauseBtn.className = 'ctrl-btn';
    this.pauseBtn.textContent = '暂停';
    this.pauseBtn.addEventListener('click', () => this.callbacks.onPause());

    const clearBtn = document.createElement('button');
    clearBtn.className = 'ctrl-btn ctrl-btn-danger';
    clearBtn.textContent = '清空';
    clearBtn.addEventListener('click', () => this.callbacks.onClear());

    btnRow.appendChild(this.pauseBtn);
    btnRow.appendChild(clearBtn);
    controlPanel.appendChild(btnRow);

    // 存档按钮行
    const saveRow = document.createElement('div');
    saveRow.className = 'control-row';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'ctrl-btn';
    saveBtn.textContent = '保存';
    saveBtn.addEventListener('click', () => this.callbacks.onSave());

    const loadBtn = document.createElement('button');
    loadBtn.className = 'ctrl-btn';
    loadBtn.textContent = '加载';
    loadBtn.addEventListener('click', () => this.callbacks.onLoad());

    saveRow.appendChild(saveBtn);
    saveRow.appendChild(loadBtn);
    controlPanel.appendChild(saveRow);

    // 导出/导入文件按钮行
    const fileRow = document.createElement('div');
    fileRow.className = 'control-row';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'ctrl-btn';
    exportBtn.textContent = '导出';
    exportBtn.title = '导出世界为 .pw 文件';
    exportBtn.addEventListener('click', () => this.callbacks.onExportFile?.());

    const importBtn = document.createElement('button');
    importBtn.className = 'ctrl-btn';
    importBtn.textContent = '导入';
    importBtn.title = '导入 .pw 文件（也可拖拽到画布）';
    importBtn.addEventListener('click', () => this.callbacks.onImportFile?.());

    fileRow.appendChild(exportBtn);
    fileRow.appendChild(importBtn);
    controlPanel.appendChild(fileRow);

    // 撤销/重做按钮行
    const undoRow = document.createElement('div');
    undoRow.className = 'control-row';

    const undoBtn = document.createElement('button');
    undoBtn.className = 'ctrl-btn';
    undoBtn.textContent = '撤销';
    undoBtn.title = 'Ctrl+Z';
    undoBtn.addEventListener('click', () => this.callbacks.onUndo());

    const redoBtn = document.createElement('button');
    redoBtn.className = 'ctrl-btn';
    redoBtn.textContent = '重做';
    redoBtn.title = 'Ctrl+Y';
    redoBtn.addEventListener('click', () => this.callbacks.onRedo());

    undoRow.appendChild(undoBtn);
    undoRow.appendChild(redoBtn);
    controlPanel.appendChild(undoRow);

    // 橡皮擦按钮
    const eraserRow = document.createElement('div');
    eraserRow.className = 'control-row';
    this.eraserBtn = document.createElement('button');
    this.eraserBtn.className = 'ctrl-btn';
    this.eraserBtn.textContent = '橡皮擦';
    this.eraserBtn.title = '切换橡皮擦 (E) · 右键也可擦除';
    this.eraserBtn.addEventListener('click', () => {
      if (this.input.getMaterial() === 0) {
        // 已经是橡皮擦，切回沙子
        this.input.setMaterial(1);
      } else {
        this.input.setMaterial(0);
      }
      this.refreshMaterialSelection();
      this.refreshEraser();
    });
    eraserRow.appendChild(this.eraserBtn);
    controlPanel.appendChild(eraserRow);

    // 填充工具按钮
    const fillRow = document.createElement('div');
    fillRow.className = 'control-row';
    this.fillBtn = document.createElement('button');
    this.fillBtn.className = 'ctrl-btn';
    this.fillBtn.textContent = '填充';
    this.fillBtn.title = '洪水填充工具 (F)';
    this.fillBtn.addEventListener('click', () => {
      const current = this.input.getDrawMode();
      this.input.setDrawMode(current === 'fill' ? 'brush' : 'fill');
      this.refreshDrawMode();
    });
    fillRow.appendChild(this.fillBtn);
    controlPanel.appendChild(fillRow);

    // 替换工具按钮
    const replaceRow = document.createElement('div');
    replaceRow.className = 'control-row';
    this.replaceBtn = document.createElement('button');
    this.replaceBtn.className = 'ctrl-btn';
    this.replaceBtn.textContent = '替换';
    this.replaceBtn.title = '材质替换工具 (X) · 将笔刷范围内光标下方材质替换为当前选中材质';
    this.replaceBtn.addEventListener('click', () => {
      const current = this.input.getDrawMode();
      this.input.setDrawMode(current === 'replace' ? 'brush' : 'replace');
      this.refreshDrawMode();
    });
    replaceRow.appendChild(this.replaceBtn);
    controlPanel.appendChild(replaceRow);

    // 随机材质按钮
    const randomRow = document.createElement('div');
    randomRow.className = 'control-row';
    this.randomBtn = document.createElement('button');
    this.randomBtn.className = 'ctrl-btn';
    this.randomBtn.textContent = '随机';
    this.randomBtn.title = '随机材质模式 (R) · 每个像素随机选择材质';
    this.randomBtn.addEventListener('click', () => {
      this.input.setRandomMode(!this.input.getRandomMode());
      this.refreshRandomMode();
    });
    randomRow.appendChild(this.randomBtn);
    controlPanel.appendChild(randomRow);

    // 镜像绘制按钮
    const mirrorRow = document.createElement('div');
    mirrorRow.className = 'control-row';
    this.mirrorBtn = document.createElement('button');
    this.mirrorBtn.className = 'ctrl-btn';
    this.mirrorBtn.textContent = '镜像';
    this.mirrorBtn.title = '镜像绘制模式 (M) · 沿中轴对称绘制';
    this.mirrorBtn.addEventListener('click', () => {
      this.input.setMirrorMode(!this.input.getMirrorMode());
      this.refreshMirrorMode();
      this.callbacks.onToggleMirror?.();
    });
    mirrorRow.appendChild(this.mirrorBtn);
    controlPanel.appendChild(mirrorRow);

    // 截图按钮
    const screenshotRow = document.createElement('div');
    screenshotRow.className = 'control-row';
    const screenshotBtn = document.createElement('button');
    screenshotBtn.className = 'ctrl-btn';
    screenshotBtn.textContent = '截图';
    screenshotBtn.title = '导出画布为 PNG (P)';
    screenshotBtn.addEventListener('click', () => this.callbacks.onScreenshot());
    screenshotRow.appendChild(screenshotBtn);
    controlPanel.appendChild(screenshotRow);

    // 温度叠加层按钮
    const tempRow = document.createElement('div');
    tempRow.className = 'control-row';
    this.tempOverlayBtn = document.createElement('button');
    this.tempOverlayBtn.className = 'ctrl-btn';
    this.tempOverlayBtn.textContent = '温度: 关';
    this.tempOverlayBtn.title = '切换温度可视化 (T)';
    this.tempOverlayBtn.addEventListener('click', () => {
      this.callbacks.onToggleTempOverlay();
    });
    tempRow.appendChild(this.tempOverlayBtn);
    controlPanel.appendChild(tempRow);

    // 网格线按钮
    const gridRow = document.createElement('div');
    gridRow.className = 'control-row';
    this.gridBtn = document.createElement('button');
    this.gridBtn.className = 'ctrl-btn';
    this.gridBtn.textContent = '网格: 关';
    this.gridBtn.title = '切换网格线 (G)';
    this.gridBtn.addEventListener('click', () => {
      this.callbacks.onToggleGrid();
    });
    gridRow.appendChild(this.gridBtn);
    controlPanel.appendChild(gridRow);

    // 模拟速度
    const speedDiv = document.createElement('div');
    speedDiv.className = 'control-row';
    const speedLabel = document.createElement('span');
    speedLabel.className = 'control-label';
    speedLabel.textContent = `速度: ${this.callbacks.getSpeed()}x`;
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '1';
    speedSlider.max = '5';
    speedSlider.value = String(this.callbacks.getSpeed());
    speedSlider.setAttribute('aria-label', '模拟速度');
    speedSlider.addEventListener('input', () => {
      const speed = parseInt(speedSlider.value);
      this.callbacks.setSpeed(speed);
      speedLabel.textContent = `速度: ${speed}x`;
    });
    this.speedLabel = speedLabel;
    this.speedSlider = speedSlider;
    speedDiv.appendChild(speedLabel);
    speedDiv.appendChild(speedSlider);
    controlPanel.appendChild(speedDiv);

    // 风力控制
    const windDiv = document.createElement('div');
    windDiv.className = 'control-row';
    const windLabel = document.createElement('span');
    windLabel.className = 'control-label';
    windLabel.textContent = '风力: 无';
    const windSlider = document.createElement('input');
    windSlider.type = 'range';
    windSlider.min = '-5';
    windSlider.max = '5';
    windSlider.value = '0';
    windSlider.setAttribute('aria-label', '风力方向与强度');
    windSlider.addEventListener('input', () => {
      const val = parseInt(windSlider.value);
      if (val === 0) {
        windLabel.textContent = '风力: 无';
        this.callbacks.setWind(0, 0);
      } else {
        const dir = val > 0 ? 1 : -1;
        const strength = Math.abs(val) / 5;
        const arrow = dir > 0 ? '→' : '←';
        windLabel.textContent = `风力: ${arrow} ${Math.abs(val)}`;
        this.callbacks.setWind(dir, strength);
      }
    });
    windDiv.appendChild(windLabel);
    windDiv.appendChild(windSlider);
    controlPanel.appendChild(windDiv);

    // 天气切换按钮
    const weatherRow = document.createElement('div');
    weatherRow.className = 'control-row';
    this.weatherBtn = document.createElement('button');
    this.weatherBtn.className = 'ctrl-btn';
    this.weatherBtn.textContent = '天气: 晴天';
    this.weatherBtn.title = '切换天气 (W) · 晴天/雨天/雪天/沙尘暴/酸雨';
    this.weatherBtn.addEventListener('click', () => {
      if (this.callbacks.onCycleWeather) {
        const label = this.callbacks.onCycleWeather();
        this.weatherBtn.textContent = `天气: ${label}`;
        this.weatherBtn.classList.toggle('active', label !== '晴天');
      }
    });
    weatherRow.appendChild(this.weatherBtn);
    controlPanel.appendChild(weatherRow);

    // 录制 GIF 按钮
    const recordRow = document.createElement('div');
    recordRow.className = 'control-row';
    this.recordBtn = document.createElement('button');
    this.recordBtn.className = 'ctrl-btn';
    this.recordBtn.textContent = '录制 GIF';
    this.recordBtn.title = '录制模拟过程为 GIF 动画';
    this.recordBtn.addEventListener('click', () => {
      if (this.callbacks.onToggleRecord) {
        const recording = this.callbacks.onToggleRecord();
        this.refreshRecord(recording);
      }
    });
    recordRow.appendChild(this.recordBtn);
    controlPanel.appendChild(recordRow);

    // 粒子计数
    const statsDiv = document.createElement('div');
    statsDiv.className = 'control-row stats';
    const statsLabel = document.createElement('span');
    statsLabel.textContent = '粒子: ';
    this.particleCountEl = document.createElement('span');
    this.particleCountEl.textContent = '0';
    statsDiv.appendChild(statsLabel);
    statsDiv.appendChild(this.particleCountEl);
    controlPanel.appendChild(statsDiv);

    this.container.appendChild(controlPanel);

    // 初始化收藏夹
    this.refreshFavorites();

    // 快捷键提示
    const helpDiv = document.createElement('div');
    helpDiv.className = 'toolbar-sep';
    this.container.appendChild(helpDiv);
    const keysDiv = document.createElement('div');
    keysDiv.className = 'control-row stats';
    keysDiv.textContent = 'Space 暂停 · 1~0 材质 · [] 笔刷 · B 形状 · D 密度 · G 渐变 · F 填充 · X 替换 · R 随机 · M 镜像 · W 天气 · S 统计 · -/= 速度';
    this.container.appendChild(keysDiv);

    // 监听滚轮笔刷变化同步滑块
    const canvasEl = document.querySelector('#canvas');
    if (canvasEl) {
      canvasEl.addEventListener('brushchange', ((e: CustomEvent) => {
        slider.value = String(e.detail);
        brushLabel.textContent = `笔刷: ${e.detail}`;
      }) as EventListener);
    }
  }
}
