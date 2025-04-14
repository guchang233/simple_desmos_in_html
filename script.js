document.addEventListener('DOMContentLoaded', () => {
    const calculatorContainer = document.getElementById('calculator-container');
    const graphingBtn = document.getElementById('graphing-btn');
    const scientificBtn = document.getElementById('scientific-btn');

    let currentCalculator = null; // 用于存储当前的 Desmos 计算器实例
    let currentType = 'graphing'; // 跟踪当前类型 ('graphing' or 'scientific')

    // 检查 Desmos API 是否加载成功
    if (typeof Desmos === 'undefined' || !calculatorContainer) {
        console.error('Desmos API could not be loaded or the container element was not found.');
        if (calculatorContainer) {
            calculatorContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: red;">无法加载 Desmos 计算器 API 或找不到容器。请检查网络连接、API Key 或 HTML 结构。</p>';
        }
        // 禁用按钮，因为无法创建计算器
        if (graphingBtn) graphingBtn.disabled = true;
        if (scientificBtn) scientificBtn.disabled = true;
        return; // 停止执行后续代码
    }

    // --- 函数：初始化或切换计算器 ---
    function initializeCalculator(type) {
        // 1. 清理旧实例（如果存在）
        if (currentCalculator) {
            console.log(`Destroying previous ${currentType} calculator.`);
            currentCalculator.destroy(); // 非常重要：销毁旧实例释放资源
            calculatorContainer.innerHTML = ''; // 清空容器内容
        }

        // 2. 设置选项 (可以根据类型不同设置不同选项)
        const options = {
            // keypad: true, // 默认通常为 true
            // expressions: type === 'graphing', // 科学计算器通常没有表达式列表
            // settingsMenu: true, // 显示设置菜单
             border: false // 尝试移除边框
            // language: 'zh-CN' // 也可以在这里设置，但 updateSettings 更可靠
        };

        // 3. 创建新实例
        console.log(`Initializing ${type} calculator...`);
        try {
            if (type === 'graphing') {
                currentCalculator = Desmos.GraphingCalculator(calculatorContainer, options);
                 // (可选) 为图形计算器添加示例表达式
                currentCalculator.setExpression({ id: 'graph1', latex: 'y=\\sin(x)', color: Desmos.Colors.BLUE });
                currentCalculator.setExpression({ id: 'point1', latex: '(1,0)', showLabel: true, color: Desmos.Colors.RED });
            } else if (type === 'scientific') {
                currentCalculator = Desmos.ScientificCalculator(calculatorContainer, options);
                // 科学计算器通常不需要预设表达式，但可以设置初始状态，如角度单位
                // currentCalculator.setState(...)
            } else {
                console.error("Unknown calculator type:", type);
                calculatorContainer.innerHTML = `<p style="padding: 20px; text-align: center; color: orange;">未知的计算器类型: ${type}</p>`;
                return; // 创建失败，退出
            }

            currentType = type; // 更新当前类型

            // 4. **强制设置语言为中文**
            // 这是确保中文生效的关键一步，即使 URL 参数或 options 里设置了，也建议再调一次
            if (currentCalculator && typeof currentCalculator.updateSettings === 'function') {
                 // 检查支持的语言，确认 zh-CN 是否可用
                 console.log('Desmos Supported Languages:', Desmos.supportedLanguages);
                 if (Desmos.supportedLanguages && Desmos.supportedLanguages.includes('zh-CN')) {
                    currentCalculator.updateSettings({ language: 'zh-CN' });
                    console.log('Calculator language explicitly set to zh-CN.');
                 } else {
                     console.warn('zh-CN language might not be fully supported or loaded by the API.');
                 }
            }

            console.log(`${type} calculator initialized successfully.`);

        } catch (error) {
            console.error(`Error initializing ${type} calculator:`, error);
            calculatorContainer.innerHTML = `<p style="padding: 20px; text-align: center; color: red;">初始化 ${type} 计算器时出错。</p>`;
            currentCalculator = null; // 重置实例
        }

        // 5. 更新导航按钮的激活状态
        updateNavButtons();
    }

    // --- 函数：更新导航按钮样式 ---
    function updateNavButtons() {
        if (currentType === 'graphing') {
            graphingBtn.classList.add('active');
            scientificBtn.classList.remove('active');
        } else if (currentType === 'scientific') {
            graphingBtn.classList.remove('active');
            scientificBtn.classList.add('active');
        }
    }

    // --- 添加事件监听器 ---
    graphingBtn.addEventListener('click', () => {
        if (currentType !== 'graphing') { // 避免重复加载
            initializeCalculator('graphing');
        }
    });

    scientificBtn.addEventListener('click', () => {
        if (currentType !== 'scientific') { // 避免重复加载
            initializeCalculator('scientific');
        }
    });

    // --- 初始加载 ---
    // 页面加载时默认初始化图形计算器
    initializeCalculator('graphing');

    // (可选) 监听窗口大小变化，让 Desmos 自动调整
    // Desmos API 默认会监听容器大小变化并自适应，通常不需要手动调用 resize
    // window.addEventListener('resize', () => {
    //     if (currentCalculator) {
    //         // currentCalculator.resize(); // Desmos v1.10 应该自动处理
    //     }
    // });
});
