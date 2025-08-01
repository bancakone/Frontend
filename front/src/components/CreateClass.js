import React, { useState } from 'react';

const CreateClass = ({ onLoginSuccess, user }) => {
    const [className, setClassName] = useState('');
    const [classDescription, setClassDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to create a new class goes here
        console.log('Class Created:', { className, classDescription });
        // Reset form fields
        setClassName('');
        setClassDescription('');
    };

    return (
        <div className="create-class-container">
            <h2 className="text-2xl font-bold mb-4">Créer une Classe</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Nom de la Classe</label>
                    <input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Description de la Classe</label>
                    <textarea
                        value={classDescription}
                        onChange={(e) => setClassDescription(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <button type="submit" className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
                    Créer la Classe
                </button>
            </form>
        </div>
    );
};

export default CreateClass;