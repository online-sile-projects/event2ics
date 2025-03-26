document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        fileContent: null,
        textContent: null,
        apiKey: localStorage.getItem('geminiApiKey') || '',

        init() {
            this.checkApiKey();
            this.registerShareTarget();
        },

        checkApiKey() {
            if (!this.apiKey) {
                const key = prompt('請輸入 Gemini API Key：');
                if (key) {
                    this.apiKey = key;
                    localStorage.setItem('geminiApiKey', key);
                }
            }
        },

        registerShareTarget() {
            if (navigator.share) {
                navigator.share({
                    title: 'Event2ICS',
                    text: '將文字或圖片轉換成日曆檔案'
                }).catch(console.error);
            }
        },

        async processContent() {
            try {
                const response = await this.callGeminiAPI();
                if (response) {
                    const icsContent = this.generateICS(response);
                    this.downloadICS(icsContent);
                }
            } catch (error) {
                console.error('處理內容時發生錯誤：', error);
                alert('處理失敗，請重試');
            }
        },

        async callGeminiAPI() {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
            const data = {
                contents: [{
                    role: "user",
                    parts: []
                }],
                systemInstruction: {
                    role: "user",
                    parts: [{
                        text: "你是活動分析器，分析輸入內容並生成 ICS 格式的日曆事件。回傳一個物件，包含事件名稱、開始時間、結束時間、地點、描述等資訊。"
                    }]
                }
            };

            if (this.fileContent) {
                // 處理圖片
                const imageBlob = await fetch(this.fileContent).then(r => r.blob());
                const base64 = await this.blobToBase64(imageBlob);
                data.contents[0].parts.push({
                    inlineData: {
                        data: base64,
                        mimeType: imageBlob.type
                    }
                });
            } else if (this.textContent) {
                // 處理文字
                data.contents[0].parts.push({
                    text: this.textContent
                });
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            return result;
        },

        generateICS(apiResponse) {
            // 解析 API 回應並生成 ICS 格式
            const event = JSON.parse(apiResponse.candidates[0].content.parts[0].text);
            
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'BEGIN:VEVENT',
                `SUMMARY:${event.name}`,
                `DTSTART:${this.formatDateTime(event.startTime)}`,
                `DTEND:${this.formatDateTime(event.endTime)}`,
                `LOCATION:${event.location || ''}`,
                `DESCRIPTION:${event.description || ''}`,
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n');

            return icsContent;
        },

        downloadICS(icsContent) {
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'event.ics';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },

        formatDateTime(dateTimeStr) {
            const date = new Date(dateTimeStr);
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        },

        blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        },

        openFilePicker() {
            document.getElementById('filePicker').click();
        },

        handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.fileContent = e.target.result;
                    this.textContent = null;
                };
                reader.readAsDataURL(file);
            }
        },

        clearContent() {
            this.fileContent = null;
            this.textContent = null;
            document.getElementById('filePicker').value = '';
        }
    }));
});