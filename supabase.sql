-- Create the leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    score INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to everyone
CREATE POLICY "Allow public read access" ON public.leaderboard
    FOR SELECT USING (true);

-- Create policy to allow service role to insert/update
CREATE POLICY "Allow service role write access" ON public.leaderboard
    FOR ALL USING (auth.role() = 'service_role');

-- Create a user profiles table to store usernames securely
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow public read access" ON public.user_profiles
    FOR SELECT USING (true);

-- Allow service role to write
CREATE POLICY "Allow service role write access" ON public.user_profiles
    FOR ALL USING (auth.role() = 'service_role');
