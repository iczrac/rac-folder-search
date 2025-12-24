# ✅ 扩展已打包成功！

## 📦 生成的文件

```
folder-search-symlink-0.0.1.vsix
```

这个文件已经在当前目录中生成。

---

## 🚀 安装方法

### 方法 1：通过 VS Code UI 安装（推荐）

1. **打开 VS Code**

2. **打开扩展面板**：
   - 按 `Cmd+Shift+X`（Mac）
   - 或 `Ctrl+Shift+X`（Windows/Linux）

3. **安装 VSIX**：
   - 点击扩展面板右上角的 `...` 菜单
   - 选择 "Install from VSIX..."
   - 浏览到当前目录
   - 选择 `folder-search-symlink-0.0.1.vsix`

4. **重启 VS Code**

---

### 方法 2：通过命令行安装

如果你的 `code` 命令已配置：

```bash
code --install-extension folder-search-symlink-0.0.1.vsix
```

如果 `code` 命令不可用，需要先配置：

**在 VS Code 中**：
1. 按 `Cmd+Shift+P`
2. 输入 "Shell Command"
3. 选择 "Shell Command: Install 'code' command in PATH"
4. 然后运行上面的安装命令

---

### 方法 3：拖放安装

1. 打开 VS Code
2. 打开扩展面板（`Cmd+Shift+X`）
3. 将 `folder-search-symlink-0.0.1.vsix` 文件拖放到扩展面板中

---

## ✅ 验证安装

安装后，在 VS Code 中：

1. 打开扩展面板（`Cmd+Shift+X`）
2. 搜索 "folder-search"
3. 应该能看到 "Folder Search with Symlink Support" 扩展
4. 确认状态为"已启用"

---

## 🎯 开始使用

### 1. 打开你的项目

打开包含 `cases` 符号链接的项目，或者先测试 `test-workspace`：

```bash
code test-workspace
```

### 2. 触发搜索

- 按 `Cmd+Shift+P`
- 输入 "Search Folders"
- 选择 "Folder Search: Search Folders (with Symlink Support)"

### 3. 搜索案件

- 输入 "C2CAR2021" 或任何案件编号
- 结果会实时过滤
- 按 Enter 选择文件夹

---

## ⚙️ 配置（重要！）

为了获得最佳性能，建议配置：

1. 按 `Cmd+,` 打开设置
2. 搜索 "fold-search"
3. 设置以下值：

```json
{
  "fold-search.followSymlinks": true,
  "fold-search.maxDepth": 3,
  "fold-search.includeFiles": false,
  "fold-search.maxResults": 5000,
  "fold-search.cacheExpiryMinutes": 30
}
```

或者直接编辑 `settings.json`（点击设置右上角的 {} 图标）。

---

## 📊 性能预期

基于实际测试（1715 个案件文件夹）：

- **首次扫描**：~326ms（< 1 秒）
- **缓存搜索**：< 100ms（即时）
- **搜索 "C2CAR2021"**：找到 3 个匹配
- **符号链接**：✅ 正确跟随和标记 🔗

---

## 🔧 故障排除

### 扩展没有出现在列表中

1. 确认安装成功（应该看到成功消息）
2. 重启 VS Code
3. 检查扩展面板中是否有错误提示

### 找不到搜索命令

1. 确认扩展已启用（扩展面板中查看）
2. 尝试重新加载窗口（`Cmd+Shift+P` > "Reload Window"）
3. 检查是否有其他扩展冲突

### 符号链接不工作

1. 确认 `fold-search.followSymlinks` 设置为 `true`
2. 刷新缓存（`Cmd+Shift+P` > "Refresh Folder Index Cache"）
3. 检查符号链接权限

---

## 📝 下一步

1. ✅ 安装扩展（使用上面的方法）
2. ✅ 重启 VS Code
3. ✅ 配置设置（重要！）
4. ✅ 打开你的项目
5. ✅ 按 Cmd+Shift+P
6. ✅ 输入 "Search Folders"
7. ✅ 开始搜索！

---

## 🎉 测试建议

### 先用测试工作区测试

```bash
# 在 VS Code 中打开测试工作区
code test-workspace
```

然后：
1. 触发搜索命令
2. 应该能看到 `cases` 文件夹（带 🔗 标记）
3. 搜索 "C2CAR2021" 应该能找到匹配项

### 再用实际项目测试

打开你包含 `cases` 符号链接的实际项目，重复上述步骤。

---

## 📚 更多信息

- **README.md** - 完整功能说明
- **TEST_REPORT.md** - 测试报告
- **CHANGELOG.md** - 版本历史

---

**祝使用愉快！🚀**

如果有任何问题，请查看故障排除部分或相关文档。
