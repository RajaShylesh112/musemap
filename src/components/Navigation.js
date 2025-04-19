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
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        // You would typically check user role in your database
        setIsAdmin(session?.user?.user_metadata?.isAdmin || false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
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
                        <Link to="/" className="hover:underline hover:text-orange-500">Home</Link>
                        <Link to="/chatbot" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">Chatbot</Link>
                        <Link to="/museums" className="hover:underline hover:text-orange-500">Museums</Link>
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