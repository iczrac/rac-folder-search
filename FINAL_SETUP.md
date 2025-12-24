# ✅ 最终版本 - 安装和配置指南

## 🎉 版本 1.0.1 已完成！

### ✨ 本次更新内容

1. ✅ **版本号已同步**：package.json 版本号更新为 1.0.1
2. ✅ **移除警告**：删除了不必要的 `activationEvents`
3. ✅ **文档完善**：
   - 更新了 README.md 的版本历史
   - 创建了中文版 README（README.zh-CN.md）
   - 创建了发布者配置指南（PUBLISHER_GUIDE.md）
4. ✅ **重新打包**：生成了干净的 `folder-search-symlink-1.0.1.vsix`

---

## 📦 安装插件

### 方法 1：通过 VS Code UI 安装

1. 打开 VS Code
2. 按 `Cmd+Shift+X` 打开扩展面板
3. 点击右上角的 `...` 菜单
4. 选择 "Install from VSIX..."
5. 选择 `folder-search-symlink-1.0.1.vsix` 文件
6. 重启 VS Code

### 方法 2：通过命令行安装

```bash
code --install-extension folder-search-symlink-1.0.1.vsix
```

---

## 🔧 配置插件信息（如果要发布）

### 必须修改的字段

打开 `package.json`，找到并修改以下两个字段：

```json
{
  "publisher": "your-publisher-name",  // ⚠️ 改为你的发布者名称
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/folder-search-symlink"  // ⚠️ 改为你的仓库地址
  }
}
```

### 如何获取发布者名称

1. 访问 https://marketplace.visualstudio.com/manage
2. 使用 Microsoft 或 GitHub 账号登录
3. 创建发布者（Create Publisher）
4. 记下你的发布者 ID

**详细步骤请查看：`PUBLISHER_GUIDE.md`**

---

## 🚀 使用插件

### 1. 搜索文件夹

```
快捷键：Cmd+Shift+P
命令：Search Folders (with Symlink Support)
```

**示例**：
- 输入 `C2CAR2021` 查找所有包含该文本的案件文件夹
- 输入 `2023` 查找所有 2023 年的案件
- 支持大小写不敏感搜索

### 2. 刷新缓存

```
快捷键：Cmd+Shift+P
命令：Refresh Folder Index Cache
```

**何时使用**：
- 添加了新的案件文件夹
- 删除了文件夹
- 目录结构发生重大变化

---

## ⚙️ 推荐配置

### 针对案件文件夹的最佳配置

打开 VS Code 设置（`Cmd+,`），搜索 `fold-search`，使用以下配置：

```json
{
  // 跟踪符号链接（必须启用）
  "fold-search.followSymlinks": true,
  
  // 只索引第一层案件文件夹
  "fold-search.maxDepth": 2,
  
  // 只显示文件夹，不显示文件
  "fold-search.includeFiles": false,
  
  // 缓存 10 分钟
  "fold-search.cacheExpiryMinutes": 10,
  
  // 排除不需要的文件夹
  "fold-search.excludePatterns": [
    "node_modules",
    ".git",
    "dist",
    "build",
    "__pycache__"
  ],
  
  // 最多索引 5000 个项目（足够 1700+ 案件）
  "fold-search.maxResults": 5000
}
```

### 配置说明

| 配置项 | 推荐值 | 说明 |
|--------|--------|------|
| `followSymlinks` | `true` | 必须启用才能索引 cases 符号链接 |
| `maxDepth` | `2` | 只索引案件文件夹，不索引子文件夹 |
| `includeFiles` | `false` | 只搜索文件夹，性能更好 |
| `maxResults` | `5000` | 足够容纳所有案件文件夹 |

---

## 📊 性能指标

使用推荐配置，针对 1717 个案件文件夹：

| 指标 | 数值 |
|------|------|
| 初始扫描时间 | 6ms |
| 索引项目数 | 1722 个（1715 案件 + 7 其他） |
| 缓存搜索时间 | < 50ms |
| 内存使用 | < 10MB |

---

## 📁 项目文件说明

### 核心文件
- `folder-search-symlink-1.0.1.vsix` - **最终安装包**
- `package.json` - 插件配置文件
- `src/` - 源代码目录

### 文档文件
- `README.md` - 英文说明文档
- `README.zh-CN.md` - 中文说明文档
- `PUBLISHER_GUIDE.md` - 发布者配置指南
- `FINAL_SETUP.md` - 本文件（最终安装配置指南）
- `FINAL_INSTALL.md` - 之前的安装指南
- `SOLUTION.md` - 问题解决方案文档

### 测试文件
- `test-*.js` - 各种测试脚本
- `diagnose.js` - 诊断脚本
- `src/test/` - 单元测试

---

## ✅ 验证安装

安装后，验证插件是否正常工作：

### 1. 检查扩展已安装
```
1. 打开扩展面板（Cmd+Shift+X）
2. 搜索 "folder-search"
3. 应该看到 "Folder Search with Symlink Support"
4. 状态显示为"已启用"
```

### 2. 测试搜索功能
```
1. 打开包含 cases 符号链接的项目
2. 按 Cmd+Shift+P
3. 输入 "Search Folders"
4. 输入 "C2CAR" 测试搜索
5. 应该能看到案件文件夹列表
```

### 3. 验证性能
```
1. 首次搜索应该很快（< 100ms）
2. 后续搜索应该是即时的
3. 只显示案件文件夹，不显示子文件夹
```

---

## 🎯 下一步

### 如果只是本地使用
✅ 已完成！直接使用即可

### 如果要发布到 Marketplace
1. 阅读 `PUBLISHER_GUIDE.md`
2. 修改 `package.json` 中的 `publisher` 和 `repository`
3. 创建 Visual Studio Marketplace 账号
4. 运行 `vsce publish`

### 如果要分享给团队
1. 分享 `folder-search-symlink-1.0.1.vsix` 文件
2. 分享 `README.zh-CN.md` 使用说明
3. 团队成员通过 "Install from VSIX" 安装

---

## 📞 问题排查

### 问题：搜索不到某些文件夹
**解决方案**：
1. 检查 `maxDepth` 设置（推荐 2）
2. 检查文件夹名称是否在 `excludePatterns` 中
3. 尝试刷新缓存

### 问题：符号链接未被跟踪
**解决方案**：
1. 确认 `followSymlinks` 设置为 `true`
2. 检查符号链接是否有效（不是损坏的链接）
3. 重启 VS Code

### 问题：性能慢
**解决方案**：
1. 减少 `maxDepth`（推荐 2）
2. 禁用 `includeFiles`（设为 false）
3. 增加更多排除模式到 `excludePatterns`

---

## 🎉 完成！

现在你可以：
- ✅ 快速搜索 1717 个案件文件夹
- ✅ 享受 6ms 的极速扫描
- ✅ 使用符号链接无缝工作
- ✅ 自定义配置以满足需求

**祝使用愉快！🚀**

---

## 📝 版本历史

- **v1.0.1** (当前版本)
  - 版本号同步
  - 移除不必要的警告
  - 完善文档（中英文）
  - 优化打包

- **v1.0.0**
  - 深度控制优化
  - 性能大幅提升（326ms → 6ms）

- **v0.0.2**
  - 增加 maxResults 限制

- **v0.0.1**
  - 初始版本
