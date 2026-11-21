import React from 'react';
import type { MapConfig, TerrainPiece } from '../types';
import { ART } from '../pixel-style';
import { Px } from './pixel-art';

/** 描边像素树：三层收窄树冠 + 高光 + 木色树干（大小三档） */
const Tree: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => {
  const scale = s === 0 ? 1 : s === 1 ? 1.15 : 1.3;
  return (
    <svg
      width={Math.round(44 * scale)}
      height={Math.round(52 * scale)}
      viewBox="0 0 11 12"
      shapeRendering="crispEdges"
      style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}
    >
      <Px x={3} y={0} w={5} h={3} f="#276749" />
      <Px x={2} y={2} w={7} h={3} f="#2F855A" />
      <Px x={3} y={4} w={5} h={2} f="#2F855A" />
      <rect x={4} y={0} width={2} height={1} fill="#38A169" />
      <rect x={3} y={2} width={2} height={1} fill="#38A169" />
      <Px x={4} y={6} w={3} h={3} f={ART.wood} />
    </svg>
  );
};

const TerrainBlock: React.FC<{
  piece: TerrainPiece;
  mapWidth: number;
  mapHeight: number;
}> = ({ piece, mapWidth, mapHeight }) => {
  if (piece.type === 'river') {
    const { x = 0, y = 0, width = 0, height = 0, color, edgeColor = ART.outline } = piece;
    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height, background: color }}>
        {/* 南岸深墨描边 + 高光水线 */}
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 12, background: edgeColor }} />
        <div style={{ position: 'absolute', left: 0, bottom: 12, width: '100%', height: 8, background: ART.waterLight, opacity: 0.55 }} />
        {/* 两排像素波纹（硬停顿虚线） */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: Math.round(height * 0.28),
            width: '100%',
            height: 12,
            background: `repeating-linear-gradient(90deg, transparent 0 110px, ${ART.waterLight} 110px 168px, transparent 168px 260px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: Math.round(height * 0.58),
            width: '100%',
            height: 12,
            background: `repeating-linear-gradient(90deg, transparent 0 190px, ${ART.waterLight} 190px 248px, transparent 248px 380px)`,
          }}
        />
      </div>
    );
  }

  if (piece.type === 'woods') {
    const { x = 0, y = 0, width = 0, height = 0 } = piece;
    const trees: React.ReactNode[] = [];
    let row = 0;
    let i = 0;
    for (let ty = 8; ty < height - 46; ty += 72) {
      const offset = row % 2 === 0 ? 0 : 40;
      for (let tx = 14 + offset; tx < width - 44; tx += 88) {
        trees.push(<Tree key={`${tx}-${ty}`} x={tx} y={ty} s={i % 3} />);
        i++;
      }
      row++;
    }
    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.10)' }} />
        {trees}
      </div>
    );
  }

  if (piece.type === 'hills') {
    const { x = 0, y = 0, width = 0, height = 0, color } = piece;
    // 像素丘陵：阶梯收窄的三层山体 + 顶部高光，全描边
    const mound = (mx: number, my: number, scale: number, key: number) => (
      <svg
        key={key}
        width={Math.round(200 * scale)}
        height={Math.round(110 * scale)}
        viewBox="0 0 20 11"
        shapeRendering="crispEdges"
        style={{ position: 'absolute', left: mx, top: my, imageRendering: 'pixelated' }}
      >
        <Px x={1} y={7} w={18} h={3} f={color} />
        <Px x={4} y={4} w={12} h={3} f={color} />
        <Px x={7} y={2} w={6} h={2} f={color} />
        <rect x={8} y={2} width={4} height={1} fill="#38A169" />
        <rect x={5} y={4} width={3} height={1} fill="#38A169" />
      </svg>
    );
    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height }}>
        {mound(30, 90, 1.0, 0)}
        {mound(200, 20, 0.8, 1)}
        {mound(230, 140, 0.7, 2)}
      </div>
    );
  }

  // road：深墨描边 + 木色路面的虚线段（像素石板感）
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
      <polyline
        points={points.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke={ART.outline}
        strokeWidth={strokeWidth + 8}
        strokeDasharray="34 18"
      />
      <polyline
        points={points.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray="34 18"
      />
      <polyline
        points={points.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke={ART.woodLight}
        strokeWidth={6}
        strokeDasharray="10 42"
      />
    </svg>
  );
};

/**
 * PixelMap v2：战棋风大地图。
 * - 双色棋盘草地（conic 硬停顿，无渐变）
 * - 河流/树林/丘陵/官道全部深墨描边
 * - imageUrl 预留，可一键替换正式 PNG
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
  const t = map.tileSize;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: map.width,
        height: map.height,
        backgroundColor: map.baseColor,
        backgroundImage: `conic-gradient(${map.checkerAlt} 25%, ${map.baseColor} 0 50%, ${map.checkerAlt} 0 75%, ${map.baseColor} 0)`,
        backgroundSize: `${2 * t}px ${2 * t}px`,
        imageRendering: 'pixelated',
      }}
    >
      {map.terrain.map((tr) => (
        <TerrainBlock key={tr.name} piece={tr} mapWidth={map.width} mapHeight={map.height} />
      ))}
    </div>
  );
};
