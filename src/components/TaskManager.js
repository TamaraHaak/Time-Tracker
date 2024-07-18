import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import { auth } from '../firebase/config';
import Task from './Task';
import AddTask from './AddTask';
import SubmitReview from './SubmitReview';

const TaskManager = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchTasks(user.uid);
      } else {
        setUser(null);
        console.log('No user is signed in');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTasks = async (userId) => {
    try {
      console.log('Fetching tasks for user:', userId);
      const db = getFirestore();
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        console.log('No matching documents.');
        setTasks([]);
        return;
      }
      const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Fetched tasks:', fetchedTasks);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
      setError('Error fetching tasks: ' + error.message);
    }
  };

  const addTaskToList = (task) => {
    setTasks([...tasks, task]);
  };

  return (
    <div>
      <h1>Task Manager</h1>
      <AddTask addTaskToList={addTaskToList} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {user ? (
        tasks.length > 0 ? (
          tasks.map(task => (
            <div key={task.id} className="task-container">
              <Task
                localTask={task}
                handlePause={() => {}}
                handleStart={() => {}}
                handleEdit={() => {}}
                handleDelete={() => {}}
              />
              <div className="review-container">
                <SubmitReview revieweeId={task.userId} />
              </div>
            </div>
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