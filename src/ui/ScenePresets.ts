import { World } from '../core/World';

/** 场景预设定义 */
interface ScenePreset {
  name: string;
  icon: string;
  description: string;
  category: '自然' | '战场/科幻' | '地下/水下' | '极端';
  generate: (world: World) => void;
}

/** 辅助：在指定区域填充材质 */
function fillRect(world: World, x1: number, y1: number, x2: number, y2: number, matId: number): void {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (world.inBounds(x, y)) world.set(x, y, matId);
    }
  }
}

/** 辅助：随机散布粒子 */
function scatter(world: World, x1: number, y1: number, x2: number, y2: number, matId: number, density: number): void {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (world.inBounds(x, y) && Math.random() < density) {
        world.set(x, y, matId);
      }
    }
  }
}

/** 辅助：绘制圆形区域 */
function fillCircle(world: World, cx: number, cy: number, r: number, matId: number): void {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= r * r) {
        const x = cx + dx, y = cy + dy;
        if (world.inBounds(x, y)) world.set(x, y, matId);
      }
    }
  }
}

/** 场景：火山 */
function generateVolcano(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 地面：石头
  fillRect(world, 0, H - 15, W - 1, H - 1, 3);

  // 火山锥体（梯形）
  const baseL = 50, baseR = 150, topL = 85, topR = 115;
  const baseY = H - 15, topY = H - 70;
  for (let y = baseY; y >= topY; y--) {
    const t = (baseY - y) / (baseY - topY);
    const left = Math.round(baseL + (topL - baseL) * t);
    const right = Math.round(baseR + (topR - baseR) * t);
    fillRect(world, left, y, right, y, 3);
  }

  // 火山口：熔岩池
  fillRect(world, 90, topY - 2, 110, topY, 11);

  // 火山内部熔岩通道
  fillRect(world, 95, topY, 105, baseY - 5, 11);

  // 地表散布泥土
  scatter(world, 0, H - 18, W - 1, H - 16, 20, 0.3);

  // 天空散布烟
  scatter(world, 80, 5, 120, topY - 5, 7, 0.05);

  // 两侧散布一些植物种子
  scatter(world, 5, H - 20, 45, H - 16, 12, 0.05);
  scatter(world, 155, H - 20, W - 5, H - 16, 12, 0.05);
}

/** 场景：海洋 */
function generateOcean(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 海底：沙子
  fillRect(world, 0, H - 10, W - 1, H - 1, 1);
  // 海底岩石
  scatter(world, 0, H - 12, W - 1, H - 10, 3, 0.15);

  // 海水
  fillRect(world, 0, H - 80, W - 1, H - 11, 2);

  // 珊瑚
  for (let i = 0; i < 8; i++) {
    const cx = 15 + Math.floor(Math.random() * (W - 30));
    const cy = H - 12;
    for (let dy = 0; dy < 5 + Math.floor(Math.random() * 6); dy++) {
      if (world.inBounds(cx, cy - dy)) world.set(cx, cy - dy, 64);
    }
  }

  // 水草
  for (let i = 0; i < 12; i++) {
    const x = 10 + Math.floor(Math.random() * (W - 20));
    for (let dy = 0; dy < 4 + Math.floor(Math.random() * 5); dy++) {
      if (world.inBounds(x, H - 12 - dy)) world.set(x, H - 12 - dy, 156);
    }
  }

  // 气泡
  scatter(world, 10, H - 70, W - 10, H - 20, 73, 0.005);

  // 盐
  scatter(world, 0, H - 10, W - 1, H - 1, 23, 0.05);
}

/** 场景：森林 */
function generateForest(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 地面：泥土
  fillRect(world, 0, H - 12, W - 1, H - 1, 20);
  // 表层草地（苔藓）
  fillRect(world, 0, H - 14, W - 1, H - 13, 49);

  // 树木（木头 + 植物叶子）
  for (let i = 0; i < 7; i++) {
    const tx = 15 + Math.floor(i * (W - 30) / 6);
    const treeH = 20 + Math.floor(Math.random() * 15);
    // 树干
    for (let dy = 0; dy < treeH; dy++) {
      const y = H - 14 - dy;
      if (world.inBounds(tx, y)) world.set(tx, y, 4);
      if (world.inBounds(tx + 1, y)) world.set(tx + 1, y, 4);
    }
    // 树冠（植物）
    const crownY = H - 14 - treeH;
    const crownR = 5 + Math.floor(Math.random() * 4);
    fillCircle(world, tx, crownY, crownR, 13);
  }

  // 地面散布种子和花粉
  scatter(world, 0, H - 16, W - 1, H - 14, 12, 0.03);
  scatter(world, 0, 10, W - 1, H - 40, 114, 0.002);

  // 萤火虫
  scatter(world, 0, 10, W - 1, H - 20, 52, 0.003);

  // 藤蔓
  for (let i = 0; i < 5; i++) {
    const vx = 10 + Math.floor(Math.random() * (W - 20));
    const vy = 20 + Math.floor(Math.random() * 30);
    for (let dy = 0; dy < 8 + Math.floor(Math.random() * 8); dy++) {
      if (world.inBounds(vx, vy + dy)) world.set(vx, vy + dy, 57);
    }
  }
}

/** 场景：沙漠 */
function generateDesert(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 沙丘地形（正弦波起伏）
  for (let x = 0; x < W; x++) {
    const duneH = Math.floor(20 + 8 * Math.sin(x * 0.05) + 5 * Math.sin(x * 0.12 + 1));
    fillRect(world, x, H - duneH, x, H - 1, 1);
  }

  // 深层砂岩
  fillRect(world, 0, H - 8, W - 1, H - 1, 244);

  // 散布干沙
  scatter(world, 0, H - 30, W - 1, H - 20, 146, 0.1);

  // 沙金
  scatter(world, 0, H - 15, W - 1, H - 8, 103, 0.01);

  // 仙人掌（用植物模拟）
  for (let i = 0; i < 4; i++) {
    const cx = 20 + Math.floor(Math.random() * (W - 40));
    const baseY = H - 25;
    for (let dy = 0; dy < 10; dy++) {
      if (world.inBounds(cx, baseY - dy)) world.set(cx, baseY - dy, 13);
    }
    // 侧枝
    if (world.inBounds(cx - 2, baseY - 6)) world.set(cx - 2, baseY - 6, 13);
    if (world.inBounds(cx - 2, baseY - 7)) world.set(cx - 2, baseY - 7, 13);
    if (world.inBounds(cx + 2, baseY - 5)) world.set(cx + 2, baseY - 5, 13);
    if (world.inBounds(cx + 2, baseY - 6)) world.set(cx + 2, baseY - 6, 13);
  }

  // 沙尘暴粒子
  scatter(world, 0, 5, W - 1, 40, 84, 0.008);
}

/** 场景：冰原 */
function generateIcefield(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 冰层地面
  fillRect(world, 0, H - 20, W - 1, H - 1, 14);

  // 永冻土层
  fillRect(world, 0, H - 8, W - 1, H - 1, 190);

  // 表面雪层
  fillRect(world, 0, H - 25, W - 1, H - 21, 15);

  // 冰山（几个大冰块）
  for (let i = 0; i < 3; i++) {
    const cx = 30 + Math.floor(i * (W - 60) / 2);
    const h = 15 + Math.floor(Math.random() * 10);
    const w = 8 + Math.floor(Math.random() * 6);
    fillRect(world, cx - w, H - 25 - h, cx + w, H - 25, 14);
    // 冰山顶部雪
    fillRect(world, cx - w + 1, H - 25 - h - 2, cx + w - 1, H - 25 - h, 15);
  }

  // 霜
  scatter(world, 0, H - 30, W - 1, H - 25, 75, 0.15);

  // 飘雪
  scatter(world, 0, 0, W - 1, H - 35, 15, 0.008);

  // 冰晶
  scatter(world, 0, H - 24, W - 1, H - 20, 163, 0.03);
}

/** 场景：化学实验室 */
function generateLab(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 地板：金属
  fillRect(world, 0, H - 5, W - 1, H - 1, 10);

  // 左侧容器：玻璃壁 + 酸液
  fillRect(world, 15, H - 40, 16, H - 6, 17);
  fillRect(world, 45, H - 40, 46, H - 6, 17);
  fillRect(world, 15, H - 6, 46, H - 6, 17);
  fillRect(world, 17, H - 35, 44, H - 7, 9);

  // 中间容器：玻璃壁 + 水
  fillRect(world, 75, H - 45, 76, H - 6, 17);
  fillRect(world, 115, H - 45, 116, H - 6, 17);
  fillRect(world, 75, H - 6, 116, H - 6, 17);
  fillRect(world, 77, H - 40, 114, H - 7, 2);

  // 右侧容器：玻璃壁 + 油
  fillRect(world, 140, H - 35, 141, H - 6, 17);
  fillRect(world, 175, H - 35, 176, H - 6, 17);
  fillRect(world, 140, H - 6, 176, H - 6, 17);
  fillRect(world, 142, H - 30, 174, H - 7, 5);

  // 上方散布一些钠块（会和水反应）
  scatter(world, 80, H - 55, 110, H - 48, 79, 0.15);

  // 散布一些火花
  scatter(world, 0, 5, W - 1, 30, 28, 0.005);
}

/** 场景：暴风雨 —— 闪电+雨水+萤火虫 */
function generateStorm(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 地面：泥土+草地
  fillRect(world, 0, H - 12, W - 1, H - 1, 20);
  fillRect(world, 0, H - 14, W - 1, H - 13, 49); // 苔藓草地

  // 水坑
  fillRect(world, 60, H - 13, 100, H - 13, 2);
  fillRect(world, 130, H - 13, 170, H - 13, 2);

  // 树木（大量，暴风中的森林）
  for (let i = 0; i < 10; i++) {
    const tx = 8 + Math.floor(i * (W - 16) / 9);
    const treeH = 18 + Math.floor(Math.random() * 12);
    for (let dy = 0; dy < treeH; dy++) {
      const y = H - 14 - dy;
      if (world.inBounds(tx, y)) world.set(tx, y, 4);
    }
    const crownR = 4 + Math.floor(Math.random() * 3);
    fillCircle(world, tx, H - 14 - treeH, crownR, 13);
  }

  // 闪电：从天空随机几道
  for (let i = 0; i < 3; i++) {
    const lx = 20 + Math.floor(Math.random() * (W - 40));
    let ly = 5;
    while (ly < H - 20) {
      if (world.inBounds(lx, ly)) world.set(lx, ly, 16);
      ly += 1 + Math.floor(Math.random() * 2);
    }
  }

  // 大量雨水（从天空散布）
  scatter(world, 0, 0, W - 1, H - 20, 2, 0.04);

  // 萤火虫（雨夜发光）
  scatter(world, 0, H - 30, W - 1, H - 15, 52, 0.008);

  // 风：设置向右的轻风
  world.setWind(1, 0.3);
}

/** 场景：末日火山 —— 火山+熔岩雨+烟雾 */
function generateApocalypse(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 岩石地面
  fillRect(world, 0, H - 10, W - 1, H - 1, 3);
  // 表面熔岩池
  fillRect(world, 20, H - 11, 60, H - 11, 11);
  fillRect(world, 130, H - 11, 170, H - 11, 11);

  // 主火山
  const baseL = 40, baseR = 160, topL = 82, topR = 118;
  const baseY = H - 10, topY = H - 65;
  for (let y = baseY; y >= topY; y--) {
    const t = (baseY - y) / (baseY - topY);
    const left = Math.round(baseL + (topL - baseL) * t);
    const right = Math.round(baseR + (topR - baseR) * t);
    fillRect(world, left, y, right, y, 3);
  }
  // 火山口
  fillRect(world, 86, topY - 3, 114, topY, 11);
  // 内部熔岩
  fillRect(world, 90, topY, 110, baseY - 6, 11);

  // 天空中散布大量熔岩弹（火山喷射）
  scatter(world, topL - 10, 0, topR + 10, topY - 10, 11, 0.03);
  scatter(world, 0, 10, W - 1, 30, 7, 0.15); // 浓烟笼罩

  // 地面散布火花
  scatter(world, 0, H - 15, W - 1, H - 12, 28, 0.03);
  // 极高温
  world.setWind(0, 0);
}

