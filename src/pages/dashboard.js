import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- import useNavigate
import { AdminDashboardPage } from './admin/AdminDashboardPage';
import { OwnerDashboardPage } from './admin/OwnerDashboardPage';
import { UserDashboard } from './UserDashboard';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

export function DashboardPage() {
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [quizHistory, setQuizHistory] = useState([]);
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminRequests, setAdminRequests] = useState([]);
    const navigate = useNavigate(); // <-- initialize navigate

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
                    .select('name, email, points, role')
                    .eq('user_id', user.id)
                    .single();

                if (profileError) {
                    setProfile({
                        name: user.user_metadata?.name || 'User',
                        email: user.email,
                        points: 0,
                        role: 'user'
                    });
                } else {
                    setProfile({
                        name: profileData?.name || user.user_metadata?.name || 'User',
                        email: profileData?.email || user.email,
                        points: profileData?.points || 0,
                        role: profileData?.role || 'user'
                    });
                }

                setRole(profileData?.role || 'user');

                await Promise.all([
                    fetchBookings(user.id),
                    fetchQuizHistory(user.id)
                ]);

                // If owner, fetch pending admin requests
                if (profileData && profileData.role === 'owner') {
                    const { data: requests, error: reqError } = await supabase
                        .from('admin_requests')
                        .select('id, user_id, reason, status, created_at, profiles(name, email)')
                        .eq('status', 'pending')
                        .order('created_at', { ascending: true });
                    if (!reqError) setAdminRequests(requests || []);
                }

            } catch (err) {
                setError(err.message || "Failed to load dashboard data.");
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [role, navigate]);

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

    // Approve/reject admin request (owner only)
    const handleAdminRequest = async (id, userId, action) => {
        setLoading(true);
        try {
            await supabase
                .from('admin_requests')
                .update({ status: action })
                .eq('id', id);
            if (action === 'approved') {
                await supabase
                    .from('profiles')
                    .update({ role: 'admin' })
                    .eq('id', userId);
            }
            const { data: requests } = await supabase
                .from('admin_requests')
                .select('id, user_id, reason, status, created_at, profiles(name, email)')
                .eq('status', 'pending')
                .order('created_at', { ascending: true });
            setAdminRequests(requests || []);
        } catch (err) {
            setError(err.message || "Failed to update admin request.");
        } finally {
            setLoading(false);
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

    if (role === 'owner') {
        return (
            <OwnerDashboardPage
                adminRequests={adminRequests}
                handleAdminRequest={handleAdminRequest}
            />
        );
    }
    // Remove direct rendering of AdminDashboardPage here
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

    // For user role, use UserDashboard component (with Layout handled inside if needed)
    return <UserDashboard profile={profile} bookings={bookings} quizHistory={quizHistory} role={role} />;
}