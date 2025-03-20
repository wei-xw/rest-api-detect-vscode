# Spring REST API Detector

一个用于检测和搜索Spring Java项目中REST API接口路径的VSCode插件。

## 功能

1. 检测Spring项目中使用`@RequestMapping`、`@GetMapping`、`@PostMapping`等注解定义的REST API接口
2. 在侧边栏中显示所有检测到的API路径列表
3. 通过快捷键（默认为`Ctrl+Shift+A`或Mac上的`Cmd+Shift+A`）搜索API路径
4. 点击API路径可以直接跳转到对应的代码位置

## 使用说明

1. 安装插件后，它会自动检测当前工作区中的所有REST API接口
2. 在侧边栏中点击"Spring REST API"图标，可以查看所有检测到的API路径
3. 使用快捷键`Ctrl+Shift+A`（Mac上为`Cmd+Shift+A`）可以打开搜索框，输入API路径进行搜索
4. 点击搜索结果或侧边栏中的API路径，可以直接跳转到相应的代码位置

## 设置选项

插件提供以下设置选项：

- `springRestApiDetector.searchShortcut`: 自定义搜索快捷键
- `springRestApiDetector.includePatterns`: 要扫描的文件模式（默认为所有Java文件）
- `springRestApiDetector.excludePatterns`: 要排除的文件模式（默认为测试目录）

## 开发构建

本项目基于Maven构建，可以使用以下命令进行构建：

```bash
mvn clean package
```

构建完成后，插件文件将位于`target`目录下。

## 安装方法

1. 下载插件的VSIX文件
2. 在VSCode中，选择"扩展"面板
3. 点击右上角的"..."按钮，选择"从VSIX安装..."
4. 选择下载好的VSIX文件进行安装

## 注意事项

- 插件会扫描所有Java文件，可能会对大型项目造成一定的性能影响
- 如果遇到性能问题，可以通过设置`excludePatterns`来排除不需要扫描的目录

## 许可证

MIT 