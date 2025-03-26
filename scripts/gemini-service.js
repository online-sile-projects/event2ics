// Gemini API Service
// This module handles the communication with Google's Gemini API

class GeminiService {
  constructor() {
    this.fileUris = [];
    this.config = API_CONFIG;
  }

  // Upload an image file to Gemini API
  async uploadFile(file) {
    if (!this.config.API_KEY) {
      throw new Error('API key is not configured');
    }

    const numBytes = file.size;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.config.UPLOAD_ENDPOINT}?key=${this.config.API_KEY}`, {
        method: 'POST',
        headers: {
          'X-Goog-Upload-Command': 'start, upload, finalize',
          'X-Goog-Upload-Header-Content-Length': numBytes,
          'X-Goog-Upload-Header-Content-Type': file.type
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.fileUris.push({
        fileUri: data.file.uri,
        mimeType: file.type
      });
      
      return data.file.uri;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Process content with Gemini API
  async processContent(textInput = '', files = []) {
    if (!this.config.API_KEY) {
      throw new Error('API key is not configured');
    }

    // Upload files if provided
    if (files.length > 0) {
      for (const file of files) {
        await this.uploadFile(file);
      }
    }

    // Build the contents array for the API request
    const contents = [];
    
    // Add initial user-model interaction
    contents.push({
      role: "user",
      parts: [{
        text: "Extract event details from the following content and format them as a calendar event."
      }]
    });

    // Add model response placeholder
    contents.push({
      role: "model",
      parts: [{
        text: "I'll help extract event details from the content you provide."
      }]
    });

    // Add any uploaded files
    for (const fileData of this.fileUris) {
      contents.push({
        role: "user",
        parts: [{
          fileData: fileData
        }]
      });

      // Add model response placeholder for each file
      contents.push({
        role: "model",
        parts: [{
          text: "I've received the image and will analyze it for event details."
        }]
      });
    }

    // Add the text input
    const finalPrompt = textInput || "Please extract event details from the provided content and format them as a calendar event with title, date, time, location, and description.";
    contents.push({
      role: "user",
      parts: [{
        text: finalPrompt
      }]
    });

    // Build the API request
    const requestBody = {
      contents: contents,
      systemInstruction: {
        role: "user",
        parts: [{
          text: "Please extract event details from the provided content and format them as a calendar event with title, date, time, location, and description."
        }]
      },
      generationConfig: {
        temperature: this.config.temperature,
        topK: this.config.topK,
        topP: this.config.topP,
        maxOutputTokens: this.config.maxOutputTokens,
        responseMimeType: this.config.responseMimeType
      }
    };

    try {
      const response = await fetch(`${this.config.API_ENDPOINT}?key=${this.config.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from API';
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    } finally {
      // Clear file URIs for next request
      this.fileUris = [];
    }
  }

  // Extract structured event data from API response
  extractEventData(apiResponse) {
    // Implement logic to extract event details from the API response
    // You may need to adapt this based on how the API formats the response
    try {
      // Basic extraction - in a real app, you might want more sophisticated parsing
      const eventPattern = /Event Title:\s*([^\n]+)\s*Date:\s*([^\n]+)\s*Time:\s*([^\n]+)\s*Location:\s*([^\n]+)\s*Description:\s*([^]*)/i;
      const match = apiResponse.match(eventPattern);
      
      if (match) {
        return {
          title: match[1]?.trim(),
          date: match[2]?.trim(),
          time: match[3]?.trim(),
          location: match[4]?.trim(),
          description: match[5]?.trim()
        };
      } else {
        // If no structured format is found, return the whole text as description
        return {
          title: "Event from clipboard",
          date: new Date().toISOString().split('T')[0],
          time: "",
          location: "",
          description: apiResponse.trim()
        };
      }
    } catch (error) {
      console.error('Error parsing event data:', error);
      return null;
    }
  }
}

// Create a global instance
const geminiService = new GeminiService();