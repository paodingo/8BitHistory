import React from 'react';
import { interpolate } from 'remotion';
import type { CameraKeyframe } from '../types';

const clampValue = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

/**
 * MapCamera：像素地图运镜组件。
 * - 依据 battle.json 的 camera 关键帧，对整张世界地图做平移/缩放
 * - 位移取整，保证像素不出现亚像素抖动/模糊
 * - 自动夹取镜头中心，视野永不越出地图边界
 */
export const MapCamera: React.FC<{
  frame: number;
  viewportWidth: number;
  viewportHeight: number;
  mapWidth: number;
  mapHeight: number;
  keyframes: CameraKeyframe[];
  children: React.ReactNode;
}> = ({
  frame,
  viewportWidth,
  viewportHeight,
  mapWidth,
  mapHeight,
  keyframes,
  children,
}) => {
  const frames = keyframes.map((k) => k.frame);
  const rawX = interpolate(frame, frames, keyframes.map((k) => k.x), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rawY = interpolate(frame, frames, keyframes.map((k) => k.y), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const zoom = interpolate(frame, frames, keyframes.map((k) => k.zoom), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const halfW = viewportWidth / 2 / zoom;
  const halfH = viewportHeight / 2 / zoom;
  const x =
    halfW * 2 >= mapWidth ? mapWidth / 2 : clampValue(rawX, halfW, mapWidth - halfW);
  const y =
    halfH * 2 >= mapHeight
      ? mapHeight / 2
      : clampValue(rawY, halfH, mapHeight - halfH);

  const tx = Math.round(viewportWidth / 2 - x * zoom);
  const ty = Math.round(viewportHeight / 2 - y * zoom);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: mapWidth,
          height: mapHeight,
          transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
          transformOrigin: '0 0',
          imageRendering: 'pixelated',
        }}
      >
        {children}
      </div>
    </div>
  );
};
