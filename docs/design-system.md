# Anywhere UI 设计系统规范

**简体中文** · [English](./design-system.en.md)

**Anywhere UI** 是 Anywhere Labs 面向所有 Web 控制台、账户中心与管理后台的统一视觉与交互设计系统，沉淀自 `Agents Anywhere`、`Tokens Anywhere` 与统一认证中心的真实产品迭代，由本仓库作为唯一单一数据源持续维护，并通过公开 shadcn GitHub Registry 与一键脚手架分发。

---

## 1. 设计哲学与核心原则

Anywhere UI 追求**冷静、单色、高信噪比**的控制台美学，核心由五条原则驱动：

1. **深色优先，双模式平等**：深色模式（纯黑 `#000000` 画布）是默认品牌基调；浅色模式（纯白 `#ffffff` 画布）作为一等公民完整适配，所有表面层级、对比度与状态色均独立校准，确保 WCAG AA 可读性。
2. **表面层级替代重边框**：通过克制的灰度阶梯（Canvas → Card → Raised → Hover / Secondary）建立视觉分层，卡片、主题瓷砖、头像与嵌套区块默认**无边框**，仅在列表行间或区块分界使用 `10%` 透明细分割线。
3. **几何两极清晰**：多行容器使用微妙的 G2 连续圆角（`superellipse(1.35)`），而按钮、单行输入框、开关、徽章、侧边栏导航项与头像严格保持正圆端帽胶囊（`corner-shape: round`），不混淆两种几何语言。
4. **面向人而非技术实现**：普通用户界面只呈现准确、丰富、本地化的自然语言文案，**绝不暴露**数据库字段名、OIDC 声明键（如 `aa.drive_quota_mb`）或内部 slug（如 `free`）；技术标识符仅在管理员后台配置界面按需出现。
5. **克制交互与职责唯一**：不堆砌冗余入口与重复设置页；每个页面、每个控件与每个图标都只承担清晰单一的职责。

---

## 2. 语义色板与表面层级（Color & Surface Tokens）

> **铁律**：所有 `.tsx` 组件中**禁止硬编码任何十六进制色值**（`app/layout.tsx` 的浏览器 `viewport.themeColor` 除外），必须通过语义化 Tailwind Token（`bg-background`、`bg-card`、`text-muted-foreground` 等）消费。此规则由 `tests/design-discipline.test.ts` 静态强制校验。

### 2.1 表面与文字阶梯

| 语义 Token | 深色模式（默认 `.dark`） | 浅色模式（`:root`） | 用途说明 |
| --- | --- | --- | --- |
| `--background` | `#000000` | `oklch(1 0 0)` (`#ffffff`) | 页面主画布 |
| `--card` | `#141414` | `#f3f3f3` | 无边框内容卡片、主题块、统计面板 |
| `--surface-raised` / `--muted` | `#191919` | `#ececec` | 抬升浮层基底、次级浅底块、未选中开关轨道 |
| `--popover` | `#191919` | `oklch(1 0 0)` | 下拉菜单、Popover、Tooltip 浮层 |
| `--surface-hover` / `--accent` | `#252525` | `#e4e4e4` | 列表/按钮/菜单悬停态 |
| `--secondary` | `#262626` | `#e4e4e4` | 卡片内次级胶囊徽章与选中块 |
| `--primary` | `#ffffff` | `oklch(0.205 0 0)` | 高对比度主按钮填充 |
| `--primary-foreground` | `#000000` | `oklch(0.985 0 0)` | 主按钮文字 |
| `--foreground` | `#ffffff` | `oklch(0.145 0 0)` | 主标题与正文 |
| `--foreground-secondary` | `#b5b5b5` | `oklch(0.4 0 0)` | 副正文与弱强调文字 |
| `--muted-foreground` | `#929292` | `#666666` | 辅助说明、时间戳、次级图标（在所有表面保持 ≥ 4.5:1 对比度） |
| `--border` | `rgb(255 255 255 / 10%)` | `rgb(0 0 0 / 10%)` | 细分割线（列表行间、表头、卡片内分界） |
| `--input` | `rgb(255 255 255 / 12%)` | `rgb(0 0 0 / 12%)` | 输入框描边 |
| `--border-strong` | `#303030` | `#d0d0d0` | 线框胶囊按钮（`variant="outline"`）边框 |

