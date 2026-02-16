INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Unknown', '', '', 'South Africa', -34.1821909, 22.0388057, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total', '', '', 'Unknown', '', '', 'South Africa', -34.1796268, 22.0286257, NULL, '[]'::jsonb, 'Unknown Bank', 'Total', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Unknown', '', '', 'South Africa', -30.6890746, 28.5028728, NULL, '[]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Unknown', '', '', 'South Africa', -33.4002505, 25.1622142, NULL, '[]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', '', '', 'Unknown', '', '', 'South Africa', -33.8212268, 25.6442766, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Gqeberha', 'Eastern Cape', '', 'South Africa', -33.9277492, 25.4208192, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 372 1972","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', 'Matanzima Road', '', 'KwaNobuhle', 'Eastern Cape', '6242', 'South Africa', -33.8061496, 25.3963727, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 977 2884","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', 'Matanzima Road', '', 'KwaNobuhle', '', '', 'South Africa', -33.8055082, 25.395452, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Mollies Vulstasie', '', '', 'Unknown', '', '', 'South Africa', -30.5873211, 23.5063898, NULL, '[]'::jsonb, 'Unknown Bank', 'Mollies Vulstasie', '0000000000', '000000', '', 0.5, 'Mollies Vulstasie', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Unknown', '', '', 'South Africa', -31.6749064, 28.0022996, NULL, '[]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Engcobo', 'Eastern Cape', '5050', 'South Africa', -31.6751884, 28.0017033, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 65 967 5887","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Ngcobo', '', '5050', 'South Africa', -31.6755796, 27.9961695, NULL, '[]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', 'Voortrekker Street', '', 'Indwe', 'Eastern Cape', '5445', 'South Africa', -31.4686085, 27.3394276, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 45 952 1239","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', 'Cathcart Road', '', 'Unknown', 'Eastern Cape', '5319', 'South Africa', -31.9031073, 26.8867947, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 45 838 2890","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Quest', 'Uitenhage Road', '', 'Rocklands', '', '', 'South Africa', -33.8652892, 25.3136183, NULL, '[]'::jsonb, 'Unknown Bank', 'Quest', '0000000000', '000000', '', 0.5, 'Quest Petroleum', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', 'Ries Street', '', 'Port Elizabeth', 'Eastern Cape', '6012', 'South Africa', -33.9111262, 25.6150684, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 457 1100","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'George', 'Western Cape', '6536', 'South Africa', -33.9712602, 22.4679346, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 44 884 1316","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (95 ULP)","LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Quest', '', '', 'Unknown', '', '', 'South Africa', -32.3618168, 22.5589966, NULL, '[]'::jsonb, 'Unknown Bank', 'Quest', '0000000000', '000000', '', 0.5, 'Quest', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Truck Stop', '', '', 'Beaufort West', '', '', 'South Africa', -32.3620585, 22.5610408, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 23 414 4702","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Truck Stop', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total', '', '', 'Unknown', '', '', 'South Africa', -32.1647404, 25.6157947, NULL, '[]'::jsonb, 'Unknown Bank', 'Total', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '68 J. A. Calata Street', '', 'Cradock', 'Eastern Cape', '5880', 'South Africa', -32.1654336, 25.6161799, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 48 881 3026","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', 'Kempston Road', '', 'Unknown', '', '', 'South Africa', -33.9354165, 25.5842467, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', 'Strandfontein Road', '', 'Port Elizabeth', 'Eastern Cape', '6001', 'South Africa', -33.9913449, 25.6472921, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 583 5307","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (95 ULP)","LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '1 Marine Drive', '', 'Gqeberha', 'Eastern Cape', '6001', 'South Africa', -33.9813759, 25.6573196, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 583 3157","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Atlantic', 'George Bendle Road', '', 'Unknown', '', '', 'South Africa', -34.1706396, 22.1219063, NULL, '[]'::jsonb, 'Unknown Bank', 'Atlantic', '0000000000', '000000', '', 0.5, 'Atlantic', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', '', '', 'Unknown', '', '', 'South Africa', -34.1921348, 22.0511077, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex La Roche Motors', '2 Forest Hill Drive', '', 'Gqeberha', '', '6070', 'South Africa', -33.9804846, 25.629802, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 585 9999","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Caltex La Roche Motors', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', '8th Avenue', '', 'Port Elizabeth', '', '', 'South Africa', -33.9773582, 25.5863311, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Agri Land', '', '', 'Unknown', '', '', 'South Africa', -34.0395276, 23.046045, NULL, '[]'::jsonb, 'Unknown Bank', 'Agri Land', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Atlantic Oil', 'Main Road', '', 'Unknown', '', '', 'South Africa', -34.0365297, 23.0533984, NULL, '[]'::jsonb, 'Unknown Bank', 'Atlantic Oil', '0000000000', '000000', '', 0.5, 'Atlantic Oil', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total', 'Stanford Road', '', 'Unknown', '', '', 'South Africa', -33.9127806, 25.5599864, NULL, '[]'::jsonb, 'Unknown Bank', 'Total', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', 'Courtenay Street', '', 'Unknown', '', '', 'South Africa', -33.9586111, 22.4651036, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', 'Govan Mbeki Avenue', '', 'Unknown', '', '', 'South Africa', -33.9547503, 25.6138201, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Express', 'Western Road', '', 'Unknown', '', '', 'South Africa', -33.9633153, 25.618248, NULL, '[]'::jsonb, 'Unknown Bank', 'Express', '0000000000', '000000', '', 0.5, 'Express', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Express', '', '', 'Unknown', '', '', 'South Africa', -34.0494469, 24.9218178, NULL, '[]'::jsonb, 'Unknown Bank', 'Express', '0000000000', '000000', '', 0.5, 'Express', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', 'Rink Street', '', 'Gqeberha', '', '', 'South Africa', -33.9641475, 25.611296, NULL, '[]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', 'Discovery', '', 'George', '', '', 'South Africa', -33.9938136, 22.4429045, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Global', 'Norongo Street', '', 'iBhayi', '', '', 'South Africa', -33.8908164, 25.588273, NULL, '[]'::jsonb, 'Unknown Bank', 'Global', '0000000000', '000000', '', 0.5, 'Global Oil', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', 'Rose De La Rey Street', '', 'Unknown', '', '', 'South Africa', -33.7624713, 25.392848, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Quest', 'Main Street', '', 'Unknown', '', '', 'South Africa', -33.8007812, 25.4726394, NULL, '[]'::jsonb, 'Unknown Bank', 'Quest', '0000000000', '000000', '', 0.5, 'Quest', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', 'Algoa Road', '', 'Unknown', '', '', 'South Africa', -33.7837915, 25.4203349, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TopUp', 'Main Street', '', 'Unknown', '', '', 'South Africa', -33.7990281, 25.4663916, NULL, '[]'::jsonb, 'Unknown Bank', 'TopUp', '0000000000', '000000', '', 0.5, 'TopUp', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Quest', 'Graaff Reinet Road', '', 'Unknown', '', '', 'South Africa', -33.7515818, 25.4137113, NULL, '[]'::jsonb, 'Unknown Bank', 'Quest', '0000000000', '000000', '', 0.5, 'Quest', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Port Elizabeth', '', '', 'South Africa', -33.9711763, 25.6328971, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 585 6094","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Daniel''s Service Station', '', '', 'Unknown', '', '', 'South Africa', -33.7532732, 25.4043243, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 992 1770","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Daniel''s Service Station', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'Unknown', '', '', 'South Africa', -33.2141317, 22.0284192, NULL, '[]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Merino Motors', '', '', 'Unknown', '', '', 'South Africa', -30.2603086, 25.272438, NULL, '[]'::jsonb, 'Unknown Bank', 'Merino Motors', '0000000000', '000000', '', 0.5, 'Independent', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Scotts Caltex Garage', 'Grey Street', '', 'Tarkastad', '', '5370', 'South Africa', -32.0083698, 26.2628846, NULL, '[]'::jsonb, 'Unknown Bank', 'Scotts Caltex Garage', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'CBV Filling Station', '', '', 'Unknown', '', '', 'South Africa', -32.5813955, 25.1358723, NULL, '[]'::jsonb, 'Unknown Bank', 'CBV Filling Station', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', '', '', 'Unknown', '', '', 'South Africa', -32.7485533, 25.806681, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;