class GeminiService {
    constructor() {
        this.API_KEY = localStorage.getItem('gemini_api_key') || ''; // 從 localStorage 讀取 API key
        this.API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    }

    setApiKey(apiKey) {
        this.API_KEY = apiKey;
        localStorage.setItem('gemini_api_key', apiKey);
    }

    async convertToICS(inputText) {
        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: inputText
                        }
                    ]
                }
            ],
            systemInstruction: {
                role: "user",
                parts: [
                    {
                        text: "請將輸入的文字轉換成標準的 ICS 格式。確保包含 BEGIN:VCALENDAR、VERSION、PRODID、BEGIN:VEVENT、SUMMARY、DTSTART、DTEND、LOCATION、DESCRIPTION、END:VEVENT 和 END:VCALENDAR 等必要欄位。"
                    }
                ]
            },
            generationConfig: {
                temperature: 1,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
                responseMimeType: "text/plain"
            }
        };

        try {
            const response = await fetch(`${this.API_ENDPOINT}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API 請求失敗: ${response.statusText}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('轉換過程發生錯誤:', error);
            throw error;
        }
    }
}

export default GeminiService;