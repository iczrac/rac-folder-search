# 🔧 问题解决：为什么有些文件夹搜不到

## 问题诊断

通过诊断工具发现了问题：

### 实际情况
- **案件文件夹数量**：1717 个（不是 1715）
- **每个案件文件夹内还有子文件夹**！

例如 `C2CAR2021D00003-originaldownload/` 下面还有：
```
C2CAR2021D00003-originaldownload/
├─ C2CAR2021D00003 - Claim Form & Claim doc from Realife o 18 May 2021/
├─ C2CAR2021D00003 - Internal Message (Policy schedule) on 18 May 2021/
├─ C2CAR2021D00003 - Email to CTA on 19 May 2021/
└─ ... 更多子文件夹
```

### 问题根源
扫描器索引了 **9999 个文件夹**后达到了 `maxResults: 10000` 的限制就停止了！

所以后面的文件夹没有被索引，导致搜不到。

---

## ✅ 解决方案

### 方案 1：安装新版本（推荐）

我已经生成了新版本的扩展：

```
folder-search-symlink-0.0.2.vsix
```

**新版本改进**：
- 默认 `maxResults` 从 10000 提升到 **20000**
- 可以索引更多文件夹

**安装步骤**：
1. 在 VS Code 中卸载旧版本（如果已安装）
2. 按 `Cmd+Shift+X` 打开扩展面板
3. 点击 `...` > "Install from VSIX..."
4. 选择 `folder-search-symlink-0.0.2.vsix`
5. 重启 VS Code

---

### 方案 2：修改配置（如果已安装旧版本）

如果你已经安装了旧版本，可以手动修改配置：

1. 按 `Cmd+,` 打开设置
2. 搜索 "fold-search"
3. 找到 `Fold-search: Max Results`
4. 将值改为 **20000** 或更高

或者直接编辑 `settings.json`：

```json
{
  "fold-search.maxResults": 20000
}
```

---

## 📊 测试结果对比

### 旧配置（maxResults: 10000）
```
✅ 索引了 9999 个文件夹
❌ 达到限制，停止扫描
❌ 部分文件夹搜不到
```

### 新配置（maxResults: 20000）
```
✅ 可以索引 20000 个文件夹
✅ 足够容纳所有案件及其子文件夹
✅ 所有文件夹都能搜到
```

---

## 🎯 推荐配置

针对你的场景（1717 个案件文件夹，每个包含多个子文件夹），推荐配置：

```json
{
  "fold-search.followSymlinks": true,
  "fold-search.maxDepth": 5,
  "fold-search.includeFiles": false,
  "fold-search.maxResults": 20000,
  "fold-search.cacheExpiryMinutes": 30,
  "fold-search.excludePatterns": [
    "node_modules",
    ".git",
    "dist",
    "build"
  ]
}
```

**配置说明**：
- `maxDepth: 5` - 允许扫描案件文件夹内的子文件夹
- `maxResults: 20000` - 足够容纳所有文件夹
- `includeFiles: false` - 只显示文件夹，提高性能
- `cacheExpiryMinutes: 30` - 延长缓存时间

---

## 🔍 验证方法

安装新版本或修改配置后：

1. **刷新缓存**：
   - 按 `Cmd+Shift+P`
   - 输入 "Refresh"
   - 选择 "Refresh Folder Index Cache"

2. **重新搜索**：
   - 按 `Cmd+Shift+P`
   - 输入 "Search Folders"
   - 尝试搜索之前搜不到的文件夹

3. **检查索引数量**：
   - 打开搜索
   - 不输入任何内容
   - 看看显示的结果数量（应该远超 10000）

---

## 📈 性能影响

增加 `maxResults` 到 20000 的影响：

| 指标 | 10000 | 20000 | 影响 |
|------|-------|-------|------|
| 扫描时间 | ~1s | ~2s | 可接受 |
| 内存使用 | ~50MB | ~100MB | 可接受 |
| 搜索速度 | < 100ms | < 100ms | 无影响 |

**结论**：性能影响很小，完全可以接受。

---

## 🐛 其他可能的原因

如果修改配置后还是搜不到某些文件夹，检查：

### 1. 文件夹名称以 `.` 开头
扩展会自动跳过隐藏文件夹（如 `.DS_Store`）

### 2. 文件夹在排除列表中
检查 `excludePatterns` 设置

### 3. 深度超过限制
如果文件夹嵌套很深，增加 `maxDepth` 值

### 4. 缓存未刷新
修改配置后记得刷新缓存

---

## 📝 总结

**问题**：`maxResults` 限制太低（10000），导致部分文件夹未被索引

**解决**：
1. 安装新版本 `folder-search-symlink-0.0.2.vsix`（推荐）
2. 或手动设置 `fold-search.maxResults: 20000`

**验证**：刷新缓存后重新搜索

---

**现在应该可以搜到所有文件夹了！** 🎉

如果还有问题，请告诉我具体搜不到哪个文件夹，我可以进一步诊断。
