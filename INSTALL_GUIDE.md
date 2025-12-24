# 安装和使用指南

## 方法 1：在 VS Code 中直接测试（推荐用于开发）

### 步骤 1：在 VS Code 中打开项目

```bash
cd /Users/administrator/Documents/AIWorkingRoom/rac-folder-search
code .
```

### 步骤 2：启动扩展开发主机

在 VS Code 中：
1. 按 **F5** 键（或点击 Run > Start Debugging）
2. 会打开一个新的 VS Code 窗口（Extension Development Host）
3. 扩展会自动加载到这个窗口中

### 步骤 3：在新窗口中测试

在 Extension Development Host 窗口中：

1. **打开测试工作区**：
   ```
   File > Open Folder > 选择 test-workspace 文件夹
   ```

2. **触发搜索命令**：
   - 按 `Cmd+Shift+P`
   - 输入 "Search Folders"
   - 选择 "Folder Search: Search Folders (with Symlink Support)"

3. **搜索案件**：
   - 输入 "C2CAR2021" 或任何案件编号
   - 应该能看到匹配的案件文件夹
   - 符号链接文件夹会显示 🔗 标记

4. **选择结果**：
   - 按 Enter 键会在文件资源管理器中定位该文件夹

## 方法 2：打包并安装（推荐用于日常使用）

### 步骤 1：打包扩展

```bash
# 安装打包工具（如果还没安装）
npm install -g @vscode/vsce

# 打包扩展
vsce package
```

这会生成一个 `folder-search-symlink-0.0.1.vsix` 文件。

### 步骤 2：安装扩展

**方法 A：命令行安装**
```bash
code --install-extension folder-search-symlink-0.0.1.vsix
```

**方法 B：通过 VS Code UI 安装**
1. 打开 VS Code
2. 按 `Cmd+Shift+X` 打开扩展面板
3. 点击右上角的 `...` 菜单
4. 选择 "Install from VSIX..."
5. 选择 `folder-search-symlink-0.0.1.vsix` 文件

### 步骤 3：重启 VS Code

安装后重启 VS Code 以激活扩展。

### 步骤 4：使用扩展

1. 打开任何包含符号链接的项目
2. 按 `Cmd+Shift+P`
3. 输入 "Search Folders"
4. 开始搜索！

## 测试你的实际案件目录

### 场景说明

你有一个 `cases` 目录，它是一个符号链接：
```
cases -> /Users/administrator/Documents/ClaimsTeamShareFiles/ClaimCaseDownloads
```

该目录包含 **1715 个案件文件夹**，格式如：
- `C2CAR2021D00003-originaldownload/`
- `C2CAR2023D00001-originaldownload/`
- `23695-originaldownload/`

### 测试步骤

1. **打开你的项目**（包含 cases 符号链接的项目）

2. **首次搜索**（会建立索引）：
   - 按 `Cmd+Shift+P`
   - 选择 "Search Folders"
   - 等待索引完成（应该 < 1 秒，我们测试是 326ms）
   - 你会看到进度通知

3. **搜索案件**：
   - 输入案件编号，例如 "C2CAR2021"
   - 结果会立即过滤
   - 精确匹配会排在最前面
   - 前缀匹配会排在子串匹配前面

4. **后续搜索**（使用缓存）：
   - 再次打开搜索
   - 应该是即时的（< 100ms）
   - 缓存默认保持 10 分钟

## 推荐配置

针对你的 1715 个案件文件夹场景，建议在 VS Code 设置中添加：

```json
{
  // 跟随符号链接
  "fold-search.followSymlinks": true,
  
  // 限制扫描深度（案件文件夹通常不深）
  "fold-search.maxDepth": 3,
  
  // 只显示文件夹（不显示文件）
  "fold-search.includeFiles": false,
  
  // 增加结果限制以容纳所有案件
  "fold-search.maxResults": 5000,
  
  // 延长缓存时间（案件目录不常变化）
  "fold-search.cacheExpiryMinutes": 30,
  
  // 排除不需要的目录
  "fold-search.excludePatterns": [
    "node_modules",
    ".git",
    "dist",
    "build"
  ]
}
```

### 如何修改设置

1. 按 `Cmd+,` 打开设置
2. 搜索 "fold-search"
3. 修改相应的值
4. 或者直接编辑 `settings.json`（点击右上角的 {} 图标）

## 性能测试结果

我们已经用你的实际案件目录测试过了：

| 指标 | 结果 | 状态 |
|------|------|------|
| 案件文件夹数量 | 1715 | ✅ |
| 首次扫描时间 | 326ms | ✅ 优秀 |
| 搜索 "C2CAR2021" | 找到 3 个匹配 | ✅ |
| 符号链接跟随 | 正常工作 | ✅ |
| 🔗 标记显示 | 正常显示 | ✅ |

## 常用命令

### 搜索文件夹
- 快捷键：无（需要通过命令面板）
- 命令：`Cmd+Shift+P` > "Search Folders"

### 刷新缓存
- 命令：`Cmd+Shift+P` > "Refresh Folder Index Cache"
- 使用场景：当案件目录有大量新增或删除时

## 故障排除

### 问题：找不到案件文件夹

**解决方案**：
1. 检查 `fold-search.followSymlinks` 是否为 `true`
2. 检查 `fold-search.maxResults` 是否足够大（建议 5000）
3. 尝试刷新缓存

### 问题：搜索很慢

**解决方案**：
1. 减少 `fold-search.maxDepth`（建议 3）
2. 设置 `fold-search.includeFiles` 为 `false`
3. 增加 `fold-search.cacheExpiryMinutes`（建议 30）

### 问题：符号链接没有 🔗 标记

**解决方案**：
1. 确认是真正的符号链接（不是硬链接）
2. 刷新缓存
3. 检查控制台是否有错误

### 问题：扩展没有激活

**解决方案**：
1. 检查扩展是否已安装（扩展面板中搜索 "folder-search"）
2. 重启 VS Code
3. 查看输出面板（View > Output）选择 "Folder Search"

## 卸载

如果需要卸载扩展：

1. 打开扩展面板（`Cmd+Shift+X`）
2. 搜索 "folder-search"
3. 点击卸载按钮
4. 重启 VS Code

## 更新

当有新版本时：

1. 下载新的 `.vsix` 文件
2. 使用相同的安装方法安装
3. VS Code 会自动覆盖旧版本

## 技术支持

如果遇到问题：

1. 查看 `TEST_REPORT.md` 了解已知问题
2. 查看 `HOW_TO_TEST_IN_VSCODE.md` 了解调试方法
3. 检查 Debug Console 中的错误信息
4. 查看扩展输出日志

---

**祝使用愉快！🚀**

如果扩展对你有帮助，欢迎分享给团队其他成员！