/** 场景：城市 —— 建筑物+水管+电线 */
function generateCity(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 地面：混凝土
  fillRect(world, 0, H - 8, W - 1, H - 1, 36);
  // 地下管道层：水
  fillRect(world, 0, H - 4, W - 1, H - 4, 2);

  // 建筑物（用金属+混凝土模拟）
  const buildings = [
    { x: 5, w: 20, h: 50 },
    { x: 30, w: 15, h: 35 },
    { x: 50, w: 25, h: 60 },
    { x: 82, w: 20, h: 45 },
    { x: 107, w: 30, h: 70 },
    { x: 142, w: 22, h: 40 },
    { x: 170, w: 18, h: 55 },
  ];
  for (const b of buildings) {
    // 建筑主体：混凝土
    fillRect(world, b.x, H - 8 - b.h, b.x + b.w, H - 8, 36);
    // 建筑外墙：金属框架
    fillRect(world, b.x, H - 8 - b.h, b.x + 1, H - 8, 10);
    fillRect(world, b.x + b.w - 1, H - 8 - b.h, b.x + b.w, H - 8, 10);
    fillRect(world, b.x, H - 8 - b.h, b.x + b.w, H - 8 - b.h + 1, 10);
    // 楼层分隔线
    for (let floor = 8; floor < b.h; floor += 8) {
      fillRect(world, b.x + 1, H - 8 - floor, b.x + b.w - 1, H - 8 - floor, 10);
    }
    // 楼顶：玻璃
    fillRect(world, b.x + 2, H - 8 - b.h - 1, b.x + b.w - 2, H - 8 - b.h - 1, 17);
  }

  // 烟囱（工厂烟雾）
  for (let i = 0; i < 3; i++) {
    const cx = 15 + Math.floor(i * (W / 3));
    fillRect(world, cx, H - 70, cx + 2, H - 55, 10);
    scatter(world, cx - 3, H - 80, cx + 5, H - 68, 7, 0.3);
  }

  // 电线杆（电线）
  for (let i = 0; i < 5; i++) {
    const wx = 20 + i * 35;
    for (let dy = 0; dy < 15; dy++) {
      if (world.inBounds(wx, H - 8 - dy)) world.set(wx, H - 8 - dy, 10);
    }
    // 横向电线
    if (i < 4) {
      for (let dx = 0; dx <= 35; dx++) {
        if (world.inBounds(wx + dx, H - 22)) world.set(wx + dx, H - 22, 44);
      }
    }
  }

  // 道路（空气带，两侧有光源）
  fillRect(world, 22, H - 8, 30, H - 8, 20);
  fillRect(world, 45, H - 8, 50, H - 8, 20);

  // 天空中散布微量尘埃
  scatter(world, 0, 5, W - 1, H - 80, 7, 0.002);
  world.setWind(0, 0);
}

/** 场景：地下洞穴 —— 石头天花板+水晶+地下湖+矿石 */
function generateCave(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 全部填充石头作为岩石基底
  fillRect(world, 0, 0, W - 1, H - 1, 3);

  // 挖出主洞穴空间（上方留10格岩石屋顶）
  // 洞穴形状：宽大的中部 + 两侧收窄
  const caveTop = 15, caveBot = H - 20;
  for (let x = 0; x < W; x++) {
    // 洞穴高度波动（正弦波）
    const topOffset = Math.floor(5 * Math.sin(x * 0.06) + 3 * Math.sin(x * 0.13 + 0.5));
    const botOffset = Math.floor(4 * Math.sin(x * 0.07 + 1) + 2 * Math.sin(x * 0.15));
    fillRect(world, x, caveTop + topOffset, x, caveBot + botOffset, 0); // 空气
  }

  // 地下湖（底部左侧）
  fillRect(world, 10, caveBot - 8, 70, caveBot - 1, 2);

  // 熔岩池（底部右侧）
  fillRect(world, 130, caveBot - 5, W - 10, caveBot - 1, 11);

  // 钟乳石（天花板向下的尖刺）
  for (let i = 0; i < 12; i++) {
    const sx = 8 + Math.floor(i * (W - 16) / 11);
    const sh = 3 + Math.floor(Math.random() * 8);
    for (let dy = 0; dy < sh; dy++) {
      const y = caveTop + dy;
      if (world.inBounds(sx, y)) world.set(sx, y, 3);
      if (sh - dy > 2) {
        if (world.inBounds(sx - 1, y)) world.set(sx - 1, y, 3);
        if (world.inBounds(sx + 1, y)) world.set(sx + 1, y, 3);
      }
    }
  }

  // 石笋（地面向上的尖刺）
  for (let i = 0; i < 8; i++) {
    const sx = 15 + Math.floor(Math.random() * (W - 30));
    const sh = 4 + Math.floor(Math.random() * 7);
    for (let dy = 0; dy < sh; dy++) {
      const y = caveBot - dy;
      if (world.inBounds(sx, y)) world.set(sx, y, 3);
      if (sh - dy > 2) {
        if (world.inBounds(sx - 1, y)) world.set(sx - 1, y, 3);
        if (world.inBounds(sx + 1, y)) world.set(sx + 1, y, 3);
      }
    }
  }

  // 水晶柱（ID: 53=水晶）
  for (let i = 0; i < 6; i++) {
    const cx = 10 + Math.floor(Math.random() * (W - 20));
    const ch = 5 + Math.floor(Math.random() * 10);
    for (let dy = 0; dy < ch; dy++) {
      const y = caveBot - dy;
      if (world.inBounds(cx, y) && world.get(cx, y) === 0) {
        world.set(cx, y, 53);
      }
    }
  }

  // 萤火虫（洞穴中漂浮的光点）
  scatter(world, 20, caveTop + 5, W - 20, caveBot - 10, 52, 0.003);

  // 散布矿石（沙金）
  scatter(world, 0, caveTop, W - 1, caveBot, 103, 0.008);

  // 气泡从水中冒出
  scatter(world, 10, caveBot - 12, 70, caveBot - 9, 73, 0.02);

  world.setWind(0, 0);
}

/** 场景：战场 —— 弹坑+火焰+金属碎片+烟雾+爆炸 */
function generateBattlefield(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 地面：泥土+石头混合
  fillRect(world, 0, H - 15, W - 1, H - 1, 20);
  scatter(world, 0, H - 17, W - 1, H - 15, 3, 0.4);

  // 弹坑（挖去一些地面，形成凹陷）
  const craters = [
    { x: 25, r: 8 },
    { x: 70, r: 6 },
    { x: 110, r: 10 },
    { x: 155, r: 7 },
  ];
  for (const c of craters) {
    // 挖坑
    for (let dy = 0; dy <= c.r; dy++) {
      for (let dx = -c.r + dy; dx <= c.r - dy; dx++) {
        const y = H - 15 - dy + c.r;
        const x = c.x + dx;
        if (world.inBounds(x, y)) world.set(x, y, 0);
      }
    }
    // 坑内积水
    fillRect(world, c.x - c.r + 2, H - 15 + 1, c.x + c.r - 2, H - 15 + 1, 2);
    // 坑边散布泥土
    scatter(world, c.x - c.r - 3, H - 20, c.x + c.r + 3, H - 16, 20, 0.4);
  }

  // 金属碎片（战场残骸）
  scatter(world, 0, H - 20, W - 1, H - 15, 10, 0.05);

  // 燃烧的木头/残骸
  for (let i = 0; i < 5; i++) {
    const bx = 10 + Math.floor(Math.random() * (W - 20));
    const by = H - 18;
    fillRect(world, bx, by, bx + 3, by + 2, 4); // 木头
    if (world.inBounds(bx + 1, by - 1)) world.set(bx + 1, by - 1, 6); // 火
  }

  // 火焰和烟雾
  scatter(world, 0, H - 25, W - 1, H - 18, 6, 0.015);
  scatter(world, 0, 0, W - 1, H - 30, 7, 0.015);

  // 火花四溅
  scatter(world, 0, H - 30, W - 1, H - 20, 28, 0.01);

  // 破损的铁丝网（电线）
  for (let i = 0; i < 3; i++) {
    const wx = 30 + i * 55;
    for (let dx = 0; dx < 20; dx++) {
      if (world.inBounds(wx + dx, H - 20)) {
        if (Math.random() > 0.3) world.set(wx + dx, H - 20, 44); // 电线（有缺口）
      }
    }
  }

  // 天空中烟云弥漫
  scatter(world, 0, 5, W - 1, 40, 7, 0.03);
  scatter(world, 0, 10, W - 1, 50, 18, 0.005); // 毒气

  // 风向右（爆炸气浪效果）
  world.setWind(2, 0.4);
}

/** 场景：深海热泉 —— 海底热泉喷口+矿物结晶+海水 */
function generateHydrothermal(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 海底地层：石头和黑曜石
  fillRect(world, 0, H - 12, W - 1, H - 1, 3); // 石头地基
  fillRect(world, 0, H - 8, W - 1, H - 1, 60); // 黑曜石面层

  // 整个空间充满水（深海）
  fillRect(world, 0, 0, W - 1, H - 9, 2); // 深海水

  // 热泉喷口1（左侧）：蛇纹岩围成的烟囱形状
  const vent1X = Math.floor(W * 0.25);
  fillRect(world, vent1X - 5, H - 20, vent1X - 4, H - 9, 269); // 左壁（蛇纹岩）
  fillRect(world, vent1X + 4, H - 20, vent1X + 5, H - 9, 269); // 右壁
  fillRect(world, vent1X - 3, H - 22, vent1X + 3, H - 21, 269); // 顶部收口
  // 喷口内熔岩
  for (let y = H - 20; y < H - 9; y++) {
    if (world.inBounds(vent1X, y)) world.set(vent1X, y, 11); // 熔岩柱
  }
  // 热泉周围矿物结晶（硫磺+硫化物）
  scatter(world, vent1X - 8, H - 18, vent1X + 8, H - 9, 66, 0.15); // 硫磺
  scatter(world, vent1X - 6, H - 15, vent1X + 6, H - 9, 53, 0.1); // 水晶

  // 热泉喷口2（右侧）：更高的黑烟囱
  const vent2X = Math.floor(W * 0.7);
  fillRect(world, vent2X - 4, H - 30, vent2X - 3, H - 9, 77); // 岩浆岩壁
  fillRect(world, vent2X + 3, H - 30, vent2X + 4, H - 9, 77);
  fillRect(world, vent2X - 2, H - 32, vent2X + 2, H - 31, 77); // 顶部
  // 内部熔岩+高温蒸汽
  for (let y = H - 30; y < H - 9; y++) {
    if (world.inBounds(vent2X, y)) world.set(vent2X, y, 11);
    if (world.inBounds(vent2X - 1, y) && Math.random() < 0.5) world.set(vent2X - 1, y, 8); // 蒸汽
  }
  scatter(world, vent2X - 7, H - 28, vent2X + 7, H - 9, 66, 0.12);
  scatter(world, vent2X - 5, H - 22, vent2X + 5, H - 9, 98, 0.08); // 石英

  // 海底珊瑚礁（左右两侧）
  for (let i = 0; i < 8; i++) {
    const cx = 5 + Math.floor(Math.random() * (W / 3));
    const cy = H - 9;
    const cr = 2 + Math.floor(Math.random() * 4);
    fillCircle(world, cx, cy - cr, cr, 64); // 珊瑚
  }
  for (let i = 0; i < 6; i++) {
    const cx = Math.floor(W * 0.8) + Math.floor(Math.random() * (W / 5));
    const cy = H - 9;
    const cr = 2 + Math.floor(Math.random() * 3);
    fillCircle(world, cx, cy - cr, cr, 64);
  }

  // 海水中散布水草和海藻
  scatter(world, 0, H - 20, W - 1, H - 9, 156, 0.04); // 水草
  scatter(world, 0, H - 30, W - 1, H - 15, 73, 0.01); // 泡泡（热液释放）

  // 深海发光生物（荧光藻）
  scatter(world, 0, 0, W - 1, H - 20, 140, 0.003); // 荧光藻

  // 热泉周围设置高温
  for (let dy = -15; dy < 0; dy++) {
    for (let dx = -6; dx <= 6; dx++) {
      const x1 = vent1X + dx, y1 = H - 9 + dy;
      const x2 = vent2X + dx, y2 = H - 9 + dy;
      if (world.inBounds(x1, y1)) world.setTemp(x1, y1, 300 + Math.random() * 200);
      if (world.inBounds(x2, y2)) world.setTemp(x2, y2, 400 + Math.random() * 300);
    }
  }
}

