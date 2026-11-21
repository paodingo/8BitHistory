# 8BitHistory

> 代码驱动型 AI 历史视频自动化工作台 —— 用 [Remotion](https://www.remotion.dev/)（React / TypeScript）批量生产"复古像素战棋沙盘 + 硬核历史推演"短视频。

**当前进度**：第一阶段 MVP 已跑通 —— [《官渡之战 · 火烧乌巢》](#官渡之战--火烧乌巢-mvp-15s) 15 秒成片（1920x1080 @ 30fps）。

## 核心理念：模板锁死 + JSON 驱动

- **下游（Remotion）**：用代码锁死视觉规范、安全边距、UI 边框与缓动动画，只负责读取标准化的 `src/data/battle.json` 渲染成片。
- **上游（数据/AI）**：未来接入自动化时，只需生成结构化的 `battle.json`（文案、时间戳、坐标路径、事件触发帧数），即可 100% 复用渲染层，大幅降低成本、保证成片率。

> 架构硬性约束：所有部队坐标、行军起止帧数、兵力数值、对话文案、事件触发时间，统一从 `src/data/battle.json` 读取，严禁写死在 React 组件里。

## 快速开始

```bash
npm install        # 安装依赖
npm start          # 打开 Remotion Studio 实时预览
npm run render     # 渲染 out/guandu-mvp.mp4
npm run still:fire # 导出第 330 帧（起火画面）截图
npm run typecheck  # TypeScript 类型检查（npx tsc --noEmit）
```

## 项目结构

```
src/
├── data/
│   ├── battle.json        # ★ 唯一数据源：地图/运镜/部队/对话/事件/血量 全量编排
│   └── battle.ts          # JSON 类型化入口
├── types.ts               # battle.json 的 TypeScript 契约
├── GuanduMVP.tsx          # 主合成（读 JSON → 组装所有组件）
├── Root.tsx / index.ts    # Remotion 入口
├── pixel-style.ts         # 像素字体栈 / 黑底白双线边框等公共样式
└── components/
    ├── MapCamera.tsx      # 关键帧运镜：平移/缩放、位移取整、视野防越界
    ├── ArmyUnit.tsx       # 直线行军(interpolate)、每8帧姿态切换、头顶兵力/实时掉血
    ├── SubtitleBox.tsx    # 经典 RPG 对话框：黑底白双线、立绘左右、打字机逐字
    ├── PixelMap.tsx       # 像素沙盘底图（草地网格/河流/树林/丘陵/官道）
    ├── PixelBuilding.tsx  # 城寨/军营/粮仓（起火后焦黑化）
    ├── PixelFire.tsx      # 像素火焰（三形态每8帧闪烁 + 上升烟块）
    └── HpBarHud.tsx       # 顶部兵力对比条（掉血 + "溃败"闪烁）
```

## 《官渡之战 · 火烧乌巢》MVP（15s）

依据正史《三国志》：建安五年（公元 200 年），曹操以两万兵力据守官渡，抗袁绍十万大军。许攸来投献计，曹操亲率五千轻骑夜袭乌巢，焚毁袁军屯粮，袁军崩溃。

| 帧 | 阶段 | 内容 |
|---|---|---|
| 0–46 | 对峙开场 | 标题卡 + 全地图兵力对比（曹 2万 vs 袁 10万） |
| 46–186 | 曹操对话 | RPG 对话框两段（局势严峻 → 采纳许攸之计） |
| 126–300 | 轻骑突袭 | 五千轻骑（6 骑纵队）从官渡直线夜袭乌巢，镜头跟随 |
| 300–408 | 火烧乌巢 | 像素火焰燃起、粮仓焦黑、红光闪烁、屏幕微震动；袁军 10万 → 1.2万 掉血 |
| 408–450 | 袁绍溃败 | 镜头拉远，袁军三路溃逃东北，HUD 红字"溃败"闪烁 + 总结字幕 |

### battle.json 数据结构速览

```jsonc
{
  "meta":      { "width": 1920, "height": 1080, "fps": 30, "durationInFrames": 450 },
  "map":       { "width": 3200, "height": 1800, "terrain": [ /* 河流/树林/丘陵/官道 */ ] },
  "camera":    [ { "frame": 0, "x": 1600, "y": 900, "zoom": 0.6 } /* ...11 个关键帧 */ ],
  "armies":    [ { "id": "cao-cavalry", "moves": [{ "fromFrame": 126, "toFrame": 300, "from": {}, "to": {} }] } ],
  "dialogs":   [ { "fromFrame": 46, "toFrame": 120, "speaker": "曹操", "text": "..." } ],
  "fires":     [ { "locationId": "wuchao", "startFrame": 300, "tint": {}, "shake": {} } ],
  "hud":       { "hpBars": [ { "keyframes": [{ "frame": 324, "value": 72000 }] } ] }
}
```

## 视觉规范（吞食天地风）

- 所有像素元素强制 `image-rendering: pixelated` / SVG `shapeRendering="crispEdges"`，禁止抗锯齿模糊。
- 对话框为经典 RPG **纯黑底 + 白色像素双线边框 + 等宽/像素字体**；禁用现代圆角卡片、毛玻璃、柔和渐变阴影。
- 动画克制利落：移动用 `interpolate` 直线插值，走路/火焰用**每 8 帧切换一次状态**的极简机制。
- 素材现状：MVP 阶段全部使用风格化像素 SVG/CSS 占位；地图、部队、城池、火焰、立绘均已预留 `imageUrl` 字段，可一键替换正式 PNG 素材。

## 开发自检约定

1. 每次修改后运行 `npx tsc --noEmit`，零报错方可提交。
2. 渲染关键帧截图（如 `npm run still:fire`）或完整 MP4，确认画面无重叠、无越界。

## 路线图

- [x] **第一阶段**：官渡 MVP 跑通画面质感、像素锐度与叙事节奏
- [ ] 接入手动旁白 MP3（`public/` 目录）+ 8-bit 音效（jsfxr）
- [ ] 自建无版权像素资产库（红蓝兵种、城池、粮车、火焰、人物立绘、区域地图）
- [ ] 半自动化生产流水线（AI 生成 battle.json → 批量渲染）
- [ ] 第二阶段：横向扩展《大唐开国》等历史连载、B站/抖音多画幅适配

## 相关文档

- [PROJECT_BRIEF.md](./PROJECT_BRIEF.md) —— 项目启动文档与架构规划
- [AGENTS.md](./AGENTS.md) —— 开发规范（技术栈约束 / 数据驱动 / 视觉还原 / 交付自检）
