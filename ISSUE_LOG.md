# ISSUE_LOG

### 2026-08-06 问题 1：CodeGraph 初次查询参数不兼容
- 原因：项目尚未初始化 CodeGraph，且初次 `explore` 误用了当前 CLI 不支持的 `--max-results` 参数。
- 导致的问题：首次 Supabase 调用链查询未执行。
- 解决方式：先通过 `codegraph explore --help` 核对当前版本参数，改用受支持的 `--max-files`，并在项目初始化索引后重新查询；索引完成后查询成功。

### 2026-08-06 问题 2：macOS awk 不支持第三参数捕获组
- 原因：备份环境变量脱敏检查使用了 GNU awk 风格的 `match(..., ..., captures)`，macOS 自带 awk 不支持该写法。
- 导致的问题：归档内 `.env` 的首次脱敏检查中断，SQL 文件校验和检查不受影响。
- 解决方式：改用 Python 从标准输入解析并只输出 Supabase URL 的项目 ref，其余值统一脱敏。

### 2026-08-06 问题 3：全桌面递归查找备份文件超时
- 原因：直接对 Desktop、Downloads 和项目目录做无深度限制的 `find`，扫描范围过大。
- 导致的问题：首次定位 `vzpsyyojcvzldlxhxzoa.storage.zip` 的命令在 30 秒后超时。
- 解决方式：改用 Spotlight 精确文件名查询和限定目录/深度的 `find`，已定位到项目根目录。

### 2026-08-06 问题 4：Storage 备份 ZIP 为空
- 原因：`vzpsyyojcvzldlxhxzoa.storage.zip` 只有 ZIP 空目录结束标记，没有任何文件条目。
- 导致的问题：`unzip -t` 返回 `zipfile is empty`，该文件不能用于迁移 Supabase Storage。
- 当前判断：文件大小仅 22 字节，Python ZipFile 复核为 0 个条目；它只可能代表“旧项目确实没有任何 Storage 对象”，不能单独证明导出成功。
- 下一步：先在旧项目核对 bucket 与 `storage.objects` 数量；若不为 0，必须重新导出，并在迁移前复核文件数、总大小和 ZIP 完整性。

### 2026-08-06 问题 5：通过 Terminal 触发 Supabase 登录时调用超时
- 原因：新 Terminal 标签页先进入了交互式 `supabase logout` 等待确认，外层 AppleScript 因此超过 20 秒未返回。
- 导致的问题：浏览器登录流程没有立即进入，终端停在退出确认阶段。
- 解决方式：用 `supabase logout --yes` 清理全局登录态并终止旧的等待进程；同一 Terminal 标签页已继续执行 `HOME=/Users/admin supabase login`，登录流程已成功触发并等待用户在浏览器完成。

### 2026-08-06 问题 6：新 Supabase 项目远端 schema 检查受本机环境阻塞
- 原因：`supabase inspect db table-stats --linked` 在初始化远端登录角色阶段超过 60 秒；`supabase db dump --linked` 又因本机未运行/安装 Docker Desktop 而失败。
- 导致的问题：无法通过 CLI dump 直接核对新项目 `public` schema，生成的临时 dump 文件为空。
- 原计划：通过远端 table stats 和 schema dump 确认新项目是否为空。
- 替代验证：使用已成功的 `supabase link`、`supabase migration list --linked`，并改由新项目公开 API Key 请求 Auth/PostgREST 健康接口核对项目与客户端配置。
- 下一步：需要完整 schema dump 时先安装并启动 Docker Desktop，再重跑同一条 `supabase db dump --linked`；不得把当前空的临时 dump 当作数据库备份。

### 2026-08-06 问题 7：Python HTTPS 验证受本机 CA 环境影响
- 原因：Homebrew Python 3.14 的本地 CA 链不完整，使用 `urllib` 请求新 Supabase Auth 健康接口时报 `CERTIFICATE_VERIFY_FAILED`。
- 导致的问题：首次 HTTP 连通性验证未完成，但并非 Supabase 服务证书异常。
- 解决方式：改用本机已验证可用的 `curl` 执行同一 HTTPS 请求，Auth 健康接口返回 HTTP 200；后续标准验证入口统一使用 `npm run supabase:verify`。

### 2026-08-06 问题 8：PostgREST 根 OpenAPI 不接受公开 Key
- 原因：新项目的 `/rest/v1/` 根 OpenAPI 接口要求 secret API key，publishable key 请求返回 HTTP 401 `Secret API key required`。
- 导致的问题：不能只靠前端公开 Key读取表清单。
- 解决方式：通过 Supabase CLI 在进程内读取服务器级 key完成一次只读检查且不输出 key，确认新项目当前没有公开业务表；前端连通性仍使用 publishable key检查 Auth HTTP 200。

### 2026-08-06 问题 9：`supabase db dump --dry-run` 会输出临时数据库凭据
- 原因：CLI 的 dry-run 不只输出 `pg_dump` 参数，还会在生成脚本中展开临时 `PGPASSWORD`。
- 导致的问题：规划检查时临时登录角色密码出现在命令输出中；该凭据由 Supabase CLI 临时签发，不应写入文档、脚本或长期日志。
- 解决方式：后续禁止直接展示 `db dump --dry-run` 原始输出；需要检查命令时先重定向到权限为 600 的临时文件并脱敏。正式导出只写入受控备份目录，结束后检查日志不含连接密码。

