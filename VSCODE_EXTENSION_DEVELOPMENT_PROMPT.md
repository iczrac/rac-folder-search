# VS Code 扩展开发提示词：支持符号链接的文件夹搜索插件

## 项目背景

我需要开发一个 VS Code 扩展，用于在快速打开面板（Cmd+P）中搜索文件夹名称，并且**必须支持符号链接（symlink）**。

现有的 `hjcupupup.fold-search` 插件无法搜索到符号链接目录中的内容，我需要创建一个改进版本。

## 项目需求

### 核心功能
1. **文件夹快速搜索**：在 Quick Pick 面板中搜索工作区内的所有文件夹
2. **符号链接支持**：能够跟随并索引符号链接指向的目录内容
3. **文件搜索**：可选地在结果中包含文件（保持与原生搜索的兼容性）
4. **智能排序**：文件夹优先，精确匹配优先，前缀匹配次之
5. **性能优化**：使用缓存机制，避免重复扫描

### 技术要求
- **平台**：VS Code Extension (基于 Node.js)
- **语言**：TypeScript 或 JavaScript
- **API**：使用 VS Code Extension API
- **文件系统**：使用 Node.js `fs` 模块，支持符号链接解析

### 关键技术点

#### 1. 符号链接处理
```javascript
// 必须使用 fs.stat() 而不是 fs.lstat()
// stat() 会跟随符号链接，lstat() 不会
const stats = await fs.promises.stat(fullPath);
const isDirectory = stats.isDirectory();

// 使用 realpathSync 解析真实路径，防止循环引用
const realPath = fs.realpathSync(dirPath);
```

#### 2. 循环引用检测
```javascript
const visited = new Set();

function scanDirectory(dirPath, ...) {
    const realPath = fs.realpathSync(dirPath);
    if (visited.has(realPath)) {
        return; // 防止无限递归
    }
    visited.add(realPath);
    // ... 继续扫描
}
```

#### 3. 深度限制
```javascript
// 防止扫描过深导致性能问题
const maxDepth = 10;

function scanDirectory(dirPath, currentDepth) {
    if (currentDepth > maxDepth) {
        return;
    }
    // ... 递归扫描子目录
}
```

## 项目结构

```
folder-search-symlink/
├── package.json          # 扩展清单
├── tsconfig.json         # TypeScript 配置（如果使用 TS）
├── src/
│   ├── extension.ts      # 主入口文件
│   ├── folderScanner.ts  # 文件夹扫描逻辑
│   └── cache.ts          # 缓存管理
├── .vscodeignore         # 打包时忽略的文件
└── README.md             # 使用说明
```

## 配置选项

在 `package.json` 的 `contributes.configuration` 中添加：

```json
{
  "fold-search.followSymlinks": {
    "type": "boolean",
    "default": true,
    "description": "是否跟随符号链接进行索引"
  },
  "fold-search.maxDepth": {
    "type": "number",
    "default": 10,
    "minimum": 1,
    "maximum": 20,
    "description": "最大扫描深度"
  },
  "fold-search.includeFiles": {
    "type": "boolean",
    "default": true,
    "description": "在搜索结果中包含文件"
  },
  "fold-search.cacheExpiryMinutes": {
    "type": "number",
    "default": 10,
    "description": "缓存过期时间（分钟）"
  },
  "fold-search.excludePatterns": {
    "type": "array",
    "default": ["node_modules", ".git", "dist", "build", "__pycache__"],
    "description": "要排除的目录名称"
  },
  "fold-search.maxResults": {
    "type": "number",
    "default": 10000,
    "description": "最大索引项目数"
  }
}
```

## 命令定义

```json
{
  "commands": [
    {
      "command": "folder-search.search",
      "title": "Search Folders (with Symlink Support)",
      "category": "Folder Search"
    },
    {
      "command": "folder-search.refreshCache",
      "title": "Refresh Folder Index Cache",
      "category": "Folder Search"
    }
  ]
}
```

## 核心实现逻辑

### 1. 扫描算法伪代码

```
function scanDirectory(dirPath, relativePath, results, visited, config, currentDepth):
    // 深度检查
    if currentDepth > config.maxDepth:
        return
    
    // 循环引用检查
    realPath = fs.realpathSync(dirPath)
    if visited.has(realPath):
        return
    visited.add(realPath)
    
    // 读取目录
    entries = fs.readdir(dirPath, { withFileTypes: true })
    
    for each entry in entries:
        // 跳过隐藏文件
        if entry.name.startsWith('.'):
            continue
        
        // 跳过排除目录
        if entry.name in config.excludePatterns:
            continue
        
        fullPath = path.join(dirPath, entry.name)
        
        // 处理符号链接
        isDirectory = entry.isDirectory()
        isSymlink = entry.isSymbolicLink()
        
        if isSymlink and config.followSymlinks:
            stats = fs.stat(fullPath)  // 注意：使用 stat 而不是 lstat
            isDirectory = stats.isDirectory()
        
        if isDirectory:
            // 添加到结果
            results.push({
                label: "$(folder) " + entry.name + (isSymlink ? " 🔗" : ""),
                description: relativePath,
                fsPath: fullPath,
                isFolder: true
            })
            
            // 递归扫描
            scanDirectory(fullPath, newRelativePath, results, visited, config, currentDepth + 1)
        
        else if config.includeFiles:
            results.push({
                label: "$(file) " + entry.name,
                description: relativePath,
                fsPath: fullPath,
                isFolder: false
            })
        
        // 限制结果数量
        if results.length >= config.maxResults:
            return
```

