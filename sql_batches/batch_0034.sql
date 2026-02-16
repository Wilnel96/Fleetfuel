INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Unknown', '', '', 'South Africa', -27.1097591, 31.1860463, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'MBT', '', '', 'Unknown', '', '', 'South Africa', -25.4171702, 30.10834, NULL, '[]'::jsonb, 'Unknown Bank', 'MBT', '0000000000', '000000', '', 0.5, 'MBT', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Puma', '', '', 'Unknown', '', '', 'South Africa', -25.4241708, 30.0994698, NULL, '[]'::jsonb, 'Unknown Bank', 'Puma', '0000000000', '000000', '', 0.5, 'Puma Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Randburg', '', '2188', 'South Africa', -26.0783133, 27.9458474, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 791 2106","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Randburg', '', '', 'South Africa', -26.159707, 27.977987, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 477 1020","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Randburg', '', '', 'South Africa', -26.1202924, 27.9582192, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 678 0441","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'Randburg', 'Gauteng', '2194', 'South Africa', -26.1150182, 27.9525742, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 476 2838","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '884 Cascades Road', '', 'Roodepoort', 'Gauteng', '1724', 'South Africa', -26.1223208, 27.8999713, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 475 5007","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '3 Blueberry Street', '', 'Unknown', 'Gauteng', '2040', 'South Africa', -26.0816374, 27.9271213, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 794 1620","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Johannesburg', 'Gauteng', '2040', 'South Africa', -26.0732464, 27.9400754, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 82 785 0854","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Roodepoort', '', '1709', 'South Africa', -26.1046269, 27.9262395, NULL, '[]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Roodepoort', 'Gauteng', '', 'South Africa', -26.1434138, 27.9248279, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 10 746 0225","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'Weltervredenpark', 'Gauteng', '1715', 'South Africa', -26.126132, 27.9311433, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 475 1333","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Roodepoort', '', '1724', 'South Africa', -26.1358723, 27.8587893, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 768 0918","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Hartbeespoort', '', '0216', 'South Africa', -25.7762861, 27.8576213, NULL, '[]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Randburg', 'Gauteng', '', 'South Africa', -26.151368, 27.9407507, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 476 5201","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Puma Filling Station', '', '', 'Unknown', '', '', 'South Africa', -24.6410341, 25.8803163, NULL, '[]'::jsonb, 'Unknown Bank', 'Puma Filling Station', '0000000000', '000000', '', 0.5, 'Puma Energy', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total', '', '', 'Unknown', '', '', 'South Africa', -24.6241488, 25.9359011, NULL, '[]'::jsonb, 'Unknown Bank', 'Total', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sebele Centre Shell', '', '', 'Unknown', '', '', 'South Africa', -24.6056717, 25.9330265, NULL, '[]'::jsonb, 'Unknown Bank', 'Sebele Centre Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Roodepoort', 'Gauteng', '', 'South Africa', -26.0614243, 27.9017107, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 860 300 860","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'Kya Sands', 'Gauteng', '2001', 'South Africa', -26.02711, 27.94972, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 708 2344","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Randburg', '', '', 'South Africa', -26.0995979, 27.9409616, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 792 7586","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'AB FILLING STATION(PUMA)', '', '', 'Unknown', '', '', 'South Africa', -24.9846116, 25.3447313, NULL, '[]'::jsonb, 'Unknown Bank', 'AB FILLING STATION(PUMA)', '0000000000', '000000', '', 0.5, 'Puma Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Unknown', '', '', 'South Africa', -26.1842005, 27.9420736, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'Northcliff', 'Gauteng', '2195', 'South Africa', -26.1454052, 27.9533181, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 476 1653","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Pegasus', '', '', 'Unknown', '', '', 'South Africa', -25.79397, 27.76383, NULL, '[]'::jsonb, 'Unknown Bank', 'Pegasus', '0000000000', '000000', '', 0.5, 'Pegasus', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Unknown', '', '', 'South Africa', -25.898968, 27.8887324, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', 'N14', '', 'Lanseria', '', '1739', 'South Africa', -25.9582, 27.95067, NULL, '[]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', 'N14', '', 'Lanseria', '', '1739', 'South Africa', -25.96091, 27.9518365, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 460 0395","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Exel', '', '', 'Unknown', '', '', 'South Africa', -25.79791, 27.88162, NULL, '[]'::jsonb, 'Unknown Bank', 'Exel', '0000000000', '000000', '', 0.5, 'Exel', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Hekpoort Garage (Total)', '', '', 'Unknown', '', '', 'South Africa', -25.8935906, 27.6020897, NULL, '[]'::jsonb, 'Unknown Bank', 'Hekpoort Garage (Total)', '0000000000', '000000', '', 0.5, 'Oostermoed Beleggings', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Hartbeespoort', '', '', 'South Africa', -25.725972, 27.830276, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 12 253 0953","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Lanseria', '', '1739', 'South Africa', -25.9752236, 27.9236664, NULL, '[]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Lichtenburg', '', '2740', 'South Africa', -26.1511253, 26.1756879, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 18 632 0352","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', 'Market Street', '', 'Vryburg', '', '', 'South Africa', -26.9584497, 24.7326179, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP Express Linden', '', '', 'Unknown', '', '', 'South Africa', -26.1264155, 27.9959819, NULL, '[]'::jsonb, 'Unknown Bank', 'BP Express Linden', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total', '', '', 'Unknown', '', '', 'South Africa', -24.6266724, 25.9253401, NULL, '[]'::jsonb, 'Unknown Bank', 'Total', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Mooinooi', '', '0325', 'South Africa', -25.753086, 27.5574422, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 14 574 3129","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', 'Klipspruit Valley Road', '', 'Lenasia', '', '1827', 'South Africa', -26.3419732, 27.8554771, NULL, '[]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Unknown', '', '', 'South Africa', -25.6652208, 27.24238, NULL, '[]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Unknown', '', '', 'South Africa', -25.5773805, 27.1573059, NULL, '[]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', '', '', 'Unknown', '', '', 'South Africa', -25.6099384, 27.1759239, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Roodepoort', 'Gauteng', '1724', 'South Africa', -26.1084708, 27.8559206, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 768 4334","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)","LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Krugersdorp', '', '1739', 'South Africa', -26.092659, 27.8264832, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 954 5543","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Krugersdorp', 'Gauteng', '1739', 'South Africa', -26.0618894, 27.8312763, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 662 1303","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)","LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', 'N14', '', 'Muldersdrift', '', '', 'South Africa', -26.0353791, 27.7381521, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 956 6408","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', 'Soweto Highway', '', 'Unknown', '', '', 'South Africa', -26.2330574, 27.9502461, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Roodepoort', '', '', 'South Africa', -26.1647511, 27.9436716, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 11 673 2064","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', '', '', 'Unknown', '', '', 'South Africa', -25.7285351, 27.8842124, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Hartbeespoort', 'North West', '0260', 'South Africa', -25.7438226, 27.8998985, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 12 259 0023","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)","LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;