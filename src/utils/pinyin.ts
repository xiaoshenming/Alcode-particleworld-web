/**
 * 简易拼音首字母映射 —— 覆盖游戏中常见汉字
 * 用于材质搜索的拼音首字母匹配
 */

/** Unicode 区间 → 拼音首字母映射表（基于 GB2312 拼音排序） */
const PINYIN_BOUNDARIES: [number, string][] = [
  [0x5475, 'A'], [0x5765, 'B'], [0x5C40, 'C'], [0x5F17, 'D'],
  [0x6208, 'E'], [0x6602, 'F'], [0x6765, 'G'], [0x6D77, 'H'],
  [0x71CE, 'J'], [0x7532, 'K'], [0x7B2C, 'L'], [0x7E41, 'M'],
  [0x80FD, 'N'], [0x82B1, 'O'], [0x8361, 'P'], [0x86C7, 'Q'],
  [0x8BA8, 'R'], [0x8F6E, 'S'], [0x9489, 'T'], [0x9A6C, 'W'],
  [0x9B3C, 'X'], [0x9E21, 'Y'], [0x9F99, 'Z'],
];

/**
 * 获取单个汉字的拼音首字母（大写）
 * 非汉字直接返回大写形式
 */
function getCharPinyin(ch: string): string {
  const code = ch.charCodeAt(0);
  // 非汉字直接返回
  if (code < 0x4E00 || code > 0x9FFF) return ch.toUpperCase();
  // 从后往前找到第一个 <= code 的边界
  let letter = 'A';
  for (let i = PINYIN_BOUNDARIES.length - 1; i >= 0; i--) {
    if (code >= PINYIN_BOUNDARIES[i][0]) {
      letter = PINYIN_BOUNDARIES[i][1];
      break;
    }
  }
  return letter;
}

/**
 * 获取字符串的拼音首字母序列
 * 例如: "沙子" → "SZ", "液态铜" → "YTT"
 */
export function getPinyinInitials(str: string): string {
  let result = '';
  for (const ch of str) {
    result += getCharPinyin(ch);
  }
  return result;
}

/**
 * 常用材质名的精确拼音首字母映射（覆盖自动推断不准的情况）
 */
