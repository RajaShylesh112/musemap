import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../../supabase';

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
                    console.error('No session found');
                    navigate('/login');
                    return;
                }

                const { user } = session;
                console.log('OAuth user:', user);

                // First check if user exists in admin table by email
                const { data: adminData } = await supabase
                    .from('admin')
                    .select('*')
                    .eq('email', user.email)
                    .single();

                if (adminData) {
                    console.log('User is an admin');
                    // Store session data
                    const sessionData = {
                        user: {
                            id: adminData.admin_id,
                            email: adminData.email,
                            name: adminData.name,
                            role: adminData.role
                        }
                    };
                    localStorage.setItem('userSession', JSON.stringify(sessionData));
                    navigate('/admin/dashboard');
                    return;
                }

                // Then check if user exists in visitor table by email
                const { data: visitorData } = await supabase
                    .from('visitor')
                    .select('*')
                    .eq('email', user.email)
                    .single();

                if (visitorData) {
                    console.log('User is a visitor');
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
                    navigate('/dashboard');
                    return;
                }

                console.error('User not found in either table');
                throw new Error('User not found in the system');
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