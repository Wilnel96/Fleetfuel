/*
  # Recreate on_auth_user_created trigger and fix orphaned user

  ## Problem
  The on_auth_user_created trigger on auth.users does not exist,
  meaning new signups via the client portal get a valid auth account
  but no profile, organization, or organization_users row is created.

  ## Changes
  1. Recreate the trigger on auth.users that calls handle_new_user()
  2. Manually create the missing records for the orphaned user kobus@neworg.com
*/

-- 1. Recreate the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 2. Fix the orphaned user kobus@neworg.com
--    Their metadata has: name=KOBUS, surname=OPPERMAN, organization_name=NEWORG TEST (PTY) LTD
DO $$
DECLARE
  v_user_id uuid := 'bb5b2f5b-88c6-47de-a8ab-8e2918978088';
  v_org_id uuid;
BEGIN
  -- Only proceed if the profile is still missing
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id) THEN

    -- Create the organization
    INSERT INTO organizations (name, status, organization_type, is_management_org)
    VALUES ('NEWORG TEST (PTY) LTD', 'active', 'client', false)
    RETURNING id INTO v_org_id;

    -- Create the profile
    INSERT INTO profiles (id, organization_id, full_name, role)
    VALUES (v_user_id, v_org_id, 'KOBUS OPPERMAN', 'admin');

    -- Create the organization_users entry (trigger auto_grant_main_user_permissions
    -- will set all permissions to true on INSERT because role = 'main_user')
    INSERT INTO organization_users (
      user_id, organization_id, is_main_user, is_active,
      role, title, first_name, surname, email
    ) VALUES (
      v_user_id, v_org_id, true, true,
      'main_user', 'Main User', 'KOBUS', 'OPPERMAN', 'kobus@neworg.com'
    );

  END IF;
END $$;
