import React from 'react';
import type { MapConfig, TerrainPiece } from '../types';

/** 单棵像素树：树冠方块 + 树干 */
const Tree: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 40, height: 56 }}>
    <div style={{ position: 'absolute', left: 2, top: 0, width: 36, height: 36, background: '#0e4d20' }} />
    <div style={{ position: 'absolute', left: 8, top: 8, width: 14, height: 12, background: '#176b30' }} />
    <div style={{ position: 'absolute', left: 14, top: 36, width: 12, height: 20, background: '#5a3d1e' }} />
  </div>
);

const TerrainBlock: React.FC<{
  piece: TerrainPiece;
  mapWidth: number;
  mapHeight: number;
}> = ({ piece, mapWidth, mapHeight }) => {
  if (piece.type === 'river') {
    const { x = 0, y = 0, width = 0, height = 0, color, edgeColor = '#fff' } = piece;
    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height, background: color }}>
        {/* 两岸硬边 */}
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 10, background: edgeColor }} />
        {/* 像素波纹（硬停顿渐变，非柔和过渡） */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: Math.round(height * 0.3),
            width: '100%',
            height: 10,
            background:
              'repeating-linear-gradient(90deg, transparent 0 90px, rgba(255,255,255,0.22) 90px 134px, transparent 134px 200px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: Math.round(height * 0.62),
            width: '100%',
            height: 10,
            background:
              'repeating-linear-gradient(90deg, transparent 0 140px, rgba(255,255,255,0.18) 140px 184px, transparent 184px 260px)',
          }}
        />
      </div>
    );
  }

  if (piece.type === 'woods') {
    const { x = 0, y = 0, width = 0, height = 0, color } = piece;
    const trees: React.ReactNode[] = [];
    let row = 0;
    for (let ty = 12; ty < height - 40; ty += 78) {
      const offset = row % 2 === 0 ? 0 : 44;
      for (let tx = 16 + offset; tx < width - 40; tx += 92) {
        trees.push(<Tree key={`${tx}-${ty}`} x={tx} y={ty} />);
      }
      row++;
    }
    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height }}>
        <div style={{ position: 'absolute', inset: 0, background: color, opacity: 0.55 }} />
        {trees}
      </div>
    );
  }

  if (piece.type === 'hills') {
    const { x = 0, y = 0, width = 0, height = 0, color } = piece;
    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height }}>
        <div style={{ position: 'absolute', inset: 0, background: color, opacity: 0.7 }} />
        {[
          [30, 24, 52],
          [120, 60, 40],
          [220, 30, 64],
          [90, 130, 36],
          [270, 120, 48],
        ].map(([hx, hy, size], i) => (
          <div key={i} style={{ position: 'absolute', left: hx, top: hy, width: size, height: size / 2, background: '#3fae57', opacity: 0.85 }} />
        ))}
      </div>
    );
  }

  // road：多点折线像素土路（虚线段模拟像素石板）
  const { points = [], color, width: strokeWidth = 20 } = piece;
  if (points.length < 2) return null;
  return (
    <svg
      width={mapWidth}
      height={mapHeight}
      viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }}
      shapeRendering="crispEdges"
    >
      <polyline points={points.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray="30 20" />
    </svg>
  );
};

/**
 * PixelMap：像素战棋大地图占位底图。
 * - imageUrl 字段已预留，后续可一键替换成正式像素 PNG 地图
 * - 占位实现：纯色草地 + 硬边网格线 + 地形块（河流/树林/丘陵/官道）
 */
export const PixelMap: React.FC<{ map: MapConfig }> = ({ map }) => {
  if (map.imageUrl) {
    return (
      <img
        src={map.imageUrl}
        alt="battlefield"
        style={{ position: 'absolute', left: 0, top: 0, width: map.width, height: map.height, imageRendering: 'pixelated' }}
      />
    );
  }
  const g = map.gridSize;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: map.width,
        height: map.height,
        backgroundColor: map.baseColor,
        backgroundImage: `repeating-linear-gradient(0deg, ${map.gridColor} 0 3px, transparent 3px ${g}px), repeating-linear-gradient(90deg, ${map.gridColor} 0 3px, transparent 3px ${g}px)`,
        imageRendering: 'pixelated',
      }}
    >
      {map.terrain.map((t) => (
        <TerrainBlock key={t.name} piece={t} mapWidth={map.width} mapHeight={map.height} />
      ))}
    </div>
  );
};
