// TaskContext.js
import React, { createContext, useContext, useState } from 'react';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState({}); // Initial state from HomeScreen

  const addNewTask = (newTask) => {
    setTasks((prevTasks) => {
      const date = newTask.date;
      const existingTasks = prevTasks[date] || [];
      return {
        ...prevTasks,
        [date]: [
          ...existingTasks,
          {
            id: Math.random().toString(),
            title: newTask.title,
            subtitle: newTask.description,
            startTime: newTask.startTime,
            done: false,
            timeLeft: "default hours" // Adjust based on your logic
          }
        ]
      };
    });
  };

  return (
    <TaskContext.Provider value={{ tasks, addNewTask, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
};
