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

// 获取DOM元素
const calculatorContainer = document.getElementById('calculator-container');
const graphingBtn = document.getElementById('graphing-btn');
const scientificBtn = document.getElementById('scientific-btn');
// 删除geogebraBtn，添加imageCalcBtn
const imageCalcBtn = document.getElementById('image-calc-btn');
const geometryBtn = document.getElementById('geometry-btn');
const threeDBtn = document.getElementById('3d-btn');
const casBtn = document.getElementById('cas-btn');

// 计算器实例变量
let graphingCalculator = null;
let scientificCalculator = null;
// 删除geogebraApplet，添加imageCalcApplet
let imageCalcApplet = null;
let geometryApplet = null;
let threeDApplet = null;
let casApplet = null;
let currentMode = 'graphing'; // 默认模式

// 加载状态跟踪
const loadingStatus = {
    // 删除geogebra，添加imageCalc
    imageCalc: false,
    geometry: false,
    threeD: false,
    cas: false
};

// 容器创建状态跟踪
const containerStatus = {
    // 删除geogebra，添加imageCalc
    imageCalc: false,
    geometry: false,
    threeD: false,
    cas: false
};

// 初始化图形计算器
function initGraphingCalculator() {
    hideAllCalculators();
    
    if (!graphingCalculator) {
        const elt = document.createElement('div');
        elt.id = 'graphing-calculator';
        elt.style.width = '100%';
        elt.style.height = '100%';
        calculatorContainer.appendChild(elt);
        
        graphingCalculator = Desmos.GraphingCalculator(elt, {
            expressions: true,
            settingsMenu: true,
            zoomButtons: true,
            language: 'zh-CN'
        });
    }
    
    document.getElementById('graphing-calculator').style.display = 'block';
    currentMode = 'graphing';
    updateButtonState();
}

// 初始化科学计算器
function initScientificCalculator() {
    hideAllCalculators();
    
    if (!scientificCalculator) {
        const elt = document.createElement('div');
        elt.id = 'scientific-calculator';
        elt.style.width = '100%';
        elt.style.height = '100%';
        calculatorContainer.appendChild(elt);
        
        scientificCalculator = Desmos.ScientificCalculator(elt, {
            language: 'zh-CN'
        });
    }
    
    document.getElementById('scientific-calculator').style.display = 'block';
    currentMode = 'scientific';
    updateButtonState();
}

// 删除initGeoGebra函数，添加initImageCalc函数
// 初始化图像计算机
function initImageCalc() {
    hideAllCalculators();
    
    // 检查容器是否已创建
    if (!containerStatus.imageCalc) {
        const elt = document.createElement('div');
        elt.id = 'image-calc-container';
        elt.style.width = '100%';
        elt.style.height = '100%';
        calculatorContainer.appendChild(elt);
        containerStatus.imageCalc = true;
    }
    
    // 显示容器
    document.getElementById('image-calc-container').style.display = 'block';
    
    // 如果图像计算机尚未加载，开始加载
    if (!loadingStatus.imageCalc) {
        // 配置GeoGebra参数 - 专注于图像处理功能
        const parameters = {
            "id": "imageCalcApplet",
            "width": calculatorContainer.clientWidth,
            "height": calculatorContainer.clientHeight,
            "showToolBar": true,
            "customToolBar": "0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15", // 完整工具栏
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
            "useBrowserForJS": false,
            "perspective": "G", // 图形计算器视角
            "language": "zh-CN",
            "allowStyleBar": true,
            "preventFocus": false,
            "scaleContainerClass": "image-calc-container",
            "allowUpscale": true,
            "playButton": false,
            "showFullscreenButton": true,
            "scale": 1.0,
            "disableAutoScale": false,
            "allowSymbolTable": true,
            "algebraInputPosition": "bottom",
            "buttonRounding": 0.7,
            "buttonShadows": false,
            "appName": "graphing", // 使用图形计算器模式
            "autoResize": true, // 添加自动调整大小选项
            "scaleContainerClass": "image-calc-container" // 设置容器类名以便自动缩放
        };

        // 添加加载完成回调
        const applet = new GGBApplet(parameters, true);
        applet.setHTML5Codebase('https://www.geogebra.org/apps/5.0.583.0/web3d');
        
        // 注册加载完成事件
        window.onImageCalcLoaded = function() {
            loadingStatus.imageCalc = true;
            
            // 加载完成后添加图像处理示例
            if (window.imageCalcApplet) {
                try {
                    // 等待applet完全加载
                    setTimeout(() => {
                        // 设置坐标系
                        window.imageCalcApplet.setCoordSystem(-10, 10, -10, 10);
                        
                        // 添加一些图像处理示例
                        // 创建一个函数图像
                        window.imageCalcApplet.evalCommand("f(x,y) = sin(x^2 + y^2) / (x^2 + y^2 + 0.1)");
                        
                        // 创建一个表面图
                        window.imageCalcApplet.evalCommand("Surface(f, -5, 5, -5, 5)");
                        
                        // 添加一些点
                        window.imageCalcApplet.evalCommand("A = (0, 0)");
                        window.imageCalcApplet.evalCommand("B = (1, 1)");
                        
                        // 添加一些文本说明
                        window.imageCalcApplet.evalCommand("text1 = \"图像计算机示例\"");
                        window.imageCalcApplet.setTextValue("text1", "图像计算机示例");
                        window.imageCalcApplet.setCoords("text1", -9, 9);
                        window.imageCalcApplet.setColor("text1", 0, 0, 0);
                        window.imageCalcApplet.setFontSize("text1", 16);
                        
                        // 添加图像处理功能示例
                        window.imageCalcApplet.evalCommand("k = 1"); // 创建一个滑块
                        window.imageCalcApplet.evalCommand("g(x,y) = k * f(x,y)"); // 使用滑块创建可变函数
                        
                        // 添加一个按钮来重置视图
                        window.imageCalcApplet.evalCommand("button1 = Button(\"重置视图\")");
                        window.imageCalcApplet.setColor("button1", 0, 0, 255);
                        window.imageCalcApplet.setCoords("button1", -9, -9);
                        
                        // 设置按钮点击事件
                        window.imageCalcApplet.registerClickListener("buttonClickListener");
                        window.buttonClickListener = function(obj) {
                            if (obj === "button1") {
                                window.imageCalcApplet.setCoordSystem(-10, 10, -10, 10);
                            }
                        };
                    }, 1000);
                } catch (e) {
                    console.log("图像计算机初始化示例时出错");
                }
            }
        };
        
        applet.inject('image-calc-container', 'preferHTML5');
        imageCalcApplet = applet;
        loadingStatus.imageCalc = true; // 标记为已加载
    }
    
    // 如果已经加载，但需要调整大小
    else if (window.imageCalcApplet && window[window.imageCalcApplet.id]) {
        try {
            // 调整已加载应用的大小
            window[window.imageCalcApplet.id].setSize(
                calculatorContainer.clientWidth, 
                calculatorContainer.clientHeight
            );
        } catch (e) {
            console.log("调整图像计算机尺寸时出错", e);
        }
    }
    
    currentMode = 'imageCalc';
    updateButtonState();
}

