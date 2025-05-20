-- Create a table to track onboarded users
CREATE TABLE IF NOT EXISTS onboarded_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    yoma_user_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT,
    phone_number TEXT,
    country_code TEXT NOT NULL,
    education_id TEXT,
    gender_id TEXT,
    date_of_birth DATE NOT NULL,
    onboarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on yoma_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarded_users_yoma_id ON onboarded_users(yoma_user_id);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarded_users_email ON onboarded_users(email);

-- Create an index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarded_users_phone ON onboarded_users(phone_number);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_onboarded_users_updated_at
    BEFORE UPDATE ON onboarded_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
