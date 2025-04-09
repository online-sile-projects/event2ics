import { handleSharedContent, handlePasteEvent, sharedContent } from './share-handler.js';
import { getBase64FromUrl, callGeminiAPI, setApiKey, getApiKey } from './api-service.js';
import { downloadICS } from './ics-generator.js';

// 設定收合控制
function setupSettingsToggle() {
    const toggleButton = document.querySelector('.toggle-settings');
    const settingsContainer = document.querySelector('.settings-container');
    const toggleText = document.querySelector('.toggle-text');
    const savedApiKey = getApiKey();

    // 如果已經有存儲的 API Key，預設收起設定
    if (savedApiKey) {
        settingsContainer.classList.add('collapsed');
        toggleText.textContent = '顯示設定';
    }

    toggleButton.addEventListener('click', () => {
        settingsContainer.classList.toggle('collapsed');
        toggleText.textContent = settingsContainer.classList.contains('collapsed') ? '顯示設定' : '隱藏設定';
    });
}

// 載入已儲存的 API Key 並設定收合控制
document.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = getApiKey();
    if (savedApiKey) {
        document.getElementById('api-key').value = savedApiKey;
    }
    setupSettingsToggle();
});

// 監聽來自 Service Worker 的訊息
navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'share-target') {
        handleSharedContent(event.data.content);
    }
});

// 處理剪貼簿貼上事件
document.addEventListener('paste', handlePasteEvent);

// 處理儲存 API Key
document.getElementById('save-api-key').addEventListener('click', () => {
    const apiKey = document.getElementById('api-key').value.trim();
    if (apiKey) {
        setApiKey(apiKey);
        alert('API Key 已儲存');
    } else {
        alert('請輸入 API Key');
    }
});

// 轉換成 ICS 檔案
document.getElementById('convert-to-ics').addEventListener('click', async () => {
    const convertButton = document.getElementById('convert-to-ics');
    
    if (!sharedContent) {
        alert('請先分享或貼上內容');
        return;
    }

    try {
        convertButton.classList.add('loading');
        convertButton.disabled = true;

        let prompt;
        if (sharedContent.type === 'image') {
            const imageBase64 = await getBase64FromUrl(sharedContent.data);
            prompt = {
                image: imageBase64,
                text: '請從這張圖片中擷取事件相關資訊，包含事件名稱、日期、時間和地點，並整理成行事曆格式。'
            };
        } else {
            prompt = {
                text: `請從以下文字中擷取事件相關資訊，包含事件名稱、日期、時間和地點，並整理成行事曆格式：\n${sharedContent.data}`
            };
        }

        const icsContent = await callGeminiAPI(prompt);
        downloadICS(icsContent);
    } catch (error) {
        console.error('轉換失敗:', error);
        alert('轉換失敗，請稍後再試');
    } finally {
        convertButton.classList.remove('loading');
        convertButton.disabled = false;
    }
});