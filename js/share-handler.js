export let sharedContent = null;

export function handleSharedContent(content) {
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

export async function handlePasteEvent(e) {
    e.preventDefault();
    const items = e.clipboardData.items;
    const apiKeyInput = document.getElementById('api-key');
    
    // 如果焦點在 apiKeyInput 上，直接貼到 apiKeyInput
    if (document.activeElement === apiKeyInput) {
        for (const item of items) {
            if (item.type === 'text/plain') {
                item.getAsString(text => {
                    apiKeyInput.value = text;
                });
                return;
            }
        }
        return;
    }

    // 其他情況的處理
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
}