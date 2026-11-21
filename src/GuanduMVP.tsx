import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { battle } from './data/battle';
import { MapCamera } from './components/MapCamera';
import { ArmyUnit } from './components/ArmyUnit';
import { SubtitleBox } from './components/SubtitleBox';
import { PixelMap } from './components/PixelMap';
import { PixelBuilding } from './components/PixelBuilding';
import { PixelFire } from './components/PixelFire';
import { HpBarHud } from './components/HpBarHud';

/**
 * GuanduMVP：《官渡之战·火烧乌巢》15 秒主合成。
 * 剧本（见 battle.json）：
 * - 0~120 帧  官渡对峙 + 曹操 RPG 对话框
 * - 120~300 帧 五千轻骑直线突袭乌巢（夜袭氛围）
 * - 300~450 帧 火烧乌巢（屏幕微震动）+ 袁绍掉血溃败
 */
export const GuanduMVP: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 火烧触发的屏幕微震动（幅度衰减、确定性伪随机方向）
  let sx = 0;
  let sy = 0;
  for (const f of battle.fires) {
    const s = f.shake;
    if (!s) continue;
    if (frame >= s.startFrame && frame <= s.startFrame + s.durationFrames) {
      const decay = interpolate(
        frame,
        [s.startFrame, s.startFrame + s.durationFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      sx = Math.round(decay * s.amplitude * Math.sin(frame * 2.3));
      sy = Math.round(decay * s.amplitude * Math.cos(frame * 3.1));
    }
  }

  // 夜袭氛围（进入/退出渐变）
  const n = battle.effects.night;
  const nightOpacity = interpolate(
    frame,
    [n.fromFrame, n.toFrame, n.fadeOutFrame, n.fadeEndFrame],
    [0, n.opacity, n.opacity, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const activeDialog =
    battle.dialogs.find((d) => frame >= d.fromFrame && frame <= d.toFrame) ?? null;
  const activeSubtitle =
    battle.subtitles.find((s) => frame >= s.fromFrame && frame <= s.toFrame) ?? null;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <MapCamera
          frame={frame}
          viewportWidth={width}
          viewportHeight={height}
          mapWidth={battle.map.width}
          mapHeight={battle.map.height}
          keyframes={battle.camera}
        >
          <PixelMap map={battle.map} />
          {battle.locations.map((loc) => (
            <PixelBuilding
              key={loc.id}
              loc={loc}
              faction={battle.factions[loc.faction]}
              frame={frame}
              fires={battle.fires}
            />
          ))}
          {battle.armies.map((a) =>
            a.sprites.map((sp, i) => (
              <ArmyUnit
                key={`${a.id}-${i}`}
                army={a}
                sprite={sp}
                frame={frame}
                faction={battle.factions[a.faction]}
              />
            ))
          )}
          {battle.fires.map((f) => {
            const loc = battle.locations.find((l) => l.id === f.locationId);
            if (!loc) return null;
            return <PixelFire key={f.locationId} fire={f} x={loc.x} y={loc.y} frame={frame} />;
          })}
        </MapCamera>

        {nightOpacity > 0 ? (
          <AbsoluteFill
            style={{ backgroundColor: n.color, opacity: nightOpacity, pointerEvents: 'none' }}
          />
        ) : null}

        {battle.fires.map((f) => {
          if (!f.tint) return null;
          if (frame < f.startFrame || frame > f.endFrame) return null;
          const base = interpolate(
            frame,
            [f.startFrame, f.startFrame + 18],
            [0, f.tint.maxOpacity],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const op = base * (Math.floor(frame / f.tint.flickerFrames) % 2 === 0 ? 1 : 0.72);
          return (
            <AbsoluteFill
              key={`tint-${f.locationId}`}
              style={{ backgroundColor: f.tint.color, opacity: op, pointerEvents: 'none' }}
            />
          );
        })}
      </AbsoluteFill>

      <HpBarHud hud={battle.hud} factions={battle.factions} frame={frame} />

      {frame >= battle.title.fromFrame && frame <= battle.title.toFrame ? (
        <SubtitleBox
          frame={frame}
          fromFrame={battle.title.fromFrame}
          toFrame={battle.title.toFrame}
          text={battle.title.text}
          subText={battle.title.subText}
          variant="title"
        />
      ) : null}

      {activeSubtitle ? (
        <SubtitleBox
          frame={frame}
          fromFrame={activeSubtitle.fromFrame}
          toFrame={activeSubtitle.toFrame}
          text={activeSubtitle.text}
          variant="caption"
        />
      ) : null}

      {activeDialog ? (
        <SubtitleBox
          frame={frame}
          fromFrame={activeDialog.fromFrame}
          toFrame={activeDialog.toFrame}
          text={activeDialog.text}
          variant="dialog"
          speaker={activeDialog.speaker}
          speakerColor={battle.factions[activeDialog.faction].highlight}
          portraitChar={activeDialog.portrait.char}
          portraitColor={battle.factions[activeDialog.faction].color}
          portraitHighlightColor={battle.factions[activeDialog.faction].highlight}
          portraitDarkColor={battle.factions[activeDialog.faction].dark}
          portraitBeard={activeDialog.speaker === '曹操'}
          portraitImageUrl={activeDialog.portrait.imageUrl}
          portraitSide={activeDialog.portraitSide}
        />
      ) : null}
    </AbsoluteFill>
  );
};
