/**
 * Login Page Component
 * Handles user authentication for both visitors and admins
 * Includes password reset functionality and remember me option
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSupabase } from '../supabase';

/**
 * LoginPage Component
 * Manages user authentication and session handling for both visitors and admins
 * @returns {JSX.Element} The login page component
 */
export function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
        isAdmin: false
    });

    /**
     * Handles form input changes
     * @param {Event} e - The input change event
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * Handles password reset request
     * @param {Event} e - The form submission event
     */
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setError('Please enter your email address to reset your password');
            return;
        }

        setLoading(true);
        try {
            const supabase = getSupabase();
            const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            
            if (error) throw error;
            
            alert('Password reset instructions have been sent to your email');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles form submission and user authentication
     * @param {Event} e - The form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const supabase = getSupabase();
            console.log('Starting login process...');
            
            // First try Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (!authError && authData.user) {
                console.log('Supabase Auth successful, getting user details...');
                
                // Check if user exists in the appropriate table
                const table = formData.isAdmin ? 'admin' : 'visitor';
                console.log('Checking credentials in table:', table);
                
                const { data: existingUser, error: userError } = await supabase
                    .from(table)
                    .select('*')
                    .eq('email', formData.email)
                    .single();

                if (userError || !existingUser) {
                    console.error('User lookup error:', userError);
                    throw new Error('User not found in the system');
                }

                // Set session data
                const sessionData = {
                    user: {
                        id: formData.isAdmin ? existingUser.admin_id : existingUser.visitor_id,
                        email: existingUser.email,
                        name: existingUser.name,
                        role: formData.isAdmin ? existingUser.role : 'visitor'
                    }
                };

                console.log('Setting session data:', sessionData);

                // Store session based on rememberMe preference
                if (formData.rememberMe) {
                    localStorage.setItem('userSession', JSON.stringify(sessionData));
                    console.log('Session stored in localStorage');
                } else {
                    sessionStorage.setItem('userSession', JSON.stringify(sessionData));
                    console.log('Session stored in sessionStorage');
                }

                // Redirect based on role
                const redirectPath = formData.isAdmin ? '/admin/dashboard' : '/dashboard';
                console.log('Redirecting to:', redirectPath);
                navigate(redirectPath);
            } else {
                // If Supabase Auth fails, try legacy login
                console.log('Supabase Auth failed, trying legacy login...');
                
                const { data: existingUser, error: userError } = await supabase
                    .from(formData.isAdmin ? 'admin' : 'visitor')
                    .select('*')
                    .eq('email', formData.email)
                    .single();

                if (userError || !existingUser) {
                    console.error('User lookup error:', userError);
                    throw new Error('Invalid email or password');
                }

                // Verify password for legacy users
                if (existingUser.password !== formData.password) {
                    console.error('Password mismatch');
                    throw new Error('Invalid email or password');
                }

                // Set session data for legacy users
                const sessionData = {
                    user: {
                        id: formData.isAdmin ? existingUser.admin_id : existingUser.visitor_id,
                        email: existingUser.email,
                        name: existingUser.name,
                        role: formData.isAdmin ? existingUser.role : 'visitor'
                    }
                };

                if (formData.rememberMe) {
                    localStorage.setItem('userSession', JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem('userSession', JSON.stringify(sessionData));
                }

                navigate(formData.isAdmin ? '/admin/dashboard' : '/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider) => {
        try {
            const supabase = getSupabase();
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });
            
            if (error) throw error;
        } catch (error) {
            console.error(`${provider} login error:`, error);
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
                        create a new account
                    </Link>
                </p>
            </div>

            {/* Login Form */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Error Display */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="text-sm text-red-700">{error}</div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Login Options */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        id="rememberMe"
                                        name="rememberMe"
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                                        Remember me
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="isAdmin"
                                        name="isAdmin"
                                        type="checkbox"
                                        checked={formData.isAdmin}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                                        Login as Admin
                                    </label>
                                </div>
                            </div>

                            <div className="text-sm">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="font-medium text-orange-600 hover:text-orange-500"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    {/* OAuth Login Options */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* OAuth Buttons */}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            {/* Google OAuth */}
                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('google')}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                <span className="sr-only">Sign in with Google</span>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </button>

                            {/* GitHub OAuth */}
                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('github')}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                <span className="sr-only">Sign in with GitHub</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}