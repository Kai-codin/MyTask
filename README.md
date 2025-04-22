# Task Manager

A modern task management application built with React and Node.js, featuring user authentication, dark mode, and a clean, intuitive interface.

## Features

- 🔐 User Authentication
- 🌓 Dark/Light Mode with persistent preference
- 📝 Create, Read, Update, Delete tasks
- ✅ Mark tasks as complete/incomplete
- 📅 Set due dates for tasks
- 🎨 Modern, responsive design
- 🔒 Secure session management
- 🍪 Persistent login state

## Tech Stack

### Frontend
- React
- React Router
- Font Awesome
- CSS Variables for theming
- Local Storage for state persistence

### Backend
- Node.js
- Express
- SQLite3
- JWT Authentication
- Express Session
- CORS enabled

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/task-manager.git
cd task-manager
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../my-task
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=3001
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd ../my-task
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
task-manager/
├── backend/
│   ├── index.js
│   ├── database.db
│   └── package.json
└── my-task/
    ├── src/
    │   ├── components/
    │   ├── App.jsx
    │   ├── Login.jsx
    │   ├── Tasks.jsx
    │   ├── AuthProvider.jsx
    │   ├── ThemeContext.jsx
    │   └── components.css
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/refresh-token` - Refresh JWT token

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/complete` - Mark task as complete
- `PUT /api/tasks/:id/uncomplete` - Mark task as incomplete

## Features in Detail

### Authentication
- Session-based authentication with JWT
- Persistent login state
- Secure password hashing
- Protected routes

### Task Management
- Create tasks with name, description, and due date
- Edit existing tasks
- Mark tasks as complete/incomplete
- Delete tasks
- View task completion status

### Theme Support
- Toggle between light and dark modes
- Theme preference persists across sessions
- Smooth transitions between themes
- Responsive design for all screen sizes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Font Awesome for icons
- React team for the amazing framework
- Express.js for the backend framework
- SQLite for the database 
