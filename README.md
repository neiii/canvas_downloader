# Swansea Lecture Downloader

A Chrome extension to easily download lecture slides from Canvas.

## Development Setup

1. Install dependencies:
```bash
pnpm install
```

2. Build the extension:
```bash
pnpm build
```

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` folder from this project

## Features

- Search lecture slides by name or regex pattern
- Select/deselect all slides with one click
- Optional folder creation for downloads
- Real-time filtering of slides

## Development

- `pnpm dev` - Watch for changes and rebuild
- `pnpm build` - Build for production 