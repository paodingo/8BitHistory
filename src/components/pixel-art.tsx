import React from 'react';
import { ART } from '../pixel-style';

/**
 * 描边像素块：ART_STYLE.md 规范——仅 rect 拼接 + crispEdges + 深墨黑描边。
 * 在色块外扩 1px 画描边层，再叠色块。
 */
export const Px: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  f: string;
  o?: boolean;
}> = ({ x, y, w, h, f, o = true }) => (
  <>
    {o ? <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} fill={ART.outline} /> : null}
    <rect x={x} y={y} width={w} height={h} fill={f} />
  </>
);

/** 描边像素 SVG 画布（16 网格默认） */
export const PixelCanvas: React.FC<{
  size: number;
  grid?: number;
  children: React.ReactNode;
  flip?: boolean;
}> = ({ size, grid = 16, children, flip }) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${grid} ${grid}`}
    shapeRendering="crispEdges"
    style={{ imageRendering: 'pixelated', display: 'block', transform: flip ? 'scaleX(-1)' : undefined }}
  >
    {children}
  </svg>
);

/**
 * 像素人物立绘（对话用半身像，16x16）：
 * 盔用阵营暗部+高光，甲用阵营主色，肤色脸+墨色眼，可带须。
 */
export const BustPortrait: React.FC<{
  color: string;
  highlight: string;
  dark: string;
  beard?: boolean;
}> = ({ color, highlight, dark, beard = true }) => (
  <PixelCanvas size={150} grid={16}>
    {/* 头盔 */}
    <Px x={4} y={1} w={8} h={3} f={dark} />
    <Px x={4} y={1} w={8} h={1} f={highlight} o={false} />
    {/* 盔缨 */}
    <Px x={7} y={0} w={2} h={1} f={highlight} />
    {/* 脸 */}
    <Px x={5} y={4} w={6} h={5} f={ART.skin} />
    {/* 眼 */}
    <rect x={6} y={6} width={1} height={1} fill={ART.outline} />
    <rect x={9} y={6} width={1} height={1} fill={ART.outline} />
    {/* 须（曹操标志性的短须） */}
    {beard ? (
      <>
        <Px x={5} y={8} w={6} h={2} f={ART.outline} o={false} />
        <rect x={6} y={8} width={4} height={1} fill={ART.skin} />
      </>
    ) : null}
    {/* 肩甲 */}
    <Px x={2} y={10} w={12} h={5} f={color} />
    <Px x={2} y={10} w={12} h={1} f={highlight} o={false} />
    <rect x={4} y={12} width={2} height={2} fill={dark} />
    <rect x={10} y={12} width={2} height={2} fill={dark} />
    {/* 护心镜 */}
    <Px x={7} y={11} w={2} h={3} f={ART.steel} />
  </PixelCanvas>
);
