import React from 'react';
import { AiOutlinePauseCircle, AiOutlineReload, AiOutlineCalendar, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { BsCircleFill } from 'react-icons/bs';
import { format } from 'date-fns';

const Task = ({ localTask, handlePause, handleStart, handleEdit, handleDelete }) => {
  console.log('Received task:', localTask);

  if (!localTask || !localTask.task) {
    console.error('Task or task.task is missing:', localTask);
    return <div className="bg-red-100 p-4 rounded-md text-black shadow-lg">Invalid task data</div>;
  }

  const renderTaskDescription = () => (
    <div>
      <h3 className="font-bold text-xl">{localTask.task || 'No title'}</h3>
      <p className="text-gray-600">{localTask.description || 'No description'}</p>
    </div>
  );

  const handleRenderButtons = () => {
    switch (localTask.status) {
      case "in_progress":
        return (
          <AiOutlinePauseCircle
            className="text-2xl text-green-400 cursor-pointer"
            onClick={handlePause}
          />
        );
      default:
      case "unstarted":
        return (
          <AiOutlineReload
            className="text-2xl text-green-400 cursor-pointer"
            onClick={handleStart}
          />
        );
    }
  };

  return (
    <div className="bg-white p-4 rounded-md text-black shadow-lg flex flex-col md:flex-row md:items-center justify-between">
      <div className="md:space-x-2 space-y-2 md:space-y-0">
        {renderTaskDescription()}
        <div className="flex items-center space-x-2">
          <AiOutlineCalendar className="text-gray-600" />
          <p className="text-gray-600">
            {localTask.date ? format(new Date(localTask.date), "do MMM yyyy") : 'No date'}
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
        {handleRenderButtons()}
        <AiOutlineEdit
          onClick={handleEdit}
          className="text-2xl text-purple-400 cursor-pointer"
        />
        <AiOutlineDelete
          onClick={handleDelete}
          className="text-2xl text-red-500 cursor-pointer"
        />
      </div>
    </div>
  );
}

export default Task;