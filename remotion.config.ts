import { Config } from '@remotion/cli/config';

// 像素风硬边画面：用 PNG 帧避免 JPEG 模糊
Config.setVideoImageFormat('png');
Config.setEntryPoint('./src/index.ts');
