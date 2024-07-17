import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import Task from './Task';

const TaskManager = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchTasks(user.uid);
      } else {
        console.log('No user is signed in');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTasks = async (userId) => {
    try {
      const db = getFirestore();
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasks);
    } catch (error) {
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