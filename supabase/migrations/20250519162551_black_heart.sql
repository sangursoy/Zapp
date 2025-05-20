-- Add admin role type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;
END $$;

-- Add role column to users table
ALTER TABLE users 
ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- Create index for role column
CREATE INDEX idx_users_role ON users(role);

-- Add admin-specific policies
CREATE POLICY "Admins can manage all users"
ON users
FOR ALL
TO authenticated
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can manage all content"
ON contents
FOR ALL
TO authenticated
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Create first admin user
UPDATE users 
SET role = 'admin'
WHERE id = (
    SELECT id 
    FROM users 
    ORDER BY created_at 
    LIMIT 1
);