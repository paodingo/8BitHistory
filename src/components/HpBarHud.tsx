import React from 'react';
import { interpolate } from 'remotion';
import type { BattleData, FactionId, FactionStyle, HpBarConfig } from '../types';
import { formatTroops } from './ArmyUnit';
import { PIXEL_FONT, hardTextShadow } from '../pixel-style';

const HpBar: React.FC<{ bar: HpBarConfig; faction: FactionStyle; frame: number }> = ({
  bar,
  faction,
  frame,
}) => {
  const value = Math.round(
    interpolate(
      frame,
      bar.keyframes.map((k) => k.frame),
      bar.keyframes.map((k) => k.value),
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    )
  );
  const pct = Math.max(0, Math.min(1, value / bar.troopsMax));
  const defeated = bar.defeatAt !== undefined && value <= bar.defeatAt;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          width: 58,
          height: 58,
          background: '#000',
          border: '4px solid #ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: PIXEL_FONT,
          fontSize: 34,
          fontWeight: 'bold',
          color: faction.color,
        }}
      >
        {bar.label}
      </div>
      <div
        style={{
          width: 560,
          height: 40,
          background: '#000',
          border: '4px solid #ffffff',
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
            width: `${pct * 100}%`,
            backgroundColor: faction.color,
          }}
        />
        {/* 像素分段（硬停顿） */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(90deg, transparent 0 34px, rgba(0,0,0,0.35) 34px 38px)',
          }}
        />
      </div>
      <div
        style={{
          width: 150,
          fontFamily: PIXEL_FONT,
          fontSize: 32,
          fontWeight: 'bold',
          color: defeated ? '#ff5a4a' : '#ffffff',
          opacity: defeated && Math.floor(frame / 10) % 2 === 0 ? 0.35 : 1,
          ...hardTextShadow,
        }}
      >
        {defeated ? bar.defeatLabel : formatTroops(value)}
      </div>
    </div>
  );
};

/** 顶部兵力对比 HUD：数据驱动，支持实时掉血与“溃败”闪烁 */
export const HpBarHud: React.FC<{
  hud: BattleData['hud'];
  factions: Record<FactionId, FactionStyle>;
  frame: number;
}> = ({ hud, factions, frame }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 28,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
      }}
    >
      {hud.hpBars.map((bar) => (
        <HpBar key={bar.id} bar={bar} faction={factions[bar.faction]} frame={frame} />
      ))}
    </div>
  );
};
