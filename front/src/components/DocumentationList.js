import React from 'react';

const DocumentationList = () => {
    // Sample data for documentation
    const documents = [
        { id: 1, title: 'Document 1', description: 'Description of Document 1' },
        { id: 2, title: 'Document 2', description: 'Description of Document 2' },
        { id: 3, title: 'Document 3', description: 'Description of Document 3' },
    ];

    return (
        <div className="documentation-list">
            <h2 className="text-2xl font-bold mb-4">Liste des Documents Partagés</h2>
            <ul className="list-disc pl-5">
                {documents.map(doc => (
                    <li key={doc.id} className="mb-2">
                        <h3 className="font-semibold">{doc.title}</h3>
                        <p>{doc.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DocumentationList;