import React from 'react';
import { Link } from 'react-router-dom';

export function UserDashboard({ profile, bookings, quizHistory, role }) {
    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4">
                <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome, {profile?.name || 'User'}!</h2>
                        <p className="text-gray-600">{profile?.email}</p>
                        <span className="inline-block ml-2 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">{role?.toUpperCase()}</span>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">{profile?.points} points</span>
                    </div>
                </div>
                {/* ...rest of user dashboard code (bookings, quiz history, etc.)... */}
            </div>
        </div>
    );
}