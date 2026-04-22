# DocuMapper Technical Details

This document outlines the core architectural and technical configuration of DocuMapper.

## Tech Stack

- **Framework**: [React 19](https://reactjs.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation**: [Motion (Framer)](https://motion.dev/)

## Core Architecture

DocuMapper features a robust frontend architecture heavily optimized for zero-latency interactions:
- **120fps Drag Engine**: Rather than relying on standard React State loops for tracking `x` and `y` coordinates during mouse movement (which causes severe UI lag due to rapid re-renders), the dragging and resizing logic bypasses React entirely. It maps mouse coordinates directly to DOM node `style.left` and `style.width` properties via element IDs inside a fast `mousemove` event loop. Final positional states are only committed to React's central `mappings` array upon `mouseup`.
- **Pure Client-Side**: The app runs entirely in the browser and manages its payload via JSON Schema imports and exports.

## Project Structure

```text
/
├── index.html          # Main HTML entry point (contains SVG favicon)
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── README.md           # Product documentation
├── technical_details.md# This file
├── future_implementations.md # Roadmap and commercial concepts
├── public/
│   └── favicon.svg     # Scanning logo
└── src/
    ├── App.tsx         # Main interactive rendering and state engine
    ├── index.css       # Tailwind v4 import
    ├── main.tsx        # React DOM mounting
    └── types.ts        # TypeScript data interfaces
```

## Getting Started

### Prerequisites
- Node.js `>=20.19.0`

### Installation
```bash
npm install
npm run dev
```

The application will launch on port `3000`.