### 2.2 侧边栏与语义状态色

| 语义 Token | 深色模式 | 浅色模式 | 用途说明 |
| --- | --- | --- | --- |
| `--sidebar` | `#000000` | `oklch(0.985 0 0)` | 侧边栏画布 |
| `--sidebar-accent` | `#191919` | `oklch(0.92 0 0)` | 侧边栏导航项选中/悬停胶囊（浅色特意加深以在 `#fafafa` 上保持清晰对比） |
| `--sidebar-border` | `rgb(255 255 255 / 10%)` | `oklch(0.922 0 0)` | 侧边栏右边界细线 |
| `--destructive` | `oklch(0.704 0.191 22.216)` | `oklch(0.55 0.245 27.325)` | 危险操作、错误提示、移除确认 |
| `--success` | `oklch(0.76 0.16 152)` | `oklch(0.51 0.15 150)` | 已验证、启用、成功反馈 |
| `--warning` | `oklch(0.8 0.15 80)` | `oklch(0.54 0.15 70)` | 警告、策略提醒（如要求两步验证） |

### 2.3 数据可视化定性色板

图表固定使用 `--series-1` 至 `--series-8` 与 `--series-other`，已针对 `#141414` 与 `#f3f3f3` 卡片表面验证可辨识度，按顺序取用、禁止循环复用。

---

## 3. 中英文混排字体系统（Typography）

### 3.1 字体栈策略

```css
--font-sans:
  "HarmonyOS Sans SC", "SF Pro Text", -apple-system, BlinkMacSystemFont,
  "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;

--font-display:
  "HarmonyOS Sans SC", "SF Pro Display", -apple-system, BlinkMacSystemFont,
  "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;

--font-script: "Caveat", "Segoe Script", cursive;
```

- **英文、拉丁字母与数字**：维持各平台原生系统字体（Apple 设备为 `SF Pro Text` / `SF Pro Display`，Windows 为 `Segoe UI`），保持原生字偶距与清晰度。
- **简体中文与中文标点**：全平台统一采用自托管可变字重 **HarmonyOS Sans SC**（`@luzixu/harmonyos-sans`，字重范围 `40 900`）。
- **纯 CJK 按需加载机制**：`app/harmonyos-sans-sc.css` **仅包含** CJK 与中文标点的 WOFF2 分片（`sc-*`），显式排除 ASCII/拉丁分片（`font-text-*`）。将 `"HarmonyOS Sans SC"` 排在 `-apple-system` 之前具有双重收益：
  1. 遇到中文字符时立刻命中 HarmonyOS Sans SC，避免 macOS 上 `-apple-system` 抢先回退到苹方（PingFang SC）。
  2. 遇到英文与数字时不命中 `unicode-range`，自动穿透到原生 `SF Pro` / `Segoe UI`；纯英文页面**下载 0 字节中文字体**。

### 3.2 排版与等宽字体边界

- **页面标题**：`PageHeader` 主标题 `text-2xl font-semibold tracking-tight`；区块标题 `text-base font-semibold tracking-tight`；卡片主标题 `text-lg font-semibold tracking-tight`。
- **正文与说明**：主行 `text-sm font-medium text-foreground`，多行说明 `text-sm leading-relaxed text-muted-foreground`。
- **数字与配额**：所有配额数值、统计计数、分页与时间戳统一加 `tabular-nums`，确保纵向对齐稳定无抖动。
- **`font-mono` 使用红线**：严格限定于技术标识场景——如管理后台中的字段键（`aa.drive_quota_mb`）、Client ID、Slug、回调 URL、JSON 编辑器与用户复制区（`CopyableValue`）。**禁止在面向普通用户的套餐/权益/功能卡片中使用等宽字体展示内部键名。**

---

## 4. 两级圆角几何（Two-Tier Corner Geometry）

全局圆角基准为 `--radius: 0.75rem`（`12px`），派生刻度：

- 嵌套面板：`rounded-xl`（`~16.8px`）
- 瓷砖与表格骨架：`rounded-2xl`（`~21.6px`）
- 浮层菜单：`rounded-3xl`（`~26.4px`）
- 主卡片与弹窗：`rounded-card` = `min(var(--radius-4xl), 32px)`（`~31.2px`）

在支持 CSS Borders Level 4 `corner-shape` 的现代浏览器中启用两级几何分化：

