# Chrome Extension Configuration

The Kairo AI extension is a Manifest V3 extension that provides a floating UI for real-time text analysis.

## Features
- **Context Injection**: Automatically detects text selection on any website.
- **Floating UI**: Minimalist dark-mode panel with instant action buttons.
- **Timeout Protection**: Automatically cancels requests after 10 seconds to save power.

## Loading the Extension
1. Go to `chrome://extensions/`.
2. Toggle **Developer mode** on.
3. Click **Load unpacked**.
4. Navigate to the `extension/` folder and click **Select Folder**.

## Development
- **Content Script**: `src/content/index.js` handles the UI and DOM interaction.
- **Background Script**: `src/background/index.js` handles API communication.
- **Manifest**: `manifest.json` defines permissions (`activeTab`, `scripting`, `storage`).

### Modifying Styles
To change the look of the floating panel, edit the `KAIRO_STYLES` constant in `src/content/index.js`.
