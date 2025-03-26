// API Configuration for Gemini API
const API_CONFIG = {
  API_KEY: '',  // Will be set by user through UI
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  UPLOAD_ENDPOINT: 'https://generativelanguage.googleapis.com/upload/v1beta/files',
  systemInstruction: '你是人',  // Default system instruction
  temperature: 1,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain'
};

// Save API configuration to local storage
function saveApiConfig(config) {
  localStorage.setItem('event2ics_api_config', JSON.stringify(config));
}

// Load API configuration from local storage
function loadApiConfig() {
  const savedConfig = localStorage.getItem('event2ics_api_config');
  if (savedConfig) {
    const parsedConfig = JSON.parse(savedConfig);
    // Update the API_CONFIG object with saved values
    Object.assign(API_CONFIG, parsedConfig);
  }
  return API_CONFIG;
}

// Initialize configuration on load
document.addEventListener('DOMContentLoaded', () => {
  loadApiConfig();
});