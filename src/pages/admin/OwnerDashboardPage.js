import React from 'react';
import { Link } from 'react-router-dom';

export function OwnerDashboardPage({ adminRequests, handleAdminRequest }) {
    return (
        <div style={{ padding: 24 }}>
            <h2>Owner Dashboard</h2>
            <h3>Pending Admin Requests</h3>
            {adminRequests.length === 0 ? (
                <div>No pending admin requests.</div>
            ) : (
                <ul>
                    {adminRequests.map(req => (
                        <li key={req.id} style={{ border: '1px solid #eee', margin: 8, padding: 8, borderRadius: 4 }}>
                            <div><b>{req.profiles?.name || req.user_id}</b> ({req.profiles?.email})</div>
                            <div>Reason: {req.reason}</div>
                            <div>Requested: {new Date(req.created_at).toLocaleString()}</div>
                            <button onClick={() => handleAdminRequest(req.id, req.user_id, 'approved')} style={{ marginRight: 8 }}>Approve</button>
                            <button onClick={() => handleAdminRequest(req.id, req.user_id, 'rejected')}>Reject</button>
                        </li>
                    ))}
                </ul>
            )}
            <div style={{ marginTop: 24 }}>
                <h3>Admin Actions</h3>
                <Link to="/add-museum">Add Museum</Link> | <Link to="/create-quiz">Create Quiz</Link> | <Link to="/edit-rewards">Edit Rewards</Link>
            </div>
        </div>
    );
}