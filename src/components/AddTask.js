import React, { useState } from 'react';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { auth } from '../firebase/config';

const AddTask = ({ addTaskToList }) => {
  const [task, setTask] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const db = getFirestore();
      const createdAt = new Date();
      const docRef = await addDoc(collection(db, 'tasks'), {
        task,
        category,
        userId: auth.currentUser.uid,
        status: 'unstarted',
        createdAt: createdAt,
      });
      addTaskToList({ id: docRef.id, task, category, userId: auth.currentUser.uid, status: 'unstarted', createdAt: createdAt });
      setTask('');
      setCategory('');
    } catch (error) {
      setError('Error adding task: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow-md">
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Task"
        required
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category"
        required
        className="border p-2 rounded w-full mb-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Add Task</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
};

export default AddTask;