/*
  # Add Super Admin Support
  
  1. New Fields:
    - Add `is_super_admin` to `users` table.
  
  2. Security:
    - Update RLS policies to allow Super Admins to view ALL organizations and users.
    - Set the initial super admin by email.
*/

-- 1. Add is_super_admin to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- 2. Update RLS for organizations (Super Admins can see all)
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()) 
    OR 
    (SELECT is_super_admin FROM users WHERE id = auth.uid()) = TRUE
  );

-- 3. Update RLS for users (Super Admins can see all)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (
    id = auth.uid() 
    OR 
    (SELECT is_super_admin FROM users WHERE id = auth.uid()) = TRUE
  );

-- 4. Set Initial Super Admin
UPDATE users 
SET is_super_admin = TRUE 
WHERE email = 'djabercheriet@gmail.com';