```css
@supports (corner-shape: superellipse(1.35)) {
  /* 1. 多行圆角矩形容器：微妙的 G2 连续圆角，避免 squircle (2) 的方盒感 */
  :where([class*="rounded-"]) {
    corner-shape: superellipse(1.35);
  }

  /* 2. 圆形与单行胶囊：严格保持正圆端帽 */
  :where(
    [class*="rounded-full"],
    [data-slot="button"],
    [data-slot="input"],
    [data-slot="input-group"]:not(:has(textarea)),
    [data-slot="badge"],
    [data-slot="switch"],
    [data-slot="switch-thumb"],
    [data-slot="sidebar-menu-button"],
    [data-slot="tabs-list"]:not([data-variant="line"]),
    [data-slot="tabs-trigger"],
    [data-slot="user-avatar"],
    [data-slot="avatar"],
    [data-slot="radio-group-item"],
    [data-slot="radio-group-indicator"]
  ) {
    corner-shape: round;
  }
}
```

> **踩坑警示**：CSS 选择器中**绝不能写 `[class*="-full"]`**，它会误匹配 Tailwind 的 `w-full` / `h-full` 导致所有全宽卡片退回普通圆角；必须精确写作 `[class*="rounded-full"]`。`tests/design-discipline.test.ts` 已对此建立防回归校验。

---

## 5. 无边框纪律与图标规范

1. **无边框表面**：内容卡片（`rounded-card bg-card`）、主题选择项（`rounded-2xl bg-card`）、卡片内嵌值面板（`rounded-xl bg-background`）与用户头像（`UserAvatar`）全部无外框，依靠灰度阶梯区隔。
2. **独立图标禁加底框**：空状态（`EmptyState`）、结果页图标（`ResultCard`）与独立状态图标**禁止包裹灰色圆形或方形背景框**（如 `rounded-full bg-surface-raised`）。直接渲染干净线框图标：`size-6`–`size-8 stroke-[1.5] text-muted-foreground`（状态态用 `text-destructive` / `text-success`）。
3. **纯图标按钮无边框**：表格行操作（编辑、删除、设为默认）、复制按钮（`CopyButton`）、分页箭头（`Pagination`）、移动端展开侧边栏按钮统一使用 `Button variant="ghost"`（`size="icon-sm"` 或 `size="icon-xs"`），不加线框。

---

## 6. 核心控件与信息展示模式

### 6.1 胶囊按钮（`Button`）

- **强调态主操作**：`variant="default"`（`bg-foreground text-background`），全页通常只保留一个高对比度实心主按钮。
- **非强调态次操作**：`variant="outline"`（`border-border-strong bg-transparent text-foreground hover:bg-surface-raised`），用于次要操作与快捷筛选胶囊。
- **光学胶囊内边距**：`sm` 为 `h-8 px-4`，`default` 为 `h-9 px-4`，`lg` 为 `h-10 px-5`，与 `Input`（`h-9 px-4`）和 `Badge`（`h-5 px-2.5`）视觉重心对齐。
- **Base UI 链接渲染**：使用 `<Button render={<Link href="..." />} nativeButton={false}>` 时务必传 `nativeButton={false}`，避免生成非法嵌套按钮。

### 6.2 胶囊内嵌胶囊开关（`Switch`）

- 源自 shadcn `base-luma` 比例：`44×20` 轨道（`h-5 w-11`）内嵌 `24×16` 胶囊滑块（`h-4 w-6`，开启态位移 `translate-x-[calc(100%-8px)]`）。
- 纯黑深色画布对比度保障：开启态轨道 `bg-foreground` + 滑块 `bg-background dark:bg-secondary`；关闭态轨道 `bg-input dark:bg-surface-raised` + 滑块 `bg-secondary dark:bg-muted-foreground`。

### 6.3 选择器与确认弹窗

- **单选下拉**：优先使用 `DropdownSelect` 替代浏览器原生 `<select>`，保证胶囊触发器与浮层风格统一。
- **危险操作确认**：删除、注销、撤销授权等不可逆操作统一经由 `ConfirmDialog` 确认。

### 6.4 详情与权益卡片（`DetailCard` / `DetailList`）

面向套餐、配额、订阅权益或账户属性展示的推荐模式（组件路径：`components/console/detail-list.tsx`）：

