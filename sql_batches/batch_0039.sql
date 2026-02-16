INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '33 Nelson Mandela Drive', '', 'Unknown', 'North West', '2745', 'South Africa', -25.8621159, 25.6451783, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 18 381 5294","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Mafikeng', 'North West', '2745', 'South Africa', -25.8667059, 25.6449266, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 18 381 0956","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', 'Nelson Mandela Drive', '', 'Mahikeng', '', '', 'South Africa', -25.8527588, 25.6397072, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 18 381 3501","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Mafikeng', 'North West', '2745', 'South Africa', -25.8358786, 25.6366641, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 18 381 7224","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)","LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Zeerust', 'North West', '2864', 'South Africa', -25.5432834, 26.0859265, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 83 555 2071","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Elegant Fuel', '', '', 'Unknown', '', '', 'South Africa', -27.6905555, 23.0716708, NULL, '[]'::jsonb, 'Unknown Bank', 'Elegant Fuel', '0000000000', '000000', '', 0.5, 'Elegant Fuel', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', 'Ben Alberts Way', '', 'Kathu', '', '', 'South Africa', -27.6981378, 23.0445839, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 53 723 3267","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', '', '', 'Unknown', '', '', 'South Africa', -27.3984407, 23.4826848, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Exel', '', '', 'Unknown', '', '', 'South Africa', -25.5947927, 26.4240418, NULL, '[]'::jsonb, 'Unknown Bank', 'Exel', '0000000000', '000000', '', 0.5, 'Exel', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Exel', '', '', 'Unknown', '', '', 'South Africa', -26.3338098, 26.804144, NULL, '[]'::jsonb, 'Unknown Bank', 'Exel', '0000000000', '000000', '', 0.5, 'Exel', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Pllas Palmietfontain', '', '', 'Unknown', '', '', 'South Africa', -26.3266251, 26.892298, NULL, '[]'::jsonb, 'Unknown Bank', 'Pllas Palmietfontain', '0000000000', '000000', '', 0.5, 'Pllas Palmietfontain', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', 'Assegaai Street', '', 'Unknown', '', '', 'South Africa', -25.6450071, 27.2106443, NULL, '[]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Econo petroleum', '', '', 'Unknown', '', '', 'South Africa', -25.4359186, 27.5118698, NULL, '[]'::jsonb, 'Unknown Bank', 'Econo petroleum', '0000000000', '000000', '', 0.5, 'Econo petroleum', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'MBT', '', '', 'Unknown', '', '', 'South Africa', -25.6711971, 27.2536549, NULL, '[]'::jsonb, 'Unknown Bank', 'MBT', '0000000000', '000000', '', 0.5, 'MBT', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total', '', '', 'Unknown', '', '', 'South Africa', -25.6749578, 27.2547131, NULL, '[]'::jsonb, 'Unknown Bank', 'Total', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'refueling', '', '', 'Unknown', '', '', 'South Africa', -25.6483415, 27.266264, NULL, '[]'::jsonb, 'Unknown Bank', 'refueling', '0000000000', '000000', '', 0.5, 'refueling', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Unknown', 'Limpopo', '0370', 'South Africa', -24.9371791, 27.1542495, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 14 786 0251","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total', '', '', 'Unknown', '', '', 'South Africa', -26.6924761, 25.4575323, NULL, '[]'::jsonb, 'Unknown Bank', 'Total', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Econo Petroleum', '', '', 'Unknown', '', '', 'South Africa', -26.1770801, 26.1708734, NULL, '[]'::jsonb, 'Unknown Bank', 'Econo Petroleum', '0000000000', '000000', '', 0.5, 'Econo', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'Unknown', '', '', 'South Africa', -26.1440989, 26.1512491, NULL, '[]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Lichtenburg', '', '', 'South Africa', -26.165422, 26.1734434, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 18 632 1460","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'Lichtenburg', 'North West', '2740', 'South Africa', -26.1625165, 26.1750302, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 18 632 6291","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Truck Stop', '', '', 'Unknown', '', '', 'South Africa', -26.1679635, 26.1564283, NULL, '[]'::jsonb, 'Unknown Bank', 'Truck Stop', '0000000000', '000000', '', 0.5, 'Truck Stop', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Lichtenburg', '', '', 'South Africa', -26.1618783, 26.1540418, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 18 632 4736","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total NWK', '', '', 'Unknown', '', '', 'South Africa', -26.154173, 26.1611781, NULL, '[]'::jsonb, 'Unknown Bank', 'Total NWK', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'MK1 Diesel Depot', '', '', 'Unknown', '', '', 'South Africa', -26.0890558, 27.6707705, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 568 4484","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'MK1 Diesel Depot', '0000000000', '000000', '', 0.5, 'MK1 Diesel Depot', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen Garage', '', '', 'Unknown', '', '', 'South Africa', -27.8522538, 26.3633201, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen Garage', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex Northam', '', '', 'Unknown', '', '', 'South Africa', -24.9622386, 27.2654976, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex Northam', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Roodepoort', '', '', 'South Africa', -26.1490735, 27.9208774, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 10 210 7154","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '6568 Mooki Street', '', 'Soweto', '', '', 'South Africa', -26.227364, 27.9313314, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 82 693 6629","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen Mmopane', '', '', 'Unknown', '', '', 'South Africa', -24.587636, 25.8445822, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen Mmopane', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Unknown', '', '', 'South Africa', -24.6182478, 25.8646116, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Unknown', '', '', 'South Africa', -24.6119531, 25.8604301, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total', '', '', 'Unknown', '', '', 'South Africa', -26.4885656, 27.8675275, NULL, '[]'::jsonb, 'Unknown Bank', 'Total', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '200 Nelson Mandela Drive', '', 'Potchefstroom', '', '2531', 'South Africa', -26.7078661, 27.1195613, NULL, '[]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'Unknown', '', '', 'South Africa', -26.5913334, 27.8220914, NULL, '[]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '9 Westinghouse Boulevard', '', 'Vanderbijlpark', '', '', 'South Africa', -26.7022211, 27.8477038, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 16 931 2678","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen N12', 'Cnr Joe Slovo Road & Martin Khumo', '', 'Klerksdorp', '', '2571', 'South Africa', -26.8472556, 26.7084256, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen N12', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Voom', '', '', 'Unknown', '', '', 'South Africa', -26.3245328, 27.8267589, NULL, '[]'::jsonb, 'Unknown Bank', 'Voom', '0000000000', '000000', '', 0.5, 'Voom', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Brits', '', '', 'South Africa', -25.6158656, 27.814368, NULL, '[]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Lenasia', 'Gauteng', '1820', 'South Africa', -26.3228269, 27.8598307, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 854 1136","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Vanderbijlpark', 'Gauteng', '', 'South Africa', -26.7026193, 27.8150617, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 16 931 1438","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Hartebeespoort', 'North West', '', 'South Africa', -25.745607, 27.911275, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 12 259 1854","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Vereeniging', 'Gauteng', '', 'South Africa', -26.6585905, 27.9225572, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 16 422 2727","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Klerksdorp', 'Gauteng', '', 'South Africa', -26.9001136, 26.6084001, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 81 075 3632","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Soweto', 'Gauteng', '', 'South Africa', -26.2896036, 27.9006547, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 945 4321","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Lenasia', 'Gauteng', '', 'South Africa', -26.316387, 27.8239488, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 852 0586","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Randburg', 'Gauteng', '', 'South Africa', -26.0986424, 27.9895106, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 886 3551","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Roodepoort', 'Gauteng', '', 'South Africa', -26.1608025, 27.8621439, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 766 1109","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Vereeniging', 'Gauteng', '', 'South Africa', -26.6176044, 27.9355804, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 16 428 1181","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;