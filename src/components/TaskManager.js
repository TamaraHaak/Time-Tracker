import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase/config';
import { collection, query, where, getDocs } from "firebase/firestore";
import Task from './Task';

const TaskManager = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        console.log('User signed in:', user.uid);
        fetchTasks(user.uid);
      } else {
        console.log('No user is signed in');
      }
    });

    return () => unsubscribe();
  }, [unsubscribe]);

  const fetchTasks = async (userId) => {
    try {
      console.log('Fetching tasks for user:', userId);
      const tasksRef = collection(firestore, 'tasks');
      const q = query(tasksRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        console.log('No matching documents.');
        setTasks([]);
        return;
      }
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Fetched tasks:', tasks);
      setTasks(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
      setError('Error fetching tasks: ' + error.message);
    }
  };

  return (
    <div>
      <h1>Task Manager</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {user ? (
        tasks.length > 0 ? (
          tasks.map(task => (
            <Task
              key={task.id}
              localTask={task}
              handlePause={() => {}}
              handleStart={() => {}}
              handleEdit={() => {}}
              handleDelete={() => {}}
            />
          ))
        ) : (
          <p>No tasks found</p>
        )
      ) : (
        <p>Please sign in to manage your tasks.</p>
      )}
    </div>
  );
};

export default TaskManager;