/** 场景：极光温泉 —— 极地温泉+冰雪+极光粒子 */
function generateAuroraSpring(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 雪地地基
  fillRect(world, 0, H - 8, W - 1, H - 1, 3);    // 石头地层
  fillRect(world, 0, H - 10, W - 1, H - 8, 15);   // 雪地表面

  // 中央温泉池（石头边缘 + 热水）
  const poolX1 = Math.floor(W * 0.3), poolX2 = Math.floor(W * 0.7);
  const poolY1 = H - 18, poolY2 = H - 10;
  fillRect(world, poolX1 - 2, poolY1 - 2, poolX2 + 2, poolY2, 3); // 石头池壁
  fillRect(world, poolX1, poolY1, poolX2, poolY2 - 1, 2);           // 热水
  // 设置温泉水温（45-60°）
  for (let y = poolY1; y < poolY2; y++) {
    for (let x = poolX1; x < poolX2; x++) {
      if (world.inBounds(x, y)) world.setTemp(x, y, 45 + Math.random() * 15);
    }
  }

  // 池边冰柱和积雪
  scatter(world, 0, H - 14, poolX1 - 3, H - 10, 14, 0.3);    // 左侧冰
  scatter(world, poolX2 + 3, H - 14, W - 1, H - 10, 14, 0.3); // 右侧冰
  scatter(world, 0, H - 12, poolX1 - 3, H - 10, 15, 0.5);     // 左侧雪
  scatter(world, poolX2 + 3, H - 12, W - 1, H - 10, 15, 0.5);  // 右侧雪

  // 远处冰山（左右各一座）
  for (let i = 0; i < 6; i++) {
    const bx = 5 + i * 8;
    const bh = 15 + Math.floor(Math.random() * 20);
    fillRect(world, bx - 3, H - 10 - bh, bx + 3, H - 10, 14); // 冰山体
    fillRect(world, bx - 2, H - 11 - bh, bx + 2, H - 11 - bh, 15); // 雪顶
  }
  for (let i = 0; i < 6; i++) {
    const bx = W - 10 - i * 8;
    const bh = 12 + Math.floor(Math.random() * 18);
    fillRect(world, bx - 3, H - 10 - bh, bx + 3, H - 10, 14);
    fillRect(world, bx - 2, H - 11 - bh, bx + 2, H - 11 - bh, 15);
  }

  // 温泉上方蒸汽（温差触发）
  scatter(world, poolX1 + 2, poolY1 - 10, poolX2 - 2, poolY1 - 1, 8, 0.06);

  // 空中飘雪（稀疏）
  scatter(world, 0, 0, W - 1, H - 30, 15, 0.003);

  // 极光粒子带（萤火虫+等离子体模拟绿色/紫色极光）
  // 使用荧光液（ID:80）和等离子体（ID:55）分层模拟极光
  scatter(world, 0, 10, W - 1, 25, 80, 0.015);   // 顶部荧光液（绿色极光）
  scatter(world, 0, 20, W - 1, 35, 55, 0.008);   // 等离子体（紫色光带）
  scatter(world, 0, 30, W - 1, 45, 80, 0.010);   // 第二道极光
  scatter(world, 0, 5, W - 1, 15, 55, 0.005);    // 顶层等离子

  // 萤火虫点缀（极地生物）
  scatter(world, 5, H - 35, W - 5, H - 15, 52, 0.003);
}

/** 场景：沼泽 —— 泥沼+枯木+沼气+腐植质 */
function generateSwamp(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 泥土地基（深层石头+表层泥土）
  fillRect(world, 0, H - 8, W - 1, H - 1, 3);    // 石头地层
  fillRect(world, 0, H - 18, W - 1, H - 8, 20);  // 泥土层（ID:20）

  // 沼泽水面（低洼积水，不规则水坑）
  const swampY = H - 18;
  for (let x = 0; x < W; x++) {
    const depth = 3 + Math.floor(Math.sin(x * 0.15) * 2 + Math.random() * 3);
    for (let y = swampY; y < swampY + depth; y++) {
      if (world.inBounds(x, y)) {
        world.set(x, y, 2);  // 水
        world.setTemp(x, y, 18 + Math.random() * 5); // 微温（沼泽水偏暖）
      }
    }
  }

  // 泥浆区（沼泽边缘，沙+水混合态用泥浆ID:63）
  scatter(world, 0, H - 20, Math.floor(W * 0.3), H - 15, 63, 0.4);  // 左侧泥浆
  scatter(world, Math.floor(W * 0.7), H - 20, W - 1, H - 15, 63, 0.4); // 右侧泥浆

  // 枯木（高度不一的竖条，用木头ID:4）
  const treePositions = [15, 35, 55, 80, 105, 130, 155, 175];
  for (const tx of treePositions) {
    if (tx >= W) continue;
    const treeH = 12 + Math.floor(Math.random() * 15);
    const baseY = H - 18;
    // 树干
    for (let y = baseY - treeH; y < baseY; y++) {
      if (world.inBounds(tx, y)) world.set(tx, y, 4);
      if (world.inBounds(tx + 1, y) && Math.random() < 0.6) world.set(tx + 1, y, 4);
    }
    // 树根（入水部分）
    for (let y = baseY; y < baseY + 3; y++) {
      if (world.inBounds(tx - 1, y)) world.set(tx - 1, y, 4);
      if (world.inBounds(tx + 2, y)) world.set(tx + 2, y, 4);
    }
    // 枯枝（横向稀疏）
    const branchY = baseY - treeH + Math.floor(treeH * 0.4);
    for (let dx = -4; dx <= 5; dx++) {
      if (world.inBounds(tx + dx, branchY) && Math.random() < 0.5) {
        world.set(tx + dx, branchY, 4);
      }
    }
  }

  // 苔藓覆盖（树干和地面零星分布，ID:49）
  scatter(world, 0, H - 22, W - 1, H - 17, 49, 0.06);

  // 腐植质（藤蔓，ID:57=藤蔓，覆盖树干）
  scatter(world, 5, H - 30, W - 5, H - 18, 57, 0.03);

  // 沼气泡（ID:95，从水底缓慢上升）
  scatter(world, 0, swampY, W - 1, swampY + 5, 95, 0.02);

  // 水草（ID:156，水中生长）
  scatter(world, 0, swampY - 5, W - 1, swampY + 2, 156, 0.04);

  // 萤火虫（沼泽夜景，ID:52）
  scatter(world, 10, H - 40, W - 10, H - 20, 52, 0.004);

  // 雾气/烟（水面上方低雾，ID:7=烟）
  scatter(world, 0, swampY - 8, W - 1, swampY - 2, 7, 0.015);
}

/** 场景：山间瀑布 */
function generateWaterfall(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 底部地面（石头）
  fillRect(world, 0, H - 10, W - 1, H - 1, 3);

  // 左侧崖壁（石头高台，从顶部到中间）
  const cliffH = Math.floor(H * 0.55); // 崖顶Y坐标
  fillRect(world, 0, 0, Math.floor(W * 0.28), H - 10, 3);

  // 崖壁边缘修整（台阶感）
  const cliffX = Math.floor(W * 0.28);
  for (let y = 0; y <= cliffH; y++) {
    if (world.inBounds(cliffX + 1, y)) world.set(cliffX + 1, y, 3);
  }

  // 右侧小崖壁（水流另一侧挡板，形成峡谷感）
  fillRect(world, Math.floor(W * 0.72), 0, W - 1, Math.floor(H * 0.4), 3);
  // 右侧下部斜坡（石头）
  for (let y = Math.floor(H * 0.4); y < H - 10; y++) {
    const startX = Math.floor(W * 0.72) + Math.floor((y - Math.floor(H * 0.4)) * 0.3);
    if (startX < W) fillRect(world, startX, y, W - 1, y, 3);
  }

  // 水潭（底部中间区域）
  const pondLeft = cliffX + 2;
  const pondRight = Math.floor(W * 0.7);
  const pondTop = H - 18;
  fillRect(world, pondLeft, pondTop, pondRight, H - 11, 2);

  // 瀑布水柱（从崖顶流下，垂直水帘）
  const fallLeft = cliffX + 2;
  const fallRight = cliffX + 8;
  for (let y = cliffH; y < pondTop; y++) {
    for (let x = fallLeft; x <= fallRight; x++) {
      if (world.inBounds(x, y)) {
        world.set(x, y, 2); // 水
        world.setTemp(x, y, 16); // 清凉水温
      }
    }
  }

  // 崖顶水源（上方蓄水池）
  fillRect(world, 2, cliffH - 12, cliffX + 1, cliffH - 1, 2);
  // 水源温度
  for (let y = cliffH - 12; y < cliffH; y++) {
    for (let x = 2; x <= cliffX + 1; x++) {
      if (world.inBounds(x, y)) world.setTemp(x, y, 15);
    }
  }

  // 瀑布水雾（水柱两侧）
  for (let y = cliffH + 5; y < pondTop + 5; y++) {
    if (world.inBounds(fallLeft - 1, y) && Math.random() < 0.3) world.set(fallLeft - 1, y, 8); // 蒸汽
    if (world.inBounds(fallRight + 1, y) && Math.random() < 0.3) world.set(fallRight + 1, y, 8);
  }
  // 水潭表面水雾
  scatter(world, pondLeft, pondTop - 6, pondRight, pondTop - 1, 8, 0.08);

  // 苔藓（崖壁潮湿处，ID:49）
  scatter(world, 0, Math.floor(H * 0.3), cliffX - 1, H - 10, 49, 0.05);
  scatter(world, pondRight + 1, pondTop, W - 2, H - 10, 49, 0.04);

  // 植物（水潭周围，ID:13）
  scatter(world, pondLeft, pondTop - 8, pondLeft + 5, pondTop - 1, 13, 0.2);
  scatter(world, pondRight - 5, pondTop - 8, pondRight, pondTop - 1, 13, 0.2);

  // 藤蔓（崖壁垂挂，ID:57）
  scatter(world, cliffX - 3, cliffH, cliffX, H - 15, 57, 0.1);

  // 水草（水潭中，ID:156）
  scatter(world, pondLeft + 5, pondTop, pondRight - 5, H - 12, 156, 0.04);

  // 水晶（崖壁岩石中，ID:53）
  scatter(world, 2, Math.floor(H * 0.5), cliffX - 2, H - 11, 53, 0.015);

  // 底部沙砾（水潭底部，ID:1=沙子）
  scatter(world, pondLeft, H - 11, pondRight, H - 10, 1, 0.3);
}

