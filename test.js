// 本地测试脚本
// 用于在浏览器控制台中测试油猴脚本的功能

// 加载html2pdf.js库
function loadHTML2PDF() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 测试函数
async function testChatGPTToPDF() {
    console.log('开始测试 ChatGPT to PDF 脚本...');
    
    // 加载html2pdf.js库
    try {
        await loadHTML2PDF();
        console.log('html2pdf.js库加载成功');
    } catch (error) {
        console.error('html2pdf.js库加载失败:', error);
        return;
    }
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .pdf-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #10a37f;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .pdf-button:hover {
            background-color: #0d8a6c;
        }
        .pdf-icon {
            width: 16px;
            height: 16px;
        }
    `;
    document.head.appendChild(style);
    
    // 创建测试按钮
    const button = document.createElement('button');
    button.className = 'pdf-button';
    button.innerHTML = `
        <svg class="pdf-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
            <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
            <path d="M12 17v-6"></path>
            <path d="M9 14l3 3 3-3"></path>
        </svg>
        测试导出PDF
    `;
    
    // 添加点击事件
    button.addEventListener('click', function() {
        console.log('测试按钮被点击');
        
        // 创建测试内容
        const testContent = document.createElement('div');
        testContent.style.padding = '20px';
        testContent.style.backgroundColor = 'white';
        testContent.style.color = 'black';
        testContent.style.width = '210mm'; // A4宽度
        testContent.style.margin = '0 auto';
        
        // 添加标题
        const title = document.createElement('h1');
        title.textContent = '测试 ChatGPT 对话记录';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        testContent.appendChild(title);
        
        // 添加时间戳
        const timestamp = document.createElement('p');
        timestamp.textContent = `导出时间: ${new Date().toLocaleString()}`;
        timestamp.style.textAlign = 'right';
        timestamp.style.fontSize = '12px';
        timestamp.style.color = '#666';
        timestamp.style.marginBottom = '20px';
        testContent.appendChild(timestamp);
        
        // 添加测试对话
        testContent.innerHTML += `
            <div style="margin-bottom: 20px; padding: 10px; border-radius: 5px; background-color: #f7f7f8;">
                <p><strong>用户:</strong> 你好，请帮我解释一下什么是JavaScript？</p>
            </div>
            
            <div style="margin-bottom: 20px; padding: 10px; border-radius: 5px; background-color: #ffffff;">
                <p><strong>ChatGPT:</strong> JavaScript是一种编程语言，主要用于网页开发，但也可以用于其他环境，如服务器端开发（Node.js）。它是一种解释型语言，具有以下特点：</p>
                
                <ul>
                    <li>它是一种高级语言，易于学习和使用</li>
                    <li>它是动态类型的，变量类型可以在运行时改变</li>
                    <li>它支持面向对象编程</li>
                    <li>它可以直接在浏览器中运行，无需编译</li>
                </ul>
                
                <p>下面是一个简单的JavaScript代码示例：</p>
                
                <pre style="background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto;">
function sayHello(name) {
    return "Hello, " + name + "!";
}

console.log(sayHello("World")); // 输出: Hello, World!
                </pre>
                
                <p>JavaScript可以用来：</p>
                
                <ul>
                    <li>改变HTML内容和样式</li>
                    <li>响应用户事件（如点击、滚动等）</li>
                    <li>发送和接收服务器数据（AJAX）</li>
                    <li>创建交互式用户界面</li>
                </ul>
                
                <p>现代JavaScript还有许多框架和库，如React、Vue、Angular等，它们使得开发复杂的Web应用变得更加容易。</p>
            </div>
        `;
        
        // 设置PDF选项
        const opt = {
            margin: [10, 10],
            filename: '测试_ChatGPT对话记录.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // 生成PDF
        html2pdf().set(opt).from(testContent).save().then(() => {
            console.log('测试PDF生成成功');
        }).catch(error => {
            console.error('测试PDF生成失败:', error);
        });
    });
    
    // 添加按钮到页面
    document.body.appendChild(button);
    console.log('测试按钮已添加到页面');
}

// 执行测试
// 在浏览器控制台中运行: testChatGPTToPDF()
console.log('测试脚本已加载，请在控制台中运行: testChatGPTToPDF()'); 