// 初始化几何工具
function initGeometry() {
    hideAllCalculators();
    
    // 检查容器是否已创建
    if (!containerStatus.geometry) {
        const elt = document.createElement('div');
        elt.id = 'geometry-container';
        elt.style.width = '100%';
        elt.style.height = '100%';
        calculatorContainer.appendChild(elt);
        containerStatus.geometry = true;
    }
    
    // 显示容器
    document.getElementById('geometry-container').style.display = 'block';
    
    if (!loadingStatus.geometry) {
        const parameters = {
            "id": "geometryApplet",
            "width": calculatorContainer.clientWidth,
            "height": calculatorContainer.clientHeight,
            "showToolBar": true,
            "borderColor": null,
            "showMenuBar": true,
            "showAlgebraInput": false,
            "enableLabelDrags": false,
            "enableShiftDragZoom": true,
            "showToolBarHelp": false,
            "errorDialogsActive": false, // 禁用错误对话框
            "perspective": "T", // 几何视角
            "capturingThreshold": 8, // 修复null值错误
            "showLogging": false, // 禁用日志记录
            "language": "zh-CN"
        };

        // 添加加载完成回调
        const applet = new GGBApplet(parameters, true);
        applet.setHTML5Codebase('https://www.geogebra.org/apps/5.0.583.0/web3d');
        
        window.onGeometryLoaded = function() {
            loadingStatus.geometry = true;
        };
        
        applet.inject('geometry-container', 'preferHTML5');
        geometryApplet = applet;
        loadingStatus.geometry = true; // 标记为已加载
    }
    
    currentMode = 'geometry';
    updateButtonState();
}

// 初始化3D图形
function init3D() {
    hideAllCalculators();
    
    // 检查容器是否已创建
    if (!containerStatus.threeD) {
        const elt = document.createElement('div');
        elt.id = '3d-container';
        elt.style.width = '100%';
        elt.style.height = '100%';
        calculatorContainer.appendChild(elt);
        containerStatus.threeD = true;
    }
    
    // 显示容器
    document.getElementById('3d-container').style.display = 'block';
    
    if (!loadingStatus.threeD) {
        const parameters = {
            "id": "threeDApplet",
            "width": calculatorContainer.clientWidth,
            "height": calculatorContainer.clientHeight,
            "showToolBar": true,
            "borderColor": null,
            "showMenuBar": true,
            "showAlgebraInput": true,
            "enableLabelDrags": false,
            "enableShiftDragZoom": true,
            "showToolBarHelp": false,
            "errorDialogsActive": false, // 禁用错误对话框
            "perspective": "G", // 3D视角
            "showZoomButtons": true,
            "capturingThreshold": 8, // 修复null值错误
            "showLogging": false, // 禁用日志记录
            "language": "zh-CN",
            "appName": "3d"
        };

        const applet = new GGBApplet(parameters, true);
        applet.setHTML5Codebase('https://www.geogebra.org/apps/5.0.583.0/web3d');
        
        window.on3DLoaded = function() {
            loadingStatus.threeD = true;
        };
        
        applet.inject('3d-container', 'preferHTML5');
        threeDApplet = applet;
        loadingStatus.threeD = true; // 标记为已加载
    }
    
    currentMode = '3d';
    updateButtonState();
}

