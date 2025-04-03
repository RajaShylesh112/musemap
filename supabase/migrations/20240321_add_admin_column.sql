-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Add created_at and updated_at columns if they don't exist
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE profiles 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION
        WHEN duplicate_column THEN 
            NULL;
    END;
END $$;

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 