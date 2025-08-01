import React, { useState } from 'react';

const SendMessage = ({ user }) => {
    const [message, setMessage] = useState('');
    const [recipient, setRecipient] = useState('');

    const handleSendMessage = () => {
        // Logic to send the message
        console.log(`Message sent to ${recipient}: ${message}`);
        setMessage('');
        setRecipient('');
    };

    return (
        <div className="send-message-container">
            <h2 className="text-lg font-semibold">Envoyer un Message</h2>
            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Destinataire"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="border p-2 w-full"
                />
            </div>
            <div className="mt-4">
                <textarea
                    placeholder="Votre message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border p-2 w-full"
                />
            </div>
            <button
                onClick={handleSendMessage}
                className="mt-4 bg-blue-500 text-white p-2 rounded"
            >
                Envoyer
            </button>
        </div>
    );
};

export default SendMessage;