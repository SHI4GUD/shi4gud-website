<p align="center">
  <a href="https://shi4gud.com" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="public/assets/logos/shi4gud-light.svg">
      <source media="(prefers-color-scheme: light)" srcset="public/assets/logos/shi4gud-dark.svg">
      <img alt="SHI4GUD Logo" src="public/assets/logos/shi4gud-dark.svg" width="250">
    </picture>
  </a>
</p>

<h1 align="center">SHI4GUD Website</h1>

<p align="center">
  <a href="https://vitejs.dev" target="_blank"><img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://react.dev" target="_blank"><img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React"></a>
  <a href="https://www.typescriptlang.org" target="_blank"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com" target="_blank"><img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://viem.sh" target="_blank"><img src="https://img.shields.io/badge/Viem-1C1C1C?style=flat&logo=ethereum&logoColor=white" alt="Viem"></a>
  <a href="https://www.sanity.io" target="_blank"><img src="https://img.shields.io/badge/Sanity-F03E2F?style=flat&logo=sanity&logoColor=white" alt="Sanity"></a>
</p>

<p align="center">
    <a href="https://x.com/SHI4GUD" target="_blank"><img src="https://img.shields.io/badge/@SHI4GUD-black?style=flat&logo=x&logoColor=white" alt="Project on X"></a>
    <a href="https://x.com/CryptoMonark" target="_blank"><img src="https://img.shields.io/badge/Dev:-@CryptoMonark-black?style=flat&logo=x&logoColor=white&labelColor=black" alt="Author on X"></a>
</p>

<p align="center">
  The official SHI4GUD website. A modern, headless CMS-powered front-end delivering dynamic content for the SHI4GUD ecosystem.
  <br />
  <a href="https://docs.shi4gud.com"><strong>Explore the docs »</strong></a>
  <br />
  <br />
</p>

<!-- TABLE OF CONTENTS -->
## Table of Contents

1.  [About The Project](#about-the-project)
    *   [Key Features](#key-features)
    *   [Built With](#built-with)
    *   [Architecture Overview](#architecture-overview)
2.  [Support and Contact](#support-and-contact)
3.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Usage](#usage)
        *   [Available Scripts](#available-scripts)

---

## About The Project

The **SHI4GUD Website** serves as the primary web presence for the SHI4GUD ecosystem, providing users with information about the platform, FAQs, tutorials, and more. Built with a modern tech stack and powered by a headless CMS, the website delivers a fast, responsive, and maintainable experience.

### Key Features

*   📱 **Responsive Design**: Mobile-first, responsive layout ensures an optimal experience across all devices.
*   ⚡ **High Performance**: Built with Vite and React for lightning-fast development and highly optimized production builds.
*   🎯 **Route-Based Code-Splitting**: Lazy-loaded routes improve initial page load times.
*   🔄 **Efficient Data Fetching**: TanStack Query handles data fetching, caching, and state management.
*   🛡️ **Type-Safe**: Written in TypeScript for improved code quality and maintainability.
*   🔥 **Burn Tracker**: Real-time token burn analytics with historical charts, transaction history, and USD values.

### Built With

This project leverages modern web development tools and a headless CMS architecture.

*   **Frontend Framework**: [Vite](https://vitejs.dev/) (v6+), [React](https://react.dev/) (v19+)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (v5.8+)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4+)
*   **Routing**: [React Router DOM](https://reactrouter.com/) (v7.6+)
*   **State Management**: [TanStack React Query](https://tanstack.com/query/latest) (v5.75+)
*   **Blockchain**: [Viem](https://viem.sh/) (v2+) for Ethereum RPC interactions
*   **Charts**: [Recharts](https://recharts.org/) for data visualization
*   **Headless CMS**: [Sanity](https://www.sanity.io/) (v3+)
*   **UI Components**: [Lucide React](https://lucide.dev/) (v0.508+)
*   **Development Tools**: [ESLint](https://eslint.org/) (v9+), [Prettier](https://prettier.io/)

### Architecture Overview

Here's how the architecture works:

*   **Frontend**: The user-facing website is built with React and Vite, with all source code publicly available in this repository.
*   **Content Management**: Content is managed through a headless CMS backend.
*   **Data Fetching**: Public content is fetched from the CMS API using TanStack Query for efficient caching and state management.
*   **Burn Tracker**: Fetches real-time burn data directly from Ethereum via Alchemy/Infura RPCs, with smart caching and ENS resolution.

---

## Support and Contact

You can reach out through the following channels:

- **Project on X (Twitter)**: [@SHI4GUD](https://x.com/SHI4GUD)
- **Developer on X (Twitter)**: [@CryptoMonark](https://x.com/CryptoMonark)
- **Website**: [shi4gud.com](https://shi4gud.com)
- **dApp**: [app.shi4gud.com](https://app.shi4gud.com)
- **Docs**: [docs.shi4gud.com](https://docs.shi4gud.com)

---

## Getting Started

Follow these steps to set up a local development environment.

### Prerequisites

*   **Node.js**: Version 20.x or newer is recommended. Download from [nodejs.org](https://nodejs.org/).
*   **Sanity Backend** *(Optional)*: To run this project with live content, you'll need your own Sanity backend. Get started at [github.com/sanity-io/sanity](https://github.com/sanity-io/sanity).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SHI4GUD/shi4gud-website.git
    cd shi4gud-website
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env` file in the project root.
    *   **Important:** Ensure `.env` is listed in your `.gitignore` file to protect your credentials.
    *   Add the following variables to your `.env` file, replacing the placeholder text with your actual values.

    ```dotenv
    # Application URL
    VITE_APP_URL="http://localhost:5173"

    # The URL for the "Launch App" button in the header
    VITE_APP_LAUNCH_URL="https://app.shi4gud.com"

    # CMS Configuration
    VITE_SANITY_PROJECT_ID="your_cms_project_id"
    VITE_SANITY_DATASET="production"

    # RPC Providers (for Burn Tracker)
    VITE_ALCHEMY_API_KEY="your_alchemy_api_key"
    VITE_INFURA_API_KEY="your_infura_api_key"
    ```

    *   `VITE_APP_URL`: The canonical URL of the deployed site (e.g., `https://shi4gud.com`). Used for SEO meta tags.
    *   `VITE_APP_LAUNCH_URL`: The URL that the "Launch App" button links to (typically your dApp).
    *   `VITE_SANITY_PROJECT_ID`: Your Sanity project ID.
    *   `VITE_SANITY_DATASET`: Your Sanity dataset (typically `production` or `development`).
    *   `VITE_ALCHEMY_API_KEY`: Your Alchemy API key for Ethereum RPC (primary provider).
    *   `VITE_INFURA_API_KEY`: Your Infura API key for Ethereum RPC (fallback provider).

### Usage

Run the development server with the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

#### Available Scripts

| Script            | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Starts the development server.                       |
| `npm run build`   | Builds the app for production.                       |
| `npm run preview` | Previews the production build locally.               |
| `npm run lint`    | Lints the codebase using ESLint.                     |
| `npm run format`  | Formats code using Prettier.                         |

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
