// 获取DOM元素
const calculatorContainer = document.getElementById('calculator-container');
const graphingBtn = document.getElementById('graphing-btn');
const threeDBtn = document.getElementById('3d-btn');

// 当前模式和应用实例
let currentMode = 'graphing';
const applets = {};
const containers = {};

// 初始化函数
function init() {
    // 创建所有容器
    createContainer('graphing');
    createContainer('3d');
    
    // 设置按钮点击事件
    graphingBtn.addEventListener('click', () => switchMode('graphing'));
    threeDBtn.addEventListener('click', () => switchMode('3d'));
    
    // 初始化默认模式
    switchMode('graphing');
    
    // 添加窗口大小调整事件
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // 添加键盘渲染优化
    setupKeyboardOptimization();
    
    // 添加移动设备检测
    setupMobileDetection();
}

// 防抖函数，优化resize事件处理
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 创建容器
function createContainer(mode) {
    const container = document.createElement('div');
    container.id = `${mode}-container`;
    container.className = 'ggb-container';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'none';
    calculatorContainer.appendChild(container);
    
    // 添加加载指示器
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="spinner"></div>
        <div>正在加载 ${getModeName(mode)}...</div>
    `;
    loadingIndicator.id = `${mode}-loading`;
    container.appendChild(loadingIndicator);
    
    containers[mode] = container;
}

// 获取模式名称
function getModeName(mode) {
    const names = {
        'graphing': '函数绘图',
        '3d': '3D 图形'
    };
    return names[mode] || mode;
}

// 切换模式
function switchMode(mode) {
    // 更新当前模式
    currentMode = mode;
    
    // 更新按钮状态
    updateButtonState();
    
    // 隐藏所有容器
    Object.values(containers).forEach(container => {
        container.style.display = 'none';
    });
    
    // 显示当前容器
    containers[mode].style.display = 'block';
    
    // 如果应用尚未加载，则加载它
    if (!applets[mode]) {
        loadApplet(mode);
    } else {
        // 如果已加载，尝试调整大小
        try {
            const appletInstance = window[`ggbApplet_${mode}`];
            if (appletInstance && typeof appletInstance.setSize === 'function') {
                appletInstance.setSize(
                    calculatorContainer.clientWidth,
                    calculatorContainer.clientHeight
                );
            }
        } catch (e) {
            console.log(`调整 ${mode} 大小时出错:`, e);
        }
    }
}

// 加载GeoGebra应用
function loadApplet(mode) {
    // 显示加载指示器
    const loadingIndicator = document.getElementById(`${mode}-loading`);
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    
    // 配置参数
    const parameters = getParameters(mode);
    
    // 创建应用实例
    const applet = new GGBApplet(parameters, true);
    applet.setHTML5Codebase('https://www.geogebra.org/apps/latest/web3d');
    
    // 注入应用
    applet.inject(`${mode}-container`, 'preferHTML5');
    
    // 保存应用实例
    applets[mode] = applet;
    
    // 设置加载完成回调
    window[`ggbOnInit_${mode}`] = function() {
        // 隐藏加载指示器
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // 根据模式执行特定的初始化
        initializeApplet(mode);
        
        // 应用键盘渲染优化
        optimizeKeyboard(mode);
    };
}

// 获取GeoGebra应用参数
function getParameters(mode) {
    // 基本参数
    const baseParams = {
        "width": calculatorContainer.clientWidth,
        "height": calculatorContainer.clientHeight,
        "showToolBar": true,
        "borderColor": null,
        "showMenuBar": true,
        "allowStyleBar": true,
        "showAlgebraInput": true,
        "enableLabelDrags": true,
        "enableShiftDragZoom": true,
        "capturingThreshold": 8,
        "showToolBarHelp": true,
        "errorDialogsActive": false,
        "showTutorialLink": false,
        "showLogging": false,
        "useBrowserForJS": true,
        "language": "zh-CN",
        "allowStyleBar": true,
        "preventFocus": false,
        "allowUpscale": true,
        "playButton": false,
        "showFullscreenButton": true,
        "scale": 1.0,
        "disableAutoScale": false,
        "allowSymbolTable": true,
        "algebraInputPosition": "bottom",
        "buttonRounding": 0.7,
        "buttonShadows": false,
        "autoResize": true,
        "enableRightClick": true,
        "showAnimationButton": true,
        "showResetIcon": true,
        "showZoomButtons": true,
        "enableFileFeatures": true,
        "enableUndoRedo": true,
        // 优化键盘设置
        "keyboard": {
            "keyboardType": "scientific",
            "language": "zh-CN",
            "fontSize": isMobileDevice() ? 16 : 18,
            "buttonHeight": isMobileDevice() ? 40 : 45,
            "buttonWidth": isMobileDevice() ? 40 : 45,
            "opacity": 0.95,
            "specialSymbolFontSize": isMobileDevice() ? 16 : 18
        }
    };
    
    // 移动设备特定参数调整
    if (isMobileDevice()) {
        baseParams.showMenuBar = false;
        baseParams.showToolBarHelp = false;
        baseParams.buttonRounding = 0.5;
    }
    
    // 模式特定参数
    const modeParams = {
        'graphing': {
            "id": "ggbApplet_graphing",
            "appName": "graphing",
            "perspective": "G",
            "customToolBar": isMobileDevice() 
                ? "0 | 1 | 2 | 3 | 4 | 5" 
                : "0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15",
            "appletOnLoad": "ggbOnInit_graphing"
        },
        '3d': {
            "id": "ggbApplet_3d",
            "appName": "3d",
            "perspective": "G",
            "showZoomButtons": true,
            "customToolBar": isMobileDevice() 
                ? "0 | 1 | 2 | 3 | 4 | 5" 
                : "0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15",
            "appletOnLoad": "ggbOnInit_3d"
        }
    };
    
    // 合并参数
    return { ...baseParams, ...modeParams[mode] };
}

// 检测是否为移动设备
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

// 设置移动设备检测
function setupMobileDetection() {
    // 添加移动设备类到body
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
    }
    
    // 监听方向变化
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 300);
    });
}

// 初始化特定应用
function initializeApplet(mode) {
    const appletInstance = window[`ggbApplet_${mode}`];
    if (!appletInstance) return;
    
    try {
        // 根据模式执行特定初始化
        switch (mode) {
            case 'graphing':
                // 函数绘图初始化
                appletInstance.setCoordSystem(-10, 10, -10, 10);
                appletInstance.evalCommand("f(x) = sin(x)");
                appletInstance.evalCommand("g(x) = x^2");
                appletInstance.evalCommand("h(x) = e^x");
                appletInstance.setColor("f", 255, 0, 0);
                appletInstance.setColor("g", 0, 0, 255);
                appletInstance.setColor("h", 0, 128, 0);
                appletInstance.setLineThickness("f", 3);
                appletInstance.setLineThickness("g", 3);
                appletInstance.setLineThickness("h", 3);
                break;
                
            case '3d':
                // 3D图形初始化
                appletInstance.evalCommand("f(x,y) = sin(x^2 + y^2) / (x^2 + y^2 + 0.1)");
                appletInstance.evalCommand("Surface(f, -5, 5, -5, 5)");
                break;
        }
    } catch (e) {
        console.log(`初始化 ${mode} 时出错:`, e);
    }
}

// 优化键盘渲染
function optimizeKeyboard(mode) {
    try {
        // 获取应用实例
        const appletInstance = window[`ggbApplet_${mode}`];
        if (!appletInstance) return;
        
        // 设置键盘样式
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .GeoGebraFrame .mtable {
                display: inline-table !important;
            }
            .GeoGebraFrame .gwt-PopupPanel {
                z-index: 1000 !important;
                position: fixed !important; /* 修复键盘位置 */
                bottom: 0 !important; /* 固定在底部 */
                left: 0 !important;
                width: 100% !important;
                max-height: ${isMobileDevice() ? '50vh' : '40vh'} !important; /* 限制最大高度 */
                overflow-y: auto !important; /* 允许滚动 */
                transform: none !important; /* 防止变换 */
                top: auto !important;
            }
            .GeoGebraFrame .KeyBoard {
                background-color: rgba(245, 245, 245, 0.98) !important;
                border-radius: 12px 12px 0 0 !important; /* 只圆角顶部 */
                box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15) !important;
                width: 100% !important;
                position: relative !important;
                bottom: 0 !important;
                padding-bottom: env(safe-area-inset-bottom) !important; /* 适配iPhone X及以上 */
            }
            .GeoGebraFrame .KeyBoardButton {
                border-radius: ${isMobileDevice() ? '8px' : '6px'} !important;
                margin: ${isMobileDevice() ? '2px' : '3px'} !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
                font-weight: bold !important;
                transition: background-color 0.2s ease !important;
            }
            .GeoGebraFrame .KeyBoardButton:hover,
            .GeoGebraFrame .KeyBoardButton:active {
                background-color: #e0e0e0 !important;
            }
            .GeoGebraFrame .keyboardInputField {
                font-size: 16px !important;
            }
            .GeoGebraFrame .keyboardRow {
                margin: ${isMobileDevice() ? '2px 0' : '3px 0'} !important;
            }
            /* 防止appletParameters上移 */
            .appletParameters, .appletParameters.notranslate {
                position: static !important;
                top: auto !important;
            }
            /* 防止页面滚动 */
            body.keyboard-open {
                overflow: hidden !important;
                position: fixed !important;
                width: 100% !important;
                height: 100% !important;
            }
            /* 键盘关闭按钮优化 */
            .GeoGebraFrame .keyBoardClosePanel {
                padding: 8px !important;
                background-color: rgba(0,0,0,0.05) !important;
                border-radius: 8px 8px 0 0 !important;
            }
            .GeoGebraFrame .keyBoardClosePanel img {
                width: 24px !important;
                height: 24px !important;
                opacity: 0.7 !important;
            }
            /* 移动设备特定样式 */
            @media (max-width: 768px) {
                .GeoGebraFrame .KeyBoardButton {
                    min-width: 36px !important;
                    height: 36px !important;
                    padding: 4px !important;
                    font-size: 14px !important;
                }
                .GeoGebraFrame .keyBoardClosePanel {
                    padding: 6px !important;
                }
                .GeoGebraFrame .keyBoardClosePanel img {
                    width: 20px !important;
                    height: 20px !important;
                }
            }
        `;
        document.head.appendChild(styleElement);
        
        // 监听键盘显示事件
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList && 
                            (node.classList.contains('KeyBoard') || 
                             node.classList.contains('gwt-PopupPanel'))) {
                            fixKeyboardRendering(node);
                            // 添加键盘打开标记
                            document.body.classList.add('keyboard-open');
                            
                            // 修复appletParameters位置
                            fixAppletParameters();
                            
                            // 阻止页面滚动
                            preventPageScroll(true);
                        }
                    });
                }
                
                // 检测键盘关闭
                if (mutation.removedNodes.length > 0) {
                    mutation.removedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList && 
                            (node.classList.contains('KeyBoard') || 
                             node.classList.contains('gwt-PopupPanel'))) {
                            // 移除键盘打开标记
                            document.body.classList.remove('keyboard-open');
                            
                            // 恢复页面滚动
                            preventPageScroll(false);
                        }
                    });
                }
            });
        });
        
        // 开始观察文档变化
        observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {
        console.log(`优化键盘渲染时出错:`, e);
    }
}

