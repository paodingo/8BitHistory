import React from 'react';
import { interpolate } from 'remotion';
import type { FireEntry } from '../types';

type FlameRect = [number, number, number, number, string];

const RED = '#ff3d1f';
const ORANGE = '#ff9c2e';
const YELLOW = '#ffdf5e';

// 三个火焰形态，每 8 帧切换一次（极简像素闪烁）
const FLAME_VARIANTS: FlameRect[][] = [
  [
    [4, 10, 8, 1, RED], [5, 9, 6, 1, RED], [5, 8, 6, 1, RED], [6, 7, 4, 1, RED], [7, 5, 3, 1, RED], [8, 3, 2, 1, RED],
    [6, 10, 4, 1, ORANGE], [6, 9, 4, 1, ORANGE], [6, 8, 4, 1, ORANGE], [7, 6, 3, 1, ORANGE], [8, 4, 2, 1, ORANGE],
    [7, 10, 2, 1, YELLOW], [7, 9, 2, 1, YELLOW], [7, 8, 2, 1, YELLOW], [8, 6, 2, 1, YELLOW], [8, 5, 2, 1, YELLOW],
  ],
  [
    [4, 10, 8, 1, RED], [5, 9, 6, 1, RED], [5, 8, 6, 1, RED], [6, 7, 4, 1, RED], [6, 5, 3, 1, RED], [7, 3, 2, 1, RED],
    [6, 10, 4, 1, ORANGE], [6, 9, 4, 1, ORANGE], [6, 8, 4, 1, ORANGE], [7, 6, 2, 1, ORANGE], [7, 4, 2, 1, ORANGE],
    [7, 10, 2, 1, YELLOW], [7, 9, 2, 1, YELLOW], [6, 8, 2, 1, YELLOW], [7, 6, 2, 1, YELLOW], [7, 5, 2, 1, YELLOW],
  ],
  [
    [4, 10, 8, 1, RED], [5, 9, 6, 1, RED], [5, 8, 6, 1, RED], [6, 7, 4, 1, RED], [7, 5, 3, 1, RED], [6, 3, 2, 1, RED],
    [6, 10, 4, 1, ORANGE], [6, 9, 4, 1, ORANGE], [6, 8, 4, 1, ORANGE], [7, 6, 3, 1, ORANGE], [7, 4, 2, 1, ORANGE],
    [7, 10, 2, 1, YELLOW], [7, 9, 2, 1, YELLOW], [7, 8, 2, 1, YELLOW], [7, 6, 2, 1, YELLOW], [8, 5, 2, 1, YELLOW],
  ],
];

const CELL = 13;
const FLAME_W = 16 * CELL;
const FLAME_H = 12 * CELL;

const FlameSvg: React.FC<{ rects: FlameRect[]; scale: number; x: number }> = ({ rects, scale, x }) => (
  <svg
    width={FLAME_W * scale}
    height={FLAME_H * scale}
    viewBox={`0 0 16 12`}
    shapeRendering="crispEdges"
    style={{ position: 'absolute', left: x, bottom: 0, imageRendering: 'pixelated' }}
  >
    {rects.map(([rx, ry, rw, rh, c], i) => (
      <rect key={i} x={rx} y={ry} width={rw} height={rh} fill={c} />
    ))}
  </svg>
);

/**
 * PixelFire：像素火焰（SVG 占位，imageUrl 已预留）。
 * - startFrame→fullFrame 火势由 25% 长到 100%
 * - 每 8 帧切换形态闪烁；主火焰 + 两侧辅焰 + 上升烟块
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
      <FlameSvg rects={variant} scale={0.55} x={-FLAME_W * 0.62} />
      <FlameSvg rects={variant} scale={0.55} x={FLAME_W * 0.07} />
      <FlameSvg rects={variant} scale={1} x={-FLAME_W / 2} />
      {/* 上升烟块 */}
      {[0, 1, 2, 3].map((i) => {
        const step = (tick * 3 + i * 5) % 6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 64 + i * 22,
              bottom: FLAME_H + 6 + step * 16,
              width: 16,
              height: 16,
              background: '#6f6f6f',
              opacity: 0.5,
            }}
          />
        );
      })}
    </div>
  );
};
