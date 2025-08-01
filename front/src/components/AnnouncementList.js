import React from 'react';

const AnnouncementList = ({ announcements }) => {
    return (
        <div className="announcement-list">
            <h2 className="text-2xl font-bold mb-4">Liste des Annonces</h2>
            <ul className="space-y-2">
                {announcements.map((announcement, index) => (
                    <li key={index} className="p-4 border rounded shadow">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <p>{announcement.content}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AnnouncementList;