import React from 'react';

const TaskList = ({ tasks }) => {
    return (
        <div className="task-list">
            <h2 className="text-2xl font-bold mb-4">Liste des Tâches</h2>
            {tasks.length === 0 ? (
                <p>Aucune tâche disponible.</p>
            ) : (
                <ul className="list-disc pl-5">
                    {tasks.map((task, index) => (
                        <li key={index} className="mb-2">
                            <span className="font-semibold">{task.title}</span>: {task.description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TaskList;