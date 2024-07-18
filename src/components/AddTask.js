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
      const docRef = await addDoc(collection(db, 'tasks'), {
        task,
        category,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      });
      addTaskToList({ id: docRef.id, task, category, userId: auth.currentUser.uid, createdAt: new Date() });
      setTask('');
      setCategory('');
    } catch (error) {
      setError('Error adding task: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder="Task" required />
      <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" required />
      <button type="submit">Add Task</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default AddTask;