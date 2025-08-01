import React, { useState } from 'react';

const CreateAnnouncement = ({ onLoginSuccess, user }) => {
    const [announcement, setAnnouncement] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to handle announcement submission
        console.log('Announcement submitted:', announcement);
        setAnnouncement('');
    };

    return (
        <div className="create-announcement">
            <h2 className="text-2xl font-bold mb-4">Créer une Annonce</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    placeholder="Écrivez votre annonce ici..."
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="5"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Soumettre
                </button>
            </form>
        </div>
    );
};

export default CreateAnnouncement;