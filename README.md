# DocuMapper

This project is a web application built with React, Vite, and TypeScript, demonstrating the use of the Google Gemini API.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Table of Contents

- [Technical Overview](#technical-overview)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation and Running](#installation-and-running)
- [Available Scripts](#available-scripts)

---

## Technical Overview

### Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
- **Server**: [Express](https://expressjs.com/) is included as a dependency, potentially for custom API routes or a backend server, though it is not used in the default `dev` script.

### Project Structure

```
/
├── .env.example        # Example environment variables file
├── .gitignore          # Git ignore configuration
├── index.html          # Main HTML entry point for Vite
├── package.json        # Project dependencies and scripts
├── README.md           # This file
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build tool configuration
└── src/                # Main application source code
    ├── App.tsx         # Main React application component
    ├── index.css       # Global CSS styles
    ├── main.tsx        # React DOM rendering entry point
    ├── types.ts        # TypeScript type definitions
    └── lib/
        └── utils.ts    # Utility functions
```

### Environment Variables

The application requires the following environment variables to be set in a `.env.local` file. You can copy `.env.example` to create it.

- `GEMINI_API_KEY`: **Required**. Your API key for authenticating with the Google Gemini API.
- `APP_URL`: **Optional**. The URL where the application is hosted. This might be used for callbacks or self-referential links.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en) (Version `^20.19.0 || >=22.12.0` is recommended as per project dependencies)

### Installation and Running

1.  **Clone the repository** (if you haven't already).

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a new file named `.env.local` in the root of the project and add your Gemini API key:
    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

- `npm run dev`: Starts the development server with hot-reloading.
- `npm run build`: Compiles and bundles the application for production into the `dist` folder.
- `npm run preview`: Serves the production build locally to preview it.
- `npm run clean`: Removes the `dist` directory.
- `npm run lint`: Runs the TypeScript compiler to check for type errors without generating JavaScript files.
