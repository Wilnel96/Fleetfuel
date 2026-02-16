INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'No.1 filling station', '', '', 'Unknown', '', '', 'South Africa', -26.3036272, 29.9857771, NULL, '[]'::jsonb, 'Unknown Bank', 'No.1 filling station', '0000000000', '000000', '', 0.5, 'Exel', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Unknown', '', '', 'South Africa', -26.3033052, 29.9855198, NULL, '[]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', 'Stevenson Street', '', 'Witbank', '', '1039', 'South Africa', -25.9000092, 29.2305989, NULL, '[]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'Machadodorp', 'Mpumalanga', '1170', 'South Africa', -25.6675625, 30.2450417, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 13 256 0050","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Hazyview', 'Mpumalanga', '1242', 'South Africa', -25.0620895, 31.1289954, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 13 737 7262","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (93 ULP)","LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Unknown', '', '', 'South Africa', -27.0331763, 28.6042829, NULL, '[]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '6 Chief Mgiyeni Khumalo Drive', '', 'White River', '', '', 'South Africa', -25.330763, 31.0137464, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 13 750 1811","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Piet Retief', 'Mpumalanga', '2380', 'South Africa', -26.9919863, 30.7979375, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 17 826 2941","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (95 ULP)","LPG"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '37 Tom Lawrence Street', '', 'White River', '', '', 'South Africa', -25.3258889, 31.0195639, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 13 751 1569","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Unknown', '', '', 'South Africa', -25.5151731, 28.528086, NULL, '[]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'shell', '', '', 'Unknown', '', '', 'South Africa', -25.514217, 28.5269989, NULL, '[]'::jsonb, 'Unknown Bank', 'shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'Unknown', '', '', 'South Africa', -24.5954034, 31.0622063, NULL, '[]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'White River', '', '', 'South Africa', -25.3243651, 31.0060399, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 13 750 1331","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', 'R40', '', 'Hazyview', '', '1242', 'South Africa', -25.0399676, 31.126724, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 13 737 7981","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Viva', '', '', 'Unknown', '', '', 'South Africa', -25.0884677, 31.0765794, NULL, '[]'::jsonb, 'Unknown Bank', 'Viva', '0000000000', '000000', '', 0.5, 'Viva', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Emalahleni', 'Mpumalanga', '1034', 'South Africa', -25.865078, 29.2196506, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 82 581 4871","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Unknown', '', '', 'South Africa', -26.3772446, 28.9277189, NULL, '[]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Galp', '', '', 'Unknown', '', '', 'South Africa', -26.6581779, 31.415494, NULL, '[]'::jsonb, 'Unknown Bank', 'Galp', '0000000000', '000000', '', 0.5, 'Galp', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Galp', '', '', 'Unknown', '', '', 'South Africa', -27.1136252, 31.1992461, NULL, '[]'::jsonb, 'Unknown Bank', 'Galp', '0000000000', '000000', '', 0.5, 'Galp', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Puma', '', '', 'Unknown', '', '', 'South Africa', -26.2126416, 30.9920191, NULL, '[]'::jsonb, 'Unknown Bank', 'Puma', '0000000000', '000000', '', 0.5, 'Puma Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Galp', '', '', 'Unknown', '', '', 'South Africa', -26.213369, 30.9921799, NULL, '[]'::jsonb, 'Unknown Bank', 'Galp', '0000000000', '000000', '', 0.5, 'Galp', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '17 Church Street', '', 'Piet Retief', '', '', 'South Africa', -27.002297, 30.8025668, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 17 826 5181","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', 'Church Street', '', 'Piet Retief', '', '2380', 'South Africa', -27.0087815, 30.8041866, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 17 826 2314","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total', '', '', 'Unknown', '', '', 'South Africa', -26.0626355, 28.8154512, NULL, '[]'::jsonb, 'Unknown Bank', 'Total', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '', '', 'Unknown', '', '', 'South Africa', -25.677765, 31.5099555, NULL, '[]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '26 Krogh Street', '', 'STANDERTON', 'Mpumalanga', '2430', 'South Africa', -26.9487301, 29.2368115, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 17 712 2911","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '110 Vermooten Street', '', 'Unknown', 'Mpumalanga', '1100', 'South Africa', -25.6956065, 30.0429036, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 13 253 1221","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Puma', '', '', 'Unknown', '', '', 'South Africa', -25.6923426, 30.0424212, NULL, '[]'::jsonb, 'Unknown Bank', 'Puma', '0000000000', '000000', '', 0.5, 'Puma Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '18 De Clerq Street', '', 'Lydenburg', '', '', 'South Africa', -25.0905371, 30.4490594, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 13 235 1303","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Galp', '', '', 'Unknown', '', '', 'South Africa', -26.2991789, 31.1338944, NULL, '[]'::jsonb, 'Unknown Bank', 'Galp', '0000000000', '000000', '', 0.5, 'Galp', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Puma', '', '', 'Unknown', '', '', 'South Africa', -25.1686177, 29.3932611, NULL, '[]'::jsonb, 'Unknown Bank', 'Puma', '0000000000', '000000', '', 0.5, 'Puma Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Tinkers Filling Station', '', '', 'Unknown', '', '', 'South Africa', -26.4975903, 31.3721385, NULL, '[]'::jsonb, 'Unknown Bank', 'Tinkers Filling Station', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Puma', '', '', 'Unknown', '', '', 'South Africa', -26.4896792, 31.4136423, NULL, '[]'::jsonb, 'Unknown Bank', 'Puma', '0000000000', '000000', '', 0.5, 'Puma Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total Energies Moneni Filling Station', '', '', 'Unknown', '', '', 'South Africa', -26.4940194, 31.400596, NULL, '[]'::jsonb, 'Unknown Bank', 'Total Energies Moneni Filling Station', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Galp petrol station', 'MR3', '', 'Unknown', '', '', 'South Africa', -26.4883902, 31.4551678, NULL, '[]'::jsonb, 'Unknown Bank', 'Galp petrol station', '0000000000', '000000', '', 0.5, 'GALP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Carolina', '', '1185', 'South Africa', -26.068386, 30.1135111, NULL, '[]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Puma', '', '', 'Unknown', '', '', 'South Africa', -26.0709345, 30.1190941, NULL, '[]'::jsonb, 'Unknown Bank', 'Puma', '0000000000', '000000', '', 0.5, 'Puma Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Puma', '', '', 'Unknown', '', '', 'South Africa', -26.5305732, 31.1885809, NULL, '[]'::jsonb, 'Unknown Bank', 'Puma', '0000000000', '000000', '', 0.5, 'Puma Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Exel', '', '', 'Unknown', '', '', 'South Africa', -26.5573376, 31.1798581, NULL, '[]'::jsonb, 'Unknown Bank', 'Exel', '0000000000', '000000', '', 0.5, 'Exel', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Evander', 'Mpumalanga', '2280', 'South Africa', -26.429521, 29.0931527, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 10 591 2057","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Lüneburg Cash Store', '', '', 'Unknown', '', '', 'South Africa', -27.329388, 30.6299741, NULL, '[]'::jsonb, 'Unknown Bank', 'Lüneburg Cash Store', '0000000000', '000000', '', 0.5, 'Lüneburg Cash Store', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '126 Bram Fischer Drive', '', 'Evander', '', '', 'South Africa', -26.4745035, 29.1111792, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 17 632 2268","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Secunda', 'Mpumalanga', '2302', 'South Africa', -26.5085986, 29.1853562, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 17 634 8080","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Secunda', 'Mpumalanga', '2302', 'South Africa', -26.5224768, 29.2052806, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 17 634 2883","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Total', '', '', 'Unknown', '', '', 'South Africa', -26.3228619, 31.1434238, NULL, '[]'::jsonb, 'Unknown Bank', 'Total', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '17 Kerk Street', '', 'Carolina', '', '', 'South Africa', -26.0688211, 30.1126086, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 17 843 1160","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Ermelo', '', '', 'South Africa', -26.5348487, 29.9896332, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 17 819 3943","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Unknown', '', '', 'South Africa', -26.3017329, 31.1205432, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Unknown', '', '', 'South Africa', -26.3283684, 31.1391269, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Galp', '', '', 'Unknown', '', '', 'South Africa', -26.3964922, 31.1734786, NULL, '[]'::jsonb, 'Unknown Bank', 'Galp', '0000000000', '000000', '', 0.5, 'Galp', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;