# Anywhere Console Starter

基于 **Anywhere UI**（Next.js 16 + Tailwind CSS v4 + Base UI + shadcn + TanStack Query）生成的管理后台与个人账户控制台模板。

## 快速运行

```bash
corepack yarn install
corepack yarn dev
```

打开 `http://127.0.0.1:3000` 即可预览完整界面（内置本地演示会话，点击「退出登录」可体验双步登录页与控制台入场动效）。

## 接入真实业务（只需替换 3 个文件）

1. **`lib/config.ts`**：修改 `brandName`、`description`、`defaultLocale` 与 `enableAdminConsole`。
2. **`lib/session.ts`**：将 `authAdapter` 替换为你的真实认证/会话接口（Cookie Session、OIDC BFF、NextAuth 等），保持 `AuthAdapter` 接口即可无缝复用所有守卫与页面过渡动效。
3. **`lib/items-store.ts`**：将示例 CRUD 查询与设置接口替换为真实业务 API，并按需扩展 `app/admin/` 与 `app/account/` 下的页面。

## 已内置模块

- **账户首页 (`/account`)**：居中身份头、`/` 快捷键搜索胶囊、线框快捷入口胶囊、单张无边框焦点卡片
- **个人资料 (`/account/profile`)**：点击侧边栏顶部头像行直达，含显示名称编辑与可复制账户 ID
- **外观设置 (`/account/appearance`)**：无边框主题选择卡片（浅色 / 深色 / 跟随系统）与语言切换
- **双步登录 (`/sign-in` & `/sign-in/password`)**：极简居中布局与平滑入场动效
- **管理控制台 (`/admin`)**：概览指标卡片、完整 CRUD `DataTable` 示例 (`/admin/items`)、设置页表单与开关示例 (`/admin/settings`)
- **AI 设计护栏**：`AGENTS.md`、`.agents/skills/anywhere-ui/SKILL.md`、`tests/design-discipline.test.ts`、`tests/i18n.test.ts`

## 验证命令

```bash
corepack yarn typecheck
corepack yarn lint
corepack yarn test
corepack yarn build
```
