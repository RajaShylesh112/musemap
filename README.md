# MuseMap

A web application for exploring museums, managing exhibitions, artifacts, and user engagement through quizzes and rewards.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication:** Secure login and registration for users.
- **Protected Routes:** Access control for different parts of the application based on user roles.
- **Museum Exploration:** Browse museum listings and view detailed information for each museum.
- **Exhibition Management (Admin):** Admins can create, edit, and manage museum exhibitions.
- **Artifact Management (Admin):** Admins can add, update, and remove artifacts associated with exhibitions.
- **Quiz System (Admin & User):** Admins can create and manage quizzes; users can take quizzes for engagement.
- **Booking System:** Users can book visits or tickets.
- **Payment Integration:** Secure payment processing for bookings or other services.
- **User Dashboard:** Personalized space for users to manage their activities, bookings, and profile.
- **Admin Dashboard:** Centralized interface for administrators to manage the platform's content and users.
- **Search Functionality:** Users can search for museums, exhibitions, or artifacts.
- **FAQ & Contact:** Informational pages for user support.
- **Chatbot:** Interactive assistant for users.
- **Reward System:** Users can earn rewards, potentially based on quiz performance or other activities.
- **Profile Management:** Users can update their personal information.

## Tech Stack

- **Frontend:**
  - [React](https://reactjs.org/): A JavaScript library for building user interfaces.
  - [Vite](https://vitejs.dev/): A fast build tool and development server.
  - [React Router](https://reactrouter.com/): For declarative routing in React applications.
  - [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework.
- **Backend & Database:**
  - [Supabase](https://supabase.io/): An open-source Firebase alternative for building secure and scalable backends. Provides database, authentication, storage, and real-time capabilities.
- **Package Management:**
  - [npm](https://www.npmjs.com/) (or yarn)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm)
- A [Supabase](https://supabase.io/) account and project.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd musemap
    ```
    (Replace `<repository-url>` with the actual URL of the repository)

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    *   Create a new project on [Supabase](https://supabase.com/dashboard/projects).
    *   In the root of your cloned project, create a `.env` file.
    *   Add your Supabase project's URL and Anon Key to the `.env` file like this:
        ```env
        VITE_SUPABASE_URL=your_supabase_project_url
        VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
        ```
        You can find these in your Supabase project settings (API section).
    *   **Apply database migrations:**
        The database schema is defined in the `supabase/migrations/` directory. You can apply these migrations to your Supabase project using the Supabase CLI.
        1.  Install the Supabase CLI if you haven't already: `npm install -g supabase`
        2.  Log in to Supabase: `supabase login`
        3.  Link your project: `supabase link --project-ref YOUR_PROJECT_ID` (Find `YOUR_PROJECT_ID` in your Supabase project's dashboard URL: `https://supabase.com/dashboard/project/<YOUR_PROJECT_ID>`)
        4.  Deploy migrations: `supabase db push`

### Running the Development Server

To run the app in development mode:
```bash
npm run dev
```
This will start the Vite development server, typically at `http://localhost:5173`.

### Building for Production

To create a production build:
```bash
npm run build
```
This command bundles the application into static files for deployment in the `dist/` directory.

## Project Structure

Here's an overview of the key directories and files in the project:

```
musemap/
├── public/             # Static assets (e.g., favicons, images not processed by Vite)
├── src/                # Main source code
│   ├── assets/         # Images, fonts, and other static assets used by components
│   ├── components/     # Reusable React components (e.g., Layout, Navigation, Footer)
│   ├── lib/            # Utility functions or libraries (e.g., Supabase client setup)
│   ├── pages/          # Top-level page components, organized by routes
│   │   ├── admin/      # Admin-specific page components and layout
│   │   └── auth/       # Authentication-related pages (login, register)
│   ├── services/       # Modules for interacting with backend services (e.g., database functions)
│   ├── main.jsx        # Entry point of the React application, sets up routing
│   ├── style.css       # Global styles or Tailwind CSS base styles
│   └── supabase.js     # Supabase client initialization (if not in lib/)
├── supabase/           # Supabase specific files
│   └── migrations/     # Database schema migrations
├── .env                # Environment variables (Supabase URL, keys - **Gitignored**)
├── .gitignore          # Specifies intentionally untracked files that Git should ignore
├── index.html          # Main HTML entry point for Vite
├── netlify.toml        # Netlify configuration file (if deploying to Netlify)
├── package.json        # Project metadata, dependencies, and scripts
├── tailwind.config.js  # Tailwind CSS configuration
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## Available Scripts

In the project directory, you can run the following scripts:

### `npm run dev`

Runs the app in development mode using Vite.
Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view it in your browser.
The page will reload when you make changes.

### `npm run build`

Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run lint`

Lints the project files using ESLint to check for code quality and style issues.

### `npm run preview`

Serves the production build locally from the `dist` directory. This is useful for checking the production build before deploying.
