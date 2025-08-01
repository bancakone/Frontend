import React, { useState } from 'react';

const AssignTask = ({ onLoginSuccess, user }) => {
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to assign the task goes here
        console.log('Task Assigned:', { taskTitle, taskDescription, dueDate });
        // Reset form fields
        setTaskTitle('');
        setTaskDescription('');
        setDueDate('');
    };

    return (
        <div className="assign-task-container">
            <h2 className="text-2xl font-bold">Assign a New Task</h2>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium" htmlFor="taskTitle">Task Title</label>
                    <input
                        type="text"
                        id="taskTitle"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium" htmlFor="taskDescription">Task Description</label>
                    <textarea
                        id="taskDescription"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium" htmlFor="dueDate">Due Date</label>
                    <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white rounded-md p-2">
                    Assign Task
                </button>
            </form>
        </div>
    );
};

export default AssignTask;