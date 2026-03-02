import { World } from '../core/World';

/** 场景预设定义 */
interface ScenePreset {
  name: string;
  icon: string;
  description: string;
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

/** 所有预设场景 */
export const SCENE_PRESETS: ScenePreset[] = [
  { name: '火山', icon: '🌋', description: '熔岩喷发的火山场景', generate: generateVolcano },
  { name: '海洋', icon: '🌊', description: '深海珊瑚与水草', generate: generateOcean },
  { name: '城市', icon: '🏙️', description: '混凝土建筑+电线+工业烟雾', generate: generateCity },
  { name: '森林', icon: '🌲', description: '茂密的森林与萤火虫', generate: generateForest },
  { name: '沙漠', icon: '🏜️', description: '起伏的沙丘与沙尘暴', generate: generateDesert },
  { name: '冰原', icon: '❄️', description: '冰山与飘雪的极地', generate: generateIcefield },
  { name: '实验室', icon: '🧪', description: '化学容器与反应实验', generate: generateLab },
  { name: '暴风雨', icon: '⛈️', description: '闪电+暴雨+萤火虫夜晚', generate: generateStorm },
  { name: '末日火山', icon: '🔥', description: '末日熔岩雨与火山喷发', generate: generateApocalypse },
  { name: '地下洞穴', icon: '🦇', description: '水晶+地下湖+钟乳石+熔岩池', generate: generateCave },
  { name: '战场', icon: '💥', description: '弹坑+火焰+金属碎片+毒气烟雾', generate: generateBattlefield },
  { name: '深海热泉', icon: '🌊', description: '海底热泉喷口+矿物结晶+发光深海生物', generate: generateHydrothermal },
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

    const grid = document.createElement('div');
    grid.className = 'scene-grid';

    for (const preset of SCENE_PRESETS) {
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
