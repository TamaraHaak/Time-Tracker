
import React, { useState } from "react";
import {
  getFirestore,
  updateDoc,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { BsCircleFill } from "react-icons/bs";
import { format } from "date-fns";
import {
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineCalendar,
  AiOutlinePlayCircle,
  AiOutlinePauseCircle,
  AiOutlineReload,
} from "react-icons/ai";
import { FaCheck, FaTimes } from "react-icons/fa";
import SubmitReview from './SubmitReview';
import app from "../firebase/config";

// instance of firestore
const db = getFirestore(app);

function Task({ task,  handleDelete, handlePause, handleStart }) {
  // Local state
  const [localTask, setLocalTask] = useState(task);
  const [isEditing, setIsEditing] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState(task ? task.task : "");

  const [newStartTime, setNewStartTime] = useState(localTask.startTime && localTask.startTime.seconds ? new Date(localTask.startTime.seconds * 1000).toISOString().slice(0, 16) : '');
  const [newEndTime, setNewEndTime] = useState(localTask.endTime && localTask.endTime.seconds ? new Date(localTask.endTime.seconds * 1000).toISOString().slice(0, 16) : '');

  if (!task || !task.task) {
    return <div className="text-red-500">Task data is not available or corrupted
    <p>Start Time: {newStartTime}</p>
    </div>;
  }

  // Handle Edit
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle cancel Edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewTaskDescription(localTask.task);
  };

  // Handle Update
  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, "tasks", localTask.id), {
        task: newTaskDescription,
        startTime: new Date(newStartTime),
        endTime: new Date(newEndTime),
      });
      // Update the state
      setLocalTask((prevState) => ({ ...prevState, task: newTaskDescription, startTime: new Date(newStartTime), endTime: new Date(newEndTime) }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Handle renderTaskDescription
  const renderTaskDescription = () => {
    if (isEditing) {
      return (
        <div className="flex space-x-2">
          <input
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="border border-purple-300 rounded px-2 py-1"
          />
          <FaCheck
            onClick={handleUpdate}
            className="text-green-400 cursor-pointer"
          />
          <FaTimes
            onClick={handleCancelEdit}
            className="text-red-400 cursor-pointer"
          />
        </div>
      );
    }

    return <p className="text-gray-600">{task.task}</p>;
  };

  // Handle start
  const handleStartClick = async () => {
    try {
      await updateDoc(doc(db, "tasks", localTask.id), {
        status: "in_progress",
        startTime: Date.now(),
      });
      const taskDoc = doc(db, "tasks", localTask.id);
      onSnapshot(taskDoc, (docSnap) => {
        if (docSnap.exists()) {
          setLocalTask({
            ...docSnap.data(),
            date: localTask.date,
            id: localTask.id,
          });
        }
      });
    } catch (error) {
      console.error("Error starting task:", error);
    }
  };

  // Handle pause
  const handlePauseClick = async () => {
    try {
      const elapsed = localTask.startTime
        ? Date.now() - localTask.startTime
        : 0;
      const newTotalTime = (localTask.totalTime || 0) + elapsed;
      await updateDoc(doc(db, "tasks", localTask.id), {
        status: "paused",
        endTime: Date.now(),
        totalTime: newTotalTime,
      });
      const taskDoc = doc(db, "tasks", localTask.id);
      onSnapshot(taskDoc, (docSnap) => {
        if (docSnap.exists()) {
          setLocalTask({
            ...docSnap.data(),
            date: localTask.date,
            id: localTask.id,
          });
        }
      });
    } catch (error) {
      console.error("Error pausing task:", error);
    }
  };

  // Handle delete
  const handleDeleteClick = async () => {
    try {await deleteDoc(doc(db, "tasks", localTask.id));
    handleDelete(localTask.id);
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

// Handle render buttons
const handleRenderButtons = () => {
  switch (localTask.status) {
    case "unstarted":
      return (
        <AiOutlinePlayCircle
          className="text-2xl text-purple-400 cursor-pointer"
          onClick={handleStartClick}
        />
      );
    case "in_progress":
      return (
        <AiOutlinePauseCircle
          className="text-2xl text-green-400 cursor-pointer"
          onClick={handlePauseClick}
        />
      );
    default:
      return (
        <AiOutlineReload
          className="text-2xl text-green-400 cursor-pointer"
          onClick={handleStartClick}
        />
      );
  }
};

return (
  <div className="bg-white p-4 rounded-md text-black shadow-lg flex flex-col md:flex-row md:items-center justify-between">
    <div className="md:space-x-2 space-y-2 md:space-y-0">
      {/* render description */}
      {renderTaskDescription()}
      <div className="flex items-center space-x-2">
        <AiOutlineCalendar className="text-gray-600" />
        <p className="text-gray-600">
          {localTask.createdAt && localTask.createdAt.seconds ? format(new Date(localTask.createdAt.seconds * 1000), "do MMM yyyy") : 'No date'}
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-2 justify-center">
      <BsCircleFill
        color={
          localTask.status === "paused"
            ? "red"
            : localTask.status === "in_progress"
            ? "green"
            : "yellow"
        }
      />
      <p>{localTask.status}</p>
    </div>
    <div className="flex items-center space-x-2 justify-center md:justify-end">
      {/* Render buttons */}
      {handleRenderButtons()}
      <AiOutlineEdit
        onClick={handleEditClick}
        className="text-2xl text-purple-400 cursor-pointer"
      />
      <AiOutlineDelete
        onClick={handleDeleteClick}
        className="text-2xl text-red-500 cursor-pointer"
      />
    </div>
    {isEditing && (
      <div className="mt-4">
        <label className="block text-gray-700">Start Time:</label>
        <input
          type="datetime-local"
          value={newStartTime}
          onChange={(e) => setNewStartTime(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <label className="block text-gray-700 mt-2">End Time:</label>
        <input
          type="datetime-local"
          value={newEndTime}
          onChange={(e) => setNewEndTime(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>
    )}
    {/* SubmitReview Component */}
    <div className="w-full md:w-1/2 mt-4">
      <SubmitReview revieweeId={localTask.userId} />
    </div>
  </div>
);
}

export default Task;