/** 沙漠绿洲场景 —— 第16个预设
 * - 两侧大沙丘（沙子+骨头+干草点缀）+ 中间绿洲水源
 * - 绿洲水池（水+水草+植物）+ 仙人掌形态（种子+植物）
 * - 底层岩石地基 + 沙尘漂移（干沙ID:146 + 沙尘暴ID:84小量）
 * - 绿洲周边：棕榈型植物（高植物柱）+ 苔藓+水晶点缀
 */
function generateOasis(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 底部岩石层（薄层，模拟沙漠基岩）
  fillRect(world, 0, H - 6, W - 1, H - 1, 3);

  // 左侧大沙丘（从左到中间，高度呈弧形）
  const oasisLeft = Math.floor(W * 0.33);
  const oasisRight = Math.floor(W * 0.67);
  const oasisBottom = H - 7;
  const oasisTop = Math.floor(H * 0.55);

  for (let x = 0; x < oasisLeft; x++) {
    // 沙丘高度：左侧低→中间高→绿洲处骤降
    const ratio = x / oasisLeft;
    const duneHeight = Math.floor(H * 0.35 + Math.sin(ratio * Math.PI) * H * 0.18);
    const duneTop = H - 6 - duneHeight;
    for (let y = duneTop; y < H - 6; y++) {
      world.set(x, y, 1); // 沙子
      world.setTemp(x, y, 45); // 炎热
    }
  }

  // 右侧大沙丘
  for (let x = oasisRight; x < W; x++) {
    const ratio = (W - 1 - x) / (W - oasisRight);
    const duneHeight = Math.floor(H * 0.35 + Math.sin(ratio * Math.PI) * H * 0.18);
    const duneTop = H - 6 - duneHeight;
    for (let y = duneTop; y < H - 6; y++) {
      world.set(x, y, 1);
      world.setTemp(x, y, 45);
    }
  }

  // 绿洲中央水池（中下区域）
  const poolLeft = oasisLeft + 4;
  const poolRight = oasisRight - 4;
  const poolTop = oasisBottom - 8;
  fillRect(world, poolLeft, poolTop, poolRight, oasisBottom, 2); // 水
  for (let y = poolTop; y <= oasisBottom; y++) {
    for (let x = poolLeft; x <= poolRight; x++) {
      world.setTemp(x, y, 22); // 清凉水温
    }
  }

  // 绿洲水池底部沙砾
  scatter(world, poolLeft, oasisBottom - 1, poolRight, oasisBottom, 1, 0.3);

  // 水草（水池中，ID:156）
  scatter(world, poolLeft + 2, poolTop + 2, poolRight - 2, oasisBottom - 2, 156, 0.05);

  // 绿洲地面（湿润土壤，用泥土ID:20）
  fillRect(world, oasisLeft, oasisBottom + 1, oasisRight, H - 7, 20);

  // 棕榈树（绿洲两侧，高柱状植物ID:13）
  // 左棕榈
  const palm1X = oasisLeft + 8;
  for (let y = oasisTop + 5; y < oasisBottom; y++) {
    if (world.inBounds(palm1X, y)) world.set(palm1X, y, 13);
  }
  // 树冠（水平展开）
  for (let dx = -4; dx <= 4; dx++) {
    if (world.inBounds(palm1X + dx, oasisTop + 5)) world.set(palm1X + dx, oasisTop + 5, 13);
    if (world.inBounds(palm1X + dx, oasisTop + 6)) world.set(palm1X + dx, oasisTop + 6, 13);
  }
  // 右棕榈
  const palm2X = oasisRight - 8;
  for (let y = oasisTop + 5; y < oasisBottom; y++) {
    if (world.inBounds(palm2X, y)) world.set(palm2X, y, 13);
  }
  for (let dx = -4; dx <= 4; dx++) {
    if (world.inBounds(palm2X + dx, oasisTop + 5)) world.set(palm2X + dx, oasisTop + 5, 13);
    if (world.inBounds(palm2X + dx, oasisTop + 6)) world.set(palm2X + dx, oasisTop + 6, 13);
  }

  // 绿洲周围植物（矮灌木）
  scatter(world, oasisLeft, poolTop - 5, poolLeft - 1, oasisBottom, 13, 0.12);
  scatter(world, poolRight + 1, poolTop - 5, oasisRight, oasisBottom, 13, 0.12);

  // 水池旁苔藓（湿润边缘，ID:49）
  scatter(world, poolLeft - 3, poolTop - 3, poolLeft, oasisBottom + 2, 49, 0.2);
  scatter(world, poolRight, poolTop - 3, poolRight + 3, oasisBottom + 2, 49, 0.2);

  // 沙丘中点缀干草（ID:134）和骨头（ID:105）——沙漠遗骸感
  scatter(world, 2, Math.floor(H * 0.6), oasisLeft - 2, H - 7, 134, 0.02);
  scatter(world, oasisRight + 2, Math.floor(H * 0.6), W - 3, H - 7, 105, 0.01);

  // 少量沙尘在空中（干沙ID:146漂浮，上层）
  scatter(world, 0, Math.floor(H * 0.2), W - 1, Math.floor(H * 0.38), 146, 0.015);

  // 绿洲中央水晶（清澈水底，ID:53）
  scatter(world, poolLeft + 2, oasisBottom - 2, poolRight - 2, oasisBottom, 53, 0.02);

  // 种子点缀（沙丘边缘，ID:12，会生长成植物）
  scatter(world, oasisLeft + 1, poolTop - 4, oasisLeft + 4, oasisBottom - 1, 12, 0.05);
  scatter(world, oasisRight - 4, poolTop - 4, oasisRight - 1, oasisBottom - 1, 12, 0.05);
}

/** 太空陨石坑场景 —— 第17个预设
 * 陨石撞击坑地形：坑口岩石环 + 矿石/水晶层 + 超低温陨石残留 + 真空感
 */
function generateCrater(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 底层：月球岩石地基（黑曜石，ID:60，模拟月岩）
  fillRect(world, 0, H - 4, W - 1, H - 1, 60);

  // 主地层：石头（ID:3）为主体
  fillRect(world, 0, Math.floor(H * 0.65), W - 1, H - 5, 3);

  // 矿物层：矿石/水晶夹层（中部地层）
  scatter(world, 0, Math.floor(H * 0.7), W - 1, Math.floor(H * 0.85), 53, 0.07);   // 水晶
  scatter(world, 0, Math.floor(H * 0.72), W - 1, Math.floor(H * 0.88), 66, 0.04);   // 硫磺矿
  scatter(world, 0, Math.floor(H * 0.75), W - 1, Math.floor(H * 0.90), 31, 0.02);   // 金矿
  scatter(world, 0, Math.floor(H * 0.78), W - 1, H - 5, 32, 0.015);                 // 钻石

  // 陨石坑形状：中央椭圆坑
  const craterCX = Math.floor(W / 2);
  const craterCY = Math.floor(H * 0.65);
  const craterRX = Math.floor(W * 0.22); // 水平半径
  const craterRY = Math.floor(H * 0.18); // 垂直半径

  // 挖空坑内部（置为空气）
  for (let cy = craterCY - craterRY; cy <= craterCY + craterRY / 2; cy++) {
    for (let cx = craterCX - craterRX; cx <= craterCX + craterRX; cx++) {
      if (!world.inBounds(cx, cy)) continue;
      const dx = (cx - craterCX) / craterRX;
      const dy = (cy - craterCY) / craterRY;
      if (dx * dx + dy * dy <= 1.0) {
        world.set(cx, cy, 0); // 空气（真空感）
      }
    }
  }

  // 坑口岩石环（黑曜石隆起边缘）
  const rimH = Math.floor(H * 0.08);
  for (let cx = craterCX - craterRX - 4; cx <= craterCX + craterRX + 4; cx++) {
    if (!world.inBounds(cx, craterCY - craterRY - rimH)) continue;
    const dx = Math.abs(cx - craterCX) / (craterRX + 4);
    const rimHeight = Math.floor(rimH * (1 - dx * dx * 0.5));
    for (let ry2 = 0; ry2 < rimHeight; ry2++) {
      const ry3 = craterCY - craterRY - ry2;
      if (world.inBounds(cx, ry3)) {
        world.set(cx, ry3, 60); // 黑曜石边缘隆起
      }
    }
  }

  // 坑底：陨石残留（陨石ID:58）+ 超低温（模拟太空极寒）
  const craterFloor = craterCY + Math.floor(craterRY * 0.6);
  scatter(world, craterCX - Math.floor(craterRX * 0.5), craterFloor - 3,
    craterCX + Math.floor(craterRX * 0.5), craterFloor, 58, 0.25);
  for (let cy2 = craterFloor - 4; cy2 <= craterFloor; cy2++) {
    for (let cx2 = craterCX - Math.floor(craterRX * 0.6); cx2 <= craterCX + Math.floor(craterRX * 0.6); cx2++) {
      if (world.inBounds(cx2, cy2)) world.setTemp(cx2, cy2, -120); // 极寒
    }
  }

  // 坑底液氮（ID:68）积聚（陨石坑底部极寒液体）
  fillRect(world, craterCX - Math.floor(craterRX * 0.35), craterFloor - 1,
    craterCX + Math.floor(craterRX * 0.35), craterFloor, 68);

  // 坑壁上散布水晶/矿石（撞击暴露地层）
  for (let layer = 0; layer < 3; layer++) {
    const layerY = craterCY - Math.floor(craterRY * 0.6) + layer * 6;
    scatter(world, craterCX - craterRX + 1, layerY,
      craterCX - Math.floor(craterRX * 0.6), layerY + 4, 53, 0.3);
    scatter(world, craterCX + Math.floor(craterRX * 0.6), layerY,
      craterCX + craterRX - 1, layerY + 4, 53, 0.3);
  }

  // 高空：极少量飘散陨石尘（干沙ID:146，模拟溅射物）
  scatter(world, craterCX - craterRX * 2, 5, Math.min(W - 1, craterCX + craterRX * 2), 30, 146, 0.012);
  scatter(world, craterCX - craterRX, 30, craterCX + craterRX, Math.floor(H * 0.45), 146, 0.008);

  // 岩石侧翼中嵌入闪光矿（金属）
  scatter(world, 0, Math.floor(H * 0.65), Math.floor(W * 0.25), H - 5, 10, 0.04);   // 金属
  scatter(world, Math.floor(W * 0.75), Math.floor(H * 0.65), W - 1, H - 5, 10, 0.04);
}

