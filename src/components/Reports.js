import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getFirestore, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase/config';
import Task from './Task';
import AddTask from './AddTask';
import SubmitReview from './SubmitReview';
import { Link } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import './Reports.css';

const Reports = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchTasks(user.uid, selectedDate);
      } else {
        setUser(null);
        console.log('No user is signed in');
      }
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const fetchTasks = async (userId, date) => {
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
      const fetchedTasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
        };
      });
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

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const handlePause = async (taskId) => {
    const db = getFirestore();
    const taskDoc = doc(db, "tasks", taskId);
    const taskSnap = await getDoc(taskDoc);
    if (taskSnap.exists()) {
      const taskData = taskSnap.data();
      const elapsed = taskData.startTime ? Date.now() - taskData.startTime.seconds * 1000 : 0;
      const newTotalTime = (taskData.totalTime || 0) + elapsed;
      await updateDoc(taskDoc, {
        status: "paused",
        endTime: Date.now(),
        totalTime: newTotalTime,
      });
      fetchTasks(user.uid, selectedDate);
    }
  };

  const handleStart = async (taskId) => {
    const db = getFirestore();
    const taskDoc = doc(db, "tasks", taskId);
    await updateDoc(taskDoc, {
      status: "in_progress",
      startTime: Date.now(),
    });
    fetchTasks(user.uid, selectedDate);
  };

  const handleDelete = async (taskId) => {
    const db = getFirestore();
    await deleteDoc(doc(db, "tasks", taskId));
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const formatTime = (time) => {
    return `${Math.floor(time / 3600000)}h ${Math.floor((time % 3600000) / 60000)}m`;
  };

  const exportTasks = () => {
    // Export tasks logic
  };

  const getWeekRange = (date) => {
    return {
      start: startOfWeek(date, { weekStartsOn: 1 }),
      end: endOfWeek(date, { weekStartsOn: 1 })
    };
  };

  const getMonthRange = (date) => {
    return {
      start: startOfMonth(date),
      end: endOfMonth(date)
    };
  };

  const filterTasksByRange = (tasks, range) => {
    return tasks.filter(task => {
      const taskDate = task.createdAt instanceof Date ? task.createdAt : (task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt));
      return taskDate >= range.start && taskDate <= range.end;
    });
  };

  const weekRange = getWeekRange(selectedDate);
  const monthRange = getMonthRange(selectedDate);

  const tasksThisWeek = filterTasksByRange(tasks, weekRange);
  const tasksThisMonth = filterTasksByRange(tasks, monthRange);

  const thisWeekTotal = tasksThisWeek.reduce((total, task) => total + (task.totalTime || 0), 0);
  const thisMonthTotal = tasksThisMonth.reduce((total, task) => total + (task.totalTime || 0), 0);
  const totalTime = tasks.reduce((total, task) => total + (task.totalTime || 0), 0);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <div>
      <header className="bg-gray-100 text-black py-4 px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Time Tracker</h1>
        <div>
          <span className="mr-4">Welcome, {user?.email}</span>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4">
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

        <div className="bg-gradient-to-r from-red-400 to-blue-500"> 
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

        <div className="my-4">
          <label htmlFor="date" className="block text-lg font-medium text-gray-700">Select Date</label>
          <input
            type="date"
            id="date"
            value={selectedDate instanceof Date && !isNaN(selectedDate) ? selectedDate.toISOString().split('T')[0] : ''}
            onChange={handleDateChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="task-container bg-white p-4 rounded-md shadow-md">
              <Task
                task={task}
                handlePause={handlePause}
                handleStart={handleStart}
                handleDelete={handleDelete}
              />
              <SubmitReview revieweeId={task.userId} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  </div>
);
}

export default Reports;