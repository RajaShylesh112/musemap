import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from '../supabase';

export function DashboardPage() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = getSupabase();

    useEffect(() => {
        fetchUserData();
        fetchBookings();
    }, []);

    const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const fetchBookings = async () => {
        // This would typically fetch from your bookings table
        // For now, we'll use mock data
        const mockBookings = [
            {
                id: 1,
                museum: "National Museum, New Delhi",
                date: "2024-04-15",
                status: "Confirmed"
            },
            {
                id: 2,
                museum: "Indian Museum, Kolkata",
                date: "2024-04-20",
                status: "Pending"
            }
        ];
        setBookings(mockBookings);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="bg-orange-100 rounded-full p-3">
                            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user?.user_metadata?.name}</h2>
                            <p className="text-gray-600">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Upcoming Bookings */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Bookings</h3>
                        {bookings.length > 0 ? (
                            <div className="space-y-4">
                                {bookings.map(booking => (
                                    <div key={booking.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{booking.museum}</h4>
                                                <p className="text-sm text-gray-600">Date: {booking.date}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                booking.status === 'Confirmed' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No upcoming bookings</p>
                        )}
                        <Link 
                            to="/booking"
                            className="mt-4 inline-block text-orange-600 hover:text-orange-500"
                        >
                            Book a new visit →
                        </Link>
                    </div>

                    {/* Quiz History */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz History</h3>
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Museum Knowledge Quiz</h4>
                                        <p className="text-sm text-gray-600">Completed on: 2024-04-01</p>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                        Score: 80%
                                    </span>
                                </div>
                            </div>
                            <Link 
                                to="/quiz"
                                className="mt-4 inline-block text-orange-600 hover:text-orange-500"
                            >
                                Take another quiz →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link 
                        to="/search"
                        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="bg-orange-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Explore Museums</h4>
                                <p className="text-sm text-gray-600">Find new museums to visit</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/rewards/criteria"
                        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="bg-orange-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Rewards</h4>
                                <p className="text-sm text-gray-600">Check your rewards status</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/contact"
                        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="bg-orange-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Contact Support</h4>
                                <p className="text-sm text-gray-600">Get help with your account</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
} 