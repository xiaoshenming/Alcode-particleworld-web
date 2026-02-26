import { getAllMaterials, getMaterialsByCategory } from '../materials/registry';
import type { MaterialDef } from '../materials/types';

/**
 * 材质百科全书 —— 全屏弹窗，按分类浏览所有材质详细信息
 * 快捷键 H 或工具栏按钮打开
 */
export class Encyclopedia {
  private overlay: HTMLElement;
  private visible = false;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'encyclopedia-overlay';
    this.overlay.style.display = 'none';
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });
    document.body.appendChild(this.overlay);
  }

  toggle(): void {
    if (this.visible) this.hide();
    else this.show();
  }

  isVisible(): boolean {
    return this.visible;
  }

  private show(): void {
    this.visible = true;
    this.overlay.style.display = 'flex';
    this.build();
  }

  hide(): void {
    this.visible = false;
    this.overlay.style.display = 'none';
    // 清空内容释放内存
    while (this.overlay.firstChild) this.overlay.removeChild(this.overlay.firstChild);
  }

  private colorToCSS(abgr: number): string {
    const r = abgr & 0xFF;
    const g = (abgr >> 8) & 0xFF;
    const b = (abgr >> 16) & 0xFF;
    return `rgb(${r},${g},${b})`;
  }

  private densityStr(d: number): string {
    if (d === Infinity) return '∞ (不可移动)';
    if (d < 0) return `${d.toFixed(2)} (气体)`;
    if (d === 0) return '0 (空气)';
    return d.toFixed(2);
  }

  private build(): void {
    while (this.overlay.firstChild) this.overlay.removeChild(this.overlay.firstChild);

    const panel = document.createElement('div');
    panel.className = 'encyclopedia-panel';

    // 标题栏
    const header = document.createElement('div');
    header.className = 'encyclopedia-header';

    const title = document.createElement('span');
    title.className = 'encyclopedia-title';
    title.textContent = `材质百科全书 (${getAllMaterials().length} 种)`;
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'encyclopedia-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.hide());
    header.appendChild(closeBtn);

    panel.appendChild(header);

    // 搜索框
    const searchRow = document.createElement('div');
    searchRow.className = 'encyclopedia-search-row';
    const searchInput = document.createElement('input');
    searchInput.className = 'encyclopedia-search';
    searchInput.type = 'text';
    searchInput.placeholder = '搜索材质名称或描述...';
    searchRow.appendChild(searchInput);
    panel.appendChild(searchRow);

    // 内容区
    const content = document.createElement('div');
    content.className = 'encyclopedia-content';

    const categories = getMaterialsByCategory();
    const allSections: { section: HTMLElement; cards: { card: HTMLElement; mat: MaterialDef }[] }[] = [];

    for (const [cat, mats] of categories) {
      const section = document.createElement('div');
      section.className = 'encyclopedia-section';

      const catHeader = document.createElement('div');
      catHeader.className = 'encyclopedia-cat-header';
      catHeader.textContent = `${cat} (${mats.length})`;
      section.appendChild(catHeader);

      const grid = document.createElement('div');
      grid.className = 'encyclopedia-grid';

      const cards: { card: HTMLElement; mat: MaterialDef }[] = [];
      for (const mat of mats) {
        const card = this.buildCard(mat);
        grid.appendChild(card);
        cards.push({ card, mat });
      }

      section.appendChild(grid);
      content.appendChild(section);
      allSections.push({ section, cards });
    }

    panel.appendChild(content);
    this.overlay.appendChild(panel);

    // 搜索过滤
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      for (const { section, cards } of allSections) {
        let visibleCount = 0;
        for (const { card, mat } of cards) {
          const match = !q ||
            mat.name.toLowerCase().includes(q) ||
            (mat.description || '').toLowerCase().includes(q) ||
            String(mat.id).includes(q);
          card.style.display = match ? '' : 'none';
          if (match) visibleCount++;
        }
        section.style.display = visibleCount > 0 ? '' : 'none';
      }
    });

    // 自动聚焦搜索框
    setTimeout(() => searchInput.focus(), 50);
  }

  private buildCard(mat: MaterialDef): HTMLElement {
    const card = document.createElement('div');
    card.className = 'encyclopedia-card';

    // 色块
    const swatch = document.createElement('div');
    swatch.className = 'encyclopedia-swatch';
    swatch.style.backgroundColor = this.colorToCSS(mat.color());
    card.appendChild(swatch);

    // 信息区
    const info = document.createElement('div');
    info.className = 'encyclopedia-info';

    const nameRow = document.createElement('div');
    nameRow.className = 'encyclopedia-name';
    nameRow.textContent = `#${mat.id} ${mat.name}`;
    info.appendChild(nameRow);

    if (mat.description) {
      const desc = document.createElement('div');
      desc.className = 'encyclopedia-desc';
      desc.textContent = mat.description;
      info.appendChild(desc);
    }

    const meta = document.createElement('div');
    meta.className = 'encyclopedia-meta';
    meta.textContent = `密度: ${this.densityStr(mat.density)}`;
    info.appendChild(meta);

    card.appendChild(info);
    return card;
  }
}
