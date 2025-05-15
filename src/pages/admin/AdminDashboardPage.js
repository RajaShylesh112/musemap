import React from 'react';
import { Link } from 'react-router-dom';

export function AdminDashboardPage() {
    return (
        <div style={{ padding: 24 }}>
            <h2>Admin Dashboard</h2>
            <div>
                <Link to="/add-museum">Add Museum</Link> | <Link to="/create-quiz">Create Quiz</Link> | <Link to="/edit-rewards">Edit Rewards</Link>
            </div>
        </div>
    );
}