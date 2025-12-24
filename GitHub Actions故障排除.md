# 🔧 GitHub Actions 发布故障排除

## 🚨 当前问题分析

从你的截图看到，所有的 GitHub Actions 工作流都失败了。让我们逐步诊断和解决问题。

---

## 🔍 可能的问题原因

### 1. Personal Access Token 问题
- Token 权限不正确
- Token 已过期
- Publisher 名称不匹配

### 2. Publisher 配置问题
- package.json 中的 publisher 与 Marketplace 中创建的不一致
- Publisher 账号未正确创建

### 3. 工作流配置问题
- 条件判断错误
- 环境变量设置问题

---

## 🛠️ 解决步骤

### 步骤 1：验证 Personal Access Token

1. **检查 Token 权限**
   - 访问：https://marketplace.visualstudio.com/manage
   - 确认你的发布者账号存在
   - 检查 Personal Access Token 权限是否包含 "Marketplace (Manage)"

2. **重新创建 Token（如果需要）**
   - 删除旧的 Token
   - 创建新的 Token，确保权限正确
   - 复制新的 Token

### 步骤 2：更新 GitHub Secret

1. **访问 GitHub 仓库设置**
   ```
   https://github.com/iczrac/rac-folder-search/settings/secrets/actions
   ```

2. **更新 VSCE_PAT Secret**
   - 点击 VSCE_PAT 旁边的 "Update"
   - 粘贴新的 Personal Access Token
   - 点击 "Update secret"

### 步骤 3：确认 Publisher 名称

1. **检查 Marketplace 中的 Publisher ID**
   - 访问：https://marketplace.visualstudio.com/manage
   - 记录你的 Publisher ID（可能不是 "iczrac"）

2. **如果 Publisher ID 不同，更新 package.json**
   ```json
   {
     "publisher": "你的实际Publisher ID"
   }
   ```

### 步骤 4：运行诊断测试

1. **手动触发测试工作流**
   - 访问：https://github.com/iczrac/rac-folder-search/actions
   - 点击 "Test Publish" 工作流
   - 点击 "Run workflow"
   - 查看输出结果

2. **检查测试结果**
   - 查看是否能成功编译
   - 查看是否能创建 .vsix 文件
   - 查看 PAT 验证是否成功

---

## 🎯 快速修复方案

### 方案 1：重新创建 Publisher 和 Token

1. **访问 Marketplace 管理页面**
   ```
   https://marketplace.visualstudio.com/manage
   ```

2. **确认或创建 Publisher**
   - Publisher ID: `iczrac`（或其他你想要的名称）
   - Display Name: `RAC`

3. **创建新的 Personal Access Token**
   - 权限：Marketplace (Manage)
   - 复制 Token

4. **更新 GitHub Secret**
   - 用新 Token 更新 VSCE_PAT

### 方案 2：使用命令行测试

在本地测试发布流程：

```bash
# 1. 安装 vsce
npm install -g @vscode/vsce

# 2. 测试打包
vsce package

# 3. 测试登录
vsce login iczrac

# 4. 测试发布（干运行）
vsce publish --dry-run
```

---

## 🔍 诊断命令

### 检查当前配置
```bash
# 查看 package.json 中的 publisher
grep '"publisher"' package.json

# 查看当前版本
grep '"version"' package.json

# 检查编译是否成功
npm run compile
```

### 测试本地发布
```bash
# 安装 vsce
npm install -g @vscode/vsce

# 创建包
vsce package

# 验证 PAT（替换为你的实际 Token）
vsce verify-pat YOUR_PERSONAL_ACCESS_TOKEN
```

---

## 📋 检查清单

在重新尝试发布前，请确认：

- [ ] VS Code Marketplace 中有名为 `iczrac` 的 Publisher
- [ ] Personal Access Token 权限包含 "Marketplace (Manage)"
- [ ] GitHub Secret `VSCE_PAT` 已正确设置
- [ ] package.json 中的 `publisher` 字段与 Marketplace 中的一致
- [ ] 代码能够成功编译（`npm run compile`）
- [ ] 能够成功创建 .vsix 文件（`vsce package`）

---

## 🚀 重新发布

完成上述检查后：

1. **提交任何必要的修改**
   ```bash
   git add .
   git commit -m "Fix publisher configuration"
   git push origin main
   ```

2. **创建新的发布标签**
   ```bash
   git tag -a "v1.0.4" -m "Fix publishing issues"
   git push origin "v1.0.4"
   ```

3. **监控 GitHub Actions**
   - 访问：https://github.com/iczrac/rac-folder-search/actions
   - 查看新的 Release 工作流

---

## 🆘 如果仍然失败

1. **查看详细错误日志**
   - 在 GitHub Actions 中点击失败的工作流
   - 展开每个步骤查看具体错误信息

2. **尝试手动发布**
   ```bash
   # 本地手动发布
   vsce publish --pat YOUR_PERSONAL_ACCESS_TOKEN
   ```

3. **联系支持**
   - 如果是 Marketplace 服务问题，联系 Microsoft 支持
   - 提供具体的错误信息和 Activity ID

---

## 💡 常见错误解决

### "Invalid publisher name"
- 检查 package.json 中的 publisher 字段
- 确保与 Marketplace 中的 Publisher ID 完全一致

### "Access Denied"
- 重新创建 Personal Access Token
- 确保权限包含 "Marketplace (Manage)"

### "Request timeout"
- 稍后重试，可能是服务暂时不可用
- 检查网络连接

---

**现在先运行诊断测试工作流，然后根据结果进行相应的修复！** 🔧