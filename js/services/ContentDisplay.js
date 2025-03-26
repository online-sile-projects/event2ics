export class ContentDisplay {
    constructor(containerId = 'content-display') {
        this.container = document.getElementById(containerId);
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('content-received', (event) => {
            this.displayContent(event.detail);
        });
    }

    displayContent({ type, data }) {
        this.clearDisplay();
        
        if (type === 'text') {
            this.displayText(data);
        } else if (type === 'image') {
            this.displayImage(data);
        }
    }

    displayText(text) {
        const textElement = document.createElement('div');
        textElement.textContent = text;
        textElement.classList.add('content-text');
        this.container.appendChild(textElement);
    }

    displayImage(imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('image-preview');
        img.alt = '分享的圖片';
        this.container.appendChild(img);
    }

    clearDisplay() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
}