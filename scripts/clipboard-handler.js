// Clipboard Handler Module
// Handles capturing of clipboard content - text and images

class ClipboardHandler {
  constructor() {
    this.clipboardText = null;
    this.clipboardImage = null;
  }

  // Read clipboard content (text and image)
  async readClipboard() {
    try {
      // Try to get text content
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          this.clipboardText = await navigator.clipboard.readText();
        } catch (error) {
          console.log('Could not read text from clipboard:', error);
        }
      }

      // Try to get image content (if available in browser)
      if (navigator.clipboard && navigator.clipboard.read) {
        try {
          const clipboardItems = await navigator.clipboard.read();
          
          for (const item of clipboardItems) {
            // Check for image types
            if (item.types.some(type => type.startsWith('image/'))) {
              const imageType = item.types.find(type => type.startsWith('image/'));
              const blob = await item.getType(imageType);
              this.clipboardImage = blob;
              break;
            }
          }
        } catch (error) {
          console.log('Could not read image from clipboard:', error);
        }
      }

      return {
        text: this.clipboardText,
        image: this.clipboardImage
      };
    } catch (error) {
      console.error('Error reading clipboard:', error);
      return { text: null, image: null };
    }
  }

  // Handle file sharing from other apps (for mobile PWA)
  setupShareTarget() {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { data } = event;
        if (data.type === 'share-target') {
          // Handle files from share
          if (data.files && data.files.length) {
            this.handleSharedFiles(data.files);
          }
          // Handle text from share
          if (data.text) {
            this.clipboardText = data.text;
            this.displayClipboardContent();
          }
        }
      });
    }
  }

  // Handle files shared from other applications
  handleSharedFiles(files) {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        this.clipboardImage = file;
        break; // Take only the first image
      } else if (file.type === 'text/plain') {
        // Read text files
        const reader = new FileReader();
        reader.onload = (e) => {
          this.clipboardText = e.target.result;
          this.displayClipboardContent();
        };
        reader.readAsText(file);
      }
    }
  }

  // Allow users to manually upload files
  setupFileUpload(fileInputId) {
    const fileInput = document.getElementById(fileInputId);
    if (fileInput) {
      fileInput.addEventListener('change', (event) => {
        if (event.target.files && event.target.files.length > 0) {
          const file = event.target.files[0];
          if (file.type.startsWith('image/')) {
            this.clipboardImage = file;
          } else if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
              this.clipboardText = e.target.result;
              this.displayClipboardContent();
            };
            reader.readAsText(file);
          }
          this.displayClipboardContent();
        }
      });
    }
  }

  // Display the clipboard content in the UI
  displayClipboardContent(textContainerId = 'clipboard-text', imageContainerId = 'clipboard-image') {
    // Display text if available
    const textContainer = document.getElementById(textContainerId);
    if (textContainer && this.clipboardText) {
      textContainer.textContent = this.clipboardText;
      textContainer.style.display = 'block';
    }

    // Display image if available
    const imageContainer = document.getElementById(imageContainerId);
    if (imageContainer && this.clipboardImage) {
      // Remove any existing images
      while (imageContainer.firstChild) {
        imageContainer.removeChild(imageContainer.firstChild);
      }

      // Create an image element
      const img = document.createElement('img');
      img.src = URL.createObjectURL(this.clipboardImage);
      img.alt = 'Clipboard image';
      img.style.maxWidth = '100%';
      imageContainer.appendChild(img);
      imageContainer.style.display = 'block';
    }
  }

  // Clear clipboard content
  clearClipboardContent(textContainerId = 'clipboard-text', imageContainerId = 'clipboard-image') {
    this.clipboardText = null;
    this.clipboardImage = null;
    
    // Clear text container
    const textContainer = document.getElementById(textContainerId);
    if (textContainer) {
      textContainer.textContent = '';
      textContainer.style.display = 'none';
    }
    
    // Clear image container
    const imageContainer = document.getElementById(imageContainerId);
    if (imageContainer) {
      while (imageContainer.firstChild) {
        imageContainer.removeChild(imageContainer.firstChild);
      }
      imageContainer.style.display = 'none';
    }
  }
}

// Create a global instance
const clipboardHandler = new ClipboardHandler();