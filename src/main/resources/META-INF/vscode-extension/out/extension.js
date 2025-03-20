"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path = require("path");
// API提供者，用于在边栏中显示API列表
class ApiProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.apis = [];
    }
    refresh(apis) {
        this.apis = apis;
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.apis.map(api => new ApiItem(api)));
        }
        return Promise.resolve([]);
    }
}
// API树项，用于在边栏中显示单个API信息
class ApiItem extends vscode.TreeItem {
    constructor(api) {
        super(`${api.method} ${api.fullPath}`, vscode.TreeItemCollapsibleState.None);
        this.api = api;
        this.iconPath = new vscode.ThemeIcon('link');
        this.contextValue = 'apiItem';
        this.tooltip = `类: ${api.className}\n方法: ${api.methodName}\n文件: ${api.filePath}:${api.lineNumber}`;
        this.description = `${api.className}.${api.methodName}`;
        this.command = {
            command: 'spring-rest-api-detector.openApiDefinition',
            title: '跳转到API定义',
            arguments: [api]
        };
    }
}
// 检测器核心类，用于扫描和解析Java代码中的REST API
class RestApiDetector {
    // 扫描工作区中的所有Java文件
    async scanWorkspace() {
        const apis = [];
        // 获取配置的包含和排除模式
        const config = vscode.workspace.getConfiguration('springRestApiDetector');
        const includePatterns = config.get('includePatterns', ['**/*.java']);
        const excludePatterns = config.get('excludePatterns', ['**/test/**']);
        // 查找文件
        const files = await vscode.workspace.findFiles('{' + includePatterns.join(',') + '}', '{' + excludePatterns.join(',') + '}');
        // 处理每个文件
        for (const file of files) {
            try {
                const document = await vscode.workspace.openTextDocument(file);
                const content = document.getText();
                const fileName = path.basename(file.fsPath);
                // 解析文件中的API信息
                const fileApis = this.parseFile(content, file.fsPath);
                apis.push(...fileApis);
            }
            catch (error) {
                console.error(`Error processing file ${file.fsPath}:`, error);
            }
        }
        return apis;
    }
    // 解析单个文件中的API信息
    parseFile(content, filePath) {
        const apis = [];
        const lines = content.split('\n');
        let currentClass = '';
        let currentClassRequestMapping = '';
        let currentMethod = '';
        // 解析类级别的@RequestMapping注解
        const classMatch = /@RequestMapping\s*(?:\(\s*(?:value\s*=\s*)?(?:"([^"]+)"|'([^']+)')\s*\))?/g.exec(content);
        if (classMatch) {
            currentClassRequestMapping = classMatch[1] || classMatch[2] || '';
        }
        // 解析类名
        const classNameMatch = this.findRegexInContent(content, RestApiDetector.CLASS_PATTERN);
        if (classNameMatch) {
            currentClass = classNameMatch[1];
        }
        // 逐行解析文件
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // 查找方法定义
            const methodMatch = RestApiDetector.METHOD_PATTERN.exec(line);
            if (methodMatch) {
                currentMethod = methodMatch[1];
            }
            // 查找各类REST注解
            this.findMapping(line, 'GET', RestApiDetector.GET_MAPPING_PATTERN, i, filePath, currentClass, currentMethod, currentClassRequestMapping, apis);
            this.findMapping(line, 'POST', RestApiDetector.POST_MAPPING_PATTERN, i, filePath, currentClass, currentMethod, currentClassRequestMapping, apis);
            this.findMapping(line, 'PUT', RestApiDetector.PUT_MAPPING_PATTERN, i, filePath, currentClass, currentMethod, currentClassRequestMapping, apis);
            this.findMapping(line, 'DELETE', RestApiDetector.DELETE_MAPPING_PATTERN, i, filePath, currentClass, currentMethod, currentClassRequestMapping, apis);
            this.findMapping(line, 'PATCH', RestApiDetector.PATCH_MAPPING_PATTERN, i, filePath, currentClass, currentMethod, currentClassRequestMapping, apis);
            // 查找通用的@RequestMapping注解
            const requestMappingMatch = RestApiDetector.REQUEST_MAPPING_PATTERN.exec(line);
            if (requestMappingMatch) {
                const path = requestMappingMatch[1] || requestMappingMatch[2] || '/';
                const method = requestMappingMatch[3] || 'ANY';
                // 只有在处理方法级别的@RequestMapping时才添加API
                if (currentMethod) {
                    const fullPath = this.combinePaths(currentClassRequestMapping, path);
                    apis.push({
                        method,
                        path,
                        fullPath,
                        className: currentClass,
                        methodName: currentMethod,
                        filePath,
                        lineNumber: i + 1
                    });
                }
            }
        }
        return apis;
    }
    // 在内容中查找第一个匹配的正则表达式
    findRegexInContent(content, regex) {
        regex.lastIndex = 0;
        return regex.exec(content);
    }
    // 查找指定类型的Mapping注解
    findMapping(line, method, pattern, lineNumber, filePath, className, methodName, classRequestMapping, apis) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
            const path = match[1] || match[2] || '/';
            const fullPath = this.combinePaths(classRequestMapping, path);
            apis.push({
                method,
                path,
                fullPath,
                className,
                methodName,
                filePath,
                lineNumber: lineNumber + 1
            });
        }
    }
    // 组合类级别和方法级别的路径
    combinePaths(classPath, methodPath) {
        if (!classPath) {
            return methodPath;
        }
        if (!methodPath || methodPath === '/') {
            return classPath;
        }
        // 确保路径之间只有一个"/"
        const normalizedClassPath = classPath.endsWith('/') ? classPath.slice(0, -1) : classPath;
        const normalizedMethodPath = methodPath.startsWith('/') ? methodPath : '/' + methodPath;
        return normalizedClassPath + normalizedMethodPath;
    }
}
// 正则表达式，用于匹配常见的Spring REST注解
RestApiDetector.REQUEST_MAPPING_PATTERN = /@RequestMapping\s*(?:\(\s*(?:value\s*=\s*)?(?:"([^"]+)"|'([^']+)')|(?:\(\s*(?:method\s*=\s*)?RequestMethod\.([A-Z]+)))?/g;
RestApiDetector.GET_MAPPING_PATTERN = /@GetMapping\s*(?:\(\s*(?:value\s*=\s*)?(?:"([^"]+)"|'([^']+)')\s*\))?/g;
RestApiDetector.POST_MAPPING_PATTERN = /@PostMapping\s*(?:\(\s*(?:value\s*=\s*)?(?:"([^"]+)"|'([^']+)')\s*\))?/g;
RestApiDetector.PUT_MAPPING_PATTERN = /@PutMapping\s*(?:\(\s*(?:value\s*=\s*)?(?:"([^"]+)"|'([^']+)')\s*\))?/g;
RestApiDetector.DELETE_MAPPING_PATTERN = /@DeleteMapping\s*(?:\(\s*(?:value\s*=\s*)?(?:"([^"]+)"|'([^']+)')\s*\))?/g;
RestApiDetector.PATCH_MAPPING_PATTERN = /@PatchMapping\s*(?:\(\s*(?:value\s*=\s*)?(?:"([^"]+)"|'([^']+)')\s*\))?/g;
// 正则表达式，用于匹配类定义
RestApiDetector.CLASS_PATTERN = /public\s+class\s+(\w+)/g;
// 正则表达式，用于匹配方法定义
RestApiDetector.METHOD_PATTERN = /(?:public|private|protected)(?:\s+\w+)*\s+(\w+)\s*\([^)]*\)/g;
// 添加一个全局缓存
let apiCache = [];
let isApiCacheInitialized = false;
// 扩展激活函数
function activate(context) {
    console.log('Spring Rest Api Detector extension is now active!');
    // 创建API检测器实例
    const apiDetector = new RestApiDetector();
    // 创建API列表提供者
    const apiProvider = new ApiProvider();
    // 注册API树视图
    vscode.window.registerTreeDataProvider('apiExplorer', apiProvider);
    // 初始化缓存的函数
    async function initializeApiCache() {
        if (!isApiCacheInitialized) {
            apiCache = await apiDetector.scanWorkspace();
            isApiCacheInitialized = true;
            // 更新树视图
            apiProvider.refresh(apiCache);
        }
        return apiCache;
    }
    // 监听文件变更，更新缓存
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.java');
    context.subscriptions.push(fileWatcher.onDidChange(async () => {
        apiCache = await apiDetector.scanWorkspace();
        apiProvider.refresh(apiCache);
    }), fileWatcher.onDidCreate(async () => {
        apiCache = await apiDetector.scanWorkspace();
        apiProvider.refresh(apiCache);
    }), fileWatcher.onDidDelete(async () => {
        apiCache = await apiDetector.scanWorkspace();
        apiProvider.refresh(apiCache);
    }));
    // 注册命令：检测REST API
    let detectApisCommand = vscode.commands.registerCommand('spring-rest-api-detector.detectApis', async () => {
        // 显示进度提示
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "检测REST API中...",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0 });
            try {
                // 执行扫描并更新缓存
                apiCache = await apiDetector.scanWorkspace();
                isApiCacheInitialized = true;
                // 更新视图
                apiProvider.refresh(apiCache);
                // 显示结果
                vscode.window.showInformationMessage(`检测到 ${apiCache.length} 个REST API接口`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`检测API出错: ${error}`);
            }
            progress.report({ increment: 100 });
        });
    });
    // 注册命令：搜索API路径 - 使用缓存版本
    let searchApiPathCommand = vscode.commands.registerCommand('spring-rest-api-detector.searchApiPath', async () => {
        // 确保缓存已初始化
        if (!isApiCacheInitialized) {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "首次初始化API缓存...",
                cancellable: false
            }, async () => {
                await initializeApiCache();
            });
        }
        // 使用缓存的API信息
        const apis = apiCache;
        // 构建快速选择项
        const quickPickItems = apis.map(api => ({
            label: `${api.method} ${api.fullPath}`,
            description: `${api.className}.${api.methodName}`,
            detail: `${path.basename(api.filePath)}:${api.lineNumber}`,
            api
        }));
        // 显示快速选择界面
        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: '输入API路径进行搜索...',
            matchOnDescription: true,
            matchOnDetail: true
        });
        // 如果用户选择了一个项目，则打开相应的文件
        if (selected) {
            await openApiDefinition(selected.api);
        }
    });
    // 注册命令：打开API定义
    let openApiDefinitionCommand = vscode.commands.registerCommand('spring-rest-api-detector.openApiDefinition', async (api) => {
        await openApiDefinition(api);
    });
    // 将命令注册到扩展上下文
    context.subscriptions.push(detectApisCommand);
    context.subscriptions.push(searchApiPathCommand);
    context.subscriptions.push(openApiDefinitionCommand);
    // 启动时初始化API缓存
    initializeApiCache();
}
exports.activate = activate;
// 打开API定义文件并跳转到指定行
async function openApiDefinition(api) {
    try {
        // 打开文件
        const document = await vscode.workspace.openTextDocument(api.filePath);
        // 显示文件
        const editor = await vscode.window.showTextDocument(document);
        // 跳转到指定行
        const position = new vscode.Position(api.lineNumber - 1, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
    }
    catch (error) {
        vscode.window.showErrorMessage(`无法打开API定义: ${error}`);
    }
}
// 扩展停用函数
function deactivate() {
    console.log('Spring Rest Api Detector extension is now deactivated!');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map