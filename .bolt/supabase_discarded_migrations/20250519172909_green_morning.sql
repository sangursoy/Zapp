/*
  # Set sangursoy as admin

  1. Changes
    - Update user role to 'admin' for user with username 'sangursoy'
*/

-- Update user role to admin
UPDATE users
SET role = 'admin'
WHERE username = 'sangursoy';

-- Add comment explaining the change
COMMENT ON COLUMN users.role IS 'User role (user or admin). sangursoy is set as admin.';