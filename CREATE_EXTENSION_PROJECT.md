# 快速创建扩展项目指南

## 方式 1：使用 Yeoman 生成器（推荐）

```bash
# 1. 安装工具
npm install -g yo generator-code

# 2. 创建项目
cd ~
yo code

# 在交互式界面中选择：
# ? What type of extension do you want to create? New Extension (TypeScript)
# ? What's the name of your extension? folder-search-symlink
# ? What's the identifier of your extension? folder-search-symlink
# ? What's the description of your extension? 支持符号链接的文件夹搜索插件
# ? Initialize a git repository? Yes
# ? Which bundler to use? webpack
# ? Which package manager to use? npm

# 3. 进入项目
cd folder-search-symlink

# 4. 安装依赖
npm install
```

## 方式 2：手动创建项目

```bash
# 1. 创建项目目录
mkdir ~/folder-search-symlink
cd ~/folder-search-symlink

# 2. 初始化 npm
npm init -y

# 3. 安装依赖
npm install --save-dev @types/vscode @types/node typescript
npm install --save-dev @vscode/test-electron

# 4. 创建 tsconfig.json
# 5. 创建 src/extension.ts
# 6. 创建 package.json（扩展清单）
```

## 开发流程

### 1. 编写代码
在 `src/extension.ts` 中实现功能

### 2. 调试测试
- 在 VS Code 中打开项目
- 按 F5 启动调试
- 在新窗口中测试扩展

### 3. 打包
```bash
npm install -g @vscode/vsce
vsce package
```

### 4. 安装测试
```bash
code --install-extension folder-search-symlink-0.0.1.vsix
```

## 关键文件说明

### package.json（扩展清单）
定义扩展的元数据、命令、配置等

### src/extension.ts
扩展的主入口文件，包含 `activate()` 和 `deactivate()` 函数

### tsconfig.json
TypeScript 编译配置

### .vscodeignore
打包时忽略的文件

## 下一步

1. 将 `VSCODE_EXTENSION_DEVELOPMENT_PROMPT.md` 的内容提供给 AI 助手
2. 让 AI 生成完整的项目代码
3. 在新项目中实现和测试
4. 打包并安装到你的 VS Code/Kiro 中

## 提示词使用方法

在新的 AI 对话中，直接发送：

```
我要开发一个 VS Code 扩展，请阅读以下需求文档并生成完整的项目代码：

[粘贴 VSCODE_EXTENSION_DEVELOPMENT_PROMPT.md 的全部内容]

请提供：
1. 完整的 package.json
2. 完整的 src/extension.ts（或 extension.js）
3. 其他必要的配置文件
4. 详细的使用说明
```
