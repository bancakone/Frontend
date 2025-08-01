import React from 'react';

const PrivateMessageList = () => {
    return (
        <div>
            <h2 className="text-xl font-bold">Liste des Messages Privés</h2>
            {/* Here you can map through the private messages and display them */}
            <ul>
                {/* Example message item */}
                <li className="border-b p-2">Message 1: Lorem ipsum dolor sit amet.</li>
                <li className="border-b p-2">Message 2: Consectetur adipiscing elit.</li>
                {/* Add more messages as needed */}
            </ul>
        </div>
    );
};

export default PrivateMessageList;