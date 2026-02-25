import type { MaterialDef, MaterialCategory } from './types';

/** 材质注册表 —— 通过 ID 查找材质定义 */
const materials: Map<number, MaterialDef> = new Map();

export function registerMaterial(def: MaterialDef): void {
  if (materials.has(def.id)) {
    throw new Error(`材质 ID ${def.id} 已被 "${materials.get(def.id)!.name}" 占用`);
  }
  materials.set(def.id, def);
}

export function getMaterial(id: number): MaterialDef | undefined {
  return materials.get(id);
}

export function getAllMaterials(): MaterialDef[] {
  return Array.from(materials.values());
}

/** 根据材质 ID 推断默认分类（当材质未显式设置 category 时使用） */
function inferCategory(mat: MaterialDef): MaterialCategory {
  if (mat.category) return mat.category;
  const n = mat.name;
  // 液态金属
  if (n.startsWith('液态')) return '熔融金属';
  // 熔融系列
  if (n.startsWith('熔融') || n.startsWith('熔盐')) return '熔融金属';
  // 金属判断：密度高的固体
  const metals = ['铁','铜','锡','银','金','铂','铬','锰','镍','锌','铅','钴','钒','钛','钨','铋','锑','镁','钠','钾','铝','硅','锡青铜'];
  if (metals.some(m => n.includes(m)) && mat.density >= 5) return '金属';
  // 气体
  if (mat.density < 0 || ['烟','蒸汽','气','氢','毒','臭氧','一氧化碳','二氧化硫','光气','笑气','磷化氢','甲醛','氨','氟化氢','氰化钠'].some(k => n.includes(k))) return '气体';
  // 工具类
  if (['空气','克隆体','虚空','喷泉','传送门','激光','光束'].some(k => n === k)) return '工具';
  // 生物
  if (['蚂蚁','病毒','苔藓','白蚁','萤火虫','孢子','蘑菇','菌丝','藤蔓','珊瑚','水草','苔原','花粉','荧光藻','发光苔藓','泥炭苔','水母','荧光水母'].some(k => n.includes(k))) return '生物';
  // 化学品
  if (['酸','碱','过氧化','硝化','硫酸','硝酸','磷酸','鲁米诺','硼砂','明矾','甘油','苏打','酒精','碱液'].some(k => n.includes(k))) return '化学';
  // 矿石/岩石
  if (['石','岩','矿','方解石','白云石','石英','石膏','石灰','板岩','大理石','花岗岩','砂岩','燧石','蛋白石','锆石','闪锌矿','白云母','萤石','沸石','硅藻','黑曜石','琥珀'].some(k => n.includes(k)) && mat.density > 2) return '矿石';
  // 液体
  if (mat.density > 0 && mat.density <= 3 && !['沙','雪','种','火药','盐','粉','炭','干','霜','泥砖','骨','蜡','砖'].some(k => n.includes(k))) return '液体';
  // 粉末
  if (mat.density > 0 && mat.density <= 5 && ['沙','粉','尘','雪','盐','泥','灰','炭','干','霜','焦'].some(k => n.includes(k))) return '粉末';
  // 固体兜底
  if (mat.density >= 3) return '固体';
  // 其余归特殊
  return '特殊';
}

/** 获取按分类分组的材质列表 */
export function getMaterialsByCategory(): Map<MaterialCategory, MaterialDef[]> {
  const categoryOrder: MaterialCategory[] = ['工具', '粉末', '液体', '气体', '固体', '金属', '熔融金属', '生物', '化学', '矿石', '特殊'];
  const result = new Map<MaterialCategory, MaterialDef[]>();
  for (const cat of categoryOrder) {
    result.set(cat, []);
  }
  for (const mat of materials.values()) {
    const cat = inferCategory(mat);
    if (!result.has(cat)) result.set(cat, []);
    result.get(cat)!.push(mat);
  }
  // 每个分类内按 ID 排序
  for (const list of result.values()) {
    list.sort((a, b) => a.id - b.id);
  }
  // 移除空分类
  for (const [cat, list] of result) {
    if (list.length === 0) result.delete(cat);
  }
  return result;
}