/** 场景：核反应堆 */
function generateNuclearReactor(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 混凝土防护层底座
  fillRect(world, 0, H - 20, W - 1, H - 1, 36);
  
  // 反应堆核心（中央）
  const coreX = Math.floor(W / 2), coreY = H - 50;
  fillCircle(world, coreX, coreY, 8, 11); // 熔岩核心
  fillCircle(world, coreX, coreY, 12, 55); // 等离子体外层
  
  // 冷却水池（两侧）
  fillRect(world, 20, H - 45, 60, H - 21, 2); // 左侧水池
  fillRect(world, W - 60, H - 45, W - 20, H - 21, 2); // 右侧水池
  
  // 蒸汽管道
  for (let x = 30; x < 50; x += 3) {
    fillRect(world, x, H - 60, x + 1, H - 46, 10); // 金属管
  }
  for (let x = W - 50; x < W - 30; x += 3) {
    fillRect(world, x, H - 60, x + 1, H - 46, 10);
  }
  
  // 控制棒（铅）
  fillRect(world, coreX - 15, H - 70, coreX - 13, coreY - 13, 226);
  fillRect(world, coreX + 13, H - 70, coreX + 15, coreY - 13, 226);
  
  // 辐射警告区（毒气）
  scatter(world, coreX - 25, coreY - 20, coreX + 25, coreY + 20, 18, 0.05);
  
  // 混凝土防护墙
  fillRect(world, coreX - 30, H - 70, coreX - 28, H - 21, 36);
  fillRect(world, coreX + 28, H - 70, coreX + 30, H - 21, 36);
  
  // 电线网络
  for (let y = H - 65; y < H - 25; y += 8) {
    fillRect(world, 10, y, 15, y, 44);
    fillRect(world, W - 15, y, W - 10, y, 44);
  }
  
  // 高温预设
  for (let dy = -12; dy <= 12; dy++) {
    for (let dx = -12; dx <= 12; dx++) {
      if (dx * dx + dy * dy <= 144) {
        world.setTemp(coreX + dx, coreY + dy, 800);
      }
    }
  }
}

/** 场景：蚁穴生态 */
function generateAntNest(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 地表土壤层
  fillRect(world, 0, H - 80, W - 1, H - 1, 20);
  
  // 蚁穴入口（中央）
  const entranceX = Math.floor(W / 2);
  fillCircle(world, entranceX, H - 78, 4, 0);
  
  // 主通道（垂直）
  fillRect(world, entranceX - 2, H - 75, entranceX + 2, H - 30, 0);
  
  // 分支洞室（左侧3个）
  fillCircle(world, entranceX - 25, H - 65, 8, 0); // 育儿室
  fillRect(world, entranceX - 17, H - 65, entranceX - 3, H - 63, 0); // 连接通道
  fillCircle(world, entranceX - 30, H - 50, 6, 0); // 食物储藏室
  fillRect(world, entranceX - 24, H - 50, entranceX - 3, H - 48, 0);
  fillCircle(world, entranceX - 20, H - 35, 7, 0); // 蚁后室
  fillRect(world, entranceX - 13, H - 35, entranceX - 3, H - 33, 0);
  
  // 分支洞室（右侧3个）
  fillCircle(world, entranceX + 25, H - 65, 8, 0);
  fillRect(world, entranceX + 3, H - 65, entranceX + 17, H - 63, 0);
  fillCircle(world, entranceX + 30, H - 50, 6, 0);
  fillRect(world, entranceX + 3, H - 50, entranceX + 24, H - 48, 0);
  fillCircle(world, entranceX + 20, H - 35, 7, 0);
  fillRect(world, entranceX + 3, H - 35, entranceX + 13, H - 33, 0);
  
  // 蚂蚁（40只）
  for (let i = 0; i < 40; i++) {
    const x = entranceX - 35 + Math.floor(Math.random() * 70);
    const y = H - 70 + Math.floor(Math.random() * 40);
    if (world.get(x, y) === 0) world.set(x, y, 40);
  }
  
  // 食物储备（种子+蜂蜜）
  scatter(world, entranceX - 35, H - 55, entranceX - 25, H - 45, 12, 0.4);
  scatter(world, entranceX - 35, H - 55, entranceX - 25, H - 45, 45, 0.3);
  
  // 地下水脉
  fillRect(world, 0, H - 15, W - 1, H - 10, 2);
  
  // 根系（植物根）
  for (let i = 0; i < 8; i++) {
    const rootX = 10 + i * 20;
    let rootY = H - 80;
    for (let j = 0; j < 15; j++) {
      world.set(rootX + Math.floor(Math.random() * 3) - 1, rootY, 13);
      rootY--;
      if (Math.random() < 0.3) break;
    }
  }
  
  // 地表植被
  scatter(world, 0, H - 85, W - 1, H - 81, 13, 0.15);
}

/** 场景：龙卷风灾害 */
function generateTornadoDisaster(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 地面（泥土+碎石）
  fillRect(world, 0, H - 12, W - 1, H - 1, 20);
  scatter(world, 0, H - 12, W - 1, H - 1, 3, 0.2);
  
  // 被摧毁的建筑残骸（左侧）
  fillRect(world, 15, H - 25, 35, H - 13, 36); // 混凝土墙
  fillRect(world, 20, H - 30, 30, H - 26, 4); // 木梁
  scatter(world, 15, H - 30, 35, H - 13, 10, 0.15); // 金属碎片
  
  // 倾斜的电线杆
  for (let i = 0; i < 3; i++) {
    const poleX = 50 + i * 30;
    for (let dy = 0; dy < 20; dy++) {
      world.set(poleX + Math.floor(dy * 0.3), H - 13 - dy, 4);
    }
    fillRect(world, poleX - 5, H - 33, poleX + 5, H - 32, 44); // 电线
  }
  
  // 龙卷风（3个，从左到右）
  for (let i = 0; i < 3; i++) {
    const tornadoX = 40 + i * 50;
    const tornadoY = H - 60;
    for (let r = 0; r < 8; r++) {
      const radius = 3 + r * 2;
      for (let angle = 0; angle < 360; angle += 30) {
        const rad = angle * Math.PI / 180;
        const x = tornadoX + Math.floor(Math.cos(rad) * radius);
        const y = tornadoY + r * 5;
        if (world.inBounds(x, y)) world.set(x, y, 50);
      }
    }
  }
  
  // 飞扬的碎片（沙尘+木头+金属）
  scatter(world, 0, H - 80, W - 1, H - 40, 1, 0.08); // 沙子
  scatter(world, 0, H - 80, W - 1, H - 40, 4, 0.03); // 木头
  scatter(world, 0, H - 80, W - 1, H - 40, 10, 0.02); // 金属
  
  // 暴雨云层
  fillRect(world, 0, 0, W - 1, 25, 76); // 云
  scatter(world, 0, 0, W - 1, 25, 7, 0.15); // 烟雾
  
  // 暴雨（水滴从云层落下）
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(Math.random() * W);
    const y = 20 + Math.floor(Math.random() * 15);
    world.set(x, y, 2);
  }
  
  // 闪电（2道）
  const lightning1X = 60;
  for (let y = 5; y < 40; y++) {
    world.set(lightning1X + Math.floor(Math.random() * 3) - 1, y, 16);
  }
  const lightning2X = 140;
  for (let y = 8; y < 45; y++) {
    world.set(lightning2X + Math.floor(Math.random() * 3) - 1, y, 16);
  }
  
  // 被连根拔起的树（右侧）
  fillRect(world, W - 40, H - 20, W - 35, H - 13, 4); // 树干横倒
  scatter(world, W - 45, H - 22, W - 30, H - 19, 13, 0.4); // 树叶散落
}
/** 所有预设场景 */
export const SCENE_PRESETS: ScenePreset[] = [
  { name: '火山', icon: '🌋', description: '熔岩喷发的火山场景', category: '自然', generate: generateVolcano },
  { name: '海洋', icon: '🌊', description: '深海珊瑚与水草', category: '自然', generate: generateOcean },
  { name: '森林', icon: '🌲', description: '茂密的森林与萤火虫', category: '自然', generate: generateForest },
  { name: '沙漠', icon: '🏜️', description: '起伏的沙丘与沙尘暴', category: '自然', generate: generateDesert },
  { name: '冰原', icon: '❄️', description: '冰山与飘雪的极地', category: '自然', generate: generateIcefield },
  { name: '暴风雨', icon: '⛈️', description: '闪电+暴雨+萤火虫夜晚', category: '自然', generate: generateStorm },
  { name: '神秘沼泽', icon: '🌿', description: '泥沼+枯木藤蔓+沼气+萤火虫夜景', category: '自然', generate: generateSwamp },
  { name: '山间瀑布', icon: '💧', description: '崖壁瀑布+水潭+水雾+苔藓藤蔓', category: '自然', generate: generateWaterfall },
  { name: '沙漠绿洲', icon: '🌴', description: '大沙丘+绿洲水池+棕榈树+干草遗骸', category: '自然', generate: generateOasis },
  { name: '极地冰盖', icon: '🧊', description: '大型冰川+冰川湖+极光+霜雪覆盖+液氮极寒', category: '自然', generate: generatePolarIcecap },
  { name: '城市', icon: '🏙️', description: '混凝土建筑+电线+工业烟雾', category: '战场/科幻', generate: generateCity },
  { name: '实验室', icon: '🧪', description: '化学容器与反应实验', category: '战场/科幻', generate: generateLab },
  { name: '战场', icon: '💥', description: '弹坑+火焰+金属碎片+毒气烟雾', category: '战场/科幻', generate: generateBattlefield },
  { name: '极光温泉', icon: '🌌', description: '极地温泉+冰山+极光粒子带+飘雪', category: '战场/科幻', generate: generateAuroraSpring },
  { name: '太空陨石坑', icon: '☄️', description: '撞击坑+矿石水晶层+陨石残留+液氮极寒', category: '战场/科幻', generate: generateCrater },
  { name: '工业熔炉', icon: '🏭', description: '高炉冶炼+液态金属+铸造台+熔盐+工业烟尘', category: '战场/科幻', generate: generateIndustrialFurnace },
  { name: '核反应堆', icon: '⚛️', description: '反应堆核心+冷却水池+控制棒+辐射区+电力系统', category: '战场/科幻', generate: generateNuclearReactor },
  { name: '地下洞穴', icon: '🦇', description: '水晶+地下湖+钟乳石+熔岩池', category: '地下/水下', generate: generateCave },
  { name: '深海热泉', icon: '🌊', description: '海底热泉喷口+矿物结晶+发光深海生物', category: '地下/水下', generate: generateHydrothermal },
  { name: '地下熔岩管', icon: '🔥', description: '蜿蜒熔岩管道+洞穴空腔+蒸汽喷口+矿脉', category: '地下/水下', generate: generateLavaTube },
  { name: '沉船残骸', icon: '⚓', description: '铁锈覆盖的沉船+珊瑚礁+热带鱼+海底宝藏', category: '地下/水下', generate: generateShipwreck },
  { name: '蚁穴生态', icon: '🐜', description: '地下蚁穴+洞室网络+蚂蚁群落+食物储备+根系', category: '地下/水下', generate: generateAntNest },
  { name: '末日火山', icon: '🌋', description: '末日熔岩雨与火山喷发', category: '极端', generate: generateApocalypse },
  { name: '深海黑暗区', icon: '🦑', description: '深渊高压+发光生物+热液喷口+黑暗矿脉+超冷水', category: '极端', generate: generateDeepAbyss },
  { name: '极端酸雨', icon: '☠️', description: '酸液从天而降+腐蚀地表+中和水池+防护材料', category: '极端', generate: generateAcidRain },
  { name: '冰河时代', icon: '🏔️', description: '千米冰盖+冰川流动+冻土层+猛犸象脚印+极光', category: '极端', generate: generateIceAge },
  { name: '龙卷风灾害', icon: '🌪️', description: '多重龙卷风+建筑残骸+暴雨闪电+飞扬碎片', category: '极端', generate: generateTornadoDisaster },
];

/**
 * 场景预设选择面板
 * 按 K 键打开/关闭，点击场景一键加载
 */
export class ScenePanel {
  private overlay: HTMLElement;
  private visible = false;
  private onSelect: (preset: ScenePreset) => void;

