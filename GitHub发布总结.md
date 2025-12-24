# 📦 GitHub 发布 - 完整总结

## 🎯 发布流程

```
1. 在 GitHub 创建仓库
   ↓
2. 本地初始化 Git 并推送代码
   ↓
3. 在 GitHub 创建 Release
   ↓
4. 上传 .vsix 文件
   ↓
5. 完成！
```

---

## 📝 快速开始（3 步）

### 第 1 步：创建 GitHub 仓库

访问 https://github.com/new

```
Repository name: rac-folder-search
Description: Fast folder search with symlink support for VS Code
Public ✅
不要勾选任何选项 ❌
```

### 第 2 步：推送代码

**方法 A：使用脚本（推荐）**
```bash
./发布到GitHub.sh 你的GitHub用户名
```

**方法 B：手动执行**
```bash
git init
git remote add origin https://github.com/你的用户名/rac-folder-search.git
git add .
git commit -m "Initial commit: RAC Folder Search v1.0.2"
git branch -M main
git push -u origin main
```

### 第 3 步：创建 Release

1. 访问 `https://github.com/你的用户名/rac-folder-search`
2. 点击 "Releases" → "Create a new release"
3. 填写：
   - Tag: `v1.0.2`
   - Title: `RAC Folder Search v1.0.2`
   - Description: 复制 `Release描述模板.md` 的内容
4. 上传 `rac-folder-search-1.0.2.vsix`
5. 点击 "Publish release"

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| **发布步骤.md** | 简易步骤清单 ⭐ |
| **GitHub发布指南.md** | 详细发布指南 |
| **发布到GitHub.sh** | 自动化发布脚本 |
| **Release描述模板.md** | Release 描述模板 |
| **GitHub发布总结.md** | 本文件 |

---

## 🔑 认证配置

如果推送时需要密码，使用 Personal Access Token：

1. 访问 https://github.com/settings/tokens
2. "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 复制 token
5. 推送时使用 token 作为密码

---

## ✅ 验证清单

发布后检查：

- [ ] 仓库可访问：`https://github.com/你的用户名/rac-folder-search`
- [ ] 代码已上传（查看文件列表）
- [ ] README 显示正常
- [ ] Release 已创建：`https://github.com/你的用户名/rac-folder-search/releases`
- [ ] .vsix 文件可下载
- [ ] package.json 中的 repository.url 已更新

---

## 🎯 发布后的工作

### 1. 更新 package.json

```json
{
  "repository": {
    "url": "https://github.com/你的GitHub用户名/rac-folder-search"
  }
}
```

```bash
git add package.json
git commit -m "Update repository URL"
git push
```

### 2. 分享你的项目

- 在社交媒体分享
- 在 VS Code Marketplace 发布（可选）
- 告诉你的团队

### 3. 维护项目

- 回复 Issues
- 审查 Pull Requests
- 定期更新版本

---

## 🚀 后续版本发布流程

当你更新插件后：

```bash
# 1. 修改版本号（package.json）
# "version": "1.0.3"

# 2. 重新编译和打包
npm run compile
npx vsce package

# 3. 提交更改
git add .
git commit -m "Release v1.0.3: 描述更新内容"
git push

# 4. 创建 tag
git tag v1.0.3
git push origin v1.0.3

# 5. 在 GitHub 创建新 Release
# 上传新的 .vsix 文件
```

---

## 💡 最佳实践

### 1. 版本号规范

遵循语义化版本（Semantic Versioning）：

- **主版本号**（Major）：不兼容的 API 修改
- **次版本号**（Minor）：向下兼容的功能性新增
- **修订号**（Patch）：向下兼容的问题修正

示例：
- `1.0.0` → `1.0.1`：修复 bug
- `1.0.1` → `1.1.0`：添加新功能
- `1.1.0` → `2.0.0`：重大更新

### 2. Commit 信息规范

使用清晰的 commit 信息：

```bash
# 好的示例
git commit -m "feat: Add keyboard shortcut Cmd+Alt+F"
git commit -m "fix: Fix symlink circular reference detection"
git commit -m "docs: Update Chinese documentation"

# 不好的示例
git commit -m "update"
git commit -m "fix bug"
```

### 3. Release 说明

每个 Release 应包含：
- 新功能列表
- Bug 修复列表
- 破坏性变更说明
- 升级指南（如果需要）

### 4. 文档维护

保持文档更新：
- README 与代码同步
- 更新版本历史
- 添加使用示例
- 回答常见问题

---

## 📊 项目统计

当前状态：

| 项目 | 数值 |
|------|------|
| 版本 | 1.0.2 |
| 包大小 | 43 KB |
| 源代码文件 | 7 个 |
| 文档文件 | 15+ 个 |
| 性能 | 6ms 扫描时间 |

---

## 🎉 恭喜！

你已经准备好发布到 GitHub 了！

### 下一步：

1. **立即发布**：按照 `发布步骤.md` 执行
2. **查看详情**：阅读 `GitHub发布指南.md`
3. **使用脚本**：运行 `./发布到GitHub.sh 你的用户名`

---

## 📞 需要帮助？

- 查看 `GitHub发布指南.md` 的"常见问题"部分
- 访问 GitHub 文档：https://docs.github.com/
- 查看 Git 教程：https://git-scm.com/book/zh/v2

---

**祝发布顺利！🚀**
