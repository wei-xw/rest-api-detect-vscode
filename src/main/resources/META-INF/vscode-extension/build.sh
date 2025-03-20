#!/bin/bash

set -e

echo "开始构建Spring Rest Api Detector插件..."

# 确保在正确的目录
cd "$(dirname "$0")"
echo "当前目录: $(pwd)"

# 检查node和npm是否已安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到node命令，请先安装Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "错误: 未找到npm命令，请先安装npm"
    exit 1
fi

echo "正在安装依赖..."
npm install

echo "正在编译TypeScript代码..."
npm run compile

# 确保out目录存在且包含编译好的JS文件
if [ ! -d "out" ] || [ ! -f "out/extension.js" ]; then
    echo "错误: 编译后的文件未生成，请检查tsconfig.json配置"
    exit 1
fi

# echo "正在安装vsce工具..."
# npm install -g vsce

echo "正在打包VSCode扩展..."
vsce package

echo "构建完成！查看当前目录中的.vsix文件"
ls -la *.vsix 