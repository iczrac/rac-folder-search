# 🔧 解决 Azure DevOps 登录问题

## 🚨 错误信息分析

你遇到的错误：
```
選取的使用者帳戶不存在於租用戶 'Microsoft Services' 中，因而無法存取該租用戶內的應用程式
```

这表示你的账号无法直接访问 Azure DevOps。

---

## 🎯 **最简单解决方案（推荐）**

### 直接访问 Visual Studio Marketplace 管理页面

**不需要通过 Azure DevOps！直接访问 Marketplace：**

1. **访问 Marketplace 管理页面**
   ```
   https://marketplace.visualstudio.com/manage
   ```

2. **使用任何 Microsoft 账号登录**
   - 可以是你现有的 Microsoft 账号
   - 或者创建新的 @outlook.com 账号

3. **创建发布者账号**
   - Publisher ID: `iczrac`
   - Display Name: `RaCHEN` 或 `RAC`
   - Description: `VS Code extensions for productivity`

4. **获取 Personal Access Token**
   - 在发布者页面点击 "Personal Access Tokens"
   - 或访问：https://marketplace.visualstudio.com/manage/publishers/iczrac
   - 创建新 Token，权限选择 "Marketplace (Manage)"

---

## 💡 备选解决方案

### 方案 1：创建新的 Microsoft 个人账号

如果上面的直接方法不行：

1. **创建 Microsoft 个人账号**
   - 访问：https://account.microsoft.com/
   - 创建新的 @outlook.com 或 @hotmail.com 账号

2. **用新账号重新访问 Marketplace**
   - https://marketplace.visualstudio.com/manage

### 方案 2：使用命令行工具

```bash
# 1. 安装 vsce
npm install -g @vscode/vsce

# 2. 尝试创建发布者
vsce create-publisher iczrac

# 3. 登录（会引导到正确页面）
vsce login iczrac
```

---

## 🚀 **成功后的完整流程**

### 步骤 1：获取 Personal Access Token
1. 访问：https://marketplace.visualstudio.com/manage
2. 登录并创建发布者 `iczrac`
3. 创建 Personal Access Token（权限：Marketplace > Manage）
4. **复制并保存这个 Token**

### 步骤 2：在 GitHub 添加 Secret
1. 访问你的 GitHub 仓库：https://github.com/iczrac/rac-folder-search
2. 点击 Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
4. Name: `VSCE_PAT`
5. Value: 粘贴你的 Personal Access Token
6. 点击 "Add secret"

### 步骤 3：触发自动发布
```bash
# 创建新版本标签
git tag -a "v1.0.3" -m "Release to VS Code Marketplace"
git push origin "v1.0.3"
```

### 步骤 4：等待自动发布
- GitHub Actions 会自动运行
- 编译代码 → 打包扩展 → 发布到 Marketplace
- 大约 5-10 分钟后，你的插件就会出现在 VS Code 扩展商店

---

## 🎉 发布成功后

用户就可以通过以下方式安装：

### 方法 1：VS Code 扩展商店（推荐）
1. 打开 VS Code
2. 按 `Cmd+Shift+X` 打开扩展面板
3. 搜索 "RAC Folder Search"
4. 点击安装

### 方法 2：命令行安装
```bash
code --install-extension iczrac.rac-folder-search
```

---

## 📊 发布后的好处

✅ **用户体验**
- 一键安装，无需下载 .vsix 文件
- 自动更新
- 更容易被发现

✅ **统计数据**
- 下载量统计
- 用户评分和评论
- 使用情况分析

✅ **专业形象**
- 官方扩展商店展示
- 更高的可信度

---

## 🔍 **立即行动**

**现在就试试这个链接：**
```
https://marketplace.visualstudio.com/manage
```

1. 用你的 Microsoft 账号登录
2. 创建发布者 `iczrac`
3. 获取 Personal Access Token
4. 在 GitHub 添加 Secret
5. 创建新标签触发发布

**大概 30 分钟内就能完成整个流程！** 🚀