- 外层为无边框 `rounded-card bg-card p-6`，顶部展示清晰名称（`text-lg font-semibold tracking-tight`）与自然语言描述，**不附加原始 `slug` 等宽徽章**。
- 细分割线（`border-t border-border pt-5`）下方使用语义 `<dl className="divide-y divide-border">`：
  - 左侧（`<dt>`）：人类可读标题（`text-sm font-medium`）+ 多行详细说明（`mt-1 text-sm leading-relaxed text-muted-foreground`）。
  - 右侧（`<dd>`）：右对齐加粗等宽数值与本地化单位（`text-sm font-semibold tabular-nums`，如 `512 MB`、`7 天`、`10 台`、`无限制`）。
  - 移动端（`< sm`）自动纵向堆叠，避免窄屏表格挤压或横向滚动溢出。

---

## 7. 控制台信息架构与导航规范

### 7.1 侧边栏与移动端顶栏

- **顶部 Wordmark（`SectionSwitcher`）**：鼠标悬停时**禁止**出现选中/高亮背景（禁止 `hover:bg-sidebar-accent`），仅点击时触发控制台切换浮层（单控制台时回首页）；保留 `focus-visible` 键盘焦点环。
- **移动端顶栏（`CollapsedNavBar`）**：展开侧边栏按钮（`PanelLeftIcon`）必须是独立的无边框幽灵图标按钮（`variant="ghost" size="icon-sm"`），与右侧无悬停效果的 `BrandWordmark` 视觉分离，不合为一个大按钮。
- **导航分组结构**：
  1. **独立置顶「首页」组**：无分组小标题，仅放「首页」（`/account`）。
  2. **「账户」分组**：拆分独立页面——如「个人资料」（`/account/profile`）、「套餐」（`/account/plan`）、按需显示的「组织」（`/account/organizations`）、「外观」（`/account/appearance`）。
  3. **领域/安全分组**：职责清晰不重叠（例如「安全」统一承载密码、通行密钥、两步验证、会话、安全活动与注销；「已关联账号」仅负责第三方 OAuth 账号绑定/解绑）。
- **底部多账号切换器（`AccountSwitcher`）**：
  - 位于侧边栏最底部，替代原先单独的「退出登录」按钮。
  - 点击向上展开浮层（`side="top"`），集中提供：已登录账号列表切换、添加新账号、退出当前账号、以及多账号时的「退出全部账号」。
  - 当「外观」页已提供语言切换时，**不再**在侧边栏底部重复放置语言切换项（未登录状态的 `SignInShell` 右上角保留快捷语言切换）。
- **条件导航全链路隐藏**：若某领域对当前用户为空或无权限（例如未加入任何组织），应从侧边栏导航、首页快捷胶囊与首页搜索索引中**同步隐藏**。

### 7.2 账户首页与登录页

- **账户首页（`/account`）**：居中编辑感视觉中心——无边框大头像（带快捷编辑入口）+ 套餐胶囊 + 姓名与邮箱 → 支持 `/` 快捷键的居中胶囊搜索栏 → 线框快捷入口胶囊 → 单张无边框 `rounded-card bg-card` 上下文焦点提示卡 → 静默隐私页脚。
- **登录页（`SignInShell`）**：极简居中主标题（如「登录」/ `Sign in`，省去冗余废话副标题），平滑上浮入场动效（`animate-in duration-700 fade-in slide-in-from-bottom-3`）。

---

## 8. 文案与数据展示纪律

1. **前后台字段严格分层**：
   - 用户前台（如 `/account/plan`、`/org/[slug]/settings`）只展示可读名称、详细说明与带单位数值，绝不泄露技术字段名（`aa.drive_quota_mb`）或原始 slug。
   - 管理员后台（如 `/admin/plans`）保留技术字段键供配置与排错，并提供可视化配置入口（如「权益展示说明」）维护各语言的展示名称、说明与单位。
2. **中英文双语严格对齐**：所有 UI 文案同时维护 `en` 与 `zh-CN` 字典，键集合与 `{placeholder}` 占位符必须完全一致（由 `tests/i18n.test.ts` 自动检查）。
3. **品牌口径统一**：用户可见文案统一使用实际产品名（默认 `Agents Anywhere`），不泄露内部仓库代号。

---

## 9. 原生 `<ViewTransition>` 动效规范

