import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Assuming supabase is initialized 

// Define reward levels and thresholds locally for this component's display logic
const POINT_LEVELS = {
    NONE: { name: 'None', threshold: 0, nextThreshold: 250, color: 'bg-gray-300' },
    BRONZE: { name: 'Bronze', threshold: 250, nextThreshold: 500, color: 'bg-yellow-600' },
    SILVER: { name: 'Silver', threshold: 500, nextThreshold: 1000, color: 'bg-gray-400' },
    GOLD: { name: 'Gold', threshold: 1000, nextThreshold: null, color: 'bg-yellow-400' },
};
const MAX_POINTS_DISPLAY = POINT_LEVELS.GOLD.threshold; // For progress bar calculation

// Helper to get current tier based on points
const getCurrentTier = (points) => {
    if (points >= POINT_LEVELS.GOLD.threshold) return POINT_LEVELS.GOLD;
    if (points >= POINT_LEVELS.SILVER.threshold) return POINT_LEVELS.SILVER;
    if (points >= POINT_LEVELS.BRONZE.threshold) return POINT_LEVELS.BRONZE;
    return POINT_LEVELS.NONE;
};

export function RewardCriteriaPage() {
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRedeeming, setIsRedeeming] = useState(false); // State for redemption loading
    const [redeemError, setRedeemError] = useState(null); // State for redemption errors
    const [redeemSuccess, setRedeemSuccess] = useState(null); // State for success message

    useEffect(() => {
        fetchUserStats();
    }, []);

    // --- Point Calculation Logic ---
    const calculatePoints = (quizResults, visitCount) => {
        let quizPoints = 0;
        quizResults.forEach(result => {
            const score = result.score || 0;
            if (score >= 90) {
                quizPoints += 100;
            } else if (score >= 80) {
                quizPoints += 60;
            } else if (score >= 60) {
                quizPoints += 30;
            }
        });

        let visitPoints = 0;
        if (visitCount >= 20) {
            visitPoints = 200;
        } else if (visitCount >= 10) {
            visitPoints = 100;
        } else if (visitCount >= 5) {
            visitPoints = 50;
        }

        return quizPoints + visitPoints;
    };
    // --- End Point Calculation Logic ---

    const fetchUserStats = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('points')
                    // Use the correct foreign key column 'user_id'
                    .eq('user_id', user.id)
                    .single();

                if (profileError) throw profileError;
                // Handle case where profile might not exist yet for a new user
                if (!profile) {
                    console.warn("User profile not found. Points might be 0 or profile needs creation.");
                    // Decide how to handle - maybe set points to 0?
                    setUserStats(prev => ({ ...prev, points: 0 }));
                    // Or throw an error if profile is mandatory
                    // throw new Error("User profile not found.");
                } else {
                    // Existing logic to set userStats using profile.points
                    const { data: quizResults, error: quizError } = await supabase
                        .from('quiz_results')
                        .select('score')
                        .eq('user_id', user.id);
                    if (quizError) throw quizError;

                    const { count: visitCount, error: visitError } = await supabase
                        .from('bookings')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id)
                        .eq('status', 'Confirmed');
                    if (visitError) throw visitError;

                    const totalScore = quizResults.reduce((sum, result) => sum + (result.score || 0), 0);
                    const averageQuizScore = quizResults.length > 0 ? Math.round(totalScore / quizResults.length) : 0;

                    setUserStats({
                        totalVisits: visitCount || 0,
                        quizzesTaken: quizResults.length,
                        averageQuizScore: averageQuizScore,
                        points: profile.points || 0, // Use points from profile
                    });
                }
            } else {
                setUserStats(null);
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
            setUserStats(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeemReward = async (reward) => {
        if (!userStats || isRedeeming) return; // Prevent multiple clicks or if not logged in

        setIsRedeeming(true);
        setRedeemError(null);
        setRedeemSuccess(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated.");

            const currentPoints = userStats.points;
            const cost = reward.points;

            if (currentPoints < cost) {
                throw new Error("Insufficient points to redeem this reward.");
            }

            const newPoints = currentPoints - cost;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ points: newPoints })
                .eq('user_id', user.id); // Use 'user_id' to match the profile record

            if (updateError) throw updateError;

            setUserStats(prevStats => ({
                ...prevStats,
                points: newPoints
            }));

            setRedeemSuccess(`Successfully redeemed "${reward.name}"!`);

        } catch (error) {
            console.error('Error redeeming reward:', error);
            setRedeemError(error.message || 'Failed to redeem reward. Please try again.');
        } finally {
            setIsRedeeming(false);
            setTimeout(() => {
                setRedeemError(null);
                setRedeemSuccess(null);
            }, 5000);
        }
    };

    const criteria = {
        visits: {
            level1: { count: 5, points: 50 },
            level2: { count: 10, points: 100 },
            level3: { count: 20, points: 200 }
        },
        quizzes: {
            level1: { score: 60, points: 30 },
            level2: { score: 80, points: 60 },
            level3: { score: 90, points: 100 }
        },
        rewards: [
            {
                id: 'audio_guide',
                name: "Free Audio Guide",
                points: 50,
                description: "Enhance your next museum visit with a complimentary audio guide."
            },
            {
                id: 'discount_5',
                name: "5% Discount",
                points: 100,
                description: "Get 5% off your next ticket or gift shop purchase."
            },
            {
                id: 'discount_10',
                name: "10% Discount",
                points: 200,
                description: "Get 10% off your next ticket or gift shop purchase."
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

    const currentPoints = userStats?.points ?? 0;
    const currentTier = getCurrentTier(currentPoints);
    const progressPercent = Math.min((currentPoints / MAX_POINTS_DISPLAY) * 100, 100);

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {userStats ? (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Your Progress</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                            <div className="bg-orange-50 rounded-lg p-4 text-center">
                                <div className="text-sm font-medium text-orange-600 mb-1">Total Visits</div>
                                <div className="text-3xl font-bold text-gray-900">{userStats.totalVisits}</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <div className="text-sm font-medium text-blue-600 mb-1">Quizzes Taken</div>
                                <div className="text-3xl font-bold text-gray-900">{userStats.quizzesTaken}</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <div className="text-sm font-medium text-green-600 mb-1">Average Score</div>
                                <div className="text-3xl font-bold text-gray-900">{userStats.averageQuizScore}%</div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4 text-center">
                                <div className="text-sm font-medium text-yellow-600 mb-1">Points Earned</div>
                                <div className="text-3xl font-bold text-gray-900">{userStats.points}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center">
                        <p className="text-gray-600">Log in to see your progress.</p>
                        <Link to="/login" className="text-orange-600 hover:underline mt-2 inline-block">Go to Login</Link>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">How to Earn Points</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">Museum Visits</h3>
                            <ul className="space-y-3 text-gray-600 list-disc list-inside">
                                <li>
                                    Visit {criteria.visits.level1.count} museums: <span className="font-medium text-gray-800">+{criteria.visits.level1.points} points</span>
                                </li>
                                <li>
                                    Visit {criteria.visits.level2.count} museums: <span className="font-medium text-gray-800">+{criteria.visits.level2.points} points</span>
                                </li>
                                <li>
                                    Visit {criteria.visits.level3.count} museums: <span className="font-medium text-gray-800">+{criteria.visits.level3.points} points</span>
                                </li>
                            </ul>
                            <p className="text-xs text-gray-500 mt-2 italic">(Points awarded based on total confirmed visits)</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">Quiz Performance</h3>
                            <ul className="space-y-3 text-gray-600 list-disc list-inside">
                                <li>
                                    Score {criteria.quizzes.level1.score}% or higher: <span className="font-medium text-gray-800">+{criteria.quizzes.level1.points} points</span> (per quiz)
                                </li>
                                <li>
                                    Score {criteria.quizzes.level2.score}% or higher: <span className="font-medium text-gray-800">+{criteria.quizzes.level2.points} points</span> (per quiz)
                                </li>
                                <li>
                                    Score {criteria.quizzes.level3.score}% or higher: <span className="font-medium text-gray-800">+{criteria.quizzes.level3.points} points</span> (per quiz)
                                </li>
                            </ul>
                            <p className="text-xs text-gray-500 mt-2 italic">(Points awarded for each quiz meeting the criteria)</p>
                        </div>
                    </div>
                </div>

                {userStats && (
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Your Points Progress</h2>
                        <div className="mb-8 px-2 sm:px-4">
                            <div className="flex justify-between mb-1 text-sm font-medium text-center">
                                <span className={`flex-1 ${currentPoints >= POINT_LEVELS.BRONZE.threshold ? 'text-yellow-700' : 'text-gray-500'}`}>Bronze</span>
                                <span className={`flex-1 ${currentPoints >= POINT_LEVELS.SILVER.threshold ? 'text-gray-600' : 'text-gray-500'}`}>Silver</span>
                                <span className={`flex-1 ${currentPoints >= POINT_LEVELS.GOLD.threshold ? 'text-yellow-500' : 'text-gray-500'}`}>Gold</span>
                            </div>
                            <div className="relative h-4 mb-2 text-xs sm:text-sm text-gray-500">
                                <span style={{ position: 'absolute', left: '0%' }}>0</span>
                                <span style={{ position: 'absolute', left: `${(POINT_LEVELS.BRONZE.threshold / MAX_POINTS_DISPLAY) * 100}%`, transform: 'translateX(-50%)' }}>{POINT_LEVELS.BRONZE.threshold}</span>
                                <span style={{ position: 'absolute', left: `${(POINT_LEVELS.SILVER.threshold / MAX_POINTS_DISPLAY) * 100}%`, transform: 'translateX(-50%)' }}>{POINT_LEVELS.SILVER.threshold}</span>
                                <span style={{ position: 'absolute', right: '0%' }}>{POINT_LEVELS.GOLD.threshold}</span>
                            </div>
                            <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden relative">
                                <div className="absolute h-full w-px bg-gray-400" style={{ left: `${(POINT_LEVELS.BRONZE.threshold / MAX_POINTS_DISPLAY) * 100}%` }}></div>
                                <div className="absolute h-full w-px bg-gray-400" style={{ left: `${(POINT_LEVELS.SILVER.threshold / MAX_POINTS_DISPLAY) * 100}%` }}></div>
                                <div
                                    className={`h-full rounded-full ${currentTier.color} transition-all duration-500 ease-out`}
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center mt-2 text-sm">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${currentTier.color} mr-2`}></div>
                                    <span className="text-gray-700">Current Tier: <span className="font-medium">{currentTier.name}</span></span>
                                </div>
                                <span className="text-gray-600 font-medium">{currentPoints} points earned</span>
                            </div>
                            {currentTier.nextThreshold && (
                                <p className="text-xs text-gray-500 text-right mt-1">
                                    {Math.max(0, currentTier.nextThreshold - currentPoints)} points to {getCurrentTier(currentTier.nextThreshold).name}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Available Rewards</h2>

                    {redeemError && <p className="text-red-600 text-center mb-4">{redeemError}</p>}
                    {redeemSuccess && <p className="text-green-600 text-center mb-4">{redeemSuccess}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {criteria.rewards.map((reward) => (
                            <div key={reward.id} className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-semibold text-gray-800">{reward.name}</h3>
                                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                            {reward.points} points
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-5">{reward.description}</p>
                                </div>
                                <button
                                    onClick={() => handleRedeemReward(reward)}
                                    disabled={!userStats || currentPoints < reward.points || isRedeeming}
                                    className={`w-full px-4 py-2 rounded text-white font-medium transition-colors ${
                                        userStats && currentPoints >= reward.points && !isRedeeming
                                            ? 'bg-orange-500 hover:bg-orange-600'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isRedeeming ? 'Redeeming...' : (userStats && currentPoints >= reward.points ? 'Redeem' : `Need ${reward.points} pts`)}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <Link to="/rewards" className="text-orange-600 hover:underline">
                            View Your Progress Details →
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/dashboard" className="text-gray-600 hover:text-orange-600 font-medium">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}