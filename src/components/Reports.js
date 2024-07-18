import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import { auth } from '../firebase/config';
import Task from './Task';
import AddTask from './AddTask';
import SubmitReview from './SubmitReview';
import { Link } from 'react-router-dom';
import './Reports.css'

const Reports = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [thisWeekTotal, setThisWeekTotal] = useState(0);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

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

  const formatTime = (time) => {
    // Format time as needed
    return time;
  };

  const exportTasks = () => {
    // Export tasks logic
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center mb-8">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-md text-white shadow-lg">
          <h2 className="text-lg font-semibold">This Week</h2>
          <p className="text-2xl font-bold">{formatTime(thisWeekTotal)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-4 rounded-md text-white shadow-lg">
          <h2 className="text-lg font-semibold">This Month</h2>
          <p className="text-2xl font-bold">{formatTime(thisMonthTotal)}</p>
        </div>
        <div className="bg-gradient-to-r from-red-400 to-yellow-500 p-4 rounded-md text-white shadow-lg">
          <h2 className="text-lg font-semibold">Total</h2>
          <p className="text-2xl font-bold">{formatTime(totalTime)}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-400 to-yellow-500 p-4 rounded-md shadow-lg max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between mb-4">
          <Link
            to="/create-task"
            className="w-full sm:w-auto bg-gradient-to-r sm:mr-4 mb-4 sm:mb-0 from-red-500 to-pink-500 p-2 rounded text-white"
          >
            Add New Task
          </Link>
          <button
            onClick={exportTasks}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded text-white"
          >
            Export
          </button>
        </div>

        <AddTask addTaskToList={addTaskToList} />
        
        <div className="space-y-4">
          {tasks.map((task) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;