# 纸环的两面

> 一场关于亲密关系的十二幕交互展览。
> 原文《纸环的两面——论回避型恋人和焦虑型恋人在异地恋中如何相处》，作者 **Cannin·Cheung**（河北 中国）。

**在线观看**：<https://iceyt520.github.io/paper-ring/>　｜　**仓库**：<https://github.com/IceyT520/paper-ring>　｜　**单文件**：[纸环的两面.html](纸环的两面.html)（离线可用）　｜　**原文**：[纸环的两面.pdf](纸环的两面.pdf)

[![扉页：一条三维纸带，红蓝两线](docs/preview/cover.jpg)](纸环的两面.html)

| 同一张纸，两个世界 | 内侧：折页合拢，遮住"想靠近" | 沙盘：临界距离是一条平衡线 | 扭转之后，光走到另一面 |
| --- | --- | --- | --- |
| ![](docs/preview/ring.jpg) | ![](docs/preview/wall.jpg) | ![](docs/preview/sandbox.jpg) | ![](docs/preview/mobius.jpg) |

---

## 这是什么

- **12 章**：扉页 / 未回复 / 纸环 / 内侧 / 外侧 / 镜像 / 异地 / 沙盘 / 解结 / 结语 / 致谢 / 原文与参考。
- **全文一段不漏**：71 个原文块、13,176 字全部在页面里；另有一个「阅读全文」模式按 PDF 原顺序排列，两种模式共用同一份经过校订的正文。
- **一条真实的三维纸带**：开场侧光勾出纸环，红蓝细线从两端展开；第 09 章之后可以把它扭转、接合成莫比乌斯环，让一束光沿着纸面走到"曾经的另一面"。
- **六个可动手的装置**：投信纸、叩纸回声、镜像折痕、恐惧滤镜、追问计数、缝线四约定。
- **一个可调的沙盘**：原文的耦合方程 `dA/dt=αR/D−βA`、`dR/dt=γA−δR`，解析解 + 相平面；临界距离 `D*=αγ/(βδ)` 处画出的是平衡线，不是单点。

## 直接观看

双击 [纸环的两面.html](纸环的两面.html)。字体、样式、脚本、三维组件全部内嵌，不联网也能看。把它和 [纸环的两面.pdf](纸环的两面.pdf) 放在同一目录，"打开原始 PDF / 下载原文"两个入口才可用（正文本身已内嵌，不依赖 PDF）。

## 目录

```
纸环的两面.html          发布成品：单文件交互展览（约 1.6 MB）
纸环的两面.pdf           原文（10 页 / 13,176 字）
website/                源码工程：Vite + TypeScript + Three.js + GSAP
  content/article.json     71 个原文块，含章节、页码、原文偏移
  content/corrections.json 37 条逐项校订（原句、改法、理由）
  scripts/                 静态渲染、单文件打包、11 个浏览器验收脚本
  src/                     版式、交互、三维纸带、数学模型、开场编排
纸环的两面_作品大纲.md     14 节内容大纲（覆盖核对表在第十三节）
纸环的两面_内容摘要.md     原文摘要
纸环的两面_交互原型.html   早期模拟器原型（已被第 08 章取代，留作过程记录）
AI交接说明.md             实现约束、踩过的坑与审美偏好（写给下一位接手的人）
docs/preview/              README 用的预览图
.github/workflows/        Pages 部署 + 标签发布
```

## 开发

需要 Node.js 22.12+ 与 pnpm：

```sh
cd website
pnpm install
pnpm dev            # 本地开发（http://127.0.0.1:4173）
pnpm test           # 9 个单元测试
pnpm check:content  # 逐字核对原文 / 校订 / 双模式 / 单文件成品
pnpm release        # 重建页面、打包单文件、校验（发布前跑这一条）
pnpm build          # 生产构建到 dist/（可部署静态托管）
```

## 版本与发布

每个版本都走同一条路：**提交 → 标签 → 推送**。推送标签后 GitHub Actions 会自动构建、把单文件 HTML 与 PDF 附到 Release，并把 `main` 部署到 GitHub Pages。

```sh
cd website && pnpm release && pnpm test
cd ..
git add -A
git commit -m "release: v1.2.0"
git tag v1.2.0
git push --follow-tags
```

`website/scripts/paths.mjs` 是发布文件名的唯一来源：成品固定写到根目录 `纸环的两面.html`，打包脚本和 `--offline` 验收脚本都从它取路径。版本记录见 [CHANGELOG.md](CHANGELOG.md)。

## 内容与校订

原文共 10 页、13,176 字，从 PDF 文本层逐字提取，拼接后可完整重建原文本。所有改动集中在 [website/content/corrections.json](website/content/corrections.json)：标点与助词的修正、一处依恋类型的指代误写、以及几处与方程不符的模型说明；每条都保留原句、改法与理由，PDF 原件不被覆盖。

模型部分按保留的方程解释：线性系统在 `D*` 处存在一条非零平衡线；`D<D*` 时变量长期发散（页面明确显示，不裁剪到 [0,1]），`D>D*` 时衰减；这组方程的特征值为实数，不产生周期振荡。"有界扩展"是另加的饱和假设，单独标注。第 11 章那句"我们见一面吧"是情境补白，不是原文，页面第 12 章有说明。

## 授权

- **代码**（`website/` 下的脚本、样式、三维与交互实现）：MIT，见 [LICENSE](LICENSE)。
- **正文与 PDF**：《纸环的两面》文字版权归原作者 **Cannin·Cheung**。它随本仓库和网页一起发布，是为了完整呈现这部作品，**不在 MIT 授权范围内**；转载、商用或再发布正文请联系作者。
- **字体**：Noto Serif SC / Noto Sans SC（思源字族），SIL OFL 1.1，见 [website/public/fonts/OFL.txt](website/public/fonts/OFL.txt)。
- **三维与动画**：Three.js、GSAP，许可证随依赖分发。

## 已验证（v1.1.0）

- 71 个原文块在展览、全文、单文件成品三处逐字一致；37 条校订同时应用；引号成对。
- 9 个单元测试：解析解与 RK4 互证（1e-9）、临界平衡线上每点不动、纸带与光点始终贴合表面、莫比乌斯接缝连续、触控可从任一面出发。
- 无头 Edge：1440 / 768 / 390 / 360 无横向溢出、无 console 错误；无 JS、无 WebGL、减少动态效果均有可用降级。
- 清理死代码后，28 张基准截图逐像素一致（桌面 14 处 + 手机 14 处）。
