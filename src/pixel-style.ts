import type { CSSProperties } from 'react';

// 像素字体栈：本机无 Zpix 时退化为宋体/等宽，仍是复古颗粒感
export const PIXEL_FONT =
  '"Zpix","Fusion Pixel 12px Monospaced","SimSun","NSimSun","Microsoft YaHei",monospace';

/**
 * ART_STYLE.md 锁定色板（像素美术总监规范）
 * 阵营色从 battle.json 读取；以下为中性/素材局部色常量。
 */
export const ART = {
  outline: '#1A1A1A', // 描边统一深墨黑
  wall: '#A0AEC0', // 城墙灰
  wallLight: '#CBD5E0', // 城墙高光
  wallDark: '#6B7A8F', // 城墙暗部
  wood: '#975A16', // 木色
  woodLight: '#B77A2C', // 木高光
  woodDark: '#5C3A0E', // 木暗部
  grass: '#48BB78', // 草地绿
  grassDark: '#3CA56A', // 草地暗格
  water: '#3182CE', // 水系蓝
  waterLight: '#63B3ED', // 水波高光
  horse: '#B78650', // 马身
  horseDark: '#7A5230', // 马暗部/腿
  skin: '#F0C090', // 肤色
  steel: '#E2E8F0', // 枪尖/甲高光
  tent: '#D9B362', // 帐篷布
  sack: '#C9A85C', // 粮袋
  fireRed: '#E53E1F',
  fireOrange: '#F6A026',
  fireYellow: '#FEE25A',
  smoke: '#4A5568',
} as const;

// 经典 RPG 纯黑底 + 白色像素双线边框（外白线 → 黑缝 → 内白线）
export const dialogBorderStyle: CSSProperties = {
  background: '#000',
  border: '6px solid #ffffff',
  boxShadow: 'inset 0 0 0 8px #000, inset 0 0 0 12px #fff',
};

// 细版双线边框（小字幕/血条用）
export const thinBorderStyle: CSSProperties = {
  background: '#000',
  border: '4px solid #ffffff',
  boxShadow: 'inset 0 0 0 6px #000, inset 0 0 0 9px #fff',
};

// 像素描边文字（四向硬边描边，游戏地图标签感）
export const pixelOutlineText: CSSProperties = {
  textShadow:
    '3px 0 0 #000, -3px 0 0 #000, 0 3px 0 #000, 0 -3px 0 #000, 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000',
};

// 硬边像素投影（无模糊）
export const hardTextShadow: CSSProperties = {
  textShadow: '3px 3px 0 #000',
};