// 修复appletParameters位置
function fixAppletParameters() {
    const appletParams = document.querySelectorAll('.appletParameters, .appletParameters.notranslate');
    appletParams.forEach(el => {
        el.style.position = 'static';
        el.style.top = 'auto';
    });
}

// 阻止/恢复页面滚动
function preventPageScroll(prevent) {
    if (prevent) {
        // 保存当前滚动位置
        window._scrollPosition = [
            window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
            window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
        ];
        
        // 固定页面位置
        document.body.style.top = `-${window._scrollPosition[1]}px`;
    } else {
        // 恢复滚动位置
        if (window._scrollPosition) {
            window.scrollTo(window._scrollPosition[0], window._scrollPosition[1]);
            window._scrollPosition = null;
        }
        document.body.style.top = '';
    }
}

// 修复键盘渲染问题
function fixKeyboardRendering(keyboardElement) {
    try {
        // 查找所有数学表达式表格
        const mtables = keyboardElement.querySelectorAll('.mtable');
        mtables.forEach(table => {
            table.style.display = 'inline-table';
        });
        
        // 修复特殊符号大小
        const specialSymbols = keyboardElement.querySelectorAll('.msubsup, .mfrac, .msqrt, .mroot');
        specialSymbols.forEach(symbol => {
            symbol.style.fontSize = isMobileDevice() ? '16px' : '18px';
            symbol.style.lineHeight = '1.2';
        });
        
        // 确保键盘按钮大小一致
        const buttons = keyboardElement.querySelectorAll('.KeyBoardButton, .keyboardBtn');
        buttons.forEach(button => {
            button.style.minWidth = isMobileDevice() ? '36px' : '40px';
            button.style.height = isMobileDevice() ? '36px' : '40px';
            button.style.padding = isMobileDevice() ? '4px' : '6px';
        });
        
        // 修复键盘位置，确保它固定在底部
        if (keyboardElement.classList.contains('gwt-PopupPanel')) {
            keyboardElement.style.position = 'fixed';
            keyboardElement.style.bottom = '0';
            keyboardElement.style.left = '0';
            keyboardElement.style.width = '100%';
            keyboardElement.style.maxHeight = isMobileDevice() ? '50vh' : '40vh';
            keyboardElement.style.transform = 'none';
            keyboardElement.style.top = 'auto';
            
            // 修复appletParameters位置
            setTimeout(fixAppletParameters, 50);
        }
        
        // 添加关闭按钮的触摸反馈
        const closeButton = keyboardElement.querySelector('.keyBoardClosePanel');
        if (closeButton) {
            closeButton.style.cursor = 'pointer';
            closeButton.addEventListener('touchstart', function() {
                this.style.backgroundColor = 'rgba(0,0,0,0.1)';
            });
            closeButton.addEventListener('touchend', function() {
                this.style.backgroundColor = 'rgba(0,0,0,0.05)';
            });
        }
    } catch (e) {
        console.log(`修复键盘渲染时出错:`, e);
    }
}