// 初始化代数系统
function initCAS() {
    hideAllCalculators();
    
    // 检查容器是否已创建
    if (!containerStatus.cas) {
        const elt = document.createElement('div');
        elt.id = 'cas-container';
        elt.style.width = '100%';
        elt.style.height = '100%';
        calculatorContainer.appendChild(elt);
        containerStatus.cas = true;
    }
    
    // 显示容器
    document.getElementById('cas-container').style.display = 'block';
    
    if (!loadingStatus.cas) {
        const parameters = {
            "id": "casApplet",
            "width": calculatorContainer.clientWidth,
            "height": calculatorContainer.clientHeight,
            "showToolBar": true,
            "borderColor": null,
            "showMenuBar": true,
            "showAlgebraInput": true,
            "enableLabelDrags": false,
            "enableShiftDragZoom": true,
            "showToolBarHelp": false,
            "errorDialogsActive": false, // 禁用错误对话框
            "perspective": "A", // CAS视角
            "capturingThreshold": 8, // 修复null值错误
            "showLogging": false, // 禁用日志记录
            "language": "zh-CN"
        };

        const applet = new GGBApplet(parameters, true);
        applet.setHTML5Codebase('https://www.geogebra.org/apps/5.0.583.0/web3d');
        
        window.onCASLoaded = function() {
            loadingStatus.cas = true;
        };
        
        applet.inject('cas-container', 'preferHTML5');
        casApplet = applet;
        loadingStatus.cas = true; // 标记为已加载
    }
    
    currentMode = 'cas';
    updateButtonState();
}

// 隐藏所有计算器
function hideAllCalculators() {
    const containers = [
        'graphing-calculator',
        'scientific-calculator',
        // 更新容器ID
        'image-calc-container',
        'geometry-container',
        '3d-container',
        'cas-container'
    ];
    
    containers.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// 更新按钮状态
function updateButtonState() {
    const buttons = [
        graphingBtn,
        scientificBtn,
        // 更新按钮引用
        imageCalcBtn,
        geometryBtn,
        threeDBtn,
        casBtn
    ];
    
    buttons.forEach(btn => btn.classList.remove('active'));
    
    switch (currentMode) {
        case 'graphing':
            graphingBtn.classList.add('active');
            break;
        case 'scientific':
            scientificBtn.classList.add('active');
            break;
        // 更新模式名称
        case 'imageCalc':
            imageCalcBtn.classList.add('active');
            break;
        case 'geometry':
            geometryBtn.classList.add('active');
            break;
        case '3d':
            threeDBtn.classList.add('active');
            break;
        case 'cas':
            casBtn.classList.add('active');
            break;
    }
}

// 事件监听器
graphingBtn.addEventListener('click', initGraphingCalculator);
scientificBtn.addEventListener('click', initScientificCalculator);
// 更新事件监听器
imageCalcBtn.addEventListener('click', initImageCalc);
geometryBtn.addEventListener('click', initGeometry);
threeDBtn.addEventListener('click', init3D);
casBtn.addEventListener('click', initCAS);

// 初始化默认计算器
window.addEventListener('DOMContentLoaded', initGraphingCalculator);

// 窗口大小调整时重新适应容器大小
window.addEventListener('resize', () => {
    // 更新容器映射，添加imageCalc
    const containerMap = {
        'imageCalc': 'image-calc-container',
        'geometry': 'geometry-container',
        '3d': '3d-container',
        'cas': 'cas-container'
    };
    
    // 处理Desmos计算器的大小调整
    if (currentMode === 'graphing' && graphingCalculator) {
        graphingCalculator.resize();
    } else if (currentMode === 'scientific' && scientificCalculator) {
        scientificCalculator.resize();
    }
    
    // 处理GeoGebra应用的大小调整
    const containerId = containerMap[currentMode];
    if (containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            // 更新容器尺寸
            container.style.width = calculatorContainer.clientWidth + 'px';
            container.style.height = calculatorContainer.clientHeight + 'px';
            
            // 尝试更新GeoGebra应用尺寸
            try {
                // 根据当前模式获取正确的applet实例
                let applet = null;
                switch (currentMode) {
                    case 'imageCalc':
                        applet = window.imageCalcApplet;
                        break;
                    case 'geometry':
                        applet = window.geometryApplet;
                        break;
                    case '3d':
                        applet = window.threeDApplet;
                        break;
                    case 'cas':
                        applet = window.casApplet;
                        break;
                }
                
                // 如果找到applet实例，调用其resize方法
                if (applet) {
                    setTimeout(() => {
                        // 使用GeoGebra API更新尺寸
                        if (window[applet.id]) {
                            window[applet.id].setSize(
                                calculatorContainer.clientWidth, 
                                calculatorContainer.clientHeight
                            );
                        }
                    }, 100);
                }
            } catch (e) {
                console.log("调整GeoGebra应用尺寸时出错", e);
            }
        }
    }
});
