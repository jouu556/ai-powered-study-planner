# Study Planner

A full-stack study management platform designed to help students organize their academic workload, plan study sessions, manage deadlines, and keep their schedules synchronized with their calendars.

Study Planner combines a modern React interface with a Node.js/Express backend and PostgreSQL database, with Google OAuth authentication and Google Calendar integration to provide a centralized environment for managing academic activities.

## Overview

Managing university courses, assignments, exams, study sessions, and deadlines across multiple platforms can become difficult and time-consuming.

**Study Planner** addresses this problem by providing a centralized platform where students can:

* Organize their academic tasks and activities
* Create and manage study plans
* Track deadlines and upcoming activities
* Schedule study sessions
* Synchronize activities with Google Calendar
* Authenticate using Google OAuth
* Monitor their academic workload
* Use intelligent features to improve their planning workflow

The project was developed independently as a full-stack software engineering project, focusing on practical backend architecture, database design, API development, authentication, and third-party service integration.

## Key Features

### Authentication

* Google OAuth authentication
* Secure user sessions
* User-specific data and study plans
* Protected application resources

### Study Planning

* Create and manage study tasks
* Organize academic activities
* Set deadlines and priorities
* Schedule study sessions
* Track planned and completed activities

### Calendar Integration

* Google Calendar API integration
* Synchronize study activities with the user's calendar
* Manage scheduled academic events alongside existing calendar events

### Task Management

* Create, update, and delete tasks
* Assign priorities and deadlines
* Track task completion
* Organize workload around upcoming deadlines

### Intelligent Planning

The project is designed to support AI-powered features that can assist students with planning and workload management.

Potential intelligent capabilities include:

* Automated study schedule generation
* Workload analysis
* Deadline-aware planning
* Study-session recommendations
* Task prioritization
* Personalized planning suggestions

## Technology Stack

### Frontend

* React
* JavaScript
* HTML5
* CSS3
* Axios

### Backend

* Node.js
* Express.js
* RESTful APIs

### Database

* PostgreSQL

### Authentication & APIs

* Google OAuth
* Google Calendar API

### Development Tools

* Git
* GitHub
* Visual Studio Code

## System Architecture

The application follows a client-server architecture:

```text
                    ┌──────────────────────┐
                    │       Student        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     React Client     │
                    │                      │
                    │  UI / State / Axios  │
                    └──────────┬───────────┘
                               │
                         HTTP / REST
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Express Backend    │
                    │                      │
                    │ Authentication       │
                    │ Business Logic       │
                    │ REST APIs             │
                    └───────┬───────┬──────┘
                            │       │
                ┌───────────┘       └──────────────┐
                ▼                                  ▼
       ┌──────────────────┐              ┌──────────────────┐
       │    PostgreSQL    │              │  Google Services │
       │                  │              │                  │
       │ Users            │              │ OAuth            │
       │ Tasks            │              │ Calendar API     │
       │ Study Plans      │              │                  │
       │ Activities       │              │                  │
       └──────────────────┘              └──────────────────┘
```

## Project Structure

```text
Study-Planner/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       └── App.jsx
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   └── server.js
│
├── database/
│   └── ...
│
├── .env.example
├── package.json
└── README.md
```

> The exact structure may vary depending on the current implementation.

## Database

PostgreSQL is used as the primary relational database.

The database is responsible for storing application data such as:

* User accounts
* Study tasks
* Courses
* Study sessions
* Deadlines
* Planning information
* User preferences

The relational model allows the application to maintain relationships between users and their academic activities while preserving data consistency.

## API Architecture

The backend exposes RESTful API endpoints that allow the React client to communicate with the server.

Example API structure:

```text
/api
│
├── /auth
│   ├── /login
│   ├── /logout
│   └── /user
│
├── /tasks
│   ├── GET
│   ├── POST
│   ├── PUT
│   └── DELETE
│
├── /study-plans
│   ├── GET
│   ├── POST
│   ├── PUT
│   └── DELETE
│
└── /calendar
    ├── GET
    └── POST
```

## Google OAuth

The application uses Google OAuth to provide a convenient authentication experience.

The authentication flow allows users to:

1. Sign in using their Google account.
2. Authenticate with the application.
3. Access their personalized study environment.
4. Manage their academic data securely.

## Google Calendar Integration

Google Calendar integration allows Study Planner to connect academic planning with the student's existing schedule.

For example, a student can create a study session inside the application and synchronize it with Google Calendar, reducing the need to manually maintain the same schedule in multiple places.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/study-planner.git

cd study-planner
```

### 2. Install dependencies

Install the backend dependencies:

```bash
cd server
npm install
```

Install the frontend dependencies:

```bash
cd ../client
npm install
```

### 3. Configure PostgreSQL

Create a PostgreSQL database for the application.

Then configure the database connection inside the backend environment variables.

### 4. Configure environment variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=4000

DATABASE_URL=your_postgresql_connection_string

SESSION_SECRET=your_session_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url

GOOGLE_CALENDAR_CLIENT_ID=your_google_calendar_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_google_calendar_client_secret
```

Do not commit your `.env` file to GitHub.

### 5. Start the backend

```bash
cd server
npm run dev
```

### 6. Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

The application should now be available locally.

## Environment Variables

| Variable                        | Description                        |
| ------------------------------- | ---------------------------------- |
| `PORT`                          | Backend server port                |
| `DATABASE_URL`                  | PostgreSQL database connection     |
| `SESSION_SECRET`                | Secret used for session management |
| `GOOGLE_CLIENT_ID`              | Google OAuth client ID             |
| `GOOGLE_CLIENT_SECRET`          | Google OAuth client secret         |
| `GOOGLE_CALLBACK_URL`           | OAuth callback URL                 |
| `GOOGLE_CALENDAR_CLIENT_ID`     | Google Calendar API client ID      |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Google Calendar API client secret  |

## Development Goals

The project was built with several software engineering principles in mind:

* Separation of frontend and backend responsibilities
* RESTful API design
* Relational database modeling
* Secure authentication
* Third-party API integration
* Modular backend architecture
* Maintainable and reusable frontend components
* Scalable project structure

## Future Improvements

Planned improvements include:

* AI-powered study schedule generation
* Intelligent workload balancing
* Personalized study recommendations
* Automatic deadline prioritization
* Advanced analytics and progress tracking
* Notifications and reminders
* Recurring study sessions
* Improved calendar synchronization
* Mobile application support
* More advanced academic dashboards

## Learning Outcomes

Through this project, I gained practical experience in:

* Full-stack web development
* React application development
* Node.js and Express backend development
* REST API design
* PostgreSQL database design
* OAuth authentication
* Google APIs
* Client-server architecture
* Environment and configuration management
* Git and collaborative software development

## Project Status

**Status:** In Development

The project is actively being developed and expanded with additional planning and intelligent features.

## Author

**Youssef Muhammed**

Computer Engineering Student
Cairo University
