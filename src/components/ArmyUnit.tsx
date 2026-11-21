import React from 'react';
import { interpolate } from 'remotion';
import type { ArmyEntity, FactionStyle, MoveSegment, UnitSprite, Vec2 } from '../types';
import { PIXEL_FONT, ART, pixelOutlineText } from '../pixel-style';
import { PixelCanvas, Px } from './pixel-art';

/** 兵力数字格式化：100000 -> 10万；9400 -> 9千 */
export const formatTroops = (v: number): string =>
  v >= 10000 ? `${+(v / 10000).toFixed(1)}万` : `${Math.round(v / 1000)}千`;

interface PositionState {
  pos: Vec2;
  moving: boolean;
  dirX: number;
}

/** 依据帧数在直线行军段里求当前位置（数据驱动，组件不写死任何坐标） */
const positionAtFrame = (moves: MoveSegment[], f: number): PositionState => {
  const first = moves[0];
  const last = moves[moves.length - 1];
  for (const m of moves) {
    if (f >= m.fromFrame && f <= m.toFrame) {
      const pos = {
        x: interpolate(f, [m.fromFrame, m.toFrame], [m.from.x, m.to.x], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        y: interpolate(f, [m.fromFrame, m.toFrame], [m.from.y, m.to.y], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      };
      return {
        pos,
        moving:
          f < m.toFrame && (m.from.x !== m.to.x || m.from.y !== m.to.y),
        dirX: Math.sign(m.to.x - m.from.x) || 1,
      };
    }
  }
  if (f < first.fromFrame) {
    return { pos: first.from, moving: false, dirX: 1 };
  }
  return {
    pos: last.to,
    moving: false,
    dirX: Math.sign(last.to.x - last.from.x) || 1,
  };
};

/** 马腿两帧：A 组高 B 组低，交错踏步 */
const HORSE_LEGS_A: [number, number, number, number][] = [
  [4, 11, 2, 4], [6, 11, 2, 3], [9, 11, 2, 3], [11, 11, 2, 4],
];
const HORSE_LEGS_B: [number, number, number, number][] = [
  [4, 11, 2, 3], [6, 11, 2, 4], [9, 11, 2, 4], [11, 11, 2, 3],
];

/** 像素骑兵 v2（16x16，朝右，全描边+高光） */
const CavalrySprite: React.FC<{
  faction: FactionStyle;
  frame: number;
  moving: boolean;
  leader: boolean;
  flip: boolean;
}> = ({ faction, frame, moving, leader, flip }) => {
  const phase = moving && Math.floor(frame / 8) % 2 === 1 ? 1 : 0;
  const legs = phase === 0 ? HORSE_LEGS_A : HORSE_LEGS_B;
  const bodyBob = phase === 1 ? 1 : 0; // 奔跑时身体起伏 1px
  return (
    <PixelCanvas size={84} flip={flip}>
      {/* 军旗（主将） */}
      {leader ? (
        <>
          <Px x={1} y={0} w={1} h={7} f={ART.woodDark} />
          <Px x={2} y={0} w={5} h={4} f={faction.color} />
          <rect x={2} y={0} width={5} height={1} fill={faction.highlight} />
        </>
      ) : null}
      {/* 马尾 */}
      <Px x={2} y={7 + bodyBob} w={1} h={3} f={ART.horseDark} />
      {/* 马身 */}
      <Px x={3} y={8 + bodyBob} w={9} h={3} f={ART.horse} />
      <rect x={3} y={8 + bodyBob} width={9} height={1} fill={ART.horseDark} opacity={0.5} />
      {/* 颈 + 头 + 耳 */}
      <Px x={10} y={5 + bodyBob} w={2} h={3} f={ART.horse} />
      <Px x={11} y={4 + bodyBob} w={3} h={2} f={ART.horse} />
      <rect x={14} y={3 + bodyBob} width={1} height={1} fill={ART.horseDark} />
      <rect x={13} y={4 + bodyBob} width={1} height={1} fill={ART.outline} />
      {/* 马腿两帧切换 */}
      {legs.map(([x, y, w, h], i) => (
        <Px key={i} x={x} y={y + bodyBob} w={w} h={h} f={ART.horseDark} />
      ))}
      {/* 骑手：甲（阵营主色+高光）→ 头 → 盔 */}
      <Px x={6} y={4 + bodyBob} w={3} h={4} f={faction.color} />
      <rect x={6} y={4 + bodyBob} width={1} height={4} fill={faction.highlight} />
      <Px x={6} y={2 + bodyBob} w={2} h={2} f={ART.skin} />
      <Px x={5} y={1 + bodyBob} w={4} h={1} f={faction.dark} />
      {/* 长矛：木杆 + 钢尖 */}
      <Px x={11} y={1 + bodyBob} w={1} h={5} f={ART.wood} />
      <Px x={11} y={0 + bodyBob} w={1} h={1} f={ART.steel} />
    </PixelCanvas>
  );
};

/** 像素军旗步兵队 v2（18x14 网格：旗在左、两名士兵在右，间距拉开防描边粘连） */
const BannerSprite: React.FC<{
  faction: FactionStyle;
  frame: number;
  moving: boolean;
  leader: boolean;
  flip: boolean;
}> = ({ faction, frame, moving, leader, flip }) => {
  const phase = moving && Math.floor(frame / 8) % 2 === 1 ? 1 : 0;
  const step = (i: number) => (phase === 1 && i % 2 === 0 ? 1 : 0);
  const soldier = (x: number, i: number) => {
    const s = step(i);
    return (
      <React.Fragment key={x}>
        <Px x={x} y={6 + s} w={2} h={1} f={faction.dark} />
        <Px x={x} y={7 + s} w={2} h={1} f={ART.skin} />
        <Px x={x} y={8 + s} w={2} h={3} f={faction.color} />
        <rect x={x} y={8 + s} width={1} height={3} fill={faction.highlight} />
        <Px x={x} y={11 + s} w={2} h={2} f={faction.dark} />
      </React.Fragment>
    );
  };
  return (
    <svg
      width={84}
      height={84}
      viewBox="0 0 18 14"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated', display: 'block', transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {/* 大旗（左）：杆 + 旗面（高光/暗部条） */}
      <Px x={1} y={0} w={1} h={12} f={ART.woodDark} />
      <Px x={2} y={0} w={5} h={leader ? 6 : 5} f={faction.color} />
      <rect x={2} y={0} width={5} height={1} fill={faction.highlight} />
      <rect x={2} y={leader ? 5 : 4} width={5} height={1} fill={faction.dark} />
      {/* 两名士兵（右，间隔 1px） */}
      {soldier(10, 0)}
      {soldier(14, 1)}
    </svg>
  );
};

/**
 * ArmyUnit：数据驱动作战单位。
 * - 直线 interpolate 行军；编队用 sprites 偏移 + 延迟帧实现
 * - 每 8 帧切换一次姿态的极简走路模拟
 * - 头顶兵力数字（troopsKeyframes 支持实时掉血）+ 迷你血条
 */
export const ArmyUnit: React.FC<{
  army: ArmyEntity;
  sprite: UnitSprite;
  frame: number;
  faction: FactionStyle;
}> = ({ army, sprite, frame, faction }) => {
  if (army.visibleFromFrame !== undefined && frame < army.visibleFromFrame) {
    return null;
  }

  const effFrame = Math.max(0, frame - (sprite.delayFrames ?? 0));
  const state = positionAtFrame(army.moves, effFrame);
  const x = state.pos.x + (sprite.dx ?? 0);
  const y = state.pos.y + (sprite.dy ?? 0);

  let opacity = 1;
  if (army.fadeOut) {
    opacity = interpolate(
      frame,
      [army.fadeOut.fromFrame, army.fadeOut.toFrame],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  }

  const troopsNow = army.troopsKeyframes
    ? Math.round(
        interpolate(
          frame,
          army.troopsKeyframes.map((k) => k.frame),
          army.troopsKeyframes.map((k) => k.value),
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )
      )
    : null;

  const label =
    troopsNow === null ? army.label : `${army.label} ${formatTroops(troopsNow)}`;
  const hpPct =
    troopsNow !== null && army.troopsKeyframes
      ? troopsNow / army.troopsKeyframes[0].value
      : null;

  return (
    <div
      style={{
        position: 'absolute',
        left: Math.round(x),
        top: Math.round(y),
        transform: 'translate(-50%, -50%)',
        opacity,
        imageRendering: 'pixelated',
      }}
    >
      {army.imageUrl ? (
        <img
          src={army.imageUrl}
          alt={army.name}
          width={84}
          height={84}
          style={{ imageRendering: 'pixelated', display: 'block' }}
        />
      ) : army.type === 'cavalry' ? (
        <CavalrySprite
          faction={faction}
          frame={effFrame}
          moving={state.moving}
          leader={sprite.leader ?? false}
          flip={state.dirX < 0}
        />
      ) : (
        <BannerSprite
          faction={faction}
          frame={effFrame}
          moving={state.moving}
          leader={sprite.leader ?? false}
          flip={state.dirX < 0}
        />
      )}

      <div
        style={{
          marginTop: 6,
          textAlign: 'center',
          fontFamily: PIXEL_FONT,
          fontSize: 27,
          fontWeight: 'bold',
          color: '#ffffff',
          whiteSpace: 'nowrap',
          ...pixelOutlineText,
        }}
      >
        {label}
      </div>

      {hpPct !== null ? (
        <div
          style={{
            width: 120,
            height: 12,
            background: '#000',
            border: `3px solid ${ART.outline}`,
            boxShadow: '0 0 0 2px #ffffff',
            margin: '6px auto 0',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${Math.max(0, Math.min(1, hpPct)) * 100}%`,
              backgroundColor: faction.color,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${Math.max(0, Math.min(1, hpPct)) * 100}%`,
              backgroundColor: faction.highlight,
              opacity: 0.45,
              clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
            }}
          />
        </div>
      ) : null}
    </div>
  );
};
