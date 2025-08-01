import React from 'react';

const MySubmissions = ({ user }) => {
    return (
        <div className="my-submissions">
            <h2 className="text-2xl font-bold">Mes Soumissions</h2>
            <p className="mt-4">Voici la liste de vos soumissions :</p>
            {/* Here you can map through the user's submissions and display them */}
            {/* Example: */}
            {/* {user.submissions.map(submission => (
                <div key={submission.id} className="submission-item">
                    <h3 className="font-semibold">{submission.title}</h3>
                    <p>{submission.description}</p>
                </div>
            ))} */}
        </div>
    );
};

export default MySubmissions;