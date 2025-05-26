-- Add contact_phone column
ALTER TABLE public.museums
ADD COLUMN contact_phone TEXT NULL;

-- Add contact_email column
ALTER TABLE public.museums
ADD COLUMN contact_email TEXT NULL;

-- Add facilities column
ALTER TABLE public.museums
ADD COLUMN facilities TEXT[] NULL;

-- Add about column
ALTER TABLE public.museums
ADD COLUMN about TEXT NULL;

-- Add interesting_facts column
ALTER TABLE public.museums
ADD COLUMN interesting_facts TEXT[] NULL;

-- Change opening_hours column type to JSONB
ALTER TABLE public.museums
ADD COLUMN opening_hours_jsonb JSONB NULL;

-- Attempt to convert data from the old TEXT column to the new JSONB column.
-- Handle potential invalid JSON gracefully by setting it to NULL.
DO $$
BEGIN
    UPDATE public.museums
    SET opening_hours_jsonb = CASE
        WHEN opening_hours IS NULL OR opening_hours = '' THEN NULL
        ELSE opening_hours::JSONB
    END
    WHERE opening_hours IS NOT NULL AND opening_hours <> '';
EXCEPTION
    WHEN invalid_text_representation THEN
        -- If conversion fails for any row, this block will catch it.
        -- You might want to log this or handle specific rows.
        -- For now, we're letting problem rows remain NULL in opening_hours_jsonb
        RAISE WARNING 'Some rows had invalid JSON in opening_hours and were not converted.';
END $$;

ALTER TABLE public.museums
DROP COLUMN opening_hours;

ALTER TABLE public.museums
RENAME COLUMN opening_hours_jsonb TO opening_hours;

-- Change ticket_price column type to JSONB
ALTER TABLE public.museums
ADD COLUMN ticket_price_jsonb JSONB NULL;

-- Convert existing decimal ticket_price to a JSONB object format.
-- Store as {"default_price": value}
UPDATE public.museums
SET ticket_price_jsonb = jsonb_build_object('default_price', ticket_price)
WHERE ticket_price IS NOT NULL;

ALTER TABLE public.museums
DROP COLUMN ticket_price;

ALTER TABLE public.museums
RENAME COLUMN ticket_price_jsonb TO ticket_price;

-- Enable RLS for updates on museums table if not already enabled (initial schema already enabled RLS)
-- ALTER TABLE public.museums ENABLE ROW LEVEL SECURITY; -- This should have been done by initial_schema.sql

-- Drop policy if it exists to make the script idempotent
DROP POLICY IF EXISTS "Users can update their own museum" ON public.museums;

-- Add RLS policy for updating museums
CREATE POLICY "Users can update their own museum"
    ON public.museums FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant update permissions to authenticated users on specific columns if needed,
-- but RLS with a USING/WITH CHECK clause on user_id should be sufficient for row-level access.
-- If specific column grants are desired, they would look like:
-- GRANT UPDATE (name, description, location, opening_hours, ticket_price, image_url, contact_phone, contact_email, facilities, about, interesting_facts) ON public.museums TO authenticated;
-- For now, the RLS policy itself should grant the necessary update rights on rows they own.

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    museum_id UUID REFERENCES public.museums(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    data JSONB, -- For storing quiz questions, answers, etc.
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trigger for updated_at on quizzes
CREATE OR REPLACE TRIGGER handle_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); -- Assumes handle_updated_at function from initial schema

-- RLS for quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view quizzes"
    ON public.quizzes FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Museum owners can manage their quizzes"
    ON public.quizzes FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.museums WHERE id = quizzes.museum_id AND user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.museums WHERE id = quizzes.museum_id AND user_id = auth.uid()));

-- Create artifacts table
CREATE TABLE IF NOT EXISTS public.artifacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    museum_id UUID REFERENCES public.museums(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    data JSONB, -- For additional details
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trigger for updated_at on artifacts
CREATE OR REPLACE TRIGGER handle_artifacts_updated_at
    BEFORE UPDATE ON public.artifacts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS for artifacts
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view artifacts"
    ON public.artifacts FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Museum owners can manage their artifacts"
    ON public.artifacts FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.museums WHERE id = artifacts.museum_id AND user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.museums WHERE id = artifacts.museum_id AND user_id = auth.uid()));

-- Create exhibitions table
CREATE TABLE IF NOT EXISTS public.exhibitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    museum_id UUID REFERENCES public.museums(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    data JSONB, -- For additional details
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trigger for updated_at on exhibitions
CREATE OR REPLACE TRIGGER handle_exhibitions_updated_at
    BEFORE UPDATE ON public.exhibitions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS for exhibitions
ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view exhibitions"
    ON public.exhibitions FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Museum owners can manage their exhibitions"
    ON public.exhibitions FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.museums WHERE id = exhibitions.museum_id AND user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.museums WHERE id = exhibitions.museum_id AND user_id = auth.uid()));

-- Grant usage on new sequences if any are implicitly created for ID columns (though uuid_generate_v4 is used)
-- For UUID defaults, explicit sequence grants are not typically needed.
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon; -- Might be too broad, ensure specific if needed.
