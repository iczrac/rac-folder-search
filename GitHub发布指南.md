# 📦 发布到 GitHub 指南

## 🎯 发布流程概览

```
1. 创建 GitHub 仓库
2. 初始化 Git 仓库
3. 添加 .gitignore
4. 提交代码
5. 推送到 GitHub
6. 创建 Release 发布
```

---

## 📝 步骤 1：创建 GitHub 仓库

### 在 GitHub 网站上创建

1. **访问 GitHub**
   - 打开 https://github.com/new
   - 登录你的 GitHub 账号

2. **填写仓库信息**
   ```
   Repository name: rac-folder-search
   Description: Fast folder search with symlink support for VS Code
   Public/Private: 选择 Public（公开）
   
   ❌ 不要勾选 "Add a README file"
   ❌ 不要勾选 "Add .gitignore"
   ❌ 不要勾选 "Choose a license"
   ```

3. **创建仓库**
   - 点击 "Create repository" 按钮
   - 记下仓库地址（例如：`https://github.com/你的用户名/rac-folder-search.git`）

---

## 📝 步骤 2：初始化本地 Git 仓库

在项目目录下执行以下命令：

```bash
# 1. 初始化 Git 仓库
git init

# 2. 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/你的用户名/rac-folder-search.git

# 3. 验证远程仓库
git remote -v
```

---

## 📝 步骤 3：配置 .gitignore

创建 `.gitignore` 文件（如果还没有）：

```bash
# 查看当前 .gitignore
cat .gitignore
```

确保包含以下内容：

```
# 编译输出
out/
dist/

# 依赖
node_modules/

# 测试
.vscode-test/

# 环境变量
.env
.env.local

# 操作系统
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# 日志
*.log
npm-debug.log*

# 临时文件
*.tmp
*.temp

# 测试工作区
test-workspace/cases
test-workspace/symlink-folder

# 旧版本的 vsix 文件（可选）
folder-search-symlink-*.vsix

# 保留最新版本
!rac-folder-search-1.0.2.vsix
```

---

## 📝 步骤 4：提交代码

```bash
# 1. 查看当前状态
git status

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Initial commit: RAC Folder Search v1.0.2

- Fast folder search with symlink support
- Keyboard shortcut: Cmd+Alt+F / Ctrl+Alt+F
- Optimized for 1700+ folders (6ms scan time)
- Full Chinese and English documentation"

# 4. 查看提交历史
git log --oneline
```

---

## 📝 步骤 5：推送到 GitHub

```bash
# 1. 设置默认分支为 main
git branch -M main

# 2. 推送到 GitHub
git push -u origin main

# 如果遇到认证问题，可能需要使用 Personal Access Token
# 参考下面的"认证配置"部分
```

### 认证配置（如果需要）

如果推送时要求输入密码，需要使用 Personal Access Token：

1. **创建 Token**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 点击 "Generate token"
   - **复制 token**（只显示一次！）

2. **使用 Token 推送**
   ```bash
   # 方法 1：在推送时输入
   git push -u origin main
   # Username: 你的GitHub用户名
   # Password: 粘贴你的 Personal Access Token
   
   # 方法 2：在 URL 中包含 token
   git remote set-url origin https://你的token@github.com/你的用户名/rac-folder-search.git
   git push -u origin main
   ```

---

## 📝 步骤 6：创建 Release 发布

### 在 GitHub 网站上创建 Release

1. **访问仓库的 Releases 页面**
   - 打开你的仓库：`https://github.com/你的用户名/rac-folder-search`
   - 点击右侧的 "Releases"
   - 点击 "Create a new release"

2. **填写 Release 信息**
   ```
   Tag version: v1.0.2
   Release title: RAC Folder Search v1.0.2
   
   Description:
   ```

   **描述内容**（复制下面的内容）：

   ```markdown
   ## 🎉 RAC Folder Search v1.0.2
   
   Fast folder and file search with full symbolic link support for VS Code.
   
   ### ✨ Features
   
   - 🔍 **Fast Search**: 6ms scan time for 1700+ folders
   - ⌨️ **Keyboard Shortcut**: `Cmd+Alt+F` (Mac) / `Ctrl+Alt+F` (Windows/Linux)
   - 🔗 **Symlink Support**: Full symbolic link support with circular reference detection
   - 📊 **Smart Sorting**: Exact match, prefix match, and intelligent ranking
   - 🚀 **Caching**: Instant subsequent searches (< 50ms)
   - ⚙️ **Configurable**: Depth limit, exclude patterns, and more
   
   ### 📦 Installation
   
   1. Download `rac-folder-search-1.0.2.vsix`
   2. Open VS Code
   3. Press `Cmd+Shift+X` to open Extensions panel
   4. Click `...` → "Install from VSIX..."
   5. Select the downloaded `.vsix` file
   
   ### ⌨️ Usage
   
   Press `Cmd+Alt+F` (Mac) or `Ctrl+Alt+F` (Windows/Linux) to open folder search.
   
   ### 📚 Documentation
   
   - [中文文档](README.zh-CN.md)
   - [快速开始](快速开始.md)
   - [快捷键说明](快捷键说明.md)
   
   ### 🔧 Configuration
   
   ```json
   {
     "fold-search.followSymlinks": true,
     "fold-search.maxDepth": 2,
     "fold-search.includeFiles": false,
     "fold-search.maxResults": 5000
   }
   ```
   
   ### 📊 Performance
   
   - Initial scan: 6ms (1700+ folders)
   - Cached search: < 50ms
   - Memory usage: < 10MB
   
   ### 🆕 What's New in v1.0.2
   
   - Renamed to "RAC Folder Search"
   - Added keyboard shortcut: `Cmd+Alt+F` / `Ctrl+Alt+F`
   - Updated documentation
   
   ### 📝 Requirements
   
   - VS Code 1.75.0 or higher
   ```

