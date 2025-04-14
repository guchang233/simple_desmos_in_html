## ✨ 大致介绍
这是一个简单的 Web 应用程序，使用 Desmos API 创建一个支持图形计算器和科学计算器切换的全屏网页界面。界面默认为中文。

## 🌐 如何更换语言
更换 Desmos 计算器的界面语言主要有两种方式，**推荐使用第一种 (JavaScript)** 因为它更可靠：
**方式一：修改 JavaScript (推荐)**
1.  打开 `script.js` 文件。
2.  找到 `initializeCalculator` 函数内部的以下这行代码：
    ```javascript
    currentCalculator.updateSettings({ language: 'zh-CN' });
    ```
3.  将 `'zh-CN'` 替换为你想要的语言代码。常见的代码包括：
    *   `'en'`: 英语 (English)
    *   `'es'`: 西班牙语 (Español)
    *   `'fr'`: 法语 (Français)
    *   `'pt-BR'`: 巴西葡萄牙语 (Português Brasileiro)
    *   `'ru'`: 俄语 (Русский)
    *   ... 等等。
4.  你可以通过在浏览器的开发者控制台输入 `Desmos.supportedLanguages` 来查看当前 API 版本支持的所有语言代码列表。
5.  保存 `script.js` 文件并刷新网页。
**方式二：修改 HTML 中的 API URL 参数**
1.  打开 `index.html` 文件。
2.  找到引入 Desmos API 的 `<script>` 标签：
    ```html
    <script src="https://www.desmos.com/api/v1.10/calculator.js?apiKey=...&lang=zh-CN"></script>
    ```
3.  修改 `src` 属性中的 `lang=zh-CN` 部分。例如，改成 `lang=en` 或 `lang=es,fr` (加载多种语言，但界面默认显示哪种取决于浏览器或后续 JS 设置)，或者 `lang=all` (加载所有可用语言)。
4.  保存 `index.html` 文件并刷新网页。

## 🔑 API Key
此项目使用了 Desmos 官方提供的演示 API Key (`dcb31709b452b1cf9dc26972add0fda6`)。此 Key 主要用于测试和开发目的。如果你计划在生产环境或公开网站上使用，强烈建议访问 Desmos 官网申请你自己的免费 API Key，并替换 `index.html` 和/或 `script.js` 中的 Key。