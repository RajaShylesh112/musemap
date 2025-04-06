import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSupabase } from '../supabase';

export function Navigation() {
    const navigate = useNavigate();
    const supabase = getSupabase();
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        // Check local storage first
        const localSession = localStorage.getItem('userSession');
        const sessionStorageSession = sessionStorage.getItem('userSession');
        const userSession = localSession || sessionStorageSession;

        if (userSession) {
            const parsedSession = JSON.parse(userSession);
            setIsLoggedIn(true);
            setIsAdmin(parsedSession.user.role === 'admin' || parsedSession.user.role === 'curator');
            return;
        }

        // If no local session, check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // Get user details from appropriate table
            const { data: userData } = await supabase
                .from('admin')
                .select('*')
                .eq('email', session.user.email)
                .single();

            if (userData) {
                setIsLoggedIn(true);
                setIsAdmin(true);
                // Store session data
                const sessionData = {
                    user: {
                        id: userData.admin_id,
                        email: userData.email,
                        name: userData.name,
                        role: userData.role
                    }
                };
                localStorage.setItem('userSession', JSON.stringify(sessionData));
                return;
            }

            const { data: visitorData } = await supabase
                .from('visitor')
                .select('*')
                .eq('email', session.user.email)
                .single();

            if (visitorData) {
                setIsLoggedIn(true);
                setIsAdmin(false);
                // Store session data
                const sessionData = {
                    user: {
                        id: visitorData.visitor_id,
                        email: visitorData.email,
                        name: visitorData.name,
                        role: 'visitor'
                    }
                };
                localStorage.setItem('userSession', JSON.stringify(sessionData));
            }
        } else {
            setIsLoggedIn(false);
            setIsAdmin(false);
        }
    };

    const handleLogout = async () => {
        // Clear Supabase session
        await supabase.auth.signOut();
        // Clear local storage session
        localStorage.removeItem('userSession');
        // Clear session storage session
        sessionStorage.removeItem('userSession');
        setIsLoggedIn(false);
        setIsAdmin(false);
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-orange-500">
                            MuseMap
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        <Link to="/" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                        <Link to="/chatbot" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">Chatbot</Link>
                        <Link to="/museums" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">Museums</Link>
                        <Link to="/quiz" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">Quiz</Link>
                        {isLoggedIn ? (
                            <>
                                <Link to="/booking" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                                    Booking
                                </Link>
                                {isAdmin && (
                                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                                        Admin
                                    </Link>
                                )}
                                <Link to="/dashboard" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link 
                                    to="/login"
                                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register"
                                    className="text-orange-500 border border-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 