let sharedContent = null;

// 監聽來自 Service Worker 的訊息
navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'share-target') {
        handleSharedContent(event.data.content);
    }
});

// 處理分享內容
function handleSharedContent(content) {
    sharedContent = content;
    const textContent = document.getElementById('text-content');
    const imageContent = document.getElementById('image-content');

    if (content.type === 'text') {
        textContent.textContent = content.data;
        textContent.style.display = 'block';
        imageContent.style.display = 'none';
    } else if (content.type === 'image') {
        imageContent.src = content.data;
        imageContent.style.display = 'block';
        textContent.style.display = 'none';
    }
}

// 處理剪貼簿貼上事件
document.addEventListener('paste', async (e) => {
    e.preventDefault();
    const items = e.clipboardData.items;

    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            const imageUrl = URL.createObjectURL(blob);
            handleSharedContent({
                type: 'image',
                data: imageUrl
            });
            break;
        } else if (item.type === 'text/plain') {
            item.getAsString(text => {
                handleSharedContent({
                    type: 'text',
                    data: text
                });
            });
            break;
        }
    }
});

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

        // 呼叫 Gemini API（需要實作）
        const eventInfo = await callGeminiAPI(prompt);
        
        // 生成 ICS 檔案
        const icsContent = generateICS(eventInfo);
        
        // 下載檔案
        downloadICS(icsContent);
    } catch (error) {
        console.error('轉換失敗:', error);
        alert('轉換失敗，請稍後再試');
    }
});

// 將 URL 轉換為 Base64
async function getBase64FromUrl(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// 呼叫 Gemini API
async function callGeminiAPI(prompt) {
    const API_KEY = 'AIzaSyC-ruOMRJYCave2Mo4I2wLzfu-Ap6CF4O0'; // 請替換成您的 API 金鑰
    let fileUri = null;

    // 如果有圖片，先上傳圖片
    if (prompt.image) {
        const imageBlob = await fetch(`data:image/jpeg;base64,${prompt.image}`).then(r => r.blob());
        const formData = new FormData();
        formData.append('file', imageBlob, 'image.jpg');

        const uploadResponse = await fetch(
            `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'X-Goog-Upload-Command': 'start, upload, finalize',
                    'X-Goog-Upload-Header-Content-Length': imageBlob.size.toString(),
                    'X-Goog-Upload-Header-Content-Type': 'image/jpeg'
                },
                body: formData
            }
        );

        if (!uploadResponse.ok) {
            throw new Error('圖片上傳失敗');
        }

        const uploadResult = await uploadResponse.json();
        fileUri = uploadResult.file.uri;
    }

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: "我需要你幫我從以下內容擷取事件資訊，並以下列 JSON 格式回覆：\n" +
                              "{\n" +
                              "  title: '事件標題',\n" +
                              "  startDate: 'YYYYMMDDTHHMMSS',\n" +
                              "  endDate: 'YYYYMMDDTHHMMSS',\n" +
                              "  location: '地點',\n" +
                              "  description: '描述'\n" +
                              "}\n\n" +
                              "內容如下：\n" + prompt.text
                    }
                ]
            }
        ],
        systemInstruction: {
            role: "user",
            parts: [
                {
                    text: "你是一個專門協助解析事件資訊的助手。請用繁體中文回覆。"
                }
            ]
        },
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
        }
    };

    // 如果有圖片 URI，加入圖片部分
    if (fileUri) {
        requestBody.contents[0].parts.push({
            fileData: {
                fileUri: fileUri,
                mimeType: "image/jpeg"
            }
        });
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        }
    );

    if (!response.ok) {
        throw new Error('API 呼叫失敗');
    }

    const data = await response.json();
    return parseGeminiResponse(data);
}

function parseGeminiResponse(response) {
    try {
        const text = response.candidates[0].content.parts[0].text;
        // 嘗試解析 JSON 回應
        return JSON.parse(text);
    } catch (error) {
        console.error('解析回應失敗:', error);
        throw new Error('無法解析API回應');
    }
}

// 生成 ICS 檔案內容
function generateICS(eventInfo) {
    const now = new Date().toISOString().replace(/[-:.]/g, '');
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//event2ics//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${now}-${Math.random().toString(36).substr(2, 9)}
DTSTAMP:${now}
DTSTART:${eventInfo.startDate}
DTEND:${eventInfo.endDate}
SUMMARY:${eventInfo.title}
LOCATION:${eventInfo.location}
DESCRIPTION:${eventInfo.description}
END:VEVENT
END:VCALENDAR`;
}

// 下載 ICS 檔案
function downloadICS(icsContent) {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'event.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}