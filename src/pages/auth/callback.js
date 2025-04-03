import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../../supabase';
import { createUserProfile, getUserProfile } from '../../services/database';

export function AuthCallbackPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const supabase = getSupabase();
            
            try {
                // Get session details
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                if (!session) {
                    navigate('/login');
                    return;
                }

                const { user } = session;

                // Check if profile exists
                let profile = await getUserProfile(user.id);

                // If no profile exists, create one
                if (!profile) {
                    const userData = {
                        name: user.user_metadata.full_name || user.user_metadata.name || user.email.split('@')[0],
                        email: user.email,
                        isAdmin: false // Default to regular user for OAuth signups
                    };

                    profile = await createUserProfile(user.id, userData);
                }

                // Redirect based on role
                navigate(profile.is_admin ? '/admin/dashboard' : '/dashboard');
            } catch (error) {
                console.error('Auth callback error:', error);
                navigate('/login');
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
            <p className="mt-4 text-center text-sm text-gray-600">
                Completing sign in...
            </p>
        </div>
    );
} 