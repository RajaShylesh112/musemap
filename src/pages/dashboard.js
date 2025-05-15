import React, { useState, useEffect } from 'react';
import { UserDashboard } from './UserDashboard';
import { AdminDashboardPage } from './admin/AdminDashboardPage';
import { OwnerDashboardPage } from './admin/OwnerDashboardPage';
import { supabase } from '../lib/supabase';

export function DashboardPage() {
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [quizHistory, setQuizHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setRole] = useState('user');
    const [adminRequests, setAdminRequests] = useState([]);

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
                        points: 0
                    });
                    setRole('user');
                } else {
                    setProfile({
                        name: profileData?.name || user.user_metadata?.name || 'User',
                        email: profileData?.email || user.email,
                        points: profileData?.points || 0
                    });
                    setRole(profileData.role || 'user');
                }

                await Promise.all([
                    fetchBookings(user.id),
                    fetchQuizHistory(user.id)
                ]);

                // If owner, fetch pending admin requests
                if ((profileData && profileData.role === 'owner')) {
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

    // Approve/reject admin request (owner only)
    const handleAdminRequest = async (id, userId, action) => {
        setLoading(true);
        try {
            // Update admin_requests status
            await supabase
                .from('admin_requests')
                .update({ status: action })
                .eq('id', id);
            // If approved, update user role to admin
            if (action === 'approved') {
                await supabase
                    .from('profiles')
                    .update({ role: 'admin' })
                    .eq('id', userId);
            }
            // Refresh admin requests
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
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
    }
    if (error) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>{error}</div>;
    }

    if (role === 'owner') {
        return (
            <OwnerDashboardPage
                adminRequests={adminRequests}
                handleAdminRequest={handleAdminRequest}
            />
        );
    }
    if (role === 'admin') {
        return <AdminDashboardPage />;
    }
    return (
        <UserDashboard
            profile={profile}
            bookings={bookings}
            quizHistory={quizHistory}
            role={role}
        />
    );
}