通过 React `<ViewTransition>`（`components/console/page-transition.tsx` + `useRevealInTransition`）提供克制、具方向感的页面转场：

| 过渡类型 | 时长与曲线 | 触发场景 |
| --- | --- | --- |
| `console-enter` | `420ms cubic-bezier(0.22, 1, 0.36, 1)` | 登录成功或刷新后首次进入控制台壳层（需配合 `useRevealInTransition` 在 `startTransition` 内挂载） |
| `page-rise` | `360ms cubic-bezier(0.22, 1, 0.36, 1)` | 同一控制台内侧边栏平级切页（`opacity: 0.25 -> 1`, `translateY: 10px -> 0`） |
| `nav-forward` / `nav-back` | `320ms cubic-bezier(0.22, 1, 0.36, 1)` | 跨层级控制台切换（个人 ↔ 组织 ↔ 管理后台，水平位移 `±48px`） |
| `NAV_STILL` | 无过渡 | 移动端抽屉菜单内的链接点击，防止快照穿透关闭中的抽屉 |

- 全局关闭默认 `root` 交叉淡入淡出，避免非目标区域闪回旧帧。
- 全部动效强制响应 `@media (prefers-reduced-motion: reduce)`。

---

## 10. 自动化工程护栏与 Do / Don't 速查

### 10.1 自动化静态校验（`tests/design-discipline.test.ts`）

通过 `anywhere-ai-kit` 或脚手架初始化的项目自动内置六项防回归测试：

1. **零硬编码色值**：扫描所有 `app/**/*.tsx` 与 `components/**/*.tsx`，禁止出现十六进制颜色（`app/layout.tsx` 的 `themeColor` 除外）。
2. **两级圆角与卡片刻度**：验证 `app/globals.css` 存在 `superellipse(1.35)`、`corner-shape: round`、`--radius-card` 且绝不包含 `[class*="-full"]`。
3. **纯 CJK 鸿蒙字体**：验证 `app/harmonyos-sans-sc.css` 不包含拉丁分片 `font-text-` 与 `U+20-7E`。
4. **Wordmark 与移动端顶栏**：验证 `SectionSwitcher` 不含 `hover:bg-sidebar-accent`，且 `CollapsedNavBar` 不将 `BrandWordmark` 包裹进 `<Button>`。
5. **TanStack Query 共享 Key 结构一致性**：静态检查同一 `queryKey` 在全项目内的所有 `useQuery` 调用返回相同数据结构，从根源杜绝跨页导航缓存碰撞（如 `{ items }` vs `items[]` 引发的 `*.map is not a function` 运行时崩溃）。推荐实践：**每个共享 `queryKey` 在 `lib/queries.ts` 中只导出一个规范 Hook**。
6. **中英文 i18n 完整性**：`tests/i18n.test.ts` 保证键名集合、非空值与 `{placeholder}` 完全一致。

### 10.2 Do / Don't 速查表

| 维度 | 推荐（Do） | 禁止（Don't） |
| --- | --- | --- |
| 颜色 | 使用 `bg-card`、`text-muted-foreground`、`border-border-strong` | 在 `.tsx` 中写 `bg-[#141414]` 或 `text-[#929292]` |
| 圆角 | 卡片用 `rounded-card`，胶囊用 `rounded-full`，CSS 写 `[class*="rounded-full"]` | 对所有元素统一 `squircle` 或写 `[class*="-full"]` |
| 图标 | 独立图标直接裸放 `size-7 stroke-[1.5]`；纯图标按钮用 `variant="ghost"` | 给空状态/状态图标套灰色圆形底框，或给行内操作图标加边框 |
| 侧边栏 | 顶栏 Wordmark 无悬停底色；「首页」独立置顶；底部放 `AccountSwitcher` | 给 Wordmark 加 `hover:bg-sidebar-accent`；底部放重复的语言选择和退出按钮 |
| 权益/属性 | 用 `DetailCard` / `DetailList` 展示本地化标题、详细说明与带单位数值 | 向普通用户直接展示 `aa.drive_quota_mb` 或 `free` 等原始字段名/slug |
| 状态查询 | 每个共享 `queryKey` 抽成唯一 Hook（如 `usePasskeys`、`useAdminSettings`） | 在不同页面用同一 `queryKey` 返回不同解包结构 |