### 2026-08-06 问题 10：旧账号项目列表首次脱敏格式化失败
- 原因：管道内 Python 单行脚本对 f-string 引号做了错误转义，触发 `SyntaxError`，并使上游 CLI 收到 EPIPE。
- 导致的问题：登录完成后的第一次项目列表展示失败，不影响已保存的 `smartbill-old` 登录凭据。
- 解决方式：改用 Python `subprocess` 直接解析 CLI JSON，确认旧 profile 可访问 `smartbillpro`，项目状态为 `ACTIVE_HEALTHY`。

### 2026-08-06 问题 11：两个本地 Web 项目首次依赖安装失败
- 原因：Web 项目通过 Corepack 下载固定 pnpm 版本时，Node 24/Corepack 的代理请求触发 `UND_ERR_INVALID_ARG: invalid onError method`；App Web 的 Yarn 默认 registry/代理链路则长时间重试并在 600 秒后超时。
- 导致的问题：Next.js Web 与 Expo Web 首次启动被依赖安装阻塞。
- 原计划：分别执行固定 pnpm 与 Yarn lockfile 安装，然后启动 3001/8081 端口。
- 当前判断：系统 `curl` 访问 npm 官方 registry 返回 200，属于包管理器/registry/代理组合问题，不是外网完全不可达。
- 已尝试：Corepack pnpm 10.24.0 下载；Yarn 1.22 frozen lockfile 默认下载。
- 解决方式：Web 使用本机 Corepack 缓存中的 pnpm 10.33.2 直接执行并成功复用本地 store；App Web 因网络极慢，最终用同一 pnpm 缓存、离线依赖缓存及本机已有的 React Native 0.81.5 包完成生产依赖安装。两个 worktree 均已生成可执行入口。

### 2026-08-06 问题 12：SmartBill Web 首次健康检查误命中其他项目
- 原因：3001 端口已被 `wmshr/apps/home` 的 `server.ts` 占用；首次启动 SmartBill Web 返回 `EADDRINUSE`，而随后的 curl 实际命中了该既有服务。
- 导致的问题：第一次得到的 3001 HTTP 200 不能作为 SmartBill Web 启动成功证据。
- 原计划：SmartBill Web 使用 3001，避开已占用的 3000。
- 替代验证：不终止其他项目服务，改用确认空闲的 3002；后续同时核对监听进程 cwd、SmartBill 页面响应和 `/api/auth/me` 的预期匿名状态。

### 2026-08-06 问题 13：Expo Web 启动时在线依赖检查受代理阻塞
- 原因：Expo CLI 启动后调用版本元数据接口，Node/Undici 与当前代理组合再次出现 `TypeError: fetch failed`。
- 导致的问题：Metro 曾启动但随即退出，8081 未形成稳定监听。
- 原计划：直接执行 `expo start --web --port 8081`。
- 替代验证：依赖已在本地完成安装，重启时使用 Expo 官方离线模式跳过非必要版本查询，再通过 8081 监听和首页 GET 验收。

### 2026-08-06 问题 14：Expo Web SSR 静态渲染触发 Metro JSX 运行时循环依赖错误
- 原因：`app.config.js` 中 `web.output` 配置为 `"static"`，导致 Metro 在开发阶段针对每个路由执行 Node 端 SSR 预渲染；在预渲染过程中，NativeWind v4 / `react-native-css-interop` 的 `jsx-runtime` 被 CJS 循环引用，导致 `@react-navigation` 调用 `(0, _reactJsxRuntime.jsx)` 时抛出 `is not a function`。
- 导致的问题：8081 端口启动后无法通过首页 GET 请求，Metro 持续报 SSR 渲染错误。
- 原计划：直接以默认 static SSR 模式启动 Expo Web 并访问首页。
- 解决方式与替代验证：
  1. 重构 `react-native-css-interop/dist/runtime/jsx-runtime.js` 与 `jsx-dev-runtime.js`，保证 `exports.jsx` 在顶层被立即导出，消除 CJS 循环依赖；
  2. 将 `app.config.js` 中的 `web.output` 从 `"static"` 调整为 `"single"`（SPA 动态 Web 模式）；
  3. 重启 Expo Web 根路径 2 秒内完成构建，`http://127.0.0.1:8081/` 返回 HTTP 200，Web 端单页应用正常加载。

### 2026-08-06 问题 15：Vercel 部署路径与线上验证
- 原因：Hermes 环境下 Vercel CLI 需指定全局 HOME 与显式路径 `/Users/admin/.npm-global/bin/vercel`；项目需关联远端项目 `smartbill-4fw6`。
- 解决方式与线上验证：
  1. 在 `smartbill-web-local` 中执行 `vercel link --project smartbill-4fw6 --yes`；
  2. 执行 `HOME=/Users/admin /Users/admin/.npm-global/bin/vercel --prod --yes` 完成线上生产构建与发布；
  3. 通过 `curl` 验证正式域名 `https://smartbillpro.com` 根路径返回 HTTP 200，API 接口 `https://smartbillpro.com/api/auth/me` 返回 HTTP 401（未登录门禁正常拦截），线上发布完毕。

