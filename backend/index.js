/**
    * @description      : 
    * @author           : Kai
    * @group            : 
    * @created          : 22/04/2025 - 22:17:41
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 22/04/2025
    * - Author          : Kai
    * - Modification    : 
**/
const express = require('express');
const sha256 = require('sha256');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
require('dotenv').config();

app.use(
  cors({
    origin: 'http://localhost:5173', // adjust to your frontend port
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize session store
const sessionStore = new SQLiteStore({
  db: 'sessions.db',
  dir: './'
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      sameSite: 'lax',
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
  })
);

// Middleware to check JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Connect to SQLite DB
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite database.');
});

// Create sessions table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expired DATETIME NOT NULL
)`);

// Example route
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const hashed = sha256(password);

  const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
  db.get(sql, [username, hashed], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      // Save the user ID in the session
      req.session.user_id = row.id;
      
      // Generate JWT token
      const token = jwt.sign(
        { id: row.id, username: row.username },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({ 
        success: true, 
        user: { id: row.id, name: row.name, email: row.email },
        token: token
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// Add token refresh endpoint
app.post('/api/refresh-token', authenticateToken, (req, res) => {
  const token = jwt.sign(
    { id: req.user.id, username: req.user.username },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  res.json({ token });
});

// Protect routes that require authentication
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'You are logged in!' });
});

app.get('/api/tasks', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const sql = `SELECT * FROM tasks WHERE user_id = ? ORDER BY due_by`;

  db.all(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/tasks', (req, res) => {
  const user_id = req.session.user_id;

  console.log('User ID:', req.session);

  const { task_name, task_description, due_by } = req.body;

  if (!user_id) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const sql = `INSERT INTO tasks (user_id, task_name, task_description, due_by)
               VALUES (?, ?, ?, ?)`;

  db.run(sql, [user_id, task_name, task_description, due_by], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, message: 'Task added successfully' });
  });
});

// Complete task endpoint
app.put('/api/tasks/:id/complete', (req, res) => {
  const user_id = req.session.user_id;
  const task_id = req.params.id;

  if (!user_id) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const sql = `UPDATE tasks SET completed = 1, completed_percent = 100 
               WHERE id = ? AND user_id = ?`;

  db.run(sql, [task_id, user_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found or not authorized' });
    }
    res.json({ message: 'Task completed successfully' });
  });
});

// Uncomplete task endpoint
app.put('/api/tasks/:id/uncomplete', (req, res) => {
  const user_id = req.session.user_id;
  const task_id = req.params.id;

  if (!user_id) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const sql = `UPDATE tasks SET completed = 0, completed_percent = 0 
               WHERE id = ? AND user_id = ?`;

  db.run(sql, [task_id, user_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found or not authorized' });
    }
    res.json({ message: 'Task uncompleted successfully' });
  });
});

// Delete task endpoint
app.delete('/api/tasks/:id', (req, res) => {
  const user_id = req.session.user_id;
  const task_id = req.params.id;

  if (!user_id) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const sql = `DELETE FROM tasks WHERE id = ? AND user_id = ?`;

  db.run(sql, [task_id, user_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found or not authorized' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

// Update task endpoint
app.put('/api/tasks/:id', (req, res) => {
  const user_id = req.session.user_id;
  const task_id = req.params.id;
  const { task_name, task_description, due_by } = req.body;

  if (!user_id) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const sql = `UPDATE tasks 
               SET task_name = ?, task_description = ?, due_by = ?
               WHERE id = ? AND user_id = ?`;

  db.run(sql, [task_name, task_description, due_by, task_id, user_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found or not authorized' });
    }
    res.json({ message: 'Task updated successfully' });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend running on http://localhost:${port}`);
  console.log('Session secret:', process.env.SESSION_SECRET);
});