3. **上传 .vsix 文件**
   - 在 "Attach binaries" 区域
   - 拖放或选择 `rac-folder-search-1.0.2.vsix` 文件

4. **发布**
   - 勾选 "Set as the latest release"
   - 点击 "Publish release"

---

## 📝 步骤 7：更新 package.json 中的仓库地址

```bash
# 编辑 package.json，更新 repository.url
# 将 "your-username" 替换为你的 GitHub 用户名
```

在 `package.json` 中：

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/你的GitHub用户名/rac-folder-search"
  }
}
```

然后提交更新：

```bash
git add package.json
git commit -m "Update repository URL"
git push
```

---

## 🎯 完整命令清单

将以下命令复制到终端执行（记得替换你的 GitHub 用户名）：

```bash
# 1. 初始化 Git
git init

# 2. 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/rac-folder-search.git

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "Initial commit: RAC Folder Search v1.0.2"

# 5. 设置主分支
git branch -M main

# 6. 推送到 GitHub
git push -u origin main
```

---

## 📚 创建完善的 README

为了让 GitHub 仓库更专业，建议创建一个英文 README：

```bash
# 复制中文 README 为英文版本
cp README.zh-CN.md README.md
# 然后编辑 README.md 为英文内容
```

或者使用现有的 `README.md`（已经是英文）。

---

## 🎨 可选：添加徽章（Badges）

在 README.md 顶部添加徽章：

```markdown
# RAC Folder Search

[![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)](https://github.com/你的用户名/rac-folder-search/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.75.0+-007ACC.svg)](https://code.visualstudio.com/)

Fast folder and file search with full symbolic link support for VS Code.
```

---

## 📝 后续更新流程

当你更新插件后，使用以下流程发布新版本：

```bash
# 1. 修改代码并测试

# 2. 更新版本号（在 package.json 中）
# "version": "1.0.3"

# 3. 重新打包
npm run compile
npx vsce package

# 4. 提交更改
git add .
git commit -m "Release v1.0.3: 描述更新内容"
git push

# 5. 创建新的 Git tag
git tag v1.0.3
git push origin v1.0.3

# 6. 在 GitHub 上创建新的 Release
# 上传新的 .vsix 文件
```

---

## ✅ 验证发布

发布后，验证以下内容：

1. **仓库可访问**
   - 访问 `https://github.com/你的用户名/rac-folder-search`
   - 确认代码已上传

2. **Release 可下载**
   - 访问 `https://github.com/你的用户名/rac-folder-search/releases`
   - 确认 v1.0.2 Release 存在
   - 确认 .vsix 文件可下载

3. **README 显示正常**
   - 确认 README.md 在仓库首页正确显示
   - 确认链接和图片正常

---

## 🎉 完成！

现在你的插件已经发布到 GitHub，其他人可以：

1. **访问仓库**：`https://github.com/你的用户名/rac-folder-search`
2. **下载 Release**：从 Releases 页面下载 .vsix 文件
3. **查看文档**：阅读 README 和其他文档
4. **提交 Issue**：报告问题或建议
5. **贡献代码**：Fork 仓库并提交 PR

---

## 📞 常见问题

### Q: 推送时提示 "Permission denied"
**A**: 需要配置 SSH 密钥或使用 Personal Access Token（参考上面的"认证配置"）

### Q: 如何删除错误的提交？
**A**: 
```bash
# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃更改）
git reset --hard HEAD~1
```

### Q: 如何修改已推送的提交信息？
**A**:
```bash
# 修改最后一次提交
git commit --amend -m "新的提交信息"
git push --force
```

### Q: .gitignore 不生效？
**A**:
```bash
# 清除 Git 缓存
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
```

---

## 📚 相关资源

- [GitHub 文档](https://docs.github.com/)
- [Git 教程](https://git-scm.com/book/zh/v2)
- [VS Code 扩展发布指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

---

**祝发布顺利！🚀**
