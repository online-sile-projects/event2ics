import GeminiService from './GeminiService.js';
import ICSDownloader from './ICSDownloader.js';

export class EventProcessor {
    constructor() {
        this.geminiService = new GeminiService();
        this.registerShareTarget();
    }

    registerShareTarget() {
        if (navigator.share) {
            window.addEventListener('load', () => {
                // 監聽分享事件
                navigator.serviceWorker.addEventListener('message', event => {
                    if (event.data.type === 'share-target') {
                        this.handleSharedContent(event.data.content);
                    }
                });
            });
        }
    }

    async handleSharedContent(content) {
        if (!content) return;

        const event = new CustomEvent('content-received', {
            detail: {
                type: content.type || 'text',
                data: content.data
            }
        });
        window.dispatchEvent(event);
    }

    async processAndDownload(eventText) {
        try {
            // 使用 Gemini API 轉換成 ICS 格式
            const icsContent = await this.geminiService.convertToICS(eventText);
            
            // 下載 ICS 檔案
            ICSDownloader.downloadICSFile(icsContent);
            
            return {
                success: true,
                message: '已成功轉換並下載 ICS 檔案'
            };
        } catch (error) {
            console.error('處理事件時發生錯誤:', error);
            return {
                success: false,
                message: `處理失敗: ${error.message}`
            };
        }
    }

    // 處理文字內容
    static processTextContent(text) {
        return text.trim();
    }

    // 處理圖片內容
    static async processImageContent(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    }
}

export default EventProcessor;