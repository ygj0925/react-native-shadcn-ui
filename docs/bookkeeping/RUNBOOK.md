# 简账启动与验证

## 本地预览

在 `D:\project\react-native-shadcn-ui` 执行 `npm run dev`，从「今日」页进入「简账」。网页也可使用 `npx expo start --port 8090`，访问 `http://localhost:8090/bookkeeping`。无需登录即可使用本地账本；应用首次启动不会添加任何演示流水。

系统锁、通知与 Face ID 需要重新构建原生 App：已添加 `expo-secure-store`、`expo-local-authentication`、`expo-notifications` 的 Expo 配置。Expo Go 不作为真机验收基线。原有 MindFlow 功能及其 Supabase 配置独立保留；未配置 Supabase 时不应阻止简账启动。

## 服务端

服务代码位于 `D:\project\guard-find\guard-find-server`。简账设置 → 云端账号、备份与家庭共享，填写服务根地址。也可在本机 `.env.development.local` 配置 `EXPO_PUBLIC_ACCOUNTING_API_URL`。真机的 localhost 指向手机本身，需填写电脑局域网地址；正式版本必须 HTTPS。现有开发配置端口为 8082。

后端新增 Liquibase 文件 `guard-find-server-api/src/main/resources/db/changelog/mysql/accounting_snapshot.sql` 并在 master 末尾引用。代码交付没有执行数据库迁移；先在开发库审核并启动服务，让现有 Liquibase 流程建表。不要直接拿生产库做功能测试。

使用已有 C 端 App 用户账号密码，或由用户主动触发短信登录。没有创建默认账号、硬编码凭证或调用真实短信服务。

完整云备份使用 `/app/accounting/snapshot`，上传和恢复均需再次确认；版本冲突不会覆盖。云备份保存完整个人账本，服务端既有 `/app/ledger` 家庭流水在独立区域管理，尚未统一为一个跨设备领域模型。恢复前本机副本存放在 AsyncStorage 的 `jianzhang-before-cloud-restore` 或 `jianzhang-before-file-restore`；云页面提供云恢复前副本的回滚入口。导入前仍建议导出 JSON 文件到独立位置。

## 自动检查

前端：

```powershell
node --test tests/bookkeeping.test.cjs tests/bookkeeping-remote.test.cjs
./node_modules/.bin/tsc.cmd --noEmit
npx expo export --platform web --output-dir .expo/bookkeeping-web-review
```

后端（PowerShell 中必须给 Maven -D 参数加引号）：

```powershell
mvn -pl guard-find-server-system -am test '-Dtests.skip=false' '-Dtest=AccountingSnapshotServiceTest,AccountingSnapshotMapperTest,LedgerServiceImplTest' '-Dsurefire.failIfNoSpecifiedTests=false' '-Dspotless.skip=true' '-Dcheckstyle.skip=true' -q
```

已有未提交的房源、寻亲、AI 等其他改动由其他工作产生，不要把整个后端 `git add .` 后提交。当前任务没有 commit、push 或部署。

## 待真机与联调验收

用开发账号验证登录过期、双设备云版本冲突、超时重试、换号确认、家庭组越权/退组、备份恢复、通知权限拒绝、重启后提醒、后台遮罩和设备解锁。浏览器工具本轮超时，HTTP 200 和单元测试无法替代这些实际验收。


## 本轮新增配置与原生模块

服务示例见同目录 `server-config.example.yml`，不会自动加载。新增私有票据表通过 `accounting_receipts.sql` 及现有 Liquibase master 引用交付，未执行迁移。识别API只读取服务端 `guardfind.accounting.ai.*`，默认禁用；不在EXPO_PUBLIC变量中配置供应商密钥。

同步从云端页面显式选择本机或云端初始化后开启。切换账号须重新确认工作区归属。完整备份导入、恢复可能产生同步冲突，处理冲突后再继续；恢复前保留的副本也可能包含敏感财务数据，应纳入设备清理策略。

Android与iOS的本地模块位于 `modules/jianzhang-widget`，Expo自动链接注册；iOS构建插件位于 `plugins/with-bookkeeping-widgets.js`，同时声明EAS扩展凭据元数据。必须重新生成并构建原生工程；Expo Go不包含自定义模块。iOS小组件最低iOS17，需Apple AppGroup与扩展签名。未执行云构建或变更开发者账号能力。参考：[Expo本地模块](https://docs.expo.dev/modules/get-started/)、[App Extensions](https://docs.expo.dev/build-reference/app-extensions/)。

Android支付通知采集默认关闭，App内主动开启后仍需用户在系统界面授予通知访问权限。只在本机保留候选，最终入账仍需确认；iOS不支持读取其他应用通知。原生权限/签名/系统桌面行为须后续真机验证。

新增测试：

```powershell
node --test tests/bookkeeping.test.cjs tests/bookkeeping-remote.test.cjs tests/bookkeeping-sync.test.cjs tests/bookkeeping-pin.test.cjs tests/bookkeeping-widget.test.cjs tests/bookkeeping-engine.test.cjs tests/bookkeeping-currency.test.cjs
mvn -pl guard-find-server-system -am test '-Dtests.skip=false' '-Dtest=Accounting*Test,Ledger*Test' '-Dsurefire.failIfNoSpecifiedTests=false' '-Dspotless.skip=true' '-Dcheckstyle.skip=true' -q
npx expo-modules-autolinking resolve --platform ios --json
npx expo config --type introspect --json
```

尚须验收：真实双设备冲突与离线、真实供应商照片/语音、PDF下载、Android通知访问撤销、小组件日切/隐私/深链、iOS AppGroup签名和冷启动快捷入口、后台与PIN恢复。编译/测试通过不能证明这些外部行为已验证。


## 本轮最终自动检查记录

- 前端29项测试通过，包括失联重放、写盘失败不上传、换号隔离、PIN锁定、差量冲突、原币换算、Widget配置。
- 后端accounting/ledger相关36项测试通过，失败0、错误0；未连接业务数据库。
- TypeScript检查、Expo网页静态导出通过。
- Android/iOS本地模块自动链接解析通过，iOS Pod已注册；Expo配置introspection通过。
- 隔离目录 `.expo/bookkeeping-native-review` 中 Android `prebuild --no-install` 通过。未构建APK、未安装到设备。
- iOS prebuild被Expo的Windows平台限制明确拒绝，须在Mac/Linux生成工程；未运行Swift编译、iOS签名和真机测试。
- 没有commit、push、迁移、真实短信/供应商请求或部署。
