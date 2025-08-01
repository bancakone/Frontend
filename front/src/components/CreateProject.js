import React, { useState } from 'react';

const CreateProject = ({ onLoginSuccess, user }) => {
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to create a project goes here
        console.log('Project Created:', { projectName, projectDescription });
        // Reset form fields
        setProjectName('');
        setProjectDescription('');
    };

    return (
        <div className="create-project-container">
            <h2 className="text-2xl font-bold mb-4">Créer un Projet</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Nom du Projet</label>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Description du Projet</label>
                    <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <button type="submit" className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
                    Créer le Projet
                </button>
            </form>
        </div>
    );
};

export default CreateProject;