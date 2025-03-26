export class EventProcessor {
    constructor() {
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