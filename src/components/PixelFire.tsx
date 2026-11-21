import React from 'react';
import { interpolate } from 'remotion';
import type { FireEntry } from '../types';
import { ART } from '../pixel-style';
import { PixelCanvas, Px } from './pixel-art';

type FlameRect = [number, number, number, number];

// 三个火焰形态：外红 → 中橙 → 芯黄，每 8 帧切换（极简像素闪烁）
const FLAME_VARIANTS: FlameRect[][] = [
  [
    [5, 9, 6, 2], [5, 7, 6, 2], [6, 5, 4, 2], [7, 3, 2, 2],
  ],
  [
    [5, 9, 6, 2], [4, 7, 6, 2], [6, 5, 4, 2], [7, 2, 2, 3],
  ],
  [
    [5, 9, 6, 2], [6, 7, 6, 2], [5, 5, 4, 2], [8, 3, 2, 2],
  ],
];

const CELL = 14;
const FLAME_W = 16 * CELL;
const FLAME_H = 14 * CELL;

/** 单朵火焰：描边红外层 → 橙层 → 黄芯（仅外层描边） */
const Flame: React.FC<{ rects: FlameRect[]; scale: number }> = ({ rects, scale }) => {
  const inner: React.ReactNode[] = [];
  for (const [x, y, w, h] of rects) {
    inner.push(<Px key={`o${x}-${y}`} x={x} y={y} w={w} h={h} f={ART.fireOrange} o={false} />);
  }
  // 黄芯：取每块矩形向内收缩
  const core: React.ReactNode[] = [];
  for (const [x, y, w, h] of rects) {
    if (h >= 2 && w >= 2) {
      core.push(<rect key={`c${x}-${y}`} x={x + 1} y={y + h - 2} width={Math.max(1, w - 2)} height={1} fill={ART.fireYellow} />);
    }
  }
  return (
    <svg
      width={FLAME_W * scale}
      height={FLAME_H * scale}
      viewBox="0 0 16 14"
      shapeRendering="crispEdges"
      style={{ position: 'absolute', bottom: 0, imageRendering: 'pixelated' }}
    >
      {/* 红色外层（带描边） */}
      {rects.map(([x, y, w, h], i) => (
        <Px key={i} x={x} y={y} w={w} h={h} f={ART.fireRed} />
      ))}
      {inner}
      {core}
    </svg>
  );
};

/**
 * PixelFire v2：像素火焰（SVG 占位，imageUrl 已预留）。
 * - startFrame→fullFrame 火势由 25% 长到 100%
 * - 每 8 帧切换形态；主火 + 两侧辅焰 + 烟块 + 上升火星
 */
export const PixelFire: React.FC<{
  fire: FireEntry;
  x: number;
  y: number;
  frame: number;
}> = ({ fire, x, y, frame }) => {
  if (frame < fire.startFrame || frame > fire.endFrame) {
    return null;
  }

  const grow = interpolate(
    frame,
    [fire.startFrame, fire.fullFrame],
    [0.25, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const variant = FLAME_VARIANTS[Math.floor(frame / 8) % FLAME_VARIANTS.length];

  if (fire.imageUrl) {
    return (
      <img
        src={fire.imageUrl}
        alt="fire"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: FLAME_W * grow,
          height: FLAME_H * grow,
          transform: 'translate(-50%, -100%)',
          imageRendering: 'pixelated',
        }}
      />
    );
  }

  const tick = Math.floor(frame / 8);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: FLAME_W,
        height: FLAME_H,
        transform: `translate(-50%, -100%) scale(${grow})`,
        transformOrigin: '50% 100%',
        imageRendering: 'pixelated',
      }}
    >
      {/* 两侧辅焰 */}
      <div style={{ position: 'absolute', left: -FLAME_W * 0.58, bottom: 0 }}>
        <Flame rects={variant} scale={0.55} />
      </div>
      <div style={{ position: 'absolute', left: FLAME_W * 0.1, bottom: 0 }}>
        <Flame rects={variant} scale={0.55} />
      </div>
      {/* 主焰 */}
      <div style={{ position: 'absolute', left: -FLAME_W / 2, bottom: 0 }}>
        <Flame rects={variant} scale={1} />
      </div>
      {/* 上升烟块（两色调） */}
      {[0, 1, 2, 3].map((i) => {
        const step = (tick * 3 + i * 5) % 6;
        return (
          <div
            key={`s${i}`}
            style={{
              position: 'absolute',
              left: 58 + i * 24,
              bottom: FLAME_H + 10 + step * 18,
              width: 18,
              height: 18,
              background: ART.smoke,
              boxShadow: `inset -4px -4px 0 ${ART.outline}`,
              opacity: 0.55,
            }}
          />
        );
      })}
      {/* 上升火星（橙/黄小方块，确定性跳动） */}
      {[0, 1, 2, 3, 4].map((i) => {
        const step = (tick * 2 + i * 3) % 7;
        const sway = (tick + i) % 3 - 1;
        return (
          <div
            key={`e${i}`}
            style={{
              position: 'absolute',
              left: 40 + i * 32 + sway * 12,
              bottom: FLAME_H * 0.7 + step * 26,
              width: 10,
              height: 10,
              background: i % 2 === 0 ? ART.fireOrange : ART.fireYellow,
              opacity: 1 - step / 8,
            }}
          />
        );
      })}
    </div>
  );
};
