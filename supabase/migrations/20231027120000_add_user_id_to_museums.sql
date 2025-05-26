-- Add user_id column to museums table
ALTER TABLE public.museums
ADD COLUMN user_id UUID;

-- Add foreign key constraint to auth.users table
ALTER TABLE public.museums
ADD CONSTRAINT fk_museums_user_id
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE SET NULL; -- Or ON DELETE CASCADE if museum should be deleted if user is deleted

-- Add unique constraint to ensure one museum per user
ALTER TABLE public.museums
ADD CONSTRAINT unique_user_museum UNIQUE (user_id);

-- Optional: Add an index for faster lookups on user_id
CREATE INDEX IF NOT EXISTS idx_museums_user_id ON public.museums(user_id);

-- Backfill existing museums (if any) or handle them manually.
-- For new setups, this might not be needed.
-- If there are existing museums that need a user_id, you might:
-- 1. Assign them to a default admin user.
-- 2. Leave user_id NULL for them if the column is nullable and your app logic handles it.
-- Example: UPDATE public.museums SET user_id = 'your_admin_user_id_here' WHERE user_id IS NULL;
-- For now, we are keeping user_id nullable, so existing rows will have NULL.

COMMENT ON COLUMN public.museums.user_id IS 'Foreign key referencing the user who owns/manages this museum.';
