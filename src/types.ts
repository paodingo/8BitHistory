// battle.json 的类型定义（数据驱动契约）
// 所有组件只依赖这些结构，严禁在组件里写死战役数据。

export type FactionId = 'cao' | 'yuan';

export interface Vec2 {
  x: number;
  y: number;
}

export interface FactionStyle {
  name: string;
  color: string;
  highlight: string;
  dark: string;
}

export interface TerrainPiece {
  type: 'river' | 'woods' | 'hills' | 'road';
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  edgeColor?: string;
  points?: [number, number][];
}

export interface MapConfig {
  width: number;
  height: number;
  imageUrl: string | null;
  baseColor: string;
  checkerAlt: string;
  tileSize: number;
  terrain: TerrainPiece[];
}

export interface LocationEntity {
  id: string;
  name: string;
  kind: 'fort' | 'camp' | 'granary';
  faction: FactionId;
  x: number;
  y: number;
  imageUrl: string | null;
}

export interface CameraKeyframe {
  frame: number;
  x: number;
  y: number;
  zoom: number;
}

export interface MoveSegment {
  fromFrame: number;
  toFrame: number;
  from: Vec2;
  to: Vec2;
}

export interface TroopKeyframe {
  frame: number;
  value: number;
}

export interface UnitSprite {
  dx: number;
  dy: number;
  delayFrames: number;
  leader?: boolean;
}

export interface ArmyEntity {
  id: string;
  name: string;
  faction: FactionId;
  type: 'banner' | 'cavalry';
  troops: number;
  label: string;
  imageUrl: string | null;
  sprites: UnitSprite[];
  moves: MoveSegment[];
  visibleFromFrame?: number;
  fadeOut?: { fromFrame: number; toFrame: number };
  troopsKeyframes?: TroopKeyframe[];
}

export interface DialogEntry {
  fromFrame: number;
  toFrame: number;
  speaker: string;
  faction: FactionId;
  portrait: { char: string; imageUrl: string | null };
  portraitSide: 'left' | 'right';
  text: string;
}

export interface SubtitleEntry {
  fromFrame: number;
  toFrame: number;
  text: string;
}

export interface TitleEntry {
  fromFrame: number;
  toFrame: number;
  text: string;
  subText: string;
}

export interface FireEntry {
  locationId: string;
  startFrame: number;
  fullFrame: number;
  endFrame: number;
  imageUrl: string | null;
  tint?: { color: string; maxOpacity: number; flickerFrames: number };
  shake?: { startFrame: number; durationFrames: number; amplitude: number };
}

export interface NightEffect {
  fromFrame: number;
  toFrame: number;
  opacity: number;
  color: string;
  fadeOutFrame: number;
  fadeEndFrame: number;
}

export interface HpBarConfig {
  id: string;
  faction: FactionId;
  label: string;
  troopsMax: number;
  defeatAt?: number;
  defeatLabel?: string;
  keyframes: TroopKeyframe[];
}

export interface BattleData {
  meta: {
    id: string;
    title: string;
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
    version: string;
  };
  map: MapConfig;
  factions: Record<FactionId, FactionStyle>;
  locations: LocationEntity[];
  camera: CameraKeyframe[];
  armies: ArmyEntity[];
  dialogs: DialogEntry[];
  subtitles: SubtitleEntry[];
  title: TitleEntry;
  fires: FireEntry[];
  effects: { night: NightEffect };
  hud: { hpBars: HpBarConfig[] };
}
