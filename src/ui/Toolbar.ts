import { InputHandler, BrushShape } from './InputHandler';
import { getMaterialsByCategory } from '../materials/registry';
import type { MaterialDef } from '../materials/types';

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
  getParticleCount: () => number;
  isPaused: () => boolean;
  getSpeed: () => number;
  setSpeed: (speed: number) => void;
  setWind: (dir: number, strength: number) => void;
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
  private speedLabel!: HTMLSpanElement;
  private speedSlider!: HTMLInputElement;
  private tempOverlayBtn!: HTMLButtonElement;
  private gridBtn!: HTMLButtonElement;
  private eraserBtn!: HTMLButtonElement;
  private fillBtn!: HTMLButtonElement;
  /** 记录每个分类的折叠状态 */
  private collapsedCategories = new Set<string>();

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
      const shape = btn.title.includes('圆') ? 'circle' : btn.title.includes('方') ? 'square' : 'line';
      btn.classList.toggle('active', shape === current);
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

  /** 刷新填充模式按钮状态 */
  refreshDrawMode(): void {
    const isFill = this.input.getDrawMode() === 'fill';
    this.fillBtn.classList.toggle('active', isFill);
    this.fillBtn.textContent = isFill ? '填充: 开' : '填充';
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

    return btn;
  }

  private build(): void {
    const categorized = getMaterialsByCategory();

    // 搜索框
    const searchDiv = document.createElement('div');
    searchDiv.className = 'search-box';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '搜索材质...';
    searchInput.className = 'search-input';
    searchInput.setAttribute('aria-label', '搜索材质');
    searchDiv.appendChild(searchInput);
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
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
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
      const matched = allMats.filter(m =>
        m.name.toLowerCase().includes(query) ||
        String(m.id) === query
      );
      searchLabelText.textContent = `搜索结果 (${matched.length})`;
      for (const mat of matched) {
        searchBtns.appendChild(this.createMaterialBtn(mat));
      }
      searchResults.style.display = matched.length > 0 ? '' : 'none';
    });

    // Esc 清空搜索
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.blur();
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
    ];
    for (const { shape, label } of shapes) {
      const btn = document.createElement('button');
      btn.className = 'ctrl-btn brush-shape-btn';
      btn.textContent = label;
      btn.title = shape === 'circle' ? '圆形笔刷' : shape === 'square' ? '方形笔刷' : '线条笔刷';
      if (shape === this.input.getBrushShape()) btn.classList.add('active');
      btn.addEventListener('click', () => {
        this.input.setBrushShape(shape);
        this.refreshBrushShape();
      });
      this.brushShapeBtns.push(btn);
      shapeDiv.appendChild(btn);
    }
    controlPanel.appendChild(shapeDiv);

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

    // 快捷键提示
    const helpDiv = document.createElement('div');
    helpDiv.className = 'toolbar-sep';
    this.container.appendChild(helpDiv);
    const keysDiv = document.createElement('div');
    keysDiv.className = 'control-row stats';
    keysDiv.textContent = 'Space 暂停 · 1~0 材质 · [] 笔刷 · B 形状 · F 填充 · -/= 速度';
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
