// ==UserScript==
// @name         [已废弃] ChatGPT to PDF
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  [此脚本已废弃] 此脚本已不再维护，无法使用。ChatGPT界面变更导致此脚本无法正常工作。
// @author       Your Name
// @match        https://chat.openai.com/*
// @match        https://*.chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';
    
    // 调试模式
    const DEBUG = true;
    
    // 日志函数
    function log(...args) {
        if (DEBUG) {
            console.log('[ChatGPT to PDF]', ...args);
        }
    }
    
    // 错误日志
    function logError(...args) {
        console.error('[ChatGPT to PDF]', ...args);
    }

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .pdf-button {
            position: fixed;
            bottom: 80px;
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
        .pdf-settings {
            position: fixed;
            bottom: 80px;
            right: 140px;
            background-color: #10a37f;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            z-index: 1000;
        }
        .pdf-settings:hover {
            background-color: #0d8a6c;
        }
        .settings-modal {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            width: 400px;
            max-width: 90%;
            color: #333;
        }
        .settings-modal h2 {
            margin-top: 0;
            color: #333;
            font-size: 20px;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .settings-modal .form-group {
            margin-bottom: 15px;
        }
        .settings-modal label {
            display: block;
            margin: 10px 0 5px;
            color: #333;
            font-weight: bold;
        }
        .settings-modal .checkbox-label {
            display: flex;
            align-items: center;
            font-weight: normal;
            cursor: pointer;
            margin: 10px 0;
        }
        .settings-modal .checkbox-label input {
            margin-right: 10px;
            width: auto;
        }
        .settings-modal input, .settings-modal select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 5px;
            box-sizing: border-box;
        }
        .settings-modal .button-group {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
            gap: 10px;
        }
        .settings-modal button {
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        .settings-modal .save-button {
            background-color: #10a37f;
            color: white;
            border: none;
        }
        .settings-modal .save-button:hover {
            background-color: #0d8a6c;
        }
        .settings-modal .cancel-button {
            background-color: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
        }
        .settings-modal .cancel-button:hover {
            background-color: #e5e5e5;
        }
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }
        @media print {
            .pdf-button, .pdf-settings, .settings-modal, .modal-overlay {
                display: none;
            }
        }
        
        /* PDF打印样式 */
        .simple-pdf-container {
            padding: 20px;
            font-family: Arial, sans-serif;
            color: #000;
            background-color: #fff;
        }
        .simple-pdf-container h1 {
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .simple-pdf-container .timestamp {
            text-align: right;
            font-size: 12px;
            color: #666;
            margin-bottom: 20px;
        }
        .simple-pdf-container .chat-message {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e5e5e5;
        }
        .simple-pdf-container .user-message {
            background-color: #f7f7f8;
        }
        .simple-pdf-container .assistant-message {
            background-color: #ffffff;
        }
        .simple-pdf-container .message-role {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .simple-pdf-container pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            padding: 16px;
            overflow-x: visible;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 85%;
            line-height: 1.45;
            margin: 10px 0;
        }
        .simple-pdf-container code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 85%;
            background-color: rgba(175, 184, 193, 0.2);
            padding: 0.2em 0.4em;
            border-radius: 6px;
        }
        .simple-pdf-container img {
            max-width: 100%;
            height: auto;
        }
        .simple-pdf-container p {
            margin: 10px 0;
        }
        .simple-pdf-container ul, .simple-pdf-container ol {
            padding-left: 2em;
        }
    `;
    document.head.appendChild(style);

    // 默认设置
    let settings = {
        filename: 'ChatGPT对话记录.pdf',
        pageSize: 'a4',
        orientation: 'portrait',
        includeTimestamp: true,
        includeTitle: true,
        scale: 2
    };

    // 从localStorage加载设置
    function loadSettings() {
        log('加载设置...');
        const savedSettings = localStorage.getItem('chatgpt2pdf_settings');
        if (savedSettings) {
            try {
                settings = JSON.parse(savedSettings);
                log('设置加载成功', settings);
            } catch (e) {
                logError('无法解析保存的设置', e);
                // 重置为默认设置
                saveSettings();
            }
        } else {
            log('未找到保存的设置，使用默认设置');
        }
    }

    // 保存设置到localStorage
    function saveSettings() {
        log('保存设置...', settings);
        try {
            localStorage.setItem('chatgpt2pdf_settings', JSON.stringify(settings));
            log('设置保存成功');
        } catch (e) {
            logError('保存设置失败', e);
            alert('保存设置失败: ' + e.message);
        }
    }

    // 创建设置模态框
    function createSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <h2>PDF导出设置</h2>
            
            <div class="form-group">
                <label for="filename">文件名</label>
                <input type="text" id="filename" value="${settings.filename}" placeholder="输入文件名，例如：ChatGPT对话记录.pdf">
            </div>
            
            <div class="form-group">
                <label for="pageSize">页面大小</label>
                <select id="pageSize">
                    <option value="a4" ${settings.pageSize === 'a4' ? 'selected' : ''}>A4</option>
                    <option value="letter" ${settings.pageSize === 'letter' ? 'selected' : ''}>Letter</option>
                    <option value="legal" ${settings.pageSize === 'legal' ? 'selected' : ''}>Legal</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="orientation">方向</label>
                <select id="orientation">
                    <option value="portrait" ${settings.orientation === 'portrait' ? 'selected' : ''}>纵向</option>
                    <option value="landscape" ${settings.orientation === 'landscape' ? 'selected' : ''}>横向</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="includeTimestamp" ${settings.includeTimestamp ? 'checked' : ''}>
                    <span>包含时间戳</span>
                </label>
                
                <label class="checkbox-label">
                    <input type="checkbox" id="includeTitle" ${settings.includeTitle ? 'checked' : ''}>
                    <span>包含标题</span>
                </label>
            </div>
            
            <div class="button-group">
                <button id="save-settings" class="save-button">保存</button>
                <button id="cancel-settings" class="cancel-button">取消</button>
            </div>
        `;
        document.body.appendChild(modal);

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);

        // 绑定事件
        document.getElementById('save-settings').addEventListener('click', function() {
            settings.filename = document.getElementById('filename').value || 'ChatGPT对话记录.pdf';
            settings.pageSize = document.getElementById('pageSize').value;
            settings.orientation = document.getElementById('orientation').value;
            settings.includeTimestamp = document.getElementById('includeTimestamp').checked;
            settings.includeTitle = document.getElementById('includeTitle').checked;
            
            saveSettings();
            modal.style.display = 'none';
            overlay.style.display = 'none';
        });

        document.getElementById('cancel-settings').addEventListener('click', function() {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        });

        return { modal, overlay };
    }

    // 创建下载按钮
    function createButtons() {
        // 导出PDF按钮
        const button = document.createElement('button');
        button.className = 'pdf-button';
        button.innerHTML = `
            <svg class="pdf-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                <path d="M12 17v-6"></path>
                <path d="M9 14l3 3 3-3"></path>
            </svg>
            导出PDF
        `;
        button.addEventListener('click', generatePDF);
        document.body.appendChild(button);

        // 设置按钮
        const settingsButton = document.createElement('button');
        settingsButton.className = 'pdf-settings';
        settingsButton.textContent = '设置';
        document.body.appendChild(settingsButton);

        // 创建设置模态框
        const { modal, overlay } = createSettingsModal();

        // 绑定设置按钮点击事件
        settingsButton.addEventListener('click', function() {
            modal.style.display = 'block';
            overlay.style.display = 'block';
        });
    }

    // 使用直接HTML提取的方式生成PDF
    async function generatePDF() {
        log('开始生成PDF...');
        
        // 显示加载提示
        const loadingToast = document.createElement('div');
        loadingToast.style.position = 'fixed';
        loadingToast.style.top = '20px';
        loadingToast.style.left = '50%';
        loadingToast.style.transform = 'translateX(-50%)';
        loadingToast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingToast.style.color = 'white';
        loadingToast.style.padding = '10px 20px';
        loadingToast.style.borderRadius = '4px';
        loadingToast.style.zIndex = '10000';
        loadingToast.textContent = '正在生成PDF，请稍候...';
        document.body.appendChild(loadingToast);
        
        try {
            // 创建一个简单的容器用于PDF生成
            const pdfContainer = document.createElement('div');
            pdfContainer.className = 'simple-pdf-container';
            
            // 添加标题
            if (settings.includeTitle) {
                const title = document.createElement('h1');
                title.textContent = 'ChatGPT 对话记录';
                pdfContainer.appendChild(title);
            }
            
            // 添加时间戳
            if (settings.includeTimestamp) {
                const timestamp = document.createElement('div');
                timestamp.className = 'timestamp';
                timestamp.textContent = `导出时间: ${new Date().toLocaleString()}`;
                pdfContainer.appendChild(timestamp);
            }
            
            // 直接提取对话内容 - 简化方法
            // 尝试获取对话内容
            const chatContent = extractChatContent();
            if (!chatContent || chatContent.length === 0) {
                throw new Error('无法提取对话内容');
            }
            
            log(`成功提取到 ${chatContent.length} 条对话`);
            
            // 添加对话到容器
            chatContent.forEach((item, index) => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `chat-message ${item.role === 'user' ? 'user-message' : 'assistant-message'}`;
                
                const roleDiv = document.createElement('div');
                roleDiv.className = 'message-role';
                roleDiv.textContent = item.role === 'user' ? '用户:' : 'ChatGPT:';
                messageDiv.appendChild(roleDiv);
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'message-content';
                contentDiv.innerHTML = item.content;
                messageDiv.appendChild(contentDiv);
                
                pdfContainer.appendChild(messageDiv);
            });
            
            // 处理代码块样式
            const codeBlocks = pdfContainer.querySelectorAll('pre, code');
            if (codeBlocks.length > 0) {
                log(`处理 ${codeBlocks.length} 个代码块`);
                codeBlocks.forEach(block => {
                    if (block.tagName === 'PRE') {
                        block.style.whiteSpace = 'pre-wrap';
                        block.style.wordWrap = 'break-word';
                        block.style.backgroundColor = '#f6f8fa';
                        block.style.padding = '15px';
                        block.style.borderRadius = '5px';
                        block.style.border = '1px solid #e5e5e5';
                        block.style.overflow = 'visible';
                    } else if (block.tagName === 'CODE') {
                        if (block.parentNode.tagName !== 'PRE') {
                            block.style.backgroundColor = 'rgba(175, 184, 193, 0.2)';
                            block.style.padding = '0.2em 0.4em';
                            block.style.borderRadius = '3px';
                            block.style.fontFamily = 'monospace';
                            block.style.fontSize = '85%';
                        }
                    }
                });
            }
            
            // 处理图片
            const images = pdfContainer.querySelectorAll('img');
            if (images.length > 0) {
                log(`处理 ${images.length} 张图片`);
                for (const img of images) {
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    
                    // 确保图片已加载
                    if (!img.complete) {
                        await new Promise(resolve => {
                            img.onload = resolve;
                            img.onerror = resolve;
                            // 5秒超时
                            setTimeout(resolve, 5000);
                        });
                    }
                }
            }
            
            // 临时添加到文档以进行渲染
            document.body.appendChild(pdfContainer);
            pdfContainer.style.position = 'absolute';
            pdfContainer.style.left = '-9999px';
            
            // 设置PDF选项
            const opt = {
                margin: [10, 10],
                filename: settings.filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: settings.scale || 2,
                    useCORS: true,
                    logging: DEBUG,
                    backgroundColor: '#ffffff'
                },
                jsPDF: { unit: 'mm', format: settings.pageSize, orientation: settings.orientation }
            };
            
            // 更新加载提示
            loadingToast.textContent = '正在渲染PDF，这可能需要一些时间...';
            
            // 检查内容
            const contentLength = pdfContainer.innerHTML.length;
            log(`PDF容器HTML长度: ${contentLength} 字符`);
            if (contentLength < 100) {
                log('警告: PDF内容可能不足');
            }
            
            // 生成PDF
            await html2pdf().set(opt).from(pdfContainer).save();
            log('PDF生成成功');
            
            // 更新加载提示
            loadingToast.textContent = 'PDF生成成功！';
            loadingToast.style.backgroundColor = 'rgba(16, 163, 127, 0.9)';
            
            // 3秒后移除提示
            setTimeout(() => {
                if (loadingToast.parentNode) {
                    loadingToast.parentNode.removeChild(loadingToast);
                }
            }, 3000);
        } catch (error) {
            logError('PDF生成失败', error);
            
            // 更新加载提示为错误信息
            loadingToast.textContent = '生成PDF失败: ' + error.message;
            loadingToast.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
            
            // 5秒后移除提示
            setTimeout(() => {
                if (loadingToast.parentNode) {
                    loadingToast.parentNode.removeChild(loadingToast);
                }
            }, 5000);
        } finally {
            // 移除临时元素
            if (document.body.contains(pdfContainer)) {
                document.body.removeChild(pdfContainer);
            }
        }
    }
    
    // 提取聊天内容的函数 - 使用多种方法尝试
    function extractChatContent() {
        log('提取聊天内容...');
        
        // 存储提取到的对话内容
        const chatContent = [];
        
        // 方法1: 使用新版ChatGPT UI中的对话元素
        try {
            const conversationTurns = document.querySelectorAll('[data-testid^="conversation-turn-"]');
            if (conversationTurns && conversationTurns.length > 0) {
                log(`方法1: 找到 ${conversationTurns.length} 个对话回合`);
                
                conversationTurns.forEach((turn, index) => {
                    // 判断角色 (user 或 assistant)
                    const isUser = turn.getAttribute('data-testid').includes('user');
                    const role = isUser ? 'user' : 'assistant';
                    
                    // 提取内容 (通常在 .markdown 或类似的容器中)
                    const contentElement = turn.querySelector('.markdown, .prose, .text-message');
                    if (contentElement) {
                        const contentHtml = contentElement.innerHTML;
                        chatContent.push({
                            role,
                            content: contentHtml
                        });
                        log(`提取对话 #${index+1} (${role})`);
                    }
                });
                
                if (chatContent.length > 0) {
                    return chatContent;
                }
            }
        } catch (e) {
            logError('方法1提取失败:', e);
        }
        
        // 方法2: 尝试查找具有角色属性的元素
        try {
            const roleElements = document.querySelectorAll('[data-message-author-role]');
            if (roleElements && roleElements.length > 0) {
                log(`方法2: 找到 ${roleElements.length} 个带角色的消息元素`);
                
                roleElements.forEach((element, index) => {
                    const role = element.getAttribute('data-message-author-role');
                    const contentElement = element.querySelector('.markdown, .prose, .text-message');
                    if (contentElement) {
                        chatContent.push({
                            role,
                            content: contentElement.innerHTML
                        });
                        log(`提取对话 #${index+1} (${role})`);
                    }
                });
                
                if (chatContent.length > 0) {
                    return chatContent;
                }
            }
        } catch (e) {
            logError('方法2提取失败:', e);
        }
        
        // 方法3: 使用jQuery直观选择可能的对话元素
        try {
            const $messages = $('div.group:has(div.markdown), article, [data-testid^="conversation-turn-"]');
            if ($messages.length > 0) {
                log(`方法3: 找到 ${$messages.length} 个可能的消息元素`);
                
                $messages.each(function(index) {
                    // 判断角色 (简单检测)
                    let role = 'assistant';  // 默认为助手
                    const $this = $(this);
                    
                    if ($this.find('[data-testid="user-message"]').length > 0 || 
                        $this.attr('data-message-author-role') === 'user' ||
                        $this.text().toLowerCase().includes('you:') || 
                        $this.hasClass('user-message')) {
                        role = 'user';
                    }
                    
                    // 提取内容
                    const $content = $this.find('.markdown, .prose, .text-message');
                    if ($content.length > 0) {
                        chatContent.push({
                            role,
                            content: $content.html()
                        });
                        log(`提取对话 #${index+1} (${role})`);
                    } else {
                        // 如果找不到特定内容元素，使用整个元素的内容
                        chatContent.push({
                            role,
                            content: $this.html()
                        });
                        log(`提取对话 #${index+1} (${role}) - 使用整个元素`);
                    }
                });
                
                if (chatContent.length > 0) {
                    return chatContent;
                }
            }
        } catch (e) {
            logError('方法3提取失败:', e);
        }
        
        // 方法4: 极端情况 - 提取页面所有文本
        try {
            log('方法4: 尝试提取页面全部可见文本');
            
            // 获取主要内容区域
            const mainContent = document.querySelector('main');
            if (mainContent) {
                // 处理为单条消息
                chatContent.push({
                    role: 'assistant',
                    content: `<div class="extracted-full-content">${mainContent.innerHTML}</div>`
                });
                log('使用整个主内容区域作为单条消息');
                return chatContent;
            }
        } catch (e) {
            logError('方法4提取失败:', e);
        }
        
        // 所有方法都失败
        log('所有提取方法均失败');
        return [];
    }

    // 显示废弃提示
    function showDeprecationNotice() {
        const noticeDiv = document.createElement('div');
        noticeDiv.style.position = 'fixed';
        noticeDiv.style.top = '20px';
        noticeDiv.style.left = '50%';
        noticeDiv.style.transform = 'translateX(-50%)';
        noticeDiv.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
        noticeDiv.style.color = 'white';
        noticeDiv.style.padding = '15px 25px';
        noticeDiv.style.borderRadius = '8px';
        noticeDiv.style.zIndex = '10000';
        noticeDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        noticeDiv.style.fontSize = '14px';
        noticeDiv.style.fontWeight = 'bold';
        noticeDiv.style.textAlign = 'center';
        
        noticeDiv.innerHTML = `
            <div style="margin-bottom: 10px; font-size: 16px;">⚠️ ChatGPT to PDF 脚本已废弃 ⚠️</div>
            <div>由于ChatGPT界面变更，此脚本已不再维护且无法正常工作。</div>
            <div style="margin-top: 10px;">请卸载此脚本并寻找替代方案。</div>
            <div style="margin-top: 15px;">
                <button id="dismiss-notice" style="background-color: white; color: #dc3545; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    我知道了
                </button>
            </div>
        `;
        
        document.body.appendChild(noticeDiv);
        
        // 添加关闭按钮事件
        document.getElementById('dismiss-notice').addEventListener('click', function() {
            noticeDiv.style.display = 'none';
        });
    }

    // 页面加载完成后显示废弃提示
    window.addEventListener('load', function() {
        console.error('[ChatGPT to PDF] 此脚本已废弃，不再维护，无法正常工作。请卸载此脚本。');
        setTimeout(showDeprecationNotice, 2000);
    });
})(); 