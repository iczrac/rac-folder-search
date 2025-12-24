# Requirements Document

## Introduction

本文档定义了一个 VS Code 扩展的需求，该扩展用于在快速打开面板中搜索文件夹名称，并且必须支持符号链接（symlink）。该扩展旨在解决现有 `hjcupupup.fold-search` 插件无法搜索符号链接目录内容的问题。

## Glossary

- **Extension**: VS Code 扩展程序
- **Quick_Pick**: VS Code 的快速选择面板（通过 Cmd+P 或 Ctrl+P 触发）
- **Symlink**: 符号链接，指向另一个文件或目录的引用
- **Scanner**: 文件系统扫描器，负责遍历目录结构
- **Cache_Manager**: 缓存管理器，负责存储和管理扫描结果
- **Workspace**: VS Code 工作区，包含用户打开的项目文件夹
- **Real_Path**: 符号链接解析后的真实路径
- **Circular_Reference**: 循环引用，符号链接形成的循环结构

## Requirements

### Requirement 1: 文件夹快速搜索

**User Story:** 作为开发者，我希望能够快速搜索工作区内的所有文件夹，以便快速导航到目标目录。

#### Acceptance Criteria

1. WHEN 用户触发搜索命令 THEN THE Extension SHALL 显示 Quick_Pick 面板
2. WHEN 用户在 Quick_Pick 中输入查询文本 THEN THE Extension SHALL 过滤并显示匹配的文件夹
3. WHEN 用户选择一个文件夹 THEN THE Extension SHALL 在文件资源管理器中定位该文件夹
4. THE Extension SHALL 在搜索结果中显示文件夹的相对路径作为描述信息
5. WHEN 显示搜索结果 THEN THE Extension SHALL 使用文件夹图标标识目录项

### Requirement 2: 符号链接支持

**User Story:** 作为开发者，我希望扩展能够跟随并索引符号链接指向的目录内容，以便搜索到符号链接目录中的文件夹。

#### Acceptance Criteria

1. WHEN Scanner 遇到符号链接目录 THEN THE Scanner SHALL 解析符号链接并索引其指向的真实目录
2. WHEN 索引符号链接目录 THEN THE Scanner SHALL 使用 `fs.stat()` 而不是 `fs.lstat()` 来跟随符号链接
3. WHEN 显示符号链接目录 THEN THE Extension SHALL 在标签上添加 🔗 标识
4. WHEN 符号链接指向的目录包含子目录 THEN THE Scanner SHALL 递归索引这些子目录
5. WHERE 配置启用符号链接支持 THE Scanner SHALL 跟随符号链接进行索引

### Requirement 3: 循环引用防护

**User Story:** 作为开发者，我希望扩展能够处理符号链接的循环引用，以便避免无限递归和程序崩溃。

#### Acceptance Criteria

1. WHEN Scanner 遇到目录 THEN THE Scanner SHALL 使用 `fs.realpathSync()` 解析真实路径
2. WHEN Scanner 访问目录 THEN THE Scanner SHALL 记录已访问的 Real_Path 到集合中
3. IF Real_Path 已存在于已访问集合中 THEN THE Scanner SHALL 跳过该目录不再递归
4. WHEN 检测到 Circular_Reference THEN THE Scanner SHALL 继续处理其他目录而不抛出错误

### Requirement 4: 深度限制

**User Story:** 作为开发者，我希望扩展能够限制扫描深度，以便避免扫描过深导致性能问题。

#### Acceptance Criteria

1. THE Scanner SHALL 支持配置最大扫描深度参数
2. WHEN Scanner 递归扫描目录 THEN THE Scanner SHALL 跟踪当前深度
3. IF 当前深度超过最大深度限制 THEN THE Scanner SHALL 停止递归该分支
4. THE Extension SHALL 提供默认最大深度值为 10
5. WHERE 用户配置最大深度 THE Scanner SHALL 使用用户配置的值

### Requirement 5: 智能排序

**User Story:** 作为开发者，我希望搜索结果能够智能排序，以便最相关的结果显示在前面。

#### Acceptance Criteria

1. WHEN 显示搜索结果 THEN THE Extension SHALL 将文件夹排在文件之前
2. WHEN 比较搜索结果 THEN THE Extension SHALL 将精确匹配排在前面
3. WHEN 比较搜索结果 THEN THE Extension SHALL 将前缀匹配排在包含匹配之前
4. WHEN 匹配程度相同 THEN THE Extension SHALL 按名称长度排序（短的优先）
5. THE Extension SHALL 对搜索结果应用所有排序规则的组合

### Requirement 6: 缓存机制

**User Story:** 作为开发者，我希望扩展能够缓存扫描结果，以便避免重复扫描提高响应速度。

#### Acceptance Criteria

1. THE Cache_Manager SHALL 存储扫描结果和扫描时间戳
2. WHEN 用户触发搜索 THEN THE Cache_Manager SHALL 检查缓存是否有效
3. IF 缓存未过期 THEN THE Cache_Manager SHALL 返回缓存的结果
4. IF 缓存已过期或不存在 THEN THE Cache_Manager SHALL 触发新的扫描
5. THE Extension SHALL 提供默认缓存过期时间为 10 分钟
6. WHEN 多个搜索同时触发 THEN THE Cache_Manager SHALL 避免重复构建缓存
7. THE Extension SHALL 提供手动刷新缓存的命令

