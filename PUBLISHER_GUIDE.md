# 📝 插件发布配置指南

## 🔧 需要填写的信息位置

### 1. package.json - 插件基本信息

打开 `package.json` 文件，找到以下字段并填写你的信息：

```json
{
  "name": "folder-search-symlink",  // ⚠️ 插件唯一标识符（小写，连字符分隔）
  "displayName": "Folder Search with Symlink Support",  // ✏️ 显示名称（可修改）
  "description": "Fast folder and file search with full symbolic link support for VS Code",  // ✏️ 简短描述
  "version": "1.0.1",  // ✅ 已更新到最新版本
  "publisher": "your-publisher-name",  // ⚠️ 必须填写：你的发布者名称
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/folder-search-symlink"  // ⚠️ 必须填写：你的 GitHub 仓库地址
  }
}
```

### 2. 发布者名称（Publisher Name）

**在哪里获取/创建发布者名称：**

1. **访问 Visual Studio Marketplace**
   - 网址：https://marketplace.visualstudio.com/manage
   - 使用 Microsoft 账号或 GitHub 账号登录

2. **创建发布者**
   - 点击 "Create publisher"
   - 填写发布者 ID（这就是你的 `publisher` 名称）
   - 填写显示名称和其他信息

3. **更新 package.json**
   ```json
   "publisher": "你的发布者ID"
   ```

### 3. GitHub 仓库地址

**如果你有 GitHub 仓库：**

```json
"repository": {
  "type": "git",
  "url": "https://github.com/你的用户名/folder-search-symlink"
}
```

**如果没有 GitHub 仓库：**

可以暂时移除这个字段，但建议创建一个：
1. 访问 https://github.com/new
2. 创建新仓库 `folder-search-symlink`
3. 将代码推送到仓库
4. 更新 package.json 中的 URL

---

## 📦 发布到 VS Code Marketplace

### 前置要求

1. **安装 vsce（VS Code Extension Manager）**
   ```bash
   npm install -g @vscode/vsce
   ```

2. **创建 Personal Access Token (PAT)**
   - 访问：https://dev.azure.com/
   - 创建组织（如果没有）
   - 生成 PAT：User Settings → Personal Access Tokens
   - 权限选择：**Marketplace (Manage)**
   - 保存生成的 token

### 发布步骤

1. **登录到发布者账号**
   ```bash
   vsce login 你的发布者名称
   ```
   输入刚才创建的 PAT

2. **打包扩展**
   ```bash
   vsce package
   ```
   这会生成 `.vsix` 文件

3. **发布到 Marketplace**
   ```bash
   vsce publish
   ```
   或者指定版本号：
   ```bash
   vsce publish 1.0.1
   ```

### 更新版本

```bash
# 补丁版本（1.0.1 -> 1.0.2）
vsce publish patch

# 次要版本（1.0.1 -> 1.1.0）
vsce publish minor

# 主要版本（1.0.1 -> 2.0.0）
vsce publish major
```

---

## 🎨 可选：添加图标和截图

### 1. 添加扩展图标

1. 创建一个 128x128 的 PNG 图标
2. 保存为 `icon.png` 在项目根目录
3. 在 `package.json` 中添加：
   ```json
   "icon": "icon.png"
   ```

### 2. 添加使用截图

1. 创建 `images` 文件夹
2. 添加截图（建议 PNG 格式）
3. 在 `README.md` 中引用：
   ```markdown
   ![搜索演示](images/search-demo.png)
   ```

---

## 📋 发布前检查清单

- [ ] 更新 `package.json` 中的 `publisher` 字段
- [ ] 更新 `package.json` 中的 `repository.url` 字段
- [ ] 确认版本号为 `1.0.1`
- [ ] 运行 `npm run compile` 确保编译成功
- [ ] 运行 `npm run lint` 确保没有 lint 错误
- [ ] 测试扩展功能正常
- [ ] 阅读 README.md 确保文档完整
- [ ] （可选）添加扩展图标
- [ ] （可选）添加使用截图

---

## 🚀 快速发布命令

```bash
# 1. 编译代码
npm run compile

# 2. 打包扩展（本地安装用）
vsce package

# 3. 发布到 Marketplace（需要先配置 publisher）
vsce publish
```

---

## 📝 当前需要修改的字段

在 `package.json` 中，请修改以下两个字段：

```json
"publisher": "your-publisher-name",  // ⚠️ 改为你的发布者名称
"repository": {
  "type": "git",
  "url": "https://github.com/your-username/folder-search-symlink"  // ⚠️ 改为你的仓库地址
}
```

---

## 💡 提示

1. **仅本地使用**：如果只想在本地使用，不需要发布到 Marketplace，直接使用生成的 `.vsix` 文件安装即可

2. **私有发布**：如果想在团队内部使用，可以：
   - 分享 `.vsix` 文件
   - 或使用私有 Marketplace（需要 Azure DevOps）

3. **版本管理**：每次发布新版本前，记得更新 `package.json` 中的 `version` 字段

---

## 📞 获取帮助

- VS Code 扩展开发文档：https://code.visualstudio.com/api
- vsce 文档：https://github.com/microsoft/vscode-vsce
- Marketplace 管理：https://marketplace.visualstudio.com/manage