### 2. 搜索过滤逻辑

```javascript
function filterResults(cache, query) {
    const filtered = cache.filter(item => {
        const name = path.basename(item.fsPath).toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const q = query.toLowerCase();
        return name.includes(q) || desc.includes(q);
    });
    
    // 排序优先级
    filtered.sort((a, b) => {
        // 1. 文件夹优先
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        
        const aName = path.basename(a.fsPath).toLowerCase();
        const bName = path.basename(b.fsPath).toLowerCase();
        const q = query.toLowerCase();
        
        // 2. 精确匹配优先
        const aExact = aName === q;
        const bExact = bName === q;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // 3. 前缀匹配优先
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // 4. 名称长度（短的优先）
        return aName.length - bName.length;
    });
    
    return filtered.slice(0, 100); // 限制显示数量
}
```

### 3. 缓存管理

```javascript
class CacheManager {
    constructor() {
        this.cache = [];
        this.cacheTime = 0;
        this.isBuilding = false;
    }
    
    isValid(expiryMinutes) {
        const expiryMs = expiryMinutes * 60 * 1000;
        return this.cache.length > 0 && 
               (Date.now() - this.cacheTime) < expiryMs;
    }
    
    async getOrBuild(builder, expiryMinutes) {
        if (this.isValid(expiryMinutes)) {
            return this.cache;
        }
        
        if (this.isBuilding) {
            // 等待正在进行的构建
            await this.buildPromise;
            return this.cache;
        }
        
        this.isBuilding = true;
        this.buildPromise = builder();
        
        try {
            this.cache = await this.buildPromise;
            this.cacheTime = Date.now();
            return this.cache;
        } finally {
            this.isBuilding = false;
            this.buildPromise = null;
        }
    }
    
    clear() {
        this.cache = [];
        this.cacheTime = 0;
    }
}
```

## 测试场景

### 1. 基本功能测试
- [ ] 能够搜索普通文件夹
- [ ] 能够搜索普通文件
- [ ] 搜索结果正确排序

### 2. 符号链接测试
- [ ] 能够索引符号链接指向的目录
- [ ] 符号链接的文件夹显示 🔗 标识
- [ ] 能够搜索到符号链接目录中的子文件夹
- [ ] 能够搜索到符号链接目录中的文件

### 3. 边界情况测试
- [ ] 循环符号链接不会导致无限递归
- [ ] 深度限制正常工作
- [ ] 损坏的符号链接不会导致崩溃
- [ ] 权限不足的目录被正确跳过

### 4. 性能测试
- [ ] 大型项目（10000+ 文件）索引时间 < 5秒
- [ ] 缓存命中时搜索响应 < 100ms
- [ ] 内存使用合理（< 100MB）

## 开发步骤

1. **初始化项目**
   ```bash
   npm install -g yo generator-code
   yo code
   # 选择 New Extension (TypeScript)
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **实现核心功能**
   - 实现文件夹扫描器（支持符号链接）
   - 实现缓存管理器
   - 实现 Quick Pick 界面
   - 添加配置选项

4. **测试**
   - 按 F5 启动调试
   - 在测试窗口中验证功能
   - 测试符号链接场景

5. **打包发布**
   ```bash
   npm install -g @vscode/vsce
   vsce package
   # 生成 .vsix 文件
   ```

6. **本地安装**
   ```bash
   code --install-extension folder-search-symlink-0.0.1.vsix
   ```

## 特殊注意事项

### macOS 符号链接
- macOS 上符号链接权限可能受限
- 需要处理 `EACCES` 错误
- 使用 try-catch 包裹所有文件系统操作

### 性能优化
- 使用异步操作避免阻塞 UI
- 实现增量索引（监听文件系统变化）
- 考虑使用 Worker Threads 处理大型目录

### 用户体验
- 显示加载进度
- 提供刷新缓存的命令
- 在设置中提供清晰的配置说明
- 符号链接用图标标识

## 参考资源

- VS Code Extension API: https://code.visualstudio.com/api
- Node.js fs 模块: https://nodejs.org/api/fs.html
- 符号链接处理: https://nodejs.org/api/fs.html#fssymlinkpath-target-type-callback

## 我的具体场景

我有一个项目，其中 `cases` 目录是一个符号链接：
```bash
cases -> /Users/administrator/Documents/ClaimsTeamShareFiles/ClaimCaseDownloads
```

该目录包含大量案件文件夹（约 1700+ 个），格式如：
- `C2CAR2021D00003-originaldownload/`
- `C2CAR2023D00001-originaldownload/`
- `23695-originaldownload/`

我需要能够快速搜索这些文件夹名称，例如输入 "C2CAR2021" 就能找到所有匹配的案件文件夹。

---

## 开始开发

请基于以上需求，创建一个完整的 VS Code 扩展项目，确保：
1. 完整支持符号链接
2. 性能优良（能处理 1700+ 文件夹）
3. 用户体验友好
4. 代码结构清晰，易于维护

请提供完整的项目文件和详细的实现说明。
