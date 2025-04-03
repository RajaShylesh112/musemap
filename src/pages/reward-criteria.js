import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from '../supabase';

export function RewardCriteriaPage() {
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const supabase = getSupabase();

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                // In a real app, this would fetch from your database
                // For now, we'll use mock data
                const mockStats = {
                    totalVisits: 5,
                    quizzesTaken: 3,
                    averageQuizScore: 85,
                    badges: [
                        {
                            type: 'quiz',
                            level: 'silver',
                            awarded_at: '2024-03-15'
                        },
                        {
                            type: 'visits',
                            level: 'bronze',
                            awarded_at: '2024-03-10'
                        }
                    ],
                    points: 250
                };

                setUserStats(mockStats);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user stats:', error);
            setLoading(false);
        }
    };

    const criteria = {
        visits: {
            bronze: { count: 5, points: 50 },
            silver: { count: 10, points: 100 },
            gold: { count: 20, points: 200 }
        },
        quizzes: {
            bronze: { score: 60, points: 30 },
            silver: { score: 80, points: 60 },
            gold: { score: 90, points: 100 }
        },
        rewards: [
            {
                name: "Free Audio Guide",
                points: 100,
                description: "Get a free audio guide on your next visit"
            },
            {
                name: "Guided Tour",
                points: 200,
                description: "Enjoy a free guided tour of any museum"
            },
            {
                name: "Annual Pass",
                points: 500,
                description: "Get unlimited access to all museums for a year"
            }
        ]
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* User Stats */}
                {userStats && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-orange-50 rounded-lg p-4">
                                <div className="text-orange-500 text-sm font-medium">Total Visits</div>
                                <div className="text-2xl font-bold">{userStats.totalVisits}</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4">
                                <div className="text-orange-500 text-sm font-medium">Quizzes Taken</div>
                                <div className="text-2xl font-bold">{userStats.quizzesTaken}</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4">
                                <div className="text-orange-500 text-sm font-medium">Average Quiz Score</div>
                                <div className="text-2xl font-bold">{userStats.averageQuizScore}%</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4">
                                <div className="text-orange-500 text-sm font-medium">Points Earned</div>
                                <div className="text-2xl font-bold">{userStats.points}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Badge Criteria */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Earn Badges</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Visit Badges */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Visit Badges</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-orange-100 rounded-full p-3">
                                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium">Bronze Badge</div>
                                        <div className="text-sm text-gray-600">Visit {criteria.visits.bronze.count} museums (+{criteria.visits.bronze.points} points)</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 rounded-full p-3">
                                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium">Silver Badge</div>
                                        <div className="text-sm text-gray-600">Visit {criteria.visits.silver.count} museums (+{criteria.visits.silver.points} points)</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-yellow-100 rounded-full p-3">
                                        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium">Gold Badge</div>
                                        <div className="text-sm text-gray-600">Visit {criteria.visits.gold.count} museums (+{criteria.visits.gold.points} points)</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quiz Badges */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quiz Badges</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-orange-100 rounded-full p-3">
                                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium">Bronze Badge</div>
                                        <div className="text-sm text-gray-600">Score {criteria.quizzes.bronze.score}% or higher (+{criteria.quizzes.bronze.points} points)</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 rounded-full p-3">
                                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium">Silver Badge</div>
                                        <div className="text-sm text-gray-600">Score {criteria.quizzes.silver.score}% or higher (+{criteria.quizzes.silver.points} points)</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-yellow-100 rounded-full p-3">
                                        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium">Gold Badge</div>
                                        <div className="text-sm text-gray-600">Score {criteria.quizzes.gold.score}% or higher (+{criteria.quizzes.gold.points} points)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Available Rewards */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rewards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {criteria.rewards.map((reward, index) => (
                            <div key={index} className="border rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">{reward.name}</h3>
                                    <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                                        {reward.points} points
                                    </span>
                                </div>
                                <p className="text-gray-600">{reward.description}</p>
                                {userStats && userStats.points >= reward.points && (
                                    <button className="mt-4 w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                                        Redeem Reward
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 