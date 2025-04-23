/**
    * @description      : 
    * @author           : Kai
    * @group            : 
    * @created          : 22/04/2025 - 23:20:52
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 22/04/2025
    * - Author          : Kai
    * - Modification    : 
**/
/**
 * @description      : Task manager UI for users
 * @author           : Kai
 * @created          : 22/04/2025 - 23:01:48
 * 
 * MODIFICATION LOG
 * - Version         : 1.0.1
 * - Date            : 22/04/2025
 * - Author          : Kai
 * - Modification    : Fixed compatibility with session-based backend
 **/

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeContext';
import './components.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    task_name: '',
    task_description: '',
    due_by: '',
  });
  const [editingTask, setEditingTask] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user, getAuthHeader, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/tasks`, {
          method: 'GET',
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        });

        const data = await res.json();
        if (res.ok) {
          setTasks(data);
        } else if (res.status === 401) {
          setMessage('Please log in to view your tasks.');
          logout();
        } else {
          setMessage(data.error || 'Failed to fetch tasks');
        }
      } catch (err) {
        setMessage('Error fetching tasks');
        console.error(err);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user, getAuthHeader, logout]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://${window.location.hostname}:3000/api/tasks`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Task added successfully!');
        setForm({ task_name: '', task_description: '', due_by: '' });

        // Refresh tasks list
        const refreshed = await fetch(`http://${window.location.hostname}:3000/api/tasks`, {
          headers: getAuthHeader(),
          credentials: 'include',
        }).then((res) => res.json());

        setTasks(refreshed);
      } else {
        setMessage(data.error || 'Failed to add task');
      }
    } catch (err) {
      setMessage('Error adding task');
      console.error(err);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:3000/api/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: getAuthHeader(),
        credentials: 'include',
      });

      if (res.ok) {
        // Refresh tasks list
        const refreshed = await fetch(`http://${window.location.hostname}:3000/api/tasks`, {
          headers: getAuthHeader(),
          credentials: 'include',
        }).then((res) => res.json());
        setTasks(refreshed);
        setMessage('Task completed successfully!');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to complete task');
      }
    } catch (err) {
      setMessage('Error completing task');
      console.error(err);
    }
  };

  const handleUncompleteTask = async (taskId) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:3000/api/tasks/${taskId}/uncomplete`, {
        method: 'PUT',
        headers: getAuthHeader(),
        credentials: 'include',
      });

      if (res.ok) {
        // Refresh tasks list
        const refreshed = await fetch(`http://${window.location.hostname}:3000/api/tasks`, {
          headers: getAuthHeader(),
          credentials: 'include',
        }).then((res) => res.json());
        setTasks(refreshed);
        setMessage('Task uncompleted successfully!');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to uncomplete task');
      }
    } catch (err) {
      setMessage('Error uncompleting task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`http://${window.location.hostname}:3000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
        credentials: 'include',
      });

      if (res.ok) {
        // Refresh tasks list
        const refreshed = await fetch(`http://${window.location.hostname}:3000/api/tasks`, {
          headers: getAuthHeader(),
          credentials: 'include',
        }).then((res) => res.json());
        setTasks(refreshed);
        setMessage('Task deleted successfully!');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to delete task');
      }
    } catch (err) {
      setMessage('Error deleting task');
      console.error(err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setForm({
      task_name: task.task_name,
      task_description: task.task_description,
      due_by: task.due_by,
    });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const res = await fetch(`http://${window.location.hostname}:3000/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (res.ok) {
        // Refresh tasks list
        const refreshed = await fetch(`http://${window.location.hostname}:3000/api/tasks`, {
          headers: getAuthHeader(),
          credentials: 'include',
        }).then((res) => res.json());
        setTasks(refreshed);
        setMessage('Task updated successfully!');
        setEditingTask(null);
        setForm({ task_name: '', task_description: '', due_by: '' });
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to update task');
      }
    } catch (err) {
      setMessage('Error updating task');
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setForm({ task_name: '', task_description: '', due_by: '' });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="tasks-container">
      <button className="theme-toggle" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>
      <h2>{editingTask ? 'Edit Task' : 'Log a New Task'}</h2>
      <form className="task-form" onSubmit={editingTask ? handleUpdateTask : handleTaskSubmit}>
        <input
          type="text"
          name="task_name"
          placeholder="Task Name"
          value={form.task_name}
          onChange={handleChange}
          required
        />
        <textarea
          name="task_description"
          placeholder="Task Description"
          value={form.task_description}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="due_by"
          value={form.due_by}
          onChange={handleChange}
          required
        />
        <button type="submit">{editingTask ? 'Update Task' : 'Add Task'}</button>
        {editingTask && (
          <button type="button" onClick={handleCancelEdit}>Cancel</button>
        )}
      </form>
      
      <h1>Your Tasks</h1>
      <ul className="task-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li key={task.id} className="task-item">
              <h2>{task.task_name}</h2>
              <p>{task.task_description}</p>
              <p>Due By: {task.due_by}</p>
              <p>Completed: {task.completed ? 'Yes' : 'No'}</p>
              <p>Completion: {task.completed_percent || 0}%</p>
              <div className="task-actions">
                {!task.completed ? (
                  <button onClick={() => handleCompleteTask(task.id)}>Complete</button>
                ) : (
                  <button onClick={() => handleUncompleteTask(task.id)}>Uncomplete</button>
                )}
                <button onClick={() => handleEditTask(task)}>Edit</button>
                <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
              </div>
            </li>
          ))
        ) : (
          <p>No tasks found</p>
        )}
      </ul>

      {message && <p className="message success">{message}</p>}
    </div>
  );
}

export default Tasks;