  constructor(onSelect: (preset: ScenePreset) => void) {
    this.onSelect = onSelect;

    this.overlay = document.createElement('div');
    this.overlay.className = 'scene-panel-overlay';
    this.overlay.style.display = 'none';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-label', '场景预设');

    const panel = document.createElement('div');
    panel.className = 'scene-panel';

    const title = document.createElement('h3');
    title.textContent = '场景预设 (K)';
    title.className = 'scene-panel-title';
    panel.appendChild(title);

    // 按分类分组显示场景
    const categories: Array<ScenePreset['category']> = ['自然', '地下/水下', '战场/科幻', '极端'];
    const categoryIcons: Record<string, string> = {
      '自然': '🌍',
      '地下/水下': '⛏️',
      '战场/科幻': '🚀',
      '极端': '⚠️',
    };

    for (const cat of categories) {
      const presets = SCENE_PRESETS.filter(p => p.category === cat);
      if (presets.length === 0) continue;

      // 分类标题
      const catHeader = document.createElement('div');
      catHeader.className = 'scene-category-header';
      catHeader.textContent = `${categoryIcons[cat]} ${cat}`;
      panel.appendChild(catHeader);

      const grid = document.createElement('div');
      grid.className = 'scene-grid';

      for (const preset of presets) {
        const card = document.createElement('button');
        card.className = 'scene-card';
        card.setAttribute('aria-label', `加载${preset.name}场景`);

        const icon = document.createElement('span');
        icon.className = 'scene-icon';
        icon.textContent = preset.icon;

        const name = document.createElement('span');
        name.className = 'scene-name';
        name.textContent = preset.name;

        const desc = document.createElement('span');
        desc.className = 'scene-desc';
        desc.textContent = preset.description;

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(desc);

        card.addEventListener('click', () => {
          this.onSelect(preset);
          this.hide();
        });

        grid.appendChild(card);
      }

      panel.appendChild(grid);
    }

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'scene-close-btn';
    closeBtn.textContent = '关闭 (K/Esc)';
    closeBtn.addEventListener('click', () => this.hide());
    panel.appendChild(closeBtn);

    this.overlay.appendChild(panel);

    // 点击遮罩关闭
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });

    document.body.appendChild(this.overlay);
  }

  toggle(): void {
    if (this.visible) this.hide();
    else this.show();
  }

  show(): void {
    this.visible = true;
    this.overlay.style.display = 'flex';
  }

  hide(): void {
    this.visible = false;
    this.overlay.style.display = 'none';
  }

  isVisible(): boolean {
    return this.visible;
  }
}

/** 地下熔岩管道场景 —— 第18个预设 */
function generateLavaTube(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 全域岩石地基
  fillRect(world, 0, 0, W - 1, H - 1, 3);

  // 雕刻蜿蜒熔岩管道（S形曲线，上下两段）
  // 管道1：左→右，从1/4高度处水平延伸，向下弯曲
  const pipeR = 5; // 管道半径
  for (let px = 0; px < W; px++) {
    // 正弦波形管道中心Y：在H*0.30到H*0.50之间蜿蜒
    const centerY1 = Math.floor(H * 0.38 + Math.sin(px * 0.035) * H * 0.07);
    for (let dy = -pipeR; dy <= pipeR; dy++) {
      const py = centerY1 + dy;
      if (world.inBounds(px, py)) world.set(px, py, 11); // 熔岩管道
    }
    // 管道2：另一条反向正弦波，在H*0.60到H*0.80之间
    const centerY2 = Math.floor(H * 0.68 + Math.cos(px * 0.04 + 1.5) * H * 0.07);
    for (let dy2 = -pipeR; dy2 <= pipeR; dy2++) {
      const py2 = centerY2 + dy2;
      if (world.inBounds(px, py2)) world.set(px, py2, 11); // 熔岩管道
    }
  }

  // 管道两端开口：左右边界清除一段变为空气（使熔岩流动可见）
  fillRect(world, 0, Math.floor(H * 0.28), 4, Math.floor(H * 0.50), 0);
  fillRect(world, W - 5, Math.floor(H * 0.28), W - 1, Math.floor(H * 0.50), 0);
  fillRect(world, 0, Math.floor(H * 0.58), 4, Math.floor(H * 0.80), 0);
  fillRect(world, W - 5, Math.floor(H * 0.58), W - 1, Math.floor(H * 0.80), 0);

  // 主洞穴空腔：中央大空洞（玩家活动空间）
  const caveCX = Math.floor(W * 0.5);
  const caveY1 = Math.floor(H * 0.15), caveY2 = Math.floor(H * 0.55);
  const caveRX = Math.floor(W * 0.28);
  for (let cy = caveY1; cy <= caveY2; cy++) {
    // 宽度随高度变化：上窄下宽（倒梯形状）
    const progress = (cy - caveY1) / (caveY2 - caveY1);
    const halfW = Math.floor(caveRX * (0.4 + progress * 0.6));
    for (let cx = caveCX - halfW; cx <= caveCX + halfW; cx++) {
      if (world.inBounds(cx, cy)) world.set(cx, cy, 0); // 空气
    }
  }

  // 钟乳石（上方石头延伸入洞穴）
  for (let sx = caveCX - caveRX + 5; sx < caveCX + caveRX - 5; sx += 8 + Math.floor(Math.random() * 6)) {
    const stLen = 3 + Math.floor(Math.random() * 7);
    for (let sy = caveY1; sy <= caveY1 + stLen; sy++) {
      if (world.inBounds(sx, sy) && world.get(sx, sy) === 0) world.set(sx, sy, 3);
    }
  }

  // 洞底：熔岩池（小型积聚）
  const lavaFloorY = Math.floor(H * 0.52);
  fillRect(world, caveCX - Math.floor(caveRX * 0.5), lavaFloorY - 2,
    caveCX + Math.floor(caveRX * 0.5), lavaFloorY, 11);
  // 熔岩池周围设置高温
  for (let ty = lavaFloorY - 5; ty <= lavaFloorY + 2; ty++) {
    for (let tx = caveCX - Math.floor(caveRX * 0.6); tx <= caveCX + Math.floor(caveRX * 0.6); tx++) {
      if (world.inBounds(tx, ty)) world.setTemp(tx, ty, 900);
    }
  }

  // 矿物：水晶脉、金矿、钻石嵌入洞壁
  scatter(world, caveCX - caveRX - 10, caveY1, caveCX - Math.floor(caveRX * 0.7), caveY2, 53, 0.12); // 水晶
  scatter(world, caveCX + Math.floor(caveRX * 0.7), caveY1, caveCX + caveRX + 10, caveY2, 53, 0.12);
  scatter(world, 0, Math.floor(H * 0.2), Math.floor(W * 0.3), Math.floor(H * 0.9), 31, 0.02);   // 金
  scatter(world, 0, Math.floor(H * 0.5), W - 1, H - 1, 32, 0.008);  // 钻石（深处）

  // 蒸汽喷口：洞底几个位置向上喷蒸汽（实际上就是暴露到洞底的熔岩产生蒸汽）
  const ventPositions = [
    caveCX - Math.floor(caveRX * 0.4),
    caveCX,
    caveCX + Math.floor(caveRX * 0.4),
  ];
  for (const vx of ventPositions) {
    for (let vy = caveY2 - 4; vy <= caveY2; vy++) {
      if (world.inBounds(vx, vy) && world.get(vx, vy) === 0) {
        world.set(vx, vy, 8); // 蒸汽柱
        world.setTemp(vx, vy, 300);
      }
    }
  }

  // 黑曜石管壁衬层（熔岩管壁边缘）
  scatter(world, 0, Math.floor(H * 0.3), W - 1, Math.floor(H * 0.48), 60, 0.04);
  scatter(world, 0, Math.floor(H * 0.6), W - 1, Math.floor(H * 0.78), 60, 0.04);
}

/** 极地冰盖场景 —— 第19个预设 */
function generatePolarIcecap(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 整体设置极寒温度（-50°C）
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      world.setTemp(x, y, -50);
    }
  }

  // 地基：厚重冰层（下半部分）
  const iceBaseY = Math.floor(H * 0.65);
  fillRect(world, 0, iceBaseY, W - 1, H - 1, 14); // 冰

  // 冰层之下埋藏永冻土
  fillRect(world, 0, Math.floor(H * 0.78), W - 1, H - 1, 190); // 永冻土

  // 主冰川：中央巨型冰山（不规则山体轮廓）
  const glacierCX = Math.floor(W * 0.5);
  const glacierPeak = Math.floor(H * 0.2); // 峰顶Y
  for (let gx = glacierCX - 55; gx <= glacierCX + 55; gx++) {
    // 余弦形状的冰川高度
    const dx = gx - glacierCX;
    const t = Math.abs(dx) / 55;
    const peakH = glacierPeak + Math.floor(t * t * H * 0.35); // 抛物线
    // 叠加随机噪声使边缘不规则
    const noiseH = peakH + Math.floor(Math.sin(gx * 0.3) * 3 + Math.cos(gx * 0.7) * 2);
    if (world.inBounds(gx, noiseH)) {
      fillRect(world, gx, noiseH, gx, iceBaseY - 1, 14); // 冰柱
    }
  }

  // 左侧小冰川
  const leftPeak = Math.floor(H * 0.38);
  for (let gx = 5; gx <= 50; gx++) {
    const dx = gx - 27;
    const t = Math.abs(dx) / 22;
    const peakH = leftPeak + Math.floor(t * t * H * 0.2);
    const noiseH = peakH + Math.floor(Math.sin(gx * 0.5) * 2);
    if (world.inBounds(gx, noiseH)) {
      fillRect(world, gx, noiseH, gx, iceBaseY - 1, 14);
    }
  }

  // 右侧小冰川
  const rightPeak = Math.floor(H * 0.40);
  for (let gx = W - 50; gx <= W - 5; gx++) {
    const dx = gx - (W - 27);
    const t = Math.abs(dx) / 22;
    const peakH = rightPeak + Math.floor(t * t * H * 0.2);
    const noiseH = peakH + Math.floor(Math.cos(gx * 0.5) * 2);
    if (world.inBounds(gx, noiseH)) {
      fillRect(world, gx, noiseH, gx, iceBaseY - 1, 14);
    }
  }

  // 冰川湖（两侧低洼处积水，已被极寒冻住一半）
  // 左侧冰川湖
  fillRect(world, 55, iceBaseY - 5, 110, iceBaseY - 1, 2);  // 水
  fillRect(world, 55, iceBaseY - 5, 110, iceBaseY - 4, 14); // 表层结冰
  // 右侧冰川湖
  fillRect(world, W - 110, iceBaseY - 5, W - 55, iceBaseY - 1, 2);
  fillRect(world, W - 110, iceBaseY - 5, W - 55, iceBaseY - 4, 14);

  // 冰面上的霜覆盖（冰川表面散布霜）
  scatter(world, 0, Math.floor(H * 0.2), W - 1, iceBaseY - 1, 75, 0.06); // 霜

  // 雪层（地面和冰川顶部）
  scatter(world, 0, Math.floor(H * 0.18), W - 1, Math.floor(H * 0.5), 15, 0.04); // 雪

  // 空中飘雪
  scatter(world, 0, 0, W - 1, Math.floor(H * 0.2), 15, 0.025);

  // 极光（顶部空间的等离子体光带，彩色效果用等离子体粒子模拟）
  // 三条高空极光带（稀疏等离子体）
  scatter(world, 0, 2, W - 1, 5, 55, 0.04);   // 极光带1
  scatter(world, 0, 8, W - 1, 11, 55, 0.03);  // 极光带2
  scatter(world, 0, 15, W - 1, 18, 55, 0.02); // 极光带3

  // 液氮点（极冷区域，接触其他材质急速冷冻）
  fillRect(world, glacierCX - 8, Math.floor(H * 0.58), glacierCX + 8, Math.floor(H * 0.62), 68); // 液氮池

  // 设置冰川区域超低温（确保维持冻结状态）
  for (let y = 0; y < iceBaseY; y++) {
    for (let x = 0; x < W; x++) {
      if (world.inBounds(x, y) && world.get(x, y) === 14) {
        world.setTemp(x, y, -30);
      }
    }
  }
}

