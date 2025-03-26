# event2ics PWA

A Progressive Web Application that transforms clipboard content (messages or images) into calendar events in ICS format using Google Gemini API.

## Project Overview

event2ics is designed to simplify the process of creating calendar events from unstructured content on mobile devices:

1. Copy a message or image containing event details on your mobile device
2. Share it to event2ics
3. The application displays the captured content
4. Google Gemini API processes and extracts event information
5. Generate and download the event in ICS format for calendar integration

## Architecture

The application follows a loosely coupled architecture (偶聚合) with the following components:

### Core Components

#### User Interface Layer
- `index.html`: Main application interface
- `styles/main.css`: Style definitions
- PWA configuration: Manifest and service workers

#### Application Logic Layer
- Clipboard handling module: Captures shared content
- Data processing module: Prepares data for AI processing
- Gemini API integration: Extracts event data from unstructured content
- ICS generator: Creates calendar files in ICS format

#### Utility Services
- Storage service: Manages user preferences
- File handling service: Handles saving ICS files to device

### File Structure
```
event2ics/
├── index.html                # Main entry point
├── manifest.json             # PWA manifest
├── service-worker.js         # Service worker for offline functionality
├── styles/
│   └── main.css              # Main stylesheet
├── scripts/
│   ├── app.js                # Application initialization
│   ├── clipboard-handler.js  # Clipboard access functionality
│   ├── content-processor.js  # Process text/image content
│   ├── gemini-service.js     # Gemini API integration
│   ├── ics-generator.js      # Generate ICS format
│   └── file-service.js       # Save files to device
├── images/                   # App icons
│   ├── favicon.ico
│   ├── icons_apple-touch-icon.png
│   ├── icons_favicon-16x16.png
│   ├── icons_favicon-32x32.png
│   └── img_icon-192.png
└── config/
    └── api-config.js         # API configuration
```

## Data Flow

1. **Content Capture**: User shares content to the application
2. **Content Processing**: The clipboard handler captures and displays text or images
3. **AI Analysis**: Gemini API analyzes the content to extract event details
4. **ICS Generation**: The application formats the extracted data into ICS format
5. **File Saving**: User downloads or saves the ICS file to their device

## Implementation Details

### PWA Features
- Offline functionality
- Installable on mobile devices
- Fast loading and responsive design

### API Integration
- Google Gemini API for AI-powered content analysis
- Secure API key management

### Security Considerations
- Data is processed locally where possible
- No permanent storage of user content
- Transparent data handling

## Getting Started

1. Clone this repository
2. Set up your Google Gemini API key in the config
3. Serve the application using a local web server
4. Access on mobile device and add to home screen

## License

[Add license information]

## Contributors

[Add contributor information]