# Aurora Transcode

Desktop media converter built with Tauri + Vite and powered by FFmpeg.

## Features

- Video/audio conversion across common formats
- Preset-driven workflows for quick output
- Manual codec/bitrate/resolution tuning
- Conversion progress feedback
- Desktop packaging through Tauri

## Stack

- Frontend: TypeScript + Vite
- Desktop runtime: Tauri
- Processing: FFmpeg

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm run tauri build
```

## Project Layout

- `src/`: frontend application
- `src-tauri/`: desktop backend configuration
- `scripts/`: helper tooling (including FFmpeg fetch)
