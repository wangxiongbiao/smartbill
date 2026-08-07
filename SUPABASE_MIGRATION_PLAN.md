# SmartBill Supabase 迁移计划

## 1. 目标与当前状态

| 项目 | 当前状态 |
| --- | --- |
| 旧 Supabase（源） | `vzpsyyojcvzldlxhxzoa`；当前 CLI 新账号不可见，迁移前必须恢复旧账号访问 |
| 新 Supabase（目标） | `mlttbyrmzckfxpjntrea`；状态健康，当前 `public` schema 无业务表、无远端 migration |
| Mobile（`app` 分支） | 本地 `.env` 与 CLI link 已切到新项目；尚未发布新构建 |
| Web/API（`origin/main`） | 仍配置旧项目；`https://smartbillpro.com` API 仍需单独切换和发布 |
| Auth | 新项目目前只启用 email；现有 App 只提供 Google 登录，因此还不能完成真实登录 |
| Storage 备份 | ZIP 只有 22 字节、0 个条目；必须先核对旧项目是否确实为 0 个对象 |
| 数据库备份 | 现有桌面备份没有数据库 schema/data dump，也没有 Auth 用户导出 |

## 2. 已确认的数据与调用范围

Web/API 的 `origin/main` 分支是服务端实现，Mobile 通过 `https://smartbillpro.com/api/...` 调用它。迁移不能只修改 Mobile 的 Supabase URL。

已知业务表：

1. `profiles`（代码使用，但仓库没有对应建表 SQL，必须以旧库实际 schema 为准）
2. `invoices`
3. `invoice_templates`
4. `billing_profiles`
5. `invoice_shares`
6. `image_uploads`
7. `school_posters`

已知关键函数/触发器：

- `update_updated_at_column`
- `get_share_date_by_token`
- `increment_share_access`
- `increment_template_usage`（代码有 fallback，需核对旧库是否实际存在）
- Auth 新用户创建 profile 的触发器（仓库未记录，需从旧库确认）

必须一起核对：索引、外键、RLS、GRANT、扩展、序列、函数 `search_path`、Storage bucket、Auth provider、Redirect URL、邮件配置和 Edge Functions/Secrets。

## 3. 核心迁移原则

1. **先取得旧库的真实导出，再创建 migration。** 仓库中的零散 SQL 不能替代旧库 schema dump。
2. **先迁 Auth，再迁引用 `auth.users(id)` 的业务数据。** 否则外键和用户数据归属会失败。
3. **默认保留旧用户 UUID。** 如果平台不支持原 ID 导入，必须先建立 `old_user_id -> new_user_id` 映射，再改写所有业务表的 `user_id`。
4. **Web/API、Mobile、Supabase Auth 必须使用同一个目标 project ref。**
5. **不把 secret/service-role key 写入 Git、Expo 环境变量、迁移文档或聊天。**
6. **正式切换前至少完成一次全量演练。**
7. 禁止直接展示 `supabase db dump --dry-run` 原始输出；当前 CLI 会把临时数据库密码展开到脚本中。

## 4. 分阶段执行方案

### 阶段 A：准备与只读盘点

前置条件：

- 恢复旧 Supabase 项目并能进入旧账号。
- 安装并启动 Docker Desktop；当前 `supabase db dump` 因 Docker 不可用而无法执行。
- 新旧账号使用独立 Supabase CLI profile，避免登录态相互覆盖。
- 源项目和目标项目使用不同 workdir/link；当前仓库保持链接新项目，不要反复覆盖 `.temp/project-ref`。

执行内容：

1. 旧库导出 `public` schema、roles 和 data-only 数据，备份目录权限设为仅当前用户可读。
2. 单独盘点并导出 Auth 用户、identities/provider 信息。
3. 查询每张业务表的行数、主键范围、`user_id` 数量和孤儿外键。
4. 查询 Storage bucket、对象数、总字节数；只有旧项目确认为 0 个对象时，空 ZIP 才可接受。
5. 记录 Auth Google provider、Site URL、Redirect URL、SMTP、邮件模板和验证码策略。
6. 记录数据库扩展、函数、触发器、RLS、GRANT 和 schema 版本。
7. 对所有导出文件生成 SHA-256，并记录导出时间与源 project ref。

阶段门禁：拿到可恢复的 schema/data/Auth/Storage 清单，并完成校验和后才能进入阶段 B。

### 阶段 B：建立可版本化的数据库迁移

以 `origin/main` Web/API 分支作为数据库 schema 的唯一事实来源，因为服务端直接读写 Supabase。使用独立 Git worktree 开发，避免覆盖当前 `app` 分支的未提交改动。

建议迁移顺序：

1. 扩展、公共更新时间函数、`profiles` 与 Auth profile 触发器
2. `invoices`
3. `invoice_templates`
4. `billing_profiles`
5. `image_uploads`
6. `school_posters`
7. `invoice_shares` 与公开分享 RPC
8. 必要的 GRANT、RLS、函数执行权限和安全加固

要求：

- 将旧库真实 schema 转成 `supabase/migrations/<timestamp>_*.sql`，不直接把现有零散 SQL 原样拼接。
- 显式保留 PostgREST 所需 GRANT；新项目不会自动暴露新表。
- `SECURITY DEFINER` 函数必须固定安全 `search_path`，并限制 EXECUTE 权限。
- migration 在空目标库执行一次，并在临时/本地数据库完成至少一次 reset 验证。
- 把成功的 push、migration list、行数核对沉淀为项目脚本；未经实际跑通不得提前生成“可用”发布脚本。

