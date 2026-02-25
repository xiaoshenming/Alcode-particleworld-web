import type { MaterialDef } from './types';

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
