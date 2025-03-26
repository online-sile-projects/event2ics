export class ContentEditor {
    constructor(containerId = 'content-editor') {
        this.container = document.getElementById(containerId);
        this.setupEditor();
    }

    setupEditor() {
        // 建立編輯器介面
        const textarea = document.createElement('textarea');
        textarea.classList.add('editor-textarea');
        textarea.placeholder = '在此編輯文字...';
        
        const saveButton = document.createElement('button');
        saveButton.textContent = '儲存修改';
        saveButton.classList.add('button');
        
        this.container.appendChild(textarea);
        this.container.appendChild(saveButton);

        // 監聽內容接收事件
        window.addEventListener('content-received', (event) => {
            if (event.detail.type === 'text') {
                textarea.value = event.detail.data;
            }
        });

        // 監聽儲存按鈕點擊
        saveButton.addEventListener('click', () => {
            const editedContent = textarea.value;
            const event = new CustomEvent('content-edited', {
                detail: {
                    type: 'text',
                    data: editedContent
                }
            });
            window.dispatchEvent(event);
        });
    }
}