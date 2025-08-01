import React from 'react';

const ShareDocumentation = ({ user }) => {
    const handleShareDocument = (event) => {
        event.preventDefault();
        // Logic to handle document sharing
    };

    return (
        <div className="share-documentation">
            <h2 className="text-2xl font-bold mb-4">Partager un Document</h2>
            <form onSubmit={handleShareDocument} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Titre du Document</label>
                    <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Télécharger le Document</label>
                    <input type="file" required className="mt-1 block w-full" />
                </div>
                <button type="submit" className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
                    Partager
                </button>
            </form>
        </div>
    );
};

export default ShareDocumentation;