/**
 * 深海黑暗区场景 —— 极端分类
 * - 整体超高压、超低温（深海5000m以下）
 * - 底部：热液喷口（熔岩+蒸汽柱）
 * - 中层：荧光生物（荧光藻+水母稀疏散布）
 * - 主体：深蓝色水体
 * - 侧壁：黑暗矿脉（石头+黑曜石+水晶点缀）
 * - 地基：岩盐+永冻土（高压固结）
 */
function generateDeepAbyss(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 整体设置深海低温（深海约-5°模拟超冷高压）
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      world.setTemp(x, y, -5);
    }
  }

  // 底层地基：岩盐+永冻土
  fillRect(world, 0, H - 8, W - 1, H - 1, 112);  // 岩盐底层
  fillRect(world, 0, H - 4, W - 1, H - 1, 190);  // 永冻土深层

  // 侧壁峭壁（左右不规则石壁）
  for (let y = 0; y < H - 8; y++) {
    const wallWL = 18 + Math.floor(Math.sin(y * 0.15) * 5 + Math.cos(y * 0.3) * 3);
    fillRect(world, 0, y, wallWL, y, 3);
    const wallWR = 18 + Math.floor(Math.cos(y * 0.18) * 5 + Math.sin(y * 0.25) * 3);
    fillRect(world, W - 1 - wallWR, y, W - 1, y, 3);
  }

  // 侧壁矿脉：黑曜石纹路+水晶点
  scatter(world, 0, 0, 28, H - 10, 60, 0.08);
  scatter(world, W - 29, 0, W - 1, H - 10, 60, 0.08);
  scatter(world, 2, 10, 20, H - 15, 53, 0.03);
  scatter(world, W - 21, 10, W - 3, H - 15, 53, 0.03);

  // 主体深水（中央水体）
  const waterLeft = 22;
  const waterRight = W - 23;
  fillRect(world, waterLeft, 0, waterRight, H - 10, 2);     // 普通水
  fillRect(world, waterLeft, 0, waterRight, Math.floor(H * 0.3), 97); // 上层蒸馏水

  // 底部��液喷口（3个）
  const ventX = [Math.floor(W * 0.28), Math.floor(W * 0.5), Math.floor(W * 0.72)];
  for (const vx of ventX) {
    if (vx < waterLeft || vx > waterRight) continue;
    fillRect(world, vx - 4, H - 14, vx + 4, H - 9, 60);  // 黑曜石喷口基座
    fillRect(world, vx - 2, H - 16, vx + 2, H - 13, 11); // 熔岩核心
    world.setTemp(vx, H - 15, 800);
    // 蒸汽羽流向上延伸
    for (let vy = H - 17; vy >= Math.floor(H * 0.45); vy -= 3) {
      const sp = Math.floor((H - 17 - vy) * 0.08);
      scatter(world, vx - sp - 1, vy, vx + sp + 1, vy + 2, 8, 0.35);
    }
    // 热液区域温度
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const ty = H - 12 + dy, tx = vx + dx;
        if (world.inBounds(tx, ty)) world.setTemp(tx, ty, 400 - Math.abs(dx) * 50 - Math.abs(dy) * 50);
      }
    }
  }

  // 发光生物散布（荧光藻+水母+发光苔藓）
  scatter(world, waterLeft, Math.floor(H * 0.2), waterRight, Math.floor(H * 0.6), 140, 0.012); // 荧光藻
  scatter(world, waterLeft, Math.floor(H * 0.1), waterRight, Math.floor(H * 0.5), 205, 0.008); // 荧光水母
  scatter(world, 18, Math.floor(H * 0.15), 28, H - 15, 225, 0.06);      // 左壁发光苔藓
  scatter(world, W - 29, Math.floor(H * 0.15), W - 19, H - 15, 225, 0.06); // 右壁发光苔藓

  // 中层礁石（黑暗岩礁+水晶点缀）
  const reefs = [
    { x: Math.floor(W * 0.32), y: Math.floor(H * 0.55) },
    { x: Math.floor(W * 0.65), y: Math.floor(H * 0.62) },
    { x: Math.floor(W * 0.45), y: Math.floor(H * 0.72) },
  ];
  for (const reef of reefs) {
    fillRect(world, reef.x - 5, reef.y, reef.x + 5, reef.y + 6, 3);
    fillRect(world, reef.x - 3, reef.y - 2, reef.x + 3, reef.y, 60);
    scatter(world, reef.x - 5, reef.y, reef.x + 5, reef.y + 6, 53, 0.1);
  }
}

function generateAcidRain(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 地面基础：混凝土层（防腐蚀外层）+ 石灰层（中和层）+ 土层
  fillRect(world, 0, H - 3, W - 1, H - 1, 36);  // 混凝土底层（抗酸）
  fillRect(world, 0, H - 5, W - 1, H - 4, 124); // 石灰层（碱性，可中和酸）
  fillRect(world, 0, H - 12, W - 1, H - 6, 20); // 土壤层

  // 地面腐蚀区域：中央区域已被酸腐蚀的坑洼
  for (let x = Math.floor(W * 0.25); x <= Math.floor(W * 0.75); x++) {
    const depth = Math.floor(Math.sin((x / W) * Math.PI * 4) * 2 + Math.random() * 2);
    for (let y = H - 12; y >= H - 12 - depth; y--) {
      if (world.inBounds(x, y)) world.set(x, y, 0); // 已腐蚀的坑
    }
  }

  // 左侧防护墙：玻璃+混凝土（展示防酸效果）
  fillRect(world, 0, Math.floor(H * 0.3), 8, H - 13, 17);  // 玻璃防护
  fillRect(world, 8, Math.floor(H * 0.3), 12, H - 13, 36); // 混凝土支撑

  // 右侧防护墙：橡胶层（良好耐酸材质）
  fillRect(world, W - 13, Math.floor(H * 0.3), W - 9, H - 13, 33); // 橡胶
  fillRect(world, W - 9, Math.floor(H * 0.3), W - 1, H - 13, 36);  // 混凝土

  // 中和水池：底部左侧（水+石灰→碱性液体，模拟中和）
  fillRect(world, 15, H - 13, Math.floor(W * 0.35), H - 6, 2);    // 水池（普通水）
  fillRect(world, 15, H - 6, Math.floor(W * 0.35), H - 6, 124);   // 石灰底
  scatter(world, 16, H - 12, Math.floor(W * 0.34), H - 7, 178, 0.08); // 石灰水散布

  // 酸液积聚区：中央低洼（已积聚的酸液池）
  const acidLeft = Math.floor(W * 0.4);
  const acidRight = Math.floor(W * 0.6);
  fillRect(world, acidLeft, H - 11, acidRight, H - 6, 9); // 酸液池

  // 酸雨注入器：顶部散布酸液源（模拟持续降酸）
  const emitterCount = 8;
  for (let i = 0; i < emitterCount; i++) {
    const ex = Math.floor(W * 0.15 + (W * 0.7 / (emitterCount - 1)) * i);
    // 顶部少量酸液（模拟初始酸雨）
    for (let ay = 2; ay <= 6; ay++) {
      if (Math.random() < 0.4 && world.inBounds(ex, ay)) {
        world.set(ex, ay, 9);
      }
    }
  }

  // 酸雨云层：顶部酸性气体云（毒气+酸蒸气模拟酸雨云）
  scatter(world, 0, 0, W - 1, 8, 18, 0.12);   // 毒气云（宽泛分布）
  scatter(world, Math.floor(W * 0.1), 3, Math.floor(W * 0.9), 10, 9, 0.04); // 稀疏酸液滴

  // 腐蚀痕迹：部分金属构件被酸腐蚀（展示效果）
  fillRect(world, Math.floor(W * 0.5) - 3, H - 17, Math.floor(W * 0.5) + 3, H - 13, 10); // 金属支架
  scatter(world, Math.floor(W * 0.5) - 3, H - 17, Math.floor(W * 0.5) + 3, H - 13, 72, 0.3); // 铁锈点（腐蚀迹）

  // 边界防腐层：两侧添加石灰石保护（抵抗酸腐蚀）
  fillRect(world, 0, H - 12, 2, H - 3, 195);   // 左石灰石边界
  fillRect(world, W - 3, H - 12, W - 1, H - 3, 195); // 右石灰石边界

  // 设置初始温度：酸雨环境微暖（化学反应产热）
  for (let y = H - 15; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const id = world.get(x, y);
      if (id === 9) world.setTemp(x, y, 35); // 酸液微热
    }
  }
}

function generateIndustrialFurnace(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 工厂地基：混凝土厚底板
  fillRect(world, 0, H - 4, W - 1, H - 1, 36);
  // 耐火砖侧壁（用陶瓷模拟）
  fillRect(world, 0, Math.floor(H * 0.1), 6, H - 5, 90);
  fillRect(world, W - 7, Math.floor(H * 0.1), W - 1, H - 5, 90);

  // 中央高炉炉膛：左1/3
  const furnaceLeft = 10;
  const furnaceRight = Math.floor(W * 0.38);
  const furnaceTop = Math.floor(H * 0.25);
  const furnaceBot = H - 5;
  // 炉壁（石头+陶瓷）
  fillRect(world, furnaceLeft, furnaceTop, furnaceLeft + 4, furnaceBot, 3);
  fillRect(world, furnaceRight - 4, furnaceTop, furnaceRight, furnaceBot, 3);
  fillRect(world, furnaceLeft, furnaceTop, furnaceRight, furnaceTop + 3, 90);
  // 炉膛内部：底层熔岩（热源）
  fillRect(world, furnaceLeft + 5, furnaceBot - 8, furnaceRight - 5, furnaceBot - 1, 11);
  // 熔岩上方液态铁（高温冶炼产物）
  fillRect(world, furnaceLeft + 5, Math.floor(H * 0.55), furnaceRight - 5, furnaceBot - 9, 169);
  // 炉顶烟雾出口
  scatter(world, furnaceLeft + 5, furnaceTop + 3, furnaceRight - 5, furnaceTop + 12, 7, 0.3);
  scatter(world, furnaceLeft + 5, furnaceTop + 3, furnaceRight - 5, furnaceTop + 8, 84, 0.05); // 沙尘暴模拟工业烟尘

  // 铸造区域：中央
  const castLeft = Math.floor(W * 0.42);
  const castRight = Math.floor(W * 0.58);
  // 铸造台（金属支架）
  fillRect(world, castLeft, H - 12, castRight, H - 5, 10);
  // 铸造台上的液态金属
  fillRect(world, castLeft + 3, H - 18, castRight - 3, H - 13, 113);
  // 铸造台旁的铁锈氧化区
  scatter(world, castLeft, H - 12, castRight, H - 5, 72, 0.08);

  // 熔盐储罐：右侧
  const tankLeft = Math.floor(W * 0.65);
  const tankRight = Math.floor(W * 0.85);
  const tankTop = Math.floor(H * 0.45);
  // 储罐壁（金属）
  fillRect(world, tankLeft, tankTop, tankLeft + 3, H - 5, 10);
  fillRect(world, tankRight - 3, tankTop, tankRight, H - 5, 10);
  fillRect(world, tankLeft, tankTop, tankRight, tankTop + 3, 10);
  // 储罐内熔盐（高温工业液体）
  fillRect(world, tankLeft + 4, tankTop + 4, tankRight - 4, H - 6, 83);

  // 工业管道（连接炉膛与储罐）
  fillRect(world, furnaceRight, Math.floor(H * 0.6), tankLeft, Math.floor(H * 0.6) + 3, 10);
  fillRect(world, furnaceRight, Math.floor(H * 0.6) + 4, tankLeft, Math.floor(H * 0.6) + 6, 169); // 管道内液态铁

  // 顶部烟雾排放（工业烟囱效果）
  scatter(world, 0, 0, W - 1, 8, 7, 0.08);
  scatter(world, 0, 0, W - 1, 5, 84, 0.03);

  // 设置初始高温（高炉区域极热，铸造区热）
  for (let y = Math.floor(H * 0.2); y < H; y++) {
    for (let x = 0; x < W; x++) {
      const id = world.get(x, y);
      if (id === 11) world.setTemp(x, y, 800); // 熔岩极热
      else if (id === 169) world.setTemp(x, y, 600); // 液态铁高热
      else if (id === 83) world.setTemp(x, y, 400); // 熔盐热
      else if (id === 113) world.setTemp(x, y, 500); // 液态金属热
    }
  }
}

