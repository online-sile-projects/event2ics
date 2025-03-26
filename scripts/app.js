// Main Application Script
// Initializes the application and coordinates between modules

document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  initApp();
});

// Initialize the application
function initApp() {
  // Set up file upload functionality
  clipboardHandler.setupFileUpload('file-input');
  
  // Set up share target for PWA
  clipboardHandler.setupShareTarget();
  
  // Set up UI event handlers
  setupUIEventHandlers();
  
  // Load saved API configuration
  loadApiConfig();
  
  // Register service worker for PWA
  registerServiceWorker();
}

// Set up UI event handlers
function setupUIEventHandlers() {
  // Paste button
  const pasteButton = document.getElementById('paste-button');
  if (pasteButton) {
    pasteButton.addEventListener('click', async () => {
      await clipboardHandler.readClipboard();
      clipboardHandler.displayClipboardContent();
    });
  }
  
  // Process button
  const processButton = document.getElementById('process-button');
  if (processButton) {
    processButton.addEventListener('click', async () => {
      try {
        showLoading(true);
        
        // Get clipboard content
        const text = clipboardHandler.clipboardText;
        const image = clipboardHandler.clipboardImage;
        
        if (!text && !image) {
          showError('No content to process. Please paste or upload content first.');
          return;
        }
        
        // Process with Gemini API
        const files = image ? [image] : [];
        const result = await geminiService.processContent(text, files);
        
        // Display the result
        document.getElementById('api-response').textContent = result;
        document.getElementById('api-response-container').style.display = 'block';
        
        // Extract event data
        const eventData = geminiService.extractEventData(result);
        if (eventData) {
          displayEventData(eventData);
        }
      } catch (error) {
        showError('Error processing content: ' + error.message);
      } finally {
        showLoading(false);
      }
    });
  }
  
  // Create ICS button
  const createIcsButton = document.getElementById('create-ics-button');
  if (createIcsButton) {
    createIcsButton.addEventListener('click', () => {
      try {
        // Get event data from form
        const eventData = {
          title: document.getElementById('event-title').value,
          date: document.getElementById('event-date').value,
          time: document.getElementById('event-time').value,
          location: document.getElementById('event-location').value,
          description: document.getElementById('event-description').value
        };
        
        // Generate ICS file
        if (!eventData.title) {
          showError('Event title is required');
          return;
        }
        
        const filename = eventData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.ics';
        const result = icsGenerator.downloadICS(eventData, filename);
        
        if (result) {
          showMessage('ICS file has been created and downloaded');
        } else {
          showError('Failed to create ICS file');
        }
      } catch (error) {
        showError('Error creating ICS file: ' + error.message);
      }
    });
  }
  
  // Clear button
  const clearButton = document.getElementById('clear-button');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      clipboardHandler.clearClipboardContent();
      document.getElementById('api-response').textContent = '';
      document.getElementById('api-response-container').style.display = 'none';
      clearEventForm();
    });
  }
  
  // API Settings button
  const apiSettingsButton = document.getElementById('api-settings-button');
  if (apiSettingsButton) {
    apiSettingsButton.addEventListener('click', () => {
      document.getElementById('settings-modal').style.display = 'flex';
    });
  }
  
  // Close modal button
  const closeModalButton = document.getElementById('close-modal');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
      document.getElementById('settings-modal').style.display = 'none';
    });
  }
  
  // Save API settings
  const saveApiSettingsButton = document.getElementById('save-api-settings');
  if (saveApiSettingsButton) {
    saveApiSettingsButton.addEventListener('click', () => {
      const apiKey = document.getElementById('api-key-input').value;
      // const systemInstruction = document.getElementById('system-instruction').value;
      
      // Update configuration
      API_CONFIG.API_KEY = apiKey;
      // API_CONFIG.systemInstruction = systemInstruction;
      
      // Save to local storage
      saveApiConfig(API_CONFIG);
      
      document.getElementById('settings-modal').style.display = 'none';
      showMessage('API settings saved');
    });
  }
  
  // Handle window clicks to close modal
  window.addEventListener('click', (event) => {
    const modal = document.getElementById('settings-modal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// Display event data in the form
function displayEventData(eventData) {
  document.getElementById('event-title').value = eventData.title || '';
  document.getElementById('event-date').value = eventData.date || '';
  document.getElementById('event-time').value = eventData.time || '';
  document.getElementById('event-location').value = eventData.location || '';
  document.getElementById('event-description').value = eventData.description || '';
  
  document.getElementById('event-form-container').style.display = 'block';
}

// Clear event form
function clearEventForm() {
  document.getElementById('event-title').value = '';
  document.getElementById('event-date').value = '';
  document.getElementById('event-time').value = '';
  document.getElementById('event-location').value = '';
  document.getElementById('event-description').value = '';
  
  document.getElementById('event-form-container').style.display = 'none';
}

// Show loading indicator
function showLoading(isLoading) {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = isLoading ? 'flex' : 'none';
  }
}

// Show error message
function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

// Show success message
function showMessage(message) {
  const messageElement = document.getElementById('success-message');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 3000);
  }
}

// Register service worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }
}