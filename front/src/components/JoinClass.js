import React, { useState } from 'react';

const JoinClass = ({ onLoginSuccess, user }) => {
    const [classCode, setClassCode] = useState('');
    const [error, setError] = useState('');

    const handleJoinClass = () => {
        // Simulate an API call to join a class
        if (classCode) {
            // Assume success for now
            console.log(`User ${user.name} joined class with code: ${classCode}`);
            // Reset the input field
            setClassCode('');
            setError('');
        } else {
            setError('Veuillez entrer un code de classe valide.');
        }
    };

    return (
        <div className="join-class-container">
            <h2 className="text-2xl font-bold mb-4">Rejoindre une Classe</h2>
            <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="Entrez le code de la classe"
                className="border p-2 rounded mb-2"
            />
            <button
                onClick={handleJoinClass}
                className="bg-blue-500 text-white p-2 rounded"
            >
                Rejoindre
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default JoinClass;