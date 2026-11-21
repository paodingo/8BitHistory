import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PIXEL_FONT, dialogBorderStyle, hardTextShadow, thinBorderStyle, pixelOutlineText } from '../pixel-style';
import { BustPortrait } from './pixel-art';

/**
 * SubtitleBox：经典黑底白双线 RPG 文本框。
 * 三种形态全部由 battle.json 驱动：
 * - dialog：底部对话框（立绘左/右 + 说话人名牌 + 打字机逐字效果）
 * - caption：顶部窄字幕条
 * - title：居中大标题卡
 */
export const SubtitleBox: React.FC<{
  frame: number;
  fromFrame: number;
  toFrame: number;
  text: string;
  variant: 'dialog' | 'caption' | 'title';
  speaker?: string;
  speakerColor?: string;
  portraitChar?: string;
  portraitColor?: string;
  portraitHighlightColor?: string;
  portraitDarkColor?: string;
  portraitBeard?: boolean;
  portraitImageUrl?: string | null;
  portraitSide?: 'left' | 'right';
  subText?: string;
}> = ({
  frame,
  fromFrame,
  toFrame,
  text,
  variant,
  speaker,
  speakerColor = '#ffffff',
  portraitChar,
  portraitColor = '#000000',
  portraitHighlightColor,
  portraitDarkColor,
  portraitBeard = true,
  portraitImageUrl = null,
  portraitSide = 'left',
  subText,
}) => {
  if (frame < fromFrame || frame > toFrame) {
    return null;
  }

  if (variant === 'title') {
    return (
      <AbsoluteFill
        style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}
      >
        <div style={{ ...dialogBorderStyle, padding: '52px 110px', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: 88,
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: 10,
              ...hardTextShadow,
            }}
          >
            {text}
          </div>
          {subText ? (
            <div
              style={{
                fontFamily: PIXEL_FONT,
                fontSize: 30,
                color: '#cfcfcf',
                letterSpacing: 6,
                marginTop: 26,
              }}
            >
              {subText}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    );
  }

  if (variant === 'caption') {
    // 放底部：顶部留给兵力 HUD，且字幕与对话框在时间线上从不共存
    return (
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48, pointerEvents: 'none' }}>
        <div style={{ ...thinBorderStyle, padding: '18px 46px' }}>
          <span
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: 38,
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: 4,
              ...hardTextShadow,
            }}
          >
            {text}
          </span>
        </div>
      </AbsoluteFill>
    );
  }

  // ---- dialog：底部 RPG 对话框 ----
  // 打字机：前 60% 时间内逐字出现
  const typeFrames = Math.max(12, Math.floor((toFrame - fromFrame) * 0.6));
  const progress = Math.min(1, (frame - fromFrame) / typeFrames);
  const charCount = Math.floor(progress * text.length);
  const shown = text.slice(0, charCount);
  const done = charCount >= text.length;
  const cursorVisible =
    done && frame < toFrame - 6 && Math.floor(frame / 12) % 2 === 0;

  const portraitBox = (
    <div
      style={{
        width: 150,
        height: 150,
        flexShrink: 0,
        background: '#000',
        border: '4px solid #ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {portraitImageUrl ? (
        <img
          src={portraitImageUrl}
          alt={speaker ?? ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }}
        />
      ) : portraitHighlightColor && portraitDarkColor ? (
        // 像素半身立绘（阵营色板驱动，imageUrl 替换入口已预留）
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: portraitColor,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <BustPortrait
            color={portraitColor}
            highlight={portraitHighlightColor}
            dark={portraitDarkColor}
            beard={portraitBeard}
          />
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: portraitColor,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: 82,
              fontWeight: 'bold',
              color: '#ffffff',
              ...hardTextShadow,
            }}
          >
            {portraitChar ?? ''}
          </span>
        </div>
      )}
    </div>
  );

  const platePos = portraitSide === 'left' ? { left: 48 } : { right: 48 };
  const speakerPlate = speaker ? (
    <div
      style={{
        position: 'absolute',
        top: -46,
        ...platePos,
        background: '#000',
        border: '4px solid #ffffff',
        padding: '8px 24px',
        fontFamily: PIXEL_FONT,
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 4,
        whiteSpace: 'nowrap',
        ...hardTextShadow,
      }}
    >
      <span style={{ color: speakerColor, marginRight: 10 }}>■</span>
      {speaker}
    </div>
  ) : null;

  return (
    <AbsoluteFill
      style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 44, pointerEvents: 'none' }}
    >
      <div
        style={{
          ...dialogBorderStyle,
          position: 'relative',
          width: 1620,
          boxSizing: 'border-box',
          padding: '34px 40px',
          display: 'flex',
          flexDirection: 'row',
          gap: 32,
          alignItems: 'center',
        }}
      >
        {speakerPlate}
        {portraitSide === 'left' ? portraitBox : null}
        <div
          style={{
            flex: 1,
            fontFamily: PIXEL_FONT,
            fontSize: 42,
            lineHeight: 1.8,
            fontWeight: 'bold',
            color: '#ffffff',
            letterSpacing: 2,
          }}
        >
          {shown}
          {cursorVisible ? '▼' : ''}
        </div>
        {portraitSide === 'right' ? portraitBox : null}
      </div>
    </AbsoluteFill>
  );
};
