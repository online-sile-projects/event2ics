import { handleSharedContent, handlePasteEvent, sharedContent } from './share-handler.js';
import { getBase64FromUrl, callGeminiAPI, getApiKey, setApiKey } from './api-service.js';
import { downloadICS } from './ics-generator.js';

// 初始化 API key 輸入欄位
const apiKeyInput = document.getElementById('api-key');
const savedApiKey = getApiKey();
if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
}

// 處理 API key 儲存
document.getElementById('save-api-key').addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        setApiKey(apiKey);
        alert('API Key 已儲存');
    } else {
        alert('請輸入有效的 API Key');
    }
});

// 監聽來自 Service Worker 的訊息
navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'share-target') {
        handleSharedContent(event.data.content);
    }
});

// 處理剪貼簿貼上事件
document.addEventListener('paste', handlePasteEvent);

// 轉換成 ICS 檔案
document.getElementById('convert-to-ics').addEventListener('click', async () => {
    if (!sharedContent) {
        alert('請先分享或貼上內容');
        return;
    }

    try {
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
    }
});