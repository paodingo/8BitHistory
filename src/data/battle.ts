import raw from './battle.json';
import type { BattleData } from '../types';

// 唯一的数据入口：所有战役数据（坐标/帧数/兵力/文案/事件）都来自 battle.json
export const battle = raw as unknown as BattleData;
