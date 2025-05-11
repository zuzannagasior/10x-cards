# 10xCards

## Project Description

10xCards is a web application designed to help users create educational flashcards for spaced repetition learning. The application offers two methods for building flashcards: **AI-Generated Flashcards** and **Manual Creation**.

## Tech Stack

- **Frontend**: Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, authentication)
- **AI Integration**: Utilizes Openrouter.ai to access various AI models for flashcard generation
- **CI/CD & Hosting**: GitHub Actions, DigitalOcean (Docker-based deployment)
- **Unit Testing**: Vitest and React Testing Library
- **E2E Testing**: Playwright

## Getting Started Locally

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd 10x-cards
   ```

2. **Install dependencies:**
   Ensure you are using the Node version specified in `.nvmrc` (22.14.0):

   ```bash
   nvm use
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Visit `http://localhost:3000` (or the port indicated in your terminal) to view the application.

## Available Scripts

- `npm run dev` - Start the Astro development server.
- `npm run build` - Build the project for production.
- `npm run preview` - Preview the production build locally.
- `npm run astro` - Access Astro CLI commands.
- `npm run lint` - Run ESLint to check for code issues.
- `npm run lint:fix` - Run ESLint and automatically fix issues.
- `npm run format` - Format the code using Prettier.

## Project Scope

This project covers the following functionalities:


- **AI-Generated Flashcards**: Automatically generate flashcards from user-provided text, with validation for text length and options to edit, and accept or reject each flashcard.
- **Manual Flashcard Creation**: Allow users to create and edit flashcards manually.
- **Flashcard Management**: Enable users to view, edit, and delete flashcards.
- **Spaced Repetition Integration**: Integrate with an existing spaced repetition algorithm to schedule learining seassions.
- **User Account Management**: Provide capabilities for user registration, login, password management, and account deletion.

## Project Status

The project is currently in early development (version 0.0.1) and is under active development.

## License

This project does not currently specify a license. Please add appropriate licensing information if applicable.
