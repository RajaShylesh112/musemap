import { getSupabase } from '../supabase';

// User Profile Operations
export async function createUserProfile(userId, userData) {
    const supabase = getSupabase();
    
    try {
        console.log('Starting profile creation for user:', userId);
        console.log('User data:', userData);
        
        // First, check if profile already exists
        console.log('Checking for existing profile...');
        const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error checking existing profile:', checkError);
            throw checkError;
        }

        if (existingProfile) {
            console.log('Profile already exists, updating instead');
            const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update({
                    name: userData.name,
                    email: userData.email,
                    is_admin: userData.isAdmin || false
                })
                .eq('id', userId)
                .select()
                .single();

            if (updateError) {
                console.error('Profile update error:', updateError);
                throw updateError;
            }

            return updatedProfile;
        }

        // Create new profile
        console.log('Creating new profile...');
        const { data: profile, error } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                name: userData.name,
                email: userData.email,
                is_admin: userData.isAdmin || false
            }])
            .select()
            .single();

        if (error) {
            console.error('Profile creation error:', error);
            throw error;
        }

        console.log('Profile created successfully:', profile);
        return profile;
    } catch (error) {
        console.error('Error in createUserProfile:', error);
        throw error;
    }
}

export async function getUserProfile(userId) {
    const supabase = getSupabase();
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

// Museum Operations
export async function getMuseums() {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('museums')
        .select('*')
        .order('name');

    if (error) throw error;
    return data;
}

export async function getMuseumById(museumId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('museums')
        .select('*')
        .eq('id', museumId)
        .single();

    if (error) throw error;
    return data;
}

// Booking Operations
export async function createBooking(bookingData) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getUserBookings(userId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            museums (
                name,
                location
            )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
}

// Quiz Operations
export async function saveQuizResult(quizData) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('quiz_results')
        .insert([quizData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getUserQuizResults(userId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

    if (error) throw error;
    return data;
}

// Badge Operations
export async function awardBadge(badgeData) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('user_badges')
        .insert([badgeData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getUserBadges(userId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });

    if (error) throw error;
    return data;
}

// Points Operations
export async function updateUserPoints(userId, points) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('user_points')
        .upsert([
            {
                user_id: userId,
                points: points
            }
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getUserPoints(userId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId)
        .single();

    if (error) throw error;
    return data?.points || 0;
}

// Stats Operations
export async function getUserStats(userId) {
    const supabase = getSupabase();
    
    // Get total visits
    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', userId);

    // Get quiz stats
    const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results')
        .select('score')
        .eq('user_id', userId);

    // Get badges
    const { data: badges, error: badgesError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

    // Get points
    const { data: points, error: pointsError } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId)
        .single();

    if (bookingsError || quizError || badgesError || pointsError) {
        throw new Error('Error fetching user stats');
    }

    const totalVisits = bookings?.length || 0;
    const quizzesTaken = quizResults?.length || 0;
    const averageQuizScore = quizResults?.length > 0
        ? quizResults.reduce((acc, curr) => acc + curr.score, 0) / quizResults.length
        : 0;

    return {
        totalVisits,
        quizzesTaken,
        averageQuizScore,
        badges: badges || [],
        points: points?.points || 0
    };
} 