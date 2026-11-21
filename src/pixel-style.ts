import type { CSSProperties } from 'react';

// 像素字体栈：本机无 Zpix 时退化为宋体/等宽，仍是复古颗粒感
export const PIXEL_FONT =
  '"Zpix","Fusion Pixel 12px Monospaced","SimSun","NSimSun","Microsoft YaHei",monospace';

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

// 硬边像素投影（无模糊）
export const hardTextShadow: CSSProperties = {
  textShadow: '3px 3px 0 #000',
};
