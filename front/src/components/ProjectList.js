import React from 'react';

const ProjectList = () => {
    // Sample data for projects
    const projects = [
        { id: 1, name: 'Project Alpha', description: 'Description for Project Alpha' },
        { id: 2, name: 'Project Beta', description: 'Description for Project Beta' },
        { id: 3, name: 'Project Gamma', description: 'Description for Project Gamma' },
    ];

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Liste des Projets</h2>
            <ul className="space-y-4">
                {projects.map(project => (
                    <li key={project.id} className="border p-4 rounded shadow">
                        <h3 className="text-xl font-semibold">{project.name}</h3>
                        <p>{project.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProjectList;