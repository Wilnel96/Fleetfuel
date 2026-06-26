UPDATE auth.users 
SET encrypted_password = crypt('FuelAdmin2026!', gen_salt('bf'))
WHERE email = 'willem@fleetfuel.com';