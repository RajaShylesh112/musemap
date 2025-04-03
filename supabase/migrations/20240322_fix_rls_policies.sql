-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

-- Disable RLS temporarily to ensure clean state
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy for inserting profiles (allows profile creation during registration)
CREATE POLICY "Enable insert for registration"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy for service role operations (allows the service role to manage all profiles)
CREATE POLICY "Service role can manage all profiles"
    ON profiles
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions to authenticated users
GRANT ALL ON profiles TO authenticated;

-- Grant insert permission to anon role for registration
GRANT INSERT ON profiles TO anon; 