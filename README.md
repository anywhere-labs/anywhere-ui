# Anywhere UI

[English](./README.en.md) · **简体中文**

**Anywhere UI** 是 Anywhere Labs 的 Web 设计系统、shadcn GitHub Source Registry 与一键管理后台脚手架，沉淀自 `Agents Anywhere`、`Tokens Anywhere` 与统一认证中心的控制台视觉规范。

## 一键初始化完整管理后台项目

无需预先安装全局 CLI，直接执行：

```bash
npx github:anywhere-labs/anywhere-ui my-console
```

支持交互式向导或非交互参数：

```bash
npx github:anywhere-labs/anywhere-ui my-console \
  --brand "My Workspace" \
  --locale zh-CN \
  --yes
```

常用参数：

| 参数 | 说明 |
| --- | --- |
| `--brand <name>` | 设置侧边栏 Wordmark 与页面标题（默认 `"Agents Anywhere"`） |
| `--slug <name>` | 设置 `package.json` 的包名 |
| `--locale <en\|zh-CN>` | 设置默认兜底语言（浏览器仍会自动识别 `zh-CN` / `en`） |
| `--no-admin` | 仅保留个人账户控制台，省略 `/admin` 管理模块 |
| `--no-install` | 跳过 `corepack yarn install` |
| `--no-git` | 跳过 `git init` |
| `-y, --yes` | 跳过交互提问 |

### 接入真实业务只需替换 3 个文件

生成后的项目立即可运行（`corepack yarn dev`），内置本地演示会话与 CRUD 数据；接入真实业务时只需修改：

1. **`lib/config.ts`**：品牌名称、描述、默认语言与功能开关。
2. **`lib/session.ts`**：实现 `AuthAdapter`（接入你的 Cookie Session、OIDC BFF、FastAPI / NextAuth 后端），页面守卫与 `<ViewTransition>` 入场动效自动复用。
3. **`lib/items-store.ts`**：将示例 CRUD 查询与设置接口替换为真实业务 API，并按需扩展 `app/admin/` 与 `app/account/` 页面。

---

## 在现有 Next.js 项目中按需安装（shadcn GitHub Registry）

本仓库是公开的 shadcn Source Registry，无需额外配置即可按组件或预设套件直接安装：

```bash
# 安装完整控制台套件（主题 Token + 鸿蒙中文字体 + 23 个 UI 原语 + ConsoleShell / DataTable / FormLayout / SignInShell）
npx shadcn@latest add anywhere-labs/anywhere-ui/anywhere-console

# 仅安装基础主题 + 核心胶囊 UI 原语
npx shadcn@latest add anywhere-labs/anywhere-ui/anywhere-base

# 安装 AI 设计护栏（AGENTS.md + .agents/skills/anywhere-ui/SKILL.md + design-discipline.test.ts）
npx shadcn@latest add anywhere-labs/anywhere-ui/anywhere-ai-kit

# 按需安装单个组件
npx shadcn@latest add anywhere-labs/anywhere-ui/button
npx shadcn@latest add anywhere-labs/anywhere-ui/switch
npx shadcn@latest add anywhere-labs/anywhere-ui/data-table
npx shadcn@latest add anywhere-labs/anywhere-ui/console-shell
```

查看全部可用组件：

```bash
npx shadcn@latest list anywhere-labs/anywhere-ui
```

---

## 核心视觉与交互规范

完整规范见内置 AI Skill [`skills/anywhere-ui/SKILL.md`](./skills/anywhere-ui/SKILL.md)：

- **极简黑白语义色板**：深色模式（默认）纯黑 `#000000` 画布 + `#141414` 无边框卡片；浅色模式 `#ffffff` 画布 + `#f3f3f3` 卡片 + `oklch(0.92 0 0)` 高对比度侧边栏选中态。TSX 中零硬编码十六进制色值。
- **中英文混排字体**：中文采用自托管可变字重 **HarmonyOS Sans SC**（`@luzixu/harmonyos-sans` 纯 CJK 子集，按字频按需加载 WOFF2）；英文与数字保留原生 **SF Pro / Segoe UI**，纯英文页面零额外字体下载。
- **两级圆角几何（`corner-shape`）**：
  - 卡片、弹窗、浮层、多行输入框与骨架屏采用 `superellipse(1.35)` 平滑连续圆角（`--radius: 0.75rem`，卡片圆角 `rounded-card` ≈ `31.2px`）。
  - 胶囊按钮、单行输入框、徽章、开关、侧边栏导航项与头像严格保持正圆端帽 `corner-shape: round`。
- **克制控件与无边框原则**：
  - 胶囊按钮主次分明：强调态实心 `default` + 非强调态线框 `outline`，光学内边距 `px-4` / `px-5`。
  - 开关采用 `base-luma` 胶囊内嵌胶囊样式（`44×20` 轨道 + `24×16` 胶囊滑块）。
  - 卡片、主题选择项、头像、独立图标与纯图标按钮（`variant="ghost"`）均不加多余圆底或重边框。
  - 侧边栏顶部 Wordmark 悬停无选中背景（仅点击触发交互）；「首页」独立置顶分组；底部为 `AccountSwitcher` 多账号切换器（切换账号 / 添加新账号 / 退出账号）；语言切换收敛至「外观」页，不在侧边栏底部重复展示；移动端顶栏的展开侧边栏按钮独立于 Wordmark。
- **原生 `<ViewTransition>` 动效**：`console-enter`（控制台进入）、`page-rise`（同层切换）、`nav-forward` / `nav-back`（层级切换）与登录页平滑上浮。

## 仓库目录与开发检查

| 目录 | 说明 |
| --- | --- |
| `templates/console-next/` | 权威单一数据源：完整可运行的 Next.js 16 控制台模板 |
| `registry.json` & `registry/` | shadcn Source Registry 清单与同步文件 |
| `packages/create-anywhere-app/` | 零依赖 Node ESM 脚手架 CLI 与测试 |
| `skills/anywhere-ui/SKILL.md` | 可复用的 AI Agent 设计系统 Skill |
| `scripts/sync-registry.mjs` | 将模板与 Skill 同步至 Registry（支持 `--check` 漂移检查） |

本地验证命令：

```bash
node scripts/sync-registry.mjs --check
npx --yes shadcn@latest registry validate ./registry.json
node --test packages/create-anywhere-app/test/cli.test.mjs
```