// 设置键盘优化
function setupKeyboardOptimization() {
    // 添加全局样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* 修复GeoGebra键盘渲染问题 */
        .mtable {
            display: inline-table !important;
        }
        .gwt-PopupPanel {
            z-index: 1000 !important;
        }
        /* 防止appletParameters上移 */
        .appletParameters, 
        .appletParameters.notranslate {
            position: static !important;
            top: auto !important;
        }
        /* 键盘打开时的样式 */
        body.keyboard-open {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
        }
        /* GeoGebra键盘固定在底部 */
        .GeoGebraFrame .gwt-PopupPanel.KeyBoard,
        .GeoGebraFrame .gwt-PopupPanel:has(.KeyBoard) {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-height: ${isMobileDevice() ? '50vh' : '40vh'} !important;
            overflow-y: auto !important;
            transform: none !important;
            top: auto !important;
        }
        /* 移动设备工具栏优化 */
        .mobile-device .GeoGebraFrame .toolbar {
            height: auto !important;
            padding: 2px !important;
        }
        .mobile-device .GeoGebraFrame .toolbarButtonPanel {
            margin: 1px !important;
        }
        .mobile-device .GeoGebraFrame .toolbarButtonPanel img {
            width: 24px !important;
            height: 24px !important;
        }
        /* 移动设备代数视图优化 */
        .mobile-device .GeoGebraFrame .algebraView {
            font-size: 14px !important;
        }
        .mobile-device .GeoGebraFrame .algebraViewButton {
            width: 24px !important;
            height: 24px !important;
        }
        /* 移动设备输入框优化 */
        .mobile-device .GeoGebraFrame .inputPanel {
            padding: 4px !important;
        }
        .mobile-device .GeoGebraFrame .inputPanel input {
            font-size: 14px !important;
            height: 32px !important;
        }
    `;
    document.head.appendChild(styleElement);
    
    // 监听DOM变化，处理动态添加的键盘元素
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const keyboard = node.querySelector ? 
                            node.querySelector('.KeyBoard, .gwt-PopupPanel') : null;
                        if (keyboard || 
                            (node.classList && 
                             (node.classList.contains('KeyBoard') || 
                              node.classList.contains('gwt-PopupPanel')))) {
                            fixKeyboardRendering(keyboard || node);
                        }
                    }
                });
            }
        });
    });
    
    // 开始观察文档变化
    observer.observe(document.body, { childList: true, subtree: true });
}

// 更新按钮状态
function updateButtonState() {
    // 移除所有按钮的active类
    [graphingBtn, threeDBtn].forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 根据当前模式添加active类
    switch (currentMode) {
        case 'graphing':
            graphingBtn.classList.add('active');
            break;
        case '3d':
            threeDBtn.classList.add('active');
            break;
    }
}

// 处理窗口大小调整
function handleResize() {
    // 获取当前应用实例
    const appletInstance = window[`ggbApplet_${currentMode}`];
    
    // 如果应用已加载，调整其大小
    if (appletInstance && typeof appletInstance.setSize === 'function') {
        try {
            appletInstance.setSize(
                calculatorContainer.clientWidth,
                calculatorContainer.clientHeight
            );
        } catch (e) {
            console.log(`调整大小时出错:`, e);
        }
    }
}

// 过滤控制台消息
function setupConsoleFilter() {
    // 保存原始的console方法
    const originalConsole = {
        log: console.log,
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error
    };

    // 过滤掉GeoGebra相关的控制台消息
    console.log = function(...args) {
        if (!args.some(arg => String(arg).includes('GeoGebra'))) {
            originalConsole.log(...args);
        }
    };

    console.debug = function(...args) {
        if (!args.some(arg => String(arg).includes('GeoGebra'))) {
            originalConsole.debug(...args);
        }
    };

    console.info = function(...args) {
        if (!args.some(arg => String(arg).includes('GeoGebra'))) {
            originalConsole.info(...args);
        }
    };

    console.warn = function(...args) {
        if (!args.some(arg => String(arg).includes('GeoGebra'))) {
            originalConsole.warn(...args);
        }
    };

    console.error = function(...args) {
        if (!args.some(arg => String(arg).includes('GeoGebra')) && 
            !args.some(arg => String(arg).includes('Invalid capturing threshold'))) {
            originalConsole.error(...args);
        }
    };
}

// 设置控制台过滤器
setupConsoleFilter();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
