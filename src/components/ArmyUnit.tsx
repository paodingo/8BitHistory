import React from 'react';
import { interpolate } from 'remotion';
import type { ArmyEntity, FactionStyle, MoveSegment, UnitSprite, Vec2 } from '../types';
import { PIXEL_FONT, hardTextShadow } from '../pixel-style';

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

const HORSE = '#c9a06a';
const HORSE_DARK = '#7d5f38';
const SKIN = '#f2c99a';
const WOOD = '#3a2a18';
const GOLD = '#ffd24a';

/** 像素骑兵（向右，16x16 网格 SVG 占位，imageUrl 字段已预留） */
const CavalrySprite: React.FC<{
  faction: FactionStyle;
  frame: number;
  moving: boolean;
  leader: boolean;
  flip: boolean;
}> = ({ faction, frame, moving, leader, flip }) => {
  // 每 8 帧切换一次姿态（极简走路模拟）
  const phase = moving && Math.floor(frame / 8) % 2 === 1 ? 1 : 0;
  const legs =
    phase === 0
      ? [
          [4, 10, 2, 4],
          [6, 10, 2, 3],
          [9, 10, 2, 3],
          [11, 10, 2, 4],
        ]
      : [
          [4, 10, 2, 3],
          [6, 10, 2, 4],
          [9, 10, 2, 4],
          [11, 10, 2, 3],
        ];
  return (
    <svg
      width={76}
      height={76}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated', display: 'block', transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {/* 军旗（主将金色） */}
      <rect x={2} y={1} width={1} height={5} fill={WOOD} />
      <rect x={3} y={1} width={4} height={3} fill={leader ? GOLD : faction.color} />
      {/* 马尾 / 马身 / 颈 / 头 */}
      <rect x={2} y={7} width={2} height={2} fill={HORSE_DARK} />
      <rect x={4} y={7} width={8} height={3} fill={HORSE} />
      <rect x={11} y={5} width={2} height={3} fill={HORSE} />
      <rect x={12} y={4} width={3} height={2} fill={HORSE} />
      <rect x={13} y={3} width={1} height={1} fill={HORSE_DARK} />
      {/* 马腿：两帧切换 */}
      {legs.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={HORSE_DARK} />
      ))}
      {/* 骑手 */}
      <rect x={6} y={4} width={3} height={3} fill={faction.color} />
      <rect x={6} y={2} width={2} height={2} fill={SKIN} />
      <rect x={6} y={1} width={2} height={1} fill={faction.dark} />
      {/* 长矛 */}
      <rect x={9} y={2} width={1} height={4} fill="#9aa0a8" />
      <rect x={9} y={1} width={1} height={1} fill="#e8e8e8" />
    </svg>
  );
};

/** 像素军旗步兵队（16x16 网格 SVG 占位） */
const BannerSprite: React.FC<{
  faction: FactionStyle;
  frame: number;
  moving: boolean;
  leader: boolean;
  flip: boolean;
}> = ({ faction, frame, moving, leader, flip }) => {
  const phase = moving && Math.floor(frame / 8) % 2 === 1 ? 1 : 0;
  const bob = (i: number) => (phase === 1 && i % 2 === 0 ? -1 : 0);
  const soldiers = [1, 6, 11];
  return (
    <svg
      width={96}
      height={96}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated', display: 'block', transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {/* 大旗 */}
      <rect x={7} y={1} width={1} height={9} fill="#4a3a22" />
      <rect x={8} y={1} width={6} height={leader ? 5 : 4} fill={faction.color} />
      {leader ? <rect x={8} y={5} width={6} height={1} fill={faction.dark} /> : null}
      {/* 三名士兵，走路时交错上下 1px */}
      {soldiers.map((x, i) => (
        <React.Fragment key={x}>
          <rect x={x + 1} y={8 + bob(i)} width={2} height={2} fill={SKIN} />
          <rect x={x} y={10 + bob(i)} width={4} height={4} fill={faction.color} />
          <rect x={x} y={14 + bob(i)} width={4} height={1} fill={faction.dark} />
        </React.Fragment>
      ))}
    </svg>
  );
};

/**
 * ArmyUnit：数据驱制作战单位。
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
          width={army.type === 'cavalry' ? 76 : 96}
          height={army.type === 'cavalry' ? 76 : 96}
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
          marginTop: 4,
          textAlign: 'center',
          fontFamily: PIXEL_FONT,
          fontSize: 26,
          fontWeight: 'bold',
          color: '#ffffff',
          whiteSpace: 'nowrap',
          ...hardTextShadow,
        }}
      >
        {label}
      </div>

      {hpPct !== null ? (
        <div
          style={{
            marginTop: 4,
            width: 120,
            height: 12,
            background: '#000',
            border: '2px solid #ffffff',
            margin: '4px auto 0',
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
        </div>
      ) : null}
    </div>
  );
};