/** 冰河时代场景 —— 极端分类第4个
 * 设计：
 * - 全局极寒温度(-80°)
 * - 多层冰盖：顶部极厚冰川层（冰+永冻土+雪）
 * - 冰川流：正弦噪声塑造不规则冰川前缘
 * - 冻土层：永冻土(190)底基+岩石
 * - 极地湖泊：冰封湖（冰层下液氮/冰水）
 * - 极光带：等离子体(55)极光模拟（稀疏，高空）
 * - 雪暴：雪粒散布（上层）
 */
function generateIceAge(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 全局极寒初始化
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      world.setTemp(x, y, -80);
    }
  }

  // 永冻土基底（最底部3层）
  fillRect(world, 0, H - 3, W - 1, H - 1, 190);
  // 岩石层（冻土上方）
  fillRect(world, 0, H - 7, W - 1, H - 4, 3);

  // 冰川主体：不规则厚冰盖（上半部）
  // 用正弦函数+随机偏移塑造冰川前缘
  for (let x = 0; x < W; x++) {
    // 冰川底部高度：正弦波形塑造不规则前缘
    const iceBase = Math.floor(H * 0.45
      + Math.sin(x * 0.08) * H * 0.07
      + Math.sin(x * 0.03 + 1.5) * H * 0.05
      + Math.cos(x * 0.05 + 0.8) * H * 0.03);

    // 从顶部向下填充冰层
    for (let y = 0; y < iceBase; y++) {
      if (y < Math.floor(H * 0.1)) {
        // 最顶层：雪（蓬松）
        if (Math.random() < 0.85) world.set(x, y, 15);
      } else if (y < Math.floor(H * 0.18)) {
        // 上层：雪+霜
        const r = Math.random();
        if (r < 0.6) world.set(x, y, 15);
        else if (r < 0.85) world.set(x, y, 75); // 霜
        else world.set(x, y, 14); // 冰
      } else {
        // 主冰川体：致密冰
        world.set(x, y, 14);
      }
    }
  }

  // 冰川裂缝：垂直裂隙（少量）
  for (let crack = 0; crack < 4; crack++) {
    const cx = Math.floor(W * 0.15 + Math.random() * W * 0.7);
    const crackDepth = Math.floor(H * 0.05 + Math.random() * H * 0.1);
    for (let y = Math.floor(H * 0.1); y < Math.floor(H * 0.1) + crackDepth; y++) {
      if (world.get(cx, y) === 14) {
        world.set(cx, y, 0); // 裂缝（空气）
        if (Math.random() < 0.3 && world.inBounds(cx - 1, y)) world.set(cx - 1, y, 0);
      }
    }
  }

  // 冰封湖泊（冰川底部几个积水洼）
  for (let lake = 0; lake < 2; lake++) {
    const lakeX = Math.floor(W * 0.2 + lake * W * 0.45);
    const lakeW = Math.floor(W * 0.1 + Math.random() * W * 0.08);
    // 底部液氮湖（超冷液体）
    const lakeTop = H - 9;
    fillRect(world, lakeX, lakeTop, lakeX + lakeW, H - 8, 68); // 液氮
    // 湖面结冰
    fillRect(world, lakeX - 1, lakeTop - 2, lakeX + lakeW + 1, lakeTop - 1, 14);
  }

  // 极地山丘（冰覆盖的岩石山）
  for (let hill = 0; hill < 3; hill++) {
    const hx = Math.floor(W * 0.15 + hill * W * 0.3);
    const hh = Math.floor(H * 0.08 + Math.random() * H * 0.06); // 山高
    const hw = Math.floor(W * 0.06 + Math.random() * W * 0.04); // 山宽
    const hBase = H - 7; // 山底
    for (let dy = 0; dy < hh; dy++) {
      const width = Math.floor(hw * (1 - dy / hh));
      for (let dx = -width; dx <= width; dx++) {
        const px = hx + dx, py = hBase - dy;
        if (world.inBounds(px, py)) {
          if (dy < 2) world.set(px, py, 3); // 底部岩石
          else world.set(px, py, 14); // 冰覆盖
        }
      }
    }
    // 山顶积雪
    for (let dx = -1; dx <= 1; dx++) {
      const px = hx + dx, py = hBase - hh;
      if (world.inBounds(px, py)) world.set(px, py, 15);
    }
  }

  // 极光带：等离子体(55)高空稀疏散布（模拟极光）
  // 两条极光带，水平分布
  scatter(world, 0, 2, W - 1, 6, 55, 0.025);
  scatter(world, Math.floor(W * 0.2), 8, Math.floor(W * 0.8), 12, 55, 0.015);

  // 上层雪暴（飘落雪粒）
  scatter(world, 0, 0, W - 1, 20, 15, 0.04);
  scatter(world, 0, 20, W - 1, 35, 15, 0.02);

  // 设置所有粒子为极寒（确保物理反应正确触发）
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (world.get(x, y) !== 0) {
        world.setTemp(x, y, -80);
      }
    }
  }
}

/** 场景：沉船残骸 —— 铁锈覆盖的沉船骸骨+珊瑚礁+海底沙地+气泡+盐水 */
function generateShipwreck(world: World): void {
  const W = world.width, H = world.height;
  world.clear();

  // 海底沙地（底部3层）
  fillRect(world, 0, H - 3, W - 1, H - 1, 1); // 沙子
  // 海底泥浆点缀
  scatter(world, 0, H - 4, W - 1, H - 4, 63, 0.3); // 泥浆

  // 海水填充（下2/3区域）
  const waterTop = Math.floor(H * 0.3);
  for (let y = waterTop; y < H - 3; y++) {
    for (let x = 0; x < W; x++) {
      if (world.inBounds(x, y)) world.set(x, y, 2); // 水
    }
  }

  // 盐水：底部分层（盐水比淡水重，沉到下部）
  for (let y = H - 18; y < H - 3; y++) {
    for (let x = 0; x < W; x++) {
      if (world.get(x, y) === 2 && Math.random() < 0.6) world.set(x, y, 24); // 盐水
    }
  }

  // 沉船骸骨：倾斜的金属船体（铁锈覆盖）
  const shipCX = Math.floor(W * 0.5);
  const shipY = H - 25;

  // 船底龙骨（金属，大部分已锈蚀）
  for (let x = shipCX - 40; x <= shipCX + 40; x++) {
    const y = shipY + Math.floor(Math.sin((x - shipCX) * 0.03) * 3);
    if (world.inBounds(x, y)) {
      world.set(x, y, Math.random() < 0.7 ? 72 : 10); // 70%铁锈 30%金属
    }
    if (world.inBounds(x, y + 1)) world.set(x, y + 1, 72); // 龙骨厚度
  }

  // 左舷：倾斜船壁
  for (let dy = 0; dy < 14; dy++) {
    const x = shipCX - 38 + Math.floor(dy * 0.8);
    const y = shipY - dy;
    if (world.inBounds(x, y)) world.set(x, y, Math.random() < 0.6 ? 72 : 10);
    if (world.inBounds(x + 1, y)) world.set(x + 1, y, 72);
  }

  // 右舷：倾斜船壁（比左舷矮，模拟倾覆）
  for (let dy = 0; dy < 8; dy++) {
    const x = shipCX + 38 - Math.floor(dy * 0.5);
    const y = shipY - dy;
    if (world.inBounds(x, y)) world.set(x, y, Math.random() < 0.6 ? 72 : 10);
    if (world.inBounds(x - 1, y)) world.set(x - 1, y, 72);
  }

  // 桅杆（倒下的金属柱）
  for (let i = 0; i < 30; i++) {
    const mx = shipCX - 15 + i;
    const my = shipY - 3 - Math.floor(i * 0.3);
    if (world.inBounds(mx, my)) world.set(mx, my, Math.random() < 0.5 ? 72 : 10);
  }

  // 船舱内部（黑曜石模拟炭化木材，石头模拟压舱石）
  fillRect(world, shipCX - 25, shipY - 3, shipCX - 5, shipY - 1, 60); // 黑曜石（炭化木）
  fillRect(world, shipCX + 5, shipY - 3, shipCX + 20, shipY - 1, 3);  // 石头（压舱石）

  // 珊瑚礁（左侧区域）
  const coralColors = [64, 53, 49]; // 珊瑚、水晶、苔藓
  for (let i = 0; i < 6; i++) {
    const cx = 15 + i * 18;
    const cy = H - 10 - Math.floor(Math.random() * 8);
    const r = 3 + Math.floor(Math.random() * 4);
    fillCircle(world, cx, cy, r, coralColors[i % 3]);
    // 珊瑚茎
    for (let dy = 0; dy < r + 2; dy++) {
      if (world.inBounds(cx, cy + dy)) world.set(cx, cy + dy, 64);
    }
  }

  // 右侧珊瑚礁
  for (let i = 0; i < 5; i++) {
    const cx = W - 20 - i * 20;
    const cy = H - 8 - Math.floor(Math.random() * 6);
    const r = 2 + Math.floor(Math.random() * 3);
    fillCircle(world, cx, cy, r, coralColors[(i + 1) % 3]);
    for (let dy = 0; dy < r + 2; dy++) {
      if (world.inBounds(cx, cy + dy)) world.set(cx, cy + dy, 64);
    }
  }

  // 海底宝箱（金属箱+金粒）
  const chestX = shipCX + 25, chestY = H - 7;
  fillRect(world, chestX, chestY - 3, chestX + 6, chestY - 1, 10); // 金属箱
  world.set(chestX + 3, chestY - 4, 31); // 金（宝藏）
  scatter(world, chestX + 1, chestY - 4, chestX + 5, chestY - 4, 31, 0.5); // 散落金粒

  // 气泡从沙地渗出
  scatter(world, 10, H - 10, W - 10, H - 6, 73, 0.04); // 泡泡

  // 水草（发光水下植物）
  for (let i = 0; i < 8; i++) {
    const wx = 5 + i * 20 + Math.floor(Math.random() * 10);
    for (let dy = 0; dy < 5 + Math.floor(Math.random() * 4); dy++) {
      if (world.inBounds(wx, H - 4 - dy)) world.set(wx, H - 4 - dy, 156); // 水草
    }
  }

  // 荧光藻（发光）散布在珊瑚礁区域
  scatter(world, 0, H - 20, Math.floor(W * 0.3), H - 5, 140, 0.03);
  scatter(world, Math.floor(W * 0.7), H - 20, W - 1, H - 5, 140, 0.03);

  // 设置水下低温（海底约4°C）
  for (let y = waterTop; y < H; y++) {
    for (let x = 0; x < W; x++) {
      world.setTemp(x, y, 4);
    }
  }
}
