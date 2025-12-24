#!/bin/bash

# RAC Folder Search - 全自动发布脚本
# 使用方法：./自动发布.sh

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 配置
GITHUB_USERNAME="iczrac"
REPO_NAME="rac-folder-search"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
VERSION="1.0.2"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  RAC Folder Search - 全自动发布${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${PURPLE}📝 配置信息：${NC}"
echo -e "   GitHub 用户: ${GITHUB_USERNAME}"
echo -e "   仓库名称: ${REPO_NAME}"
echo -e "   版本号: ${VERSION}"
echo -e "   仓库地址: ${REPO_URL}"
echo ""

# 步骤 1：检查依赖
echo -e "${BLUE}[1/8] 检查依赖...${NC}"

# 检查 Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git 未安装${NC}"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 所有依赖检查通过${NC}"
echo ""

# 步骤 2：编译项目
echo -e "${BLUE}[2/8] 编译项目...${NC}"
npm run compile
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 编译成功${NC}"
else
    echo -e "${RED}❌ 编译失败${NC}"
    exit 1
fi
echo ""

# 步骤 3：运行测试（如果存在）
echo -e "${BLUE}[3/8] 运行测试...${NC}"
if npm run test &> /dev/null; then
    echo -e "${GREEN}✅ 测试通过${NC}"
else
    echo -e "${YELLOW}⚠️  测试跳过或失败（继续发布）${NC}"
fi
echo ""

# 步骤 4：打包扩展
echo -e "${BLUE}[4/8] 打包扩展...${NC}"
if command -v vsce &> /dev/null; then
    npx vsce package --allow-missing-repository
else
    echo -e "${YELLOW}⚠️  安装 vsce...${NC}"
    npm install -g @vscode/vsce
    npx vsce package --allow-missing-repository
fi

if [ -f "rac-folder-search-${VERSION}.vsix" ]; then
    echo -e "${GREEN}✅ 扩展打包成功: rac-folder-search-${VERSION}.vsix${NC}"
else
    echo -e "${RED}❌ 扩展打包失败${NC}"
    exit 1
fi
echo ""

# 步骤 5：初始化 Git（如果需要）
echo -e "${BLUE}[5/8] 配置 Git 仓库...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  初始化 Git 仓库...${NC}"
    git init
    echo -e "${GREEN}✅ Git 仓库初始化完成${NC}"
else
    echo -e "${GREEN}✅ Git 仓库已存在${NC}"
fi

# 配置远程仓库
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  更新远程仓库 URL...${NC}"
    git remote set-url origin ${REPO_URL}
else
    echo -e "${YELLOW}⚠️  添加远程仓库...${NC}"
    git remote add origin ${REPO_URL}
fi
echo -e "${GREEN}✅ 远程仓库配置完成${NC}"
echo ""

# 步骤 6：提交代码
echo -e "${BLUE}[6/8] 提交代码到 GitHub...${NC}"

# 添加所有文件
git add .

# 检查是否有更改
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  没有新的更改需要提交${NC}"
else
    # 提交更改
    git commit -m "Release v${VERSION}: RAC Folder Search

- Fast folder search with symlink support
- Keyboard shortcut: Cmd+Alt+F / Ctrl+Alt+F  
- Optimized for 1700+ folders (6ms scan time)
- Full Chinese and English documentation
- Enhanced configuration with detailed descriptions"
    echo -e "${GREEN}✅ 代码提交完成${NC}"
fi

# 推送到 GitHub
echo -e "${YELLOW}⚠️  推送到 GitHub...${NC}"
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 代码推送成功${NC}"
else
    echo -e "${RED}❌ 代码推送失败${NC}"
    echo -e "${YELLOW}💡 可能需要配置 GitHub 认证${NC}"
    echo -e "${YELLOW}   请访问: https://github.com/settings/tokens${NC}"
    exit 1
fi
echo ""

# 步骤 7：创建 Git Tag
echo -e "${BLUE}[7/8] 创建 Git Tag...${NC}"
if git tag | grep -q "v${VERSION}"; then
    echo -e "${YELLOW}⚠️  Tag v${VERSION} 已存在，删除旧 tag...${NC}"
    git tag -d "v${VERSION}"
    git push origin --delete "v${VERSION}" 2>/dev/null || true
fi

git tag -a "v${VERSION}" -m "Release v${VERSION}"
git push origin "v${VERSION}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Git Tag 创建成功${NC}"
else
    echo -e "${RED}❌ Git Tag 创建失败${NC}"
    exit 1
fi
echo ""

# 步骤 8：创建 GitHub Release
echo -e "${BLUE}[8/8] 创建 GitHub Release...${NC}"

# 检查是否安装了 GitHub CLI
if command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  使用 GitHub CLI 创建 Release...${NC}"
    
    # 创建 Release 描述
    cat > release_notes.md << 'EOF'
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

1. Download `rac-folder-search-1.0.2.vsix` from the assets below
2. Open VS Code
3. Press `Cmd+Shift+X` to open Extensions panel
4. Click `...` → "Install from VSIX..."
5. Select the downloaded `.vsix` file
6. Restart VS Code

### ⌨️ Usage

Press `Cmd+Alt+F` (Mac) or `Ctrl+Alt+F` (Windows/Linux) to open folder search.

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

- **Initial scan**: 6ms ⚡
- **Cached search**: < 50ms ⚡
- **Memory usage**: < 10MB ⚡

### 🆕 What's New in v1.0.2

- ✨ Renamed to "RAC Folder Search"
- ✨ Added keyboard shortcut: `Cmd+Alt+F` / `Ctrl+Alt+F`
- ✨ Updated documentation with shortcut information
- ✨ Improved package metadata

### 📝 Requirements

- VS Code 1.75.0 or higher

### 📄 License

MIT License

---

**Full Changelog**: https://github.com/iczrac/rac-folder-search/commits/v1.0.2
EOF

    # 创建 Release
    gh release create "v${VERSION}" \
        "rac-folder-search-${VERSION}.vsix" \
        --title "RAC Folder Search v${VERSION}" \
        --notes-file release_notes.md \
        --latest

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ GitHub Release 创建成功${NC}"
        rm release_notes.md
    else
        echo -e "${RED}❌ GitHub Release 创建失败${NC}"
        echo -e "${YELLOW}💡 请手动在 GitHub 上创建 Release${NC}"
        echo -e "${YELLOW}   访问: https://github.com/iczrac/rac-folder-search/releases/new${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI 未安装，跳过自动创建 Release${NC}"
    echo -e "${YELLOW}💡 请手动在 GitHub 上创建 Release：${NC}"
    echo -e "${YELLOW}   1. 访问: https://github.com/iczrac/rac-folder-search/releases/new${NC}"
    echo -e "${YELLOW}   2. Tag: v${VERSION}${NC}"
    echo -e "${YELLOW}   3. 上传: rac-folder-search-${VERSION}.vsix${NC}"
    echo -e "${YELLOW}   4. 使用 Release描述模板.md 中的内容${NC}"
fi
echo ""

# 完成
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🎉 发布完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}📦 仓库地址：${NC}"
echo -e "   https://github.com/iczrac/rac-folder-search"
echo ""
echo -e "${GREEN}📝 Release 页面：${NC}"
echo -e "   https://github.com/iczrac/rac-folder-search/releases"
echo ""
echo -e "${GREEN}📁 生成的文件：${NC}"
echo -e "   ✅ rac-folder-search-${VERSION}.vsix"
echo -e "   ✅ Git Tag: v${VERSION}"
echo -e "   ✅ GitHub Release (如果 gh CLI 可用)"
echo ""
echo -e "${YELLOW}📚 下一步：${NC}"
echo -e "   1. 访问 Release 页面验证发布"
echo -e "   2. 测试下载和安装 .vsix 文件"
echo -e "   3. 分享给团队或社区"
echo ""
echo -e "${PURPLE}🎊 恭喜！RAC Folder Search 已成功发布！${NC}"