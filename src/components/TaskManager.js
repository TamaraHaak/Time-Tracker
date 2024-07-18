import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import Task from "./Task";
import app from "../firebase/config";

// Instance of Firestore
const db = getFirestore(app);

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const userId = "PrPqv9ZXUpMqS9RAHNcgRVEyF133"; // Ваш пользовательский ID

  useEffect(() => {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ ...doc.data(), id: doc.id });
      });
      console.log("Fetched tasks:", tasksData); // Лог для отладки
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div>
      <h1>Task Manager</h1>
      {tasks.length > 0 ? (
        tasks.map((task) => <Task key={task.id} task={task} />)
      ) : (
        <div>Нет доступной задачи</div>
      )}
    </div>
  );
};

export default TaskManager;