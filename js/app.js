import { handleSharedContent, handlePasteEvent, sharedContent } from './share-handler.js';
import { getBase64FromUrl, callGeminiAPI } from './api-service.js';
import { generateICS, downloadICS } from './ics-generator.js';

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

        const eventInfo = await callGeminiAPI(prompt);
        const icsContent = generateICS(eventInfo);
        downloadICS(icsContent);
    } catch (error) {
        console.error('轉換失敗:', error);
        alert('轉換失敗，請稍後再試');
    }
});