### Requirement 7: 文件搜索支持

**User Story:** 作为开发者，我希望能够选择在搜索结果中包含文件，以便保持与原生搜索的兼容性。

#### Acceptance Criteria

1. WHERE 配置启用文件搜索 THE Scanner SHALL 在结果中包含文件
2. WHEN 显示文件项 THEN THE Extension SHALL 使用文件图标标识
3. WHEN 用户选择文件 THEN THE Extension SHALL 在编辑器中打开该文件
4. THE Extension SHALL 提供默认配置启用文件搜索

### Requirement 8: 排除模式

**User Story:** 作为开发者，我希望能够排除特定目录，以便避免索引不必要的内容提高性能。

#### Acceptance Criteria

1. THE Extension SHALL 支持配置排除目录名称列表
2. WHEN Scanner 遇到目录 THEN THE Scanner SHALL 检查目录名是否在排除列表中
3. IF 目录名在排除列表中 THEN THE Scanner SHALL 跳过该目录不进行索引
4. THE Extension SHALL 提供默认排除列表包含 `node_modules`, `.git`, `dist`, `build`, `__pycache__`
5. WHEN Scanner 遇到隐藏文件或目录（以 `.` 开头）THEN THE Scanner SHALL 跳过该项

### Requirement 9: 性能优化

**User Story:** 作为开发者，我希望扩展能够高效处理大型项目，以便在包含大量文件的工作区中保持良好性能。

#### Acceptance Criteria

1. THE Scanner SHALL 限制最大索引项目数
2. WHEN 索引项目数达到最大限制 THEN THE Scanner SHALL 停止扫描
3. THE Extension SHALL 提供默认最大结果数为 10000
4. THE Scanner SHALL 使用异步操作避免阻塞 UI 线程
5. WHEN 显示搜索结果 THEN THE Extension SHALL 限制显示数量为 100 项

### Requirement 10: 错误处理

**User Story:** 作为开发者，我希望扩展能够优雅地处理文件系统错误，以便在遇到问题时不会崩溃。

#### Acceptance Criteria

1. WHEN Scanner 遇到文件系统错误 THEN THE Scanner SHALL 捕获错误并继续处理其他项
2. IF 符号链接损坏或无法访问 THEN THE Scanner SHALL 跳过该符号链接
3. IF 目录权限不足 THEN THE Scanner SHALL 跳过该目录并记录警告
4. WHEN 发生错误 THEN THE Extension SHALL 向用户显示友好的错误消息
5. THE Scanner SHALL 使用 try-catch 包裹所有文件系统操作

### Requirement 11: 用户配置

**User Story:** 作为开发者，我希望能够自定义扩展的行为，以便适应不同的使用场景。

#### Acceptance Criteria

1. THE Extension SHALL 提供配置选项 `fold-search.followSymlinks` 控制是否跟随符号链接
2. THE Extension SHALL 提供配置选项 `fold-search.maxDepth` 控制最大扫描深度
3. THE Extension SHALL 提供配置选项 `fold-search.includeFiles` 控制是否包含文件
4. THE Extension SHALL 提供配置选项 `fold-search.cacheExpiryMinutes` 控制缓存过期时间
5. THE Extension SHALL 提供配置选项 `fold-search.excludePatterns` 控制排除目录列表
6. THE Extension SHALL 提供配置选项 `fold-search.maxResults` 控制最大索引项目数
7. WHEN 用户修改配置 THEN THE Extension SHALL 在下次搜索时应用新配置

### Requirement 12: 命令注册

**User Story:** 作为开发者，我希望能够通过命令面板触发搜索功能，以便快速访问扩展功能。

#### Acceptance Criteria

1. THE Extension SHALL 注册命令 `folder-search.search` 用于触发搜索
2. THE Extension SHALL 注册命令 `folder-search.refreshCache` 用于刷新缓存
3. WHEN 用户执行 `folder-search.search` 命令 THEN THE Extension SHALL 显示 Quick_Pick 面板
4. WHEN 用户执行 `folder-search.refreshCache` 命令 THEN THE Cache_Manager SHALL 清除缓存并重新扫描
5. THE Extension SHALL 为命令提供清晰的标题和分类

### Requirement 13: 工作区支持

**User Story:** 作为开发者，我希望扩展能够处理多个工作区文件夹，以便在多根工作区中正常工作。

#### Acceptance Criteria

1. WHEN Workspace 包含多个文件夹 THEN THE Scanner SHALL 扫描所有工作区文件夹
2. WHEN 显示搜索结果 THEN THE Extension SHALL 在描述中包含工作区文件夹名称
3. IF Workspace 为空 THEN THE Extension SHALL 显示提示消息并退出
4. THE Scanner SHALL 为每个工作区文件夹独立跟踪已访问路径
