import React from 'react';
import { interpolate } from 'remotion';
import type { FireEntry, LocationEntity, FactionStyle } from '../types';
import { PIXEL_FONT, ART, pixelOutlineText } from '../pixel-style';
import { PixelCanvas, Px } from './pixel-art';

/** 城寨 v2（24x16 网格）：灰墙垛口 + 木门 + 阵营大旗，全描边 */
const FortSprite: React.FC<{ flagColor: string; flagHighlight: string }> = ({
  flagColor,
  flagHighlight,
}) => (
  <PixelCanvas size={168} grid={24}>
    {/* 两侧箭塔 */}
    <Px x={1} y={4} w={4} h={11} f={ART.wall} />
    <Px x={1} y={4} w={1} h={11} f={ART.wallLight} o={false} />
    <Px x={19} y={4} w={4} h={11} f={ART.wall} />
    <Px x={19} y={4} w={1} h={11} f={ART.wallLight} o={false} />
    <rect x={1} y={3} width={1} height={1} fill={ART.wallDark} />
    <rect x={4} y={3} width={1} height={1} fill={ART.wallDark} />
    <rect x={19} y={3} width={1} height={1} fill={ART.wallDark} />
    <rect x={22} y={3} width={1} height={1} fill={ART.wallDark} />
    {/* 城墙主体 + 垛口 */}
    <Px x={5} y={7} w={14} h={8} f={ART.wall} />
    <Px x={5} y={7} w={14} h={1} f={ART.wallLight} o={false} />
    {[6, 9, 12, 15].map((x) => (
      <Px key={x} x={x} y={5} w={2} h={2} f={ART.wall} />
    ))}
    {/* 城门（木门 + 木梁） */}
    <Px x={10} y={10} w={4} h={5} f={ART.wood} />
    <rect x={11} y={10} width={1} height={5} fill={ART.woodDark} />
    <rect x={13} y={10} width={1} height={5} fill={ART.woodDark} />
    <Px x={10} y={10} w={4} h={1} f={ART.woodLight} o={false} />
    {/* 大旗 */}
    <Px x={16} y={0} w={1} h={5} f={ART.woodDark} />
    <Px x={17} y={0} w={5} h={3} f={flagColor} />
    <rect x={17} y={0} width={5} height={1} fill={flagHighlight} />
  </PixelCanvas>
);

/** 军营 v2：木栅栏 + 两顶帐篷 + 阵营大旗 */
const CampSprite: React.FC<{ flagColor: string; flagHighlight: string }> = ({
  flagColor,
  flagHighlight,
}) => (
  <PixelCanvas size={168} grid={24}>
    {/* 后排木栅栏 */}
    {[0, 3, 6, 20, 23].map((x) => (
      <Px key={`f${x}`} x={x} y={5} w={1} h={4} f={ART.wood} />
    ))}
    <Px x={0} y={6} w={24} h={1} f={ART.woodDark} o={false} />
    {/* 左帐篷：布面 + 暗部条纹 + 门 */}
    <Px x={2} y={8} w={8} h={7} f={ART.tent} />
    <Px x={3} y={7} w={6} h={1} f={ART.tent} />
    <rect x={4} y={9} width={1} height={6} fill={ART.woodDark} opacity={0.6} />
    <Px x={5} y={11} w={2} h={4} f={ART.woodDark} />
    {/* 右帐篷 */}
    <Px x={14} y={8} w={8} h={7} f={ART.tent} />
    <Px x={15} y={7} w={6} h={1} f={ART.tent} />
    <rect x={17} y={9} width={1} height={6} fill={ART.woodDark} opacity={0.6} />
    <Px x={17} y={11} w={2} h={4} f={ART.woodDark} />
    {/* 中央大旗 */}
    <Px x={11} y={1} w={1} h={9} f={ART.woodDark} />
    <Px x={12} y={1} w={6} h={4} f={flagColor} />
    <rect x={12} y={1} width={6} height={1} fill={flagHighlight} />
  </PixelCanvas>
);

/** 粮仓 v2：木仓身 + 双坡顶 + 粮袋垛 + 阵营旗 */
const GranarySprite: React.FC<{ flagColor: string; flagHighlight: string }> = ({
  flagColor,
  flagHighlight,
}) => (
  <PixelCanvas size={168} grid={24}>
    {/* 仓顶（双坡，深木色 + 高光脊线） */}
    <Px x={4} y={4} w={16} h={2} f={ART.woodDark} />
    <Px x={3} y={6} w={18} h={2} f={ART.woodDark} />
    <rect x={11} y={3} width={2} height={1} fill={ART.woodLight} />
    {/* 仓身（木板 + 板缝） */}
    <Px x={5} y={8} w={14} h={7} f={ART.wood} />
    {[10, 12].map((y) => (
      <rect key={y} x={5} y={y} width={14} height={1} fill={ART.woodDark} opacity={0.7} />
    ))}
    {/* 门 */}
    <Px x={10} y={10} w={4} h={5} f={ART.woodDark} />
    <Px x={11} y={11} w={1} h={1} f={ART.steel} o={false} />
    {/* 两侧粮袋垛 */}
    <Px x={0} y={11} w={4} h={4} f={ART.sack} />
    <Px x={1} y={10} w={2} h={1} f={ART.sack} />
    <Px x={20} y={11} w={4} h={4} f={ART.sack} />
    <Px x={21} y={10} w={2} h={1} f={ART.sack} />
    {/* 大旗 */}
    <Px x={17} y={0} w={1} h={4} f={ART.woodDark} />
    <Px x={18} y={0} w={4} h={3} f={flagColor} />
    <rect x={18} y={0} width={4} height={1} fill={flagHighlight} />
  </PixelCanvas>
);

/**
 * PixelBuilding v2：地图上的城池/军营/粮仓。
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
          [1, 0.28],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )
      : 1;

  const sprite =
    loc.kind === 'fort' ? (
      <FortSprite flagColor={faction.color} flagHighlight={faction.highlight} />
    ) : loc.kind === 'camp' ? (
      <CampSprite flagColor={faction.color} flagHighlight={faction.highlight} />
    ) : (
      <GranarySprite flagColor={faction.color} flagHighlight={faction.highlight} />
    );

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
          marginBottom: 10,
          fontFamily: PIXEL_FONT,
          fontSize: 32,
          fontWeight: 'bold',
          color: '#ffffff',
          whiteSpace: 'nowrap',
          ...pixelOutlineText,
        }}
      >
        <span style={{ color: faction.highlight, marginRight: 10 }}>■</span>
        {loc.name}
      </div>
      {loc.imageUrl ? (
        <img
          src={loc.imageUrl}
          alt={loc.name}
          width={168}
          height={112}
          style={{ imageRendering: 'pixelated', display: 'block', filter: `brightness(${brightness})` }}
        />
      ) : (
        <div style={{ filter: `brightness(${brightness})` }}>{sprite}</div>
      )}
    </div>
  );
};