阶段门禁：目标库 schema、函数、RLS、GRANT 与源库对齐，migration list 一致。

### 阶段 C：Auth 与 Google 登录迁移

1. 在新 Supabase 开启 Google provider。
2. 在 Google Cloud OAuth 增加新回调：`https://mlttbyrmzckfxpjntrea.supabase.co/auth/v1/callback`。
3. 核对 Mobile scheme 与回调路径；当前 scheme 是 `mobile`，代码中的 callback path 还需在真实设备验证。
4. 配置 Supabase Site URL 和 Redirect Allow List，覆盖正式 Web 域名、预览域名和 Mobile deep link。
5. 配置 Expo/EAS 的 Google Web/iOS Client ID；不得只改本地 `.env`。
6. 迁移 Auth 用户并优先保留 UUID；若不能保留，则完成用户映射和所有业务表外键改写。
7. 旧 Supabase session/JWT 在新项目不可继续使用，切换后用户必须重新登录。

阶段门禁：Web Google OAuth、Android/iOS 原生 Google 登录、新 JWT 获取与刷新全部通过。

### 阶段 D：业务数据与 Storage 导入演练

导入顺序：

1. Auth 用户/identities
2. `profiles`
3. `invoices`
4. `invoice_templates`
5. `billing_profiles`
6. `image_uploads`
7. `school_posters`
8. `invoice_shares`
9. Storage buckets/objects

验证项目：

- 每张表源/目标行数一致。
- 主键、用户 UUID、发票 JSON、模板 JSON、时间字段保持一致。
- 无孤儿 `user_id`、无失效 invoice/share 外键。
- 分享 token 保持不变，避免现有分享 URL 全部失效。
- Storage 对象数量、总大小和抽样 SHA-256 一致。
- 对测试用户验证 RLS：本人可访问、其他用户不可访问、匿名用户只能调用允许的公开分享 RPC。

阶段门禁：全量演练通过，并生成可重复的导入与核验记录。

### 阶段 E：Web/API 切换

`origin/main` 中的 Web/API 当前仍指向旧项目。需要：

1. 更新 Web 本地环境与 Vercel Preview/Production：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. 不在前端或公开环境变量中配置 secret/service-role key。
3. 重新部署 `smartbillpro.com`。
4. 使用新项目签发的真实 JWT 验证：
   - `/api/auth/me`
   - `/api/invoices`
   - `/api/templates`
   - `/api/billing-profiles`
   - `/api/profile`
   - `/api/share/create`
   - 分享公开读取与邮件流程
5. 匿名 `/api/auth/me` 应继续返回 401；不能只验证首页 200。

阶段门禁：新 JWT 的 API CRUD 与 RLS 验收通过。

### 阶段 F：Mobile 切换与发布

1. 本地 Mobile 已指向新项目，但必须同步更新 EAS development/preview/production 环境。
2. 重新构建测试包，不能复用嵌入旧 Supabase 配置的旧 APK。
3. 验证首次登录、session 恢复、退出登录、发票同步、模板、联系人、分享。
4. Web/API 完成新项目切换后再发布 Mobile；否则新 JWT 会被旧后端拒绝。

阶段门禁：真实设备登录和所有关键 API 通过，再发布生产构建。

### 阶段 G：正式切换与回滚

若没有活跃用户，可安排短维护窗口：

1. 暂停旧系统写入。
2. 导出并导入最后增量。
3. 复核行数与校验和。
4. 先切 Web/API，再发布/启用 Mobile 新配置。
5. 完成生产冒烟测试。

若存在活跃旧版 Mobile 用户，不能直接把后端一次性切到新项目，否则旧 JWT 会立即失效。需要在以下方案中先选一个：

- 强制升级 + 明确维护窗口；或
- 开发双项目 Auth/JWT 兼容层，并制定旧客户端退场期限。

回滚条件：Auth、核心 CRUD、RLS、分享或数据核对任一失败。

回滚方式：

- Web/Vercel 环境变量切回旧项目并重新部署。
- 停止向新库写入，保留失败现场和导入日志。
- Mobile 尚未发布前直接停止发布；已发布时需要旧项目兼容策略，不能仅靠远端改 `.env` 回滚安装包。
- 旧项目至少保留到新系统稳定运行并完成最终备份后，禁止提前删除。

## 5. 当前阻塞项

1. 当前 CLI 登录的是新账号，旧项目 `vzpsyyojcvzldlxhxzoa` 不可见。
2. 本机 Docker Desktop 不可用，无法完成正式 schema/data dump。
3. 新项目 Google Auth 未开启，现有 App 无法登录。
4. 新目标库为空，且 `profiles` 等完整 schema 不能由当前 `app` 分支 SQL 还原。
5. Web/API 生产环境仍使用旧项目。
6. 尚未确认活跃用户数量，因此还不能决定直接切换还是双项目兼容。

## 6. 推荐的下一步

先只执行阶段 A，不向新库写入：

1. 使用独立 CLI profile 登录旧 Supabase 账号。
2. 确认旧项目已恢复且可访问。
3. 启动 Docker Desktop。
4. 导出并核对旧库 schema、public 数据、Auth 用户和 Storage 清单。
5. 根据用户数与行数决定“直接维护窗口切换”还是“兼容迁移”。

完成阶段 A 后，再根据真实旧库结构生成 migration，避免把不完整的仓库 SQL 推入新数据库。
