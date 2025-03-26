export async function getBase64FromUrl(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export async function callGeminiAPI(prompt) {
    const API_KEY = 'AIzaSyC-ruOMRJYCave2Mo4I2wLzfu-Ap6CF4O0';
    let fileUri = null;

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
        console.log('解析的內容:', text);
        return JSON.parse(text);
    } catch (error) {
        console.error('解析回應失敗:', error);
        throw new Error('無法解析API回應');
    }
}