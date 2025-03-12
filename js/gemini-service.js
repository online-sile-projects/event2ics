// Get API key from localStorage instead of hardcoding
function getGeminiApiKey() {
  return localStorage.getItem('geminiApiKey') || '';
}

/**
 * Process content with Google Gemini API
 * @param {string} content - Text or base64 image data
 * @param {boolean} isImage - Whether content is an image
 * @returns {Promise<Object>} - Parsed event data
 */
async function processWithGemini(content, isImage = false) {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error('Gemini API key is not set. Please set it in the settings.');
  }
  
  const apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
  const apiUrlVision = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent';
  
  let requestBody;
  let url;
  
  if (isImage) {
    // For image processing
    url = `${apiUrlVision}?key=${apiKey}`;
    
    // Extract base64 data from data URL
    const base64Data = content.split(',')[1];
    
    requestBody = {
      contents: [{
        parts: [
          {
            text: "Extract event information from this image and parse it into a structured format with the following fields: title, start (ISO datetime), end (ISO datetime), location, description. Return only JSON, no other text."
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Data
            }
          }
        ]
      }]
    };
  } else {
    // For text processing
    url = `${apiUrl}?key=${apiKey}`;
    
    requestBody = {
      contents: [{
        parts: [{
          text: `Extract event information from the following text and parse it into a structured format with the following fields: title, start (ISO datetime), end (ISO datetime), location, description. Return only JSON, no other text.\n\n${content}`
        }]
      }]
    };
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract JSON from the response
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response from Gemini
    try {
      // Find JSON in the response (in case there's surrounding text)
      const jsonMatch = generatedText.match(/({[\s\S]*})/);
      const jsonStr = jsonMatch ? jsonMatch[0] : generatedText;
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Failed to parse JSON from Gemini response:", generatedText);
      throw new Error("Failed to parse event data from API response");
    }
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
