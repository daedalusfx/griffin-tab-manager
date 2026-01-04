# Griffin Open-Source Tab Manager

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

A specialized Electron & React application designed for managing and viewing web-based charts (like TradingView) in a persistent, multi-tab interface.

This application is built with a modern tech stack and features an advanced, type-safe IPC core. It's specifically hardened to bypass bot-detection on websites by modifying the `BrowserView` user-agent and patching Electron's preload environment.


![Preview](/screenshots/multi_tab.png)
![Preview](/screenshots/normal_tab.png)
![Preview](/screenshots/settings_tab.png)




## Core Features

* **Persistent Multi-Tab Management**: Tabs (including active tab and tab order) are saved to `localStorage` and fully restored on app startup.
* **Chart Sidebar**: A dedicated sidebar to save, manage, edit, and delete favorite charts (Title and URL).
* **Stealth Browsing**: Automatically spoofs the User-Agent and patches `navigator.webdriver` to appear as a standard Chrome browser, allowing access to sites that block Electron.
* **Modern UI**: Built with Tailwind CSS, Shadcn UI components, and Framer Motion for animations and tab reordering.
* **Type-Safe Core**: Features the custom "Conveyor" IPC system, which uses Zod for end-to-end type-safe validation between the main and renderer processes.
* **Tab Trash & Restore**: Closed tabs are moved to a trash modal and can be restored, preserving their session.

## Tech Stack

* **Core**: Electron, React 18 (with Hooks)
* **Bundler**: Vite (via `electron-vite`)
* **Language**: TypeScript
* **Styling**: Tailwind CSS, Styled-Components, Shadcn UI
* **Animation**: Framer Motion
* **Schema Validation**: Zod

## Getting Started

### Prerequisites

* Node.js (v18 or later)
* npm or yarn

### Installation & Development

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/daedalusfx/griffin-tab-manager.git](https://github.com/daedalusfx/griffin-tab-manager.git)
    cd griffin-tab-manager
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run in development mode:**
    ```bash
    npm run dev
    ```

### Building the Application

To create a production build (e.g., `.exe` or `.dmg`), run:

```bash
npm run build
```

This will generate the executable in the `release/` directory.

## Project Structure

* `app/`: Contains all renderer process code (React components, hooks, styles).
* `lib/main/`: Contains all main process code (Electron window creation, `app.ts`, protocol handling).
* `lib/preload/`: The preload script responsible for stealth patching and exposing the IPC API.
* `lib/conveyor/`: The custom, type-safe IPC system (API, Handlers, Zod Schemas).

## License

This project is licensed under the **GNU General Public License v3.0**.
See the [LICENSE](LICENSE) file for full details.