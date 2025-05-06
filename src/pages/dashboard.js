import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function DashboardPage() {
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [quizHistory, setQuizHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                if (!user) {
                    setLoading(false);
                    return;
                }

                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('name, email, points')
                    .eq('user_id', user.id)
                    .single();

                if (profileError) {
                    setProfile({
                        name: user.user_metadata?.name || 'User',
                        email: user.email,
                        points: 0
                    });
                } else {
                    setProfile({
                        name: profileData?.name || user.user_metadata?.name || 'User',
                        email: profileData?.email || user.email,
                        points: profileData?.points || 0
                    });
                }

                await Promise.all([
                    fetchBookings(user.id),
                    fetchQuizHistory(user.id)
                ]);

            } catch (err) {
                setError(err.message || "Failed to load dashboard data.");
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, []);

    const fetchBookings = async (userId) => {
        const { data, error } = await supabase
            .from('bookings')
            .select('id, museum_id, booking_date, status, museums(name)')
            .eq('user_id', userId)
            .order('booking_date', { ascending: false })
            .limit(5);

        if (error) {
            setBookings([]);
        } else {
            const formattedBookings = data.map(b => ({
                id: b.id,
                museum: b.museums?.name || 'Unknown Museum',
                date: b.booking_date,
                status: b.status
            }));
            setBookings(formattedBookings);
        }
    };

    const fetchQuizHistory = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('quiz_results')
                .select('id, score, completed_at, quizzes(title)')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            const formattedHistory = data.map(result => ({
                id: result.id,
                title: result.quizzes?.title || 'Unknown Quiz',
                score: result.score,
                completed_at: result.completed_at
            }));
            setQuizHistory(formattedHistory);

        } catch (error) {
            setQuizHistory([]);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-6 bg-white shadow-md rounded-lg">
                    <p className="text-gray-600 mb-4">Please log in to view your dashboard.</p>
                    <Link to="/login" className="text-orange-600 hover:text-orange-500">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                            <div className="bg-orange-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                {profile.name && <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>}
                                {profile.email && <p className="text-sm text-gray-600">{profile.email}</p>}
                            </div>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-sm text-gray-500">Points Earned</p>
                            <p className="text-2xl font-bold text-orange-600">{profile.points}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Bookings</h3>
                        {bookings.length > 0 ? (
                            <div className="space-y-4">
                                {bookings.map(booking => (
                                    <div key={booking.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{booking.museum}</h4>
                                                <p className="text-sm text-gray-600">Date: {new Date(booking.date).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                booking.status === 'Confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : booking.status === 'Pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
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
                            className="mt-4 inline-block text-orange-600 hover:text-orange-500 font-medium"
                        >
                            Book a new visit →
                        </Link>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz History</h3>
                        {quizHistory.length > 0 ? (
                            <div className="space-y-4">
                                {quizHistory.map(result => (
                                    <div key={result.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{result.title}</h4>
                                                <p className="text-sm text-gray-600">
                                                    Completed on: {new Date(result.completed_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                Score: {result.score}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No quiz history found.</p>
                        )}
                        <Link
                            to="/quiz"
                            className="mt-4 inline-block text-orange-600 hover:text-orange-500 font-medium"
                        >
                            Take another quiz →
                        </Link>
                    </div>
                </div>

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
                        to="/rewards"
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
                                <p className="text-sm text-gray-600">Check status & redeem ({profile.points} pts)</p>
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