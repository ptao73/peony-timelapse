# 庭前花开花落，天上云卷云舒 · Peony Time-lapse

A gesture-controlled time-lapse in the browser: **open your hand and time moves forward**
(midnight → dawn → morning, the peonies open, mist gathers into clouds and then clears, sunlight grows stronger, and a few petals fall).
**Close your hand and time runs backwards**: the clouds come back, the light fades, the flowers close and the fallen petals fly back up.

一个用手势控制的「时光」网页：**张开手 = 时光流逝**（午夜 → 黎明 → 清晨，牡丹从花骨朵到盛开，薄雾聚成云又消散，阳光渐强，少量花瓣飘落）；
**握拳 = 时光倒流**（云重新聚拢，光线变暗，花朵收拢，落下的花瓣飞回枝头）。

## Timeline 时间轴

| Hand 手势 | Time 时间 | Sky & light 天空与光线 | Clouds 云 | Peony 牡丹 |
|---|---|---|---|---|
| 0% | 00:00 Midnight 午夜 | Moonlight, stars 月光、星空 | Thin ground mist 薄雾 | Bud 花骨朵 |
| 50% | 05:30 Dawn 黎明 | Pink-orange glow 朝霞 | Thickest 云聚 | Half open 半开 |
| 85% | 07:00 | Sunbeams through gaps 光束穿云 | Clearing 消散 | Full bloom 全开 |
| 100% | 08:00 Morning 清晨 | Golden light 金色阳光 | Clear 晴朗 | A few petals fall 花瓣飘落 |

The timeline follows the natural radiation-fog cycle: mist forms on clear nights, is thickest around sunrise (the coldest moment), and burns off in the morning sun.
时间轴参照自然界的辐射雾规律：晴朗夜晚生成薄雾，日出前后最冷时最浓，日出后被阳光蒸散。

## How to use 使用方法

- **Online 在线**: https://peony-timelapse.vercel.app (Mac / iPhone)
- **Gesture 手势**: click 📷 to allow the camera, then open/close your hand. The badge shows `张开 xx%`; the page calibrates to your hand automatically.
- **Without a camera 无摄像头**: drag the slider, press ▶ (play) / ◀ (rewind), or **swipe up/down anywhere** (up = forward). 拖动滑块、点 ▶/◀，或在画面上**上下滑动**（上滑 = 时光流逝）。
- **⚔️ Lightsaber mode 光剑模式**: a small bonus scene.

### iPhone app (PWA) 安装到 iPhone

1. Open the site in **Safari** 用 Safari 打开网址
2. Tap **Share → Add to Home Screen** 点「分享 → 添加到主屏幕」
3. Launch it from the icon: full screen, works **offline** after the first visit, gesture control uses the front camera.
   从图标启动：全屏运行，首次联网打开后可**离线**使用，手势用前置摄像头。

### Run locally 本地运行

The page loads images into WebGL, which browsers block for `file://` pages, so serve it over HTTP:
页面用 WebGL 加载图片，直接双击 html 会被浏览器拦截，需要用本地服务器打开：

```bash
git clone https://github.com/ptao73/peony-timelapse.git
cd peony-timelapse
python3 -m http.server 8000
# open http://localhost:8000
```

## How it works 实现原理

One number **T (0–1)** drives everything; every layer is a pure function of T, so rewinding is an exact mirror of moving forward.
一个时间变量 **T（0–1）** 驱动所有画面；每一层都只由 T 决定，所以倒流与前进完全对称。

1. **Sky, clouds, light**: WebGL shaders (fbm noise clouds, stars, moon, sun glow, god rays), computed in real time, so they are perfectly smooth.
2. **Peony**: 12 AI-painted frames on transparent backgrounds (`frames/`), cross-faded on the GPU with premultiplied alpha (no ghosting), relit by the current time of day.
3. **Falling petals**: 4 painted petal sprites (`petals/`) whose positions are a function of T.
4. **Hand tracking**: MediaPipe Hands; openness = average straightness of the four fingers in 3D, self-calibrated, with dead zones at both ends.

Tech: plain HTML + [three.js r128](https://threejs.org/) + [MediaPipe Hands](https://developers.google.com/mediapipe) (both self-hosted in `vendor/`), PWA manifest + service worker. No build step.

## Project structure 目录结构

```
index.html        → redirects to web/index.html
web/index.html    the page (shaders, gesture control, UI)
frames/           frame_01.webp … frame_12.webp  (bud → full bloom, transparent WebP)
petals/           petal_1.webp … petal_4.webp
icons/            app icons (PWA / iPhone home screen)
vendor/           three.js and MediaPipe Hands, pinned versions
manifest.webmanifest, sw.js   PWA manifest and offline service worker
docs/             build spec, fix notes and the image-generation prompts
```

## Made with AI 制作方式

A multi-AI collaboration 多个 AI 分工协作:

- **Claude** (Anthropic): orchestrator. Design, specs, quality review, publishing. 总调度：方案设计、规格文档、效果评估、发布。
- **Codex** (OpenAI): painted the 12 flower frames and the petals, following the prompts in `docs/`. 生成全部花朵帧与花瓣图片。
- **Antigravity** (Google): wrote the web page from `docs/SPEC.md` and applied fixes. 按规格文档编写网页代码与修复。

The style follows a classical oil painting of red tree peonies (*Paeonia suffruticosa*) provided by the author.
画风参照作者提供的红牡丹古典油画。

## License

MIT
