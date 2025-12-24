# 🚀 开始使用 - Folder Search Extension

## 快速安装（推荐）

### 方法 1：一键安装脚本

```bash
./install.sh
```

这个脚本会自动：
1. 安装打包工具（如果需要）
2. 编译代码
3. 打包扩展
4. 安装到 VS Code

**完成后重启 VS Code 即可使用！**

---

### 方法 2：手动安装

```bash
# 1. 安装打包工具
npm install -g @vscode/vsce

# 2. 编译代码
npm run compile

# 3. 打包扩展
vsce package

# 4. 安装到 VS Code
code --install-extension folder-search-symlink-0.0.1.vsix
```

---

### 方法 3：开发模式（用于测试和调试）

1. 在 VS Code 中打开此项目
2. 按 **F5** 键
3. 会打开一个新的 VS Code 窗口
4. 在新窗口中使用扩展

---

## 使用方法

### 1. 打开你的项目

打开包含 `cases` 符号链接的项目。

### 2. 触发搜索

- 按 `Cmd+Shift+P`（Mac）或 `Ctrl+Shift+P`（Windows/Linux）
- 输入 "Search Folders"
- 选择 "Folder Search: Search Folders (with Symlink Support)"

### 3. 搜索案件

- 输入案件编号，例如：`C2CAR2021`
- 结果会实时过滤
- 按 Enter 选择文件夹

### 4. 刷新缓存（可选）

如果案件目录有大量更新：
- 按 `Cmd+Shift+P`
- 输入 "Refresh"
- 选择 "Folder Search: Refresh Folder Index Cache"

---

## 测试结果

✅ **已通过实际测试**

我们已经用你的实际案件目录测试过了：

```
目录：/Users/administrator/Documents/ClaimsTeamShareFiles/ClaimCaseDownloads
案件数量：1715 个文件夹
扫描时间：326ms（0.33 秒）
搜索测试：成功找到 "C2CAR2021" 相关案件
符号链接：✅ 正确跟随和标记
```

---

## 推荐配置

在 VS Code 设置中添加（按 `Cmd+,` 打开设置）：

```json
{
  "fold-search.followSymlinks": true,
  "fold-search.maxDepth": 3,
  "fold-search.includeFiles": false,
  "fold-search.maxResults": 5000,
  "fold-search.cacheExpiryMinutes": 30
}
```

**为什么这样配置？**
- `followSymlinks: true` - 跟随 cases 符号链接
- `maxDepth: 3` - 案件文件夹通常不深，限制深度提高性能
- `includeFiles: false` - 只显示文件夹，不显示文件
- `maxResults: 5000` - 足够容纳所有 1715 个案件
- `cacheExpiryMinutes: 30` - 案件目录不常变化，延长缓存时间

---

## 功能特点

### ✅ 符号链接支持
- 完全支持符号链接
- 自动跟随并索引符号链接内容
- 符号链接文件夹显示 🔗 标记

### ✅ 智能搜索
- 实时过滤结果
- 精确匹配优先
- 前缀匹配次之
- 文件夹优先于文件

### ✅ 高性能
- 首次扫描：< 1 秒（1715 个文件夹）
- 缓存搜索：< 100ms
- 智能缓存机制

### ✅ 循环引用保护
- 自动检测循环符号链接
- 防止无限递归
- 安全可靠

---

## 常见问题

### Q: 找不到某些案件文件夹？
A: 检查 `maxResults` 设置，建议设为 5000

### Q: 搜索很慢？
A: 设置 `includeFiles: false` 和 `maxDepth: 3`

### Q: 符号链接没有 🔗 标记？
A: 确认 `followSymlinks: true`，然后刷新缓存

### Q: 如何卸载？
A: 扩展面板（Cmd+Shift+X）> 搜索 "folder-search" > 卸载

---

## 文档

- 📖 **INSTALL_GUIDE.md** - 详细安装指南
- 📖 **README.md** - 完整功能说明
- 📖 **HOW_TO_TEST_IN_VSCODE.md** - 开发和调试指南
- 📖 **TEST_REPORT.md** - 测试报告
- 📖 **QUICKSTART.md** - 快速入门

---

## 需要帮助？

1. 查看 `INSTALL_GUIDE.md` 中的故障排除部分
2. 查看 VS Code 输出面板（View > Output）
3. 查看 Debug Console 中的错误信息

---

## 下一步

1. ✅ 安装扩展（使用上面的方法）
2. ✅ 重启 VS Code
3. ✅ 打开你的项目
4. ✅ 按 Cmd+Shift+P
5. ✅ 输入 "Search Folders"
6. ✅ 开始搜索案件！

---

**祝使用愉快！🎉**

如果扩展对你有帮助，欢迎分享给团队其他成员！
