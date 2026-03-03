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
  { name: '极光温泉', icon: '🌌', description: '极地温泉+冰山+极光粒子带+飘雪', generate: generateAuroraSpring },
  { name: '神秘沼泽', icon: '🌿', description: '泥沼+枯木藤蔓+沼气+萤火虫夜景', generate: generateSwamp },
  { name: '山间瀑布', icon: '💧', description: '崖壁瀑布+水潭+水雾+苔藓藤蔓', generate: generateWaterfall },
  { name: '沙漠绿洲', icon: '🌴', description: '大沙丘+绿洲水池+棕榈树+干草遗骸', generate: generateOasis },
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
