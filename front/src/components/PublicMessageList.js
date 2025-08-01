import React from 'react';

const PublicMessageList = ({ messages }) => {
    return (
        <div className="public-message-list">
            <h2 className="text-xl font-bold mb-4">Public Messages</h2>
            <ul className="list-disc pl-5">
                {messages.map((message, index) => (
                    <li key={index} className="mb-2">
                        <strong>{message.sender}:</strong> {message.content}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PublicMessageList;