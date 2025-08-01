import React from 'react';

const ClassList = () => {
    // Sample data for classes
    const classes = [
        { id: 1, name: 'Mathematics 101', teacher: 'Mr. Smith' },
        { id: 2, name: 'History 202', teacher: 'Mrs. Johnson' },
        { id: 3, name: 'Biology 303', teacher: 'Dr. Brown' },
    ];

    return (
        <div className="class-list">
            <h2 className="text-2xl font-bold mb-4">Liste des Classes</h2>
            <ul className="list-disc pl-5">
                {classes.map((classItem) => (
                    <li key={classItem.id} className="mb-2">
                        <span className="font-semibold">{classItem.name}</span> - Enseigné par {classItem.teacher}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClassList;