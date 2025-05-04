# Portfolio Project: Todo App

Welcome to my portfolio project! This is a full-stack Todo application built with [Next.js](https://nextjs.org), designed to showcase my skills in modern web development. Below, you'll find details about the project, its features, and how to explore it.

## Features

- **Authentication**: Secure user authentication with signup, signin, and logout functionality.
- **Pomodoro Timer**: A productivity timer with customizable settings.
- **Todo Management**: Create, update, reorder, and delete tasks with a user-friendly interface.
- **API Integration**: Backend APIs built with Next.js for handling todos, pomodoro settings, and user authentication.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Technologies Used

- **Frontend**: React, Next.js, TypeScript
- **Backend**: Prisma, Next.js API Routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Styling**: CSS Modules, PostCSS, TailwindCSS

## Database Setup

This project uses PostgreSQL as the database, managed through Prisma ORM. To set up the database:

1. Install PostgreSQL on your system or use a cloud-hosted PostgreSQL instance.
2. Configure the database connection string in the `.env` file:
   ```env
   DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
   ```
3. Run the Prisma migrations to set up the database schema:
   ```bash
   npx prisma migrate dev
   ```

## Session Key Setup

This project uses Iron Session for secure session management. To set up the session key:

1. Add the following environment variable to your `.env` file:
   ```env
   IRON_SESSION_KEY=<your-secure-random-key>
   ```
   Replace `<your-secure-random-key>` with a strong, random key. You can generate one using a tool like OpenSSL:
   ```bash
   openssl rand -base64 32
   ```

2. Ensure the `.env` file is not included in version control by adding it to your `.gitignore` file.

## Getting Started

To explore the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database as described above.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## About Me

I am a passionate web developer with expertise in building scalable and user-friendly applications. This project demonstrates my ability to design and implement full-stack solutions, focusing on clean code, performance, and user experience.

- Full-Stack Development
- React
- Next.js
- TypeScript
- PostgreSQL
- Prisma ORM
- API Development
- Responsive Design
- Authentication
- Productivity Tools
- Agile Development
- Web Application Development
- User Experience (UX)
- Frontend Development
- Backend Development
- Database Management
- CSS
- HTML
