# Chrome AI Assistant Extension

A Chrome extension that enables users to interact with AI models on any webpage, analyze page content, and perform page operations through natural language using WebMCP protocol.

## Features

- **AI Model Configuration**: Support for OpenAI, Anthropic, Google, and custom models
- **Conversation Interface**: Chat with AI about page content
- **Page Analysis**: Extract and analyze page content using DOM and screenshots
- **Page Operations**: Click elements, fill forms, extract data, execute scripts
- **Skills System**: AI personas/roles for different use cases
- **Shortcut Keys**: Customizable shortcuts for quick activation
- **Conversation History**: Per-page and global history management

## Installation

### Development

1. Clone repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Load unpacked extension in Chrome: `chrome://extensions/` → Load unpacked → Select `.output/chrome-mv3` directory

### Production

1. Build the extension: `npm run build`
2. Load `.output/chrome-mv3` directory in Chrome
3. Or publish to Chrome Web Store

## Usage

1. Click the extension icon to open the sidebar
2. Configure your AI model in Settings
3. Select a skill (optional)
4. Type your message and press Enter
5. AI will respond and may suggest page operations
6. Confirm operations to execute them

## Development

### Tech Stack

- WXT (Chrome extension framework)
- Vue 3 + TypeScript
- Element Plus (UI components)
- Pinia (state management)
- WebMCP (Model Context Protocol)

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run zip` - Create zip for distribution

## License

MIT
