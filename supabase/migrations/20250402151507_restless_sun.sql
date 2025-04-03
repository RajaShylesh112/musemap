/*
  # Create bookings table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `museum_id` (text)
      - `visit_date` (date)
      - `adult_count` (integer)
      - `child_count` (integer)
      - `senior_count` (integer)
      - `total_amount` (decimal)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `bookings` table
    - Add policies for users to manage their bookings
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  museum_id text NOT NULL,
  visit_date date NOT NULL,
  adult_count integer DEFAULT 0,
  child_count integer DEFAULT 0,
  senior_count integer DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);