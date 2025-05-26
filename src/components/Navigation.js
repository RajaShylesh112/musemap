import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSupabase } from '../supabase';
import { FiMoon, FiSun } from 'react-icons/fi';

export function Navigation() {
    const navigate = useNavigate();
    const supabase = getSupabase();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true'); // Initialize from localStorage

    useEffect(() => {
        // Initial check for dark mode
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Check initial auth status
        const checkInitialAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            setIsAdmin(session?.user?.user_metadata?.isAdmin || false);
        };
        checkInitialAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
            setIsAdmin(session?.user?.user_metadata?.isAdmin || false);
        });

        // Cleanup subscription on unmount
        return () => {
            subscription?.unsubscribe();
        };
    }, [supabase, darkMode]); // Rerun effect if supabase instance or darkMode changes

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            // Navigate to home page first
            navigate('/');
            // Then update state
            setIsLoggedIn(false);
            setIsAdmin(false);
        } catch (error) {
            console.error('Error during logout:', error);
            // Still update state and navigate even if there's an error
            setIsLoggedIn(false);
            setIsAdmin(false);
            navigate('/');
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <nav className="bg-white shadow-lg dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                            MuseMap
                        </Link>
                    </div>

                    {/* Hamburger menu button for mobile */}
                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={toggleMenu}
                            className="text-gray-700 hover:text-orange-500 focus:outline-none dark:text-orange-300"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="hover:underline hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-400">Home</Link>
                        <Link to="/chatbot" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium dark:text-orange-300 dark:hover:text-orange-400">Chatbot</Link>
                        <Link to="/museums" className="hover:underline hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-400">Museums</Link>
                        <Link to="/quiz" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium dark:text-orange-300 dark:hover:text-orange-400">Quiz</Link>
                        {isLoggedIn ? (
                            <>
                                <Link to="/booking" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium dark:text-orange-300 dark:hover:text-orange-400">
                                    Booking
                                </Link>
                                {isAdmin && (
                                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium dark:text-orange-300 dark:hover:text-orange-400">
                                        Admin
                                    </Link>
                                )}
                                <Link to="/dashboard" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium dark:text-orange-300 dark:hover:text-orange-400">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors dark:bg-red-600 dark:hover:bg-red-500"
                                >
                                    Logout
                                </button>
                                <button 
                                    onClick={toggleDarkMode}
                                    aria-label="Toggle dark mode"
                                    className="ml-2 p-2 rounded-full bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-xl text-orange-500 dark:text-orange-300"
                                >
                                    {darkMode ? <FiSun /> : <FiMoon />}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link 
                                    to="/login"
                                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors dark:bg-orange-600 dark:hover:bg-orange-500"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register"
                                    className="text-orange-500 border border-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-600"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile menu, show/hide based on menu state. */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
                            <Link to="/" className="text-gray-700 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium dark:text-orange-300 dark:hover:text-orange-400">Home</Link>
                            <Link to="/chatbot" className="text-gray-700 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium dark:text-orange-300 dark:hover:text-orange-400">Chatbot</Link>
                            <Link to="/museums" className="text-gray-700 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium dark:text-orange-300 dark:hover:text-orange-400">Museums</Link>
                            <Link to="/quiz" className="text-gray-700 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium dark:text-orange-300 dark:hover:text-orange-400">Quiz</Link>
                            {isLoggedIn ? (
                                <>
                                    <Link to="/booking" className="text-gray-700 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium dark:text-orange-300 dark:hover:text-orange-400">
                                        Booking
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin/dashboard" className="text-gray-700 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium dark:text-orange-300 dark:hover:text-orange-400">
                                            Admin
                                        </Link>
                                    )}
                                    <Link to="/dashboard" className="text-gray-700 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium dark:text-orange-300 dark:hover:text-orange-400">
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors w-full text-left mt-2 dark:bg-red-600 dark:hover:bg-red-500"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col space-y-2 mt-2">
                                    <Link 
                                        to="/login"
                                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-center dark:bg-orange-600 dark:hover:bg-orange-500"
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/register"
                                        className="text-orange-500 border border-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors text-center dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-600"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                            <button
                                onClick={toggleDarkMode}
                                className="flex items-center justify-center w-full mt-2 p-2 rounded-md text-gray-700 hover:bg-gray-200 dark:text-orange-300 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                                <span className="ml-2">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}