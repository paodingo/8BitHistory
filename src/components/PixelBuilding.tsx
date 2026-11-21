import React from 'react';
import { interpolate } from 'remotion';
import type { FireEntry, LocationEntity, FactionStyle } from '../types';
import { PIXEL_FONT, hardTextShadow } from '../pixel-style';

const WOOD = '#3a2a18';

/** 城寨/军营/粮仓：16x11 网格像素 SVG 占位（imageUrl 已预留） */
const BuildingSprite: React.FC<{ kind: LocationEntity['kind']; flagColor: string }> = ({
  kind,
  flagColor,
}) => {
  const rect = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}-${w}-${h}-${fill}`} x={x} y={y} width={w} height={h} fill={fill} />
  );

  return (
    <svg
      width={148}
      height={102}
      viewBox="0 0 16 11"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {kind === 'fort' && (
        <>
          {rect(1, 10, 14, 1, '#175c28')}
          {rect(0, 3, 2, 8, '#7a8088')}
          {rect(14, 3, 2, 8, '#7a8088')}
          {rect(0, 2, 2, 1, '#a8aeb8')}
          {rect(14, 2, 2, 1, '#a8aeb8')}
          {rect(1, 5, 14, 5, '#a8aeb8')}
          {rect(1, 9, 14, 1, '#7a8088')}
          {[1, 4, 7, 10, 13].map((x) => rect(x, 4, 2, 1, '#a8aeb8'))}
          {rect(6, 7, 4, 3, '#23252a')}
          {rect(8, 1, 1, 3, WOOD)}
          {rect(9, 1, 4, 2, flagColor)}
        </>
      )}

      {kind === 'camp' && (
        <>
          {rect(1, 10, 14, 1, '#7a6a44')}
          {rect(4, 5, 2, 1, '#d8b46a')}
          {rect(3, 6, 4, 1, '#d8b46a')}
          {rect(2, 7, 6, 1, '#d8b46a')}
          {rect(2, 8, 6, 2, '#d8b46a')}
          {rect(3, 8, 2, 2, '#6a4a22')}
          {rect(11, 5, 2, 1, '#d8b46a')}
          {rect(10, 6, 4, 1, '#d8b46a')}
          {rect(9, 7, 6, 1, '#d8b46a')}
          {rect(9, 8, 6, 2, '#d8b46a')}
          {rect(12, 8, 2, 2, '#6a4a22')}
          {rect(7, 2, 1, 3, WOOD)}
          {rect(8, 2, 5, 3, flagColor)}
        </>
      )}

      {kind === 'granary' && (
        <>
          {rect(1, 10, 14, 1, '#175c28')}
          {rect(2, 6, 12, 4, '#b98a4a')}
          {rect(3, 3, 10, 1, '#7a4a1e')}
          {rect(2, 4, 12, 1, '#7a4a1e')}
          {rect(1, 5, 14, 1, '#7a4a1e')}
          {rect(7, 2, 2, 1, '#5c3a1a')}
          {rect(6, 8, 4, 2, '#3a2a18')}
          {rect(0, 8, 2, 2, '#e8c84a')}
          {rect(14, 8, 2, 2, '#e8c84a')}
          {rect(7, 0, 1, 2, WOOD)}
          {rect(8, 0, 4, 2, flagColor)}
        </>
      )}
    </svg>
  );
};

/**
 * PixelBuilding：地图上的城池/军营/粮仓。
 * 锚点 (x, y) 为建筑地面中心；起火后整体压暗为焦黑剪影。
 */
export const PixelBuilding: React.FC<{
  loc: LocationEntity;
  faction: FactionStyle;
  frame: number;
  fires: FireEntry[];
}> = ({ loc, faction, frame, fires }) => {
  const fire = fires.find((f) => f.locationId === loc.id);
  const brightness =
    fire && frame > fire.startFrame + 8
      ? interpolate(
          frame,
          [fire.startFrame + 8, fire.startFrame + 24],
          [1, 0.3],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )
      : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: loc.x,
        top: loc.y,
        transform: 'translate(-50%, -100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        imageRendering: 'pixelated',
      }}
    >
      <div
        style={{
          marginBottom: 8,
          fontFamily: PIXEL_FONT,
          fontSize: 32,
          fontWeight: 'bold',
          color: '#ffffff',
          whiteSpace: 'nowrap',
          ...hardTextShadow,
        }}
      >
        <span style={{ color: faction.color, marginRight: 10 }}>■</span>
        {loc.name}
      </div>
      {loc.imageUrl ? (
        <img
          src={loc.imageUrl}
          alt={loc.name}
          width={148}
          height={102}
          style={{ imageRendering: 'pixelated', display: 'block', filter: `brightness(${brightness})` }}
        />
      ) : (
        <div style={{ filter: `brightness(${brightness})` }}>
          <BuildingSprite kind={loc.kind} flagColor={faction.color} />
        </div>
      )}
    </div>
  );
};