const EXACT_PINYIN: Record<string, string> = {
  '空气': 'KQ', '沙子': 'SZ', '水': 'S', '石头': 'ST', '木头': 'MT',
  '油': 'Y', '火': 'H', '烟': 'Y', '蒸汽': 'ZQ', '酸液': 'SY',
  '金属': 'JS', '熔岩': 'RY', '种子': 'ZZ', '植物': 'ZW', '冰': 'B',
  '雪': 'X', '雷电': 'LD', '玻璃': 'BL', '毒气': 'DQ', '氢气': 'QQ',
  '泥土': 'NT', '黏土': 'NT', '火药': 'HY', '盐': 'Y', '盐水': 'YS',
  '蜡': 'L', '液蜡': 'YL', '烟花': 'YH', '火花': 'HH', '橡皮泥': 'XPN',
  '炼金石': 'LJS', '金': 'J', '钻石': 'ZS', '橡胶': 'XJ', '水泥': 'SN',
  '湿水泥': 'SSN', '混凝土': 'HNT', '克隆体': 'KLT', '虚空': 'XK',
  '喷泉': 'PQ', '蚂蚁': 'MY', '传送门': 'CSM', '磁铁': 'CT', '病毒': 'BD',
  '电线': 'DX', '蜂蜜': 'FM', '木炭': 'MT', '激光': 'JG', '光束': 'GS',
  '苔藓': 'TX', '龙卷风': 'LJF', '泡沫': 'PM', '萤火虫': 'YHC',
  '水晶': 'SJ', '沼泽': 'ZZ', '等离子体': 'DLZT', '水银': 'SY',
  '藤蔓': 'TM', '陨石': 'YS', '蛛丝': 'ZS', '黑曜石': 'HYS',
  '琥珀': 'HP', '白磷': 'BL', '泥浆': 'NJ', '珊瑚': 'SH', '干冰': 'GB',
  '硫磺': 'LH', '沥青': 'LQ', '液氮': 'YD', '萤石': 'YS', '菌丝': 'JS',
  '树脂': 'SZ', '铁锈': 'TX', '泡泡': 'PP', '焦油砂': 'JYS', '霜': 'S',
  '云': 'Y', '岩浆岩': 'YJY', '苔原': 'TY', '钠': 'N', '荧光液': 'YGY',
  '白蚁': 'BY', '凝胶': 'NJ', '熔盐': 'RY', '沙尘暴': 'SCB',
  '铜': 'T', '锡': 'X', '血液': 'XY', '齿轮': 'CL', '黏液': 'NY',
  '陶瓷': 'TC', '纤维': 'XW', '液态玻璃': 'YTBL', '孢子': 'BZ',
  '铝热剂': 'LRJ', '沼气': 'ZQ', '磁流体': 'CLT', '蒸馏水': 'ZLS',
  '石英': 'SY', '苏打': 'SD', '蘑菇': 'MG', '雪球': 'XQ', '蒸汽机': 'ZQJ',
  '沙金': 'SJ', '彩虹液': 'CHY', '骨头': 'GT', '粘土砖': 'NTZ',
  '蜂巢': 'FC', '液态氦': 'YTH', '硝化甘油': 'XHGY', '苔藓石': 'TXS',
  '闪电球': 'SDQ', '岩盐': 'YY', '液态金属': 'YTJS', '花粉': 'HF',
  '浮石': 'FS', '沸石': 'FS', '液晶': 'YJ', '白云石': 'BYS',
  '焰火弹': 'YHD', '沙漠玫瑰': 'SMMG', '静电': 'JD', '油页岩': 'YYY',
  '蒸汽云': 'ZQY', '石灰': 'SH', '磷火': 'LH', '珍珠母': 'ZZM',
  '硅藻土': 'GZT', '等离子球': 'DLZQ', '焦炭': 'JT', '露水': 'LS',
  '工业熔盐': 'GYRY', '气凝胶': 'QNJ', '荧光粉': 'YGF', '干草': 'GC',
  '液态硫': 'YTL', '碳化硅': 'THG', '潮汐': 'CX', '闪锌矿': 'SXK',
  '液态氧': 'YTY', '荧光藻': 'YGZ', '石墨': 'SM', '泥炭': 'NT',
  '硅胶': 'GJ', '火山灰': 'HSH', '电弧': 'DH', '干沙': 'GS',
  '磁沙': 'CS', '液态铜': 'YTT', '白云母': 'BYM', '硝石': 'XS',
  '碳纤维': 'TXW', '液态铝': 'YTL', '荧光棒': 'YGB', '黑火药': 'HHY',
  '水草': 'SC', '熔融石英': 'RRSY', '钾': 'J', '磷酸': 'LS',
  '蛋白石': 'DBS', '锑': 'T', '液态锑': 'YTT', '冰晶': 'BJ',
  '泥砖': 'NZ', '酒精': 'JJ', '碱液': 'JY', '石膏': 'SG',
  '液态铁': 'YTT', '闪电熔沙': 'SDRS', '鲁米诺': 'LMN', '干藤': 'GT',
  '硫酸': 'LS', '锆石': 'GS', '蒸汽泡': 'ZQP', '白锡': 'BX',
  '液态钠': 'YTN', '石灰水': 'SHS', '沥青湖': 'LQH', '磷化氢': 'LHQ',
  '铋': 'B', '液态铋': 'YTB', '硝酸': 'XS', '石英砂': 'SYS',
  '镁': 'M', '闪光粉': 'SGF', '汞齐': 'GQ', '硅': 'G', '液态硅': 'YTG',
  '永冻土': 'YDT', '过氧化氢': 'GYHQ', '钛': 'T', '液态钛': 'YTT',
  '白磷火': 'BLH', '石灰石': 'SHS', '明矾': 'MF', '甘油': 'GY',
  '超冷液': 'CLY', '钨': 'W', '液态钨': 'YTW', '硼砂': 'PS',
  '电浆': 'DJ', '泥炭苔': 'NTT', '熔岩石': 'RYS', '荧光水母': 'YGSM',
  '铬': 'G', '液态铬': 'YTG', '氟化氢': 'FHQ', '石墨烯': 'SMX',
  '玻璃珠': 'BLZ', '锰': 'M', '液态锰': 'YTM', '氰化钠': 'QHN',
  '方解石': 'FJS', '热塑性塑料': 'RSXSL', '镍': 'N', '液态镍': 'YTN',
  '甲醛': 'JQ', '石膏板': 'SGB', '导热膏': 'DRG', '锌': 'X',
  '液态锌': 'YTX', '氨气': 'AQ', '硅藻泥': 'GZN', '发光苔藓': 'FGTX',
  '铅': 'Q', '液态铅': 'YTQ', '臭氧': 'CY', '火山玻璃': 'HSBL',
  '电磁铁': 'DCT', '钴': 'G', '液态钴': 'YTG', '一氧化碳': 'YYHT',
  '板岩': 'BY', '压电陶瓷': 'YDTC', '锡青铜': 'XQT', '液态锡青铜': 'YTXQT',
  '氯气': 'LQ', '大理石': 'DLS', '光纤': 'GX', '钒': 'F', '液态钒': 'YTF',
  '二氧化硫': 'EYHL', '砂岩': 'SY', '碳纳米管': 'TNMG', '银': 'Y',
  '液态银': 'YTY', '笑气': 'XQ', '花岗岩': 'HGY', '超导体': 'CDT',
  '铂': 'B', '液态铂': 'YTB', '光气': 'GQ', '燧石': 'SS',
  '纳米机器人': 'NMJQR', '钼': 'M', '液态钼': 'YTM', '氩气': 'YQ',
  '页岩': 'YY', '记忆合金': 'JYHJ', '铪': 'H', '液态铪': 'YTH',
  '氙气': 'XQ', '片麻岩': 'PMY', '记忆聚合物': 'JYJHW', '铱': 'Y',
  '液态铱': 'YTY', '氖气': 'NQ', '蛇纹岩': 'SWY', '压电薄膜': 'YDBM',
  '铑': 'L', '液态铑': 'YTL', '氡气': 'DQ', '辉绿岩': 'HLY',
  '形状记忆陶瓷': 'XZJYTC', '铌': 'N', '液态铌': 'YTN', '氟气': 'FQ',
  '角闪岩': 'JSY', '导电聚合物': 'DDJHW', '钯': 'B', '液态钯': 'YTB',
  '氦气': 'HQ', '片岩': 'PY', '电致变色材料': 'DZBSCL', '锆': 'G',
  '液态锆': 'YTG', '溴气': 'XQ', '石英岩': 'SYY', '热电材料': 'RDCL',
  '铪合金': 'HHJ', '液态铪合金': 'YTHHJ', '氪气': 'KQ', '角岩': 'JY',
  '自修复材料': 'ZXFCL', '钽': 'T', '液态钽': 'YTT', '氘气': 'DQ',
  '辉长岩': 'HCY', '忆阻器': 'YZQ', '铼合金': 'LHJ', '液态铼合金': 'YTLHJ',
  '三氟化氮': 'SFHD', '安山岩': 'ASY', '光致变色材料': 'GZBSCL',
  '铊': 'T', '液态铊': 'YTT', '碘气': 'DQ', '麻粒岩': 'MLY',
  '光伏材料': 'GFCL', '锇': 'E', '液态锇': 'YTE', '砷化氢': 'SHQ',
  '榴辉岩': 'LHY', '柔性电路': 'RXDL', '铟': 'Y', '液态铟': 'YTY',
  '硫化氢': 'LHQ', '矽卡岩': 'XKY', '柔性显示材料': 'RXXSCL',
  '石棉': 'SM',
};

/**
 * 获取材质名的拼音首字母（优先使用精确映射）
 */
export function getMaterialPinyin(name: string): string {
  return EXACT_PINYIN[name] || getPinyinInitials(name);
}

/**
 * 检查材质是否匹配搜索词
 * 支持：中文名匹配、ID 匹配、拼音首字母匹配
 */
export function matchMaterial(mat: { id: number; name: string }, query: string): boolean {
  const q = query.toLowerCase();
  // 中文名匹配
  if (mat.name.toLowerCase().includes(q)) return true;
  // ID 匹配
  if (String(mat.id) === q) return true;
  // 拼音首字母匹配（查询全为字母时）
  if (/^[a-zA-Z]+$/.test(q)) {
    const pinyin = getMaterialPinyin(mat.name);
    if (pinyin.toLowerCase().includes(q)) return true;
  }
  return false;
}
