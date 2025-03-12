document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const textContent = document.getElementById('text-content');
  const imageContent = document.getElementById('image-content');
  const sharedImage = document.getElementById('shared-image');
  const placeholderText = document.getElementById('placeholder-text');
  const processBtn = document.getElementById('process-btn');
  const resultContainer = document.getElementById('result-container');
  const eventDetails = document.getElementById('event-details');
  const downloadIcsBtn = document.getElementById('download-ics');
  const newEventBtn = document.getElementById('new-event');
  const loadingIndicator = document.getElementById('loading');
  
  let currentEventData = null;
  
  // Check if the app was launched via Web Share Target API
  function checkForSharedContent() {
    const url = new URL(window.location.href);
    const sharedText = url.searchParams.get('text');
    const sharedTitle = url.searchParams.get('title');
    
    // Handle shared text
    if (sharedText) {
      placeholderText.classList.add('hidden');
      textContent.classList.remove('hidden');
      textContent.textContent = sharedTitle ? `${sharedTitle}\n\n${sharedText}` : sharedText;
      return true;
    }
    
    // For shared images (this requires additional handling through POST requests)
    // This is simplified; actual implementation would need to handle the file upload
    if (url.searchParams.has('image')) {
      // This is just a placeholder - in a real app, we'd need to handle the file from FormData
      console.log("Image was shared, but requires additional handling");
      return true;
    }
    
    return false;
  }
  
  // Process content with Gemini API
  async function processContent() {
    loadingIndicator.classList.remove('hidden');
    document.getElementById('input-container').classList.add('hidden');
    
    try {
      let content;
      let isImage = false;
      
      if (!textContent.classList.contains('hidden')) {
        content = textContent.textContent;
      } else if (!imageContent.classList.contains('hidden')) {
        content = sharedImage.src;
        isImage = true;
      } else {
        throw new Error('No content to process');
      }
      
      // Call Gemini API service
      const eventData = await processWithGemini(content, isImage);
      
      // Display the event details
      showEventResults(eventData);
      currentEventData = eventData;
      
    } catch (error) {
      alert(`Error processing content: ${error.message}`);
      console.error(error);
    } finally {
      loadingIndicator.classList.add('hidden');
    }
  }
  
  // Display the processed event details
  function showEventResults(eventData) {
    let detailsHTML = `
      <p><strong>Title:</strong> ${eventData.title}</p>
      <p><strong>Start:</strong> ${new Date(eventData.start).toLocaleString()}</p>
      <p><strong>End:</strong> ${new Date(eventData.end).toLocaleString()}</p>
      <p><strong>Location:</strong> ${eventData.location || 'Not specified'}</p>
      <p><strong>Description:</strong> ${eventData.description || 'No description'}</p>
    `;
    
    eventDetails.innerHTML = detailsHTML;
    resultContainer.classList.remove('hidden');
  }
  
  // Download the ICS file
  function downloadICS() {
    if (!currentEventData) return;
    
    const icsContent = generateICS(currentEventData);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentEventData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Reset the app for a new event
  function resetApp() {
    currentEventData = null;
    resultContainer.classList.add('hidden');
    document.getElementById('input-container').classList.remove('hidden');
    
    // Clear any previous content
    textContent.textContent = '';
    textContent.classList.add('hidden');
    imageContent.classList.add('hidden');
    placeholderText.classList.remove('hidden');
  }
  
  // Event Listeners
  processBtn.addEventListener('click', processContent);
  downloadIcsBtn.addEventListener('click', downloadICS);
  newEventBtn.addEventListener('click', resetApp);
  
  // Handle paste event for text
  document.addEventListener('paste', (event) => {
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text');
    
    if (pastedText) {
      placeholderText.classList.add('hidden');
      textContent.classList.remove('hidden');
      textContent.textContent = pastedText;
    }
  });
  
  // Check if there's shared content when the app loads
  if (!checkForSharedContent()) {
    // No shared content, show manual input options
    document.getElementById('manual-input').classList.remove('hidden');
    
    // Setup manual image input
    document.getElementById('image-input').addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
          placeholderText.classList.add('hidden');
          imageContent.classList.remove('hidden');
          sharedImage.src = event.target.result;
        };
        
        reader.readAsDataURL(file);
      }
    });
  }
});
