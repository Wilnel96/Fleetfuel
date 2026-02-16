INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '8 Old Transkei Road', '', 'Unknown', 'Eastern Cape', '5241', 'South Africa', -32.9916742, 27.9196538, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 735 1580","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '136 Settlers Way', '', 'East London', '', '5201', 'South Africa', -33.0318, 27.8842, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 731 2030","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Kempston Fuel', '', '', 'Unknown', '', '', 'South Africa', -32.9833103, 27.9200592, NULL, '[]'::jsonb, 'Unknown Bank', 'Kempston Fuel', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'East London', '', '', 'South Africa', -32.966504, 27.9384425, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 748 3671","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Beaconhurst', 'Eastern Cape', '', 'South Africa', -32.9607549, 27.934673, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 748 2310","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', 'Settlers Way', '', 'East London', '', '', 'South Africa', -33.0354424, 27.8669095, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 736 3402","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', 'Morris Road', '', 'East London', 'Eastern Cape', '5241', 'South Africa', -32.9623314, 27.9185729, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 726 8182","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', 'Uitenhage Road', '', 'Port Elizabeth', '', '', 'South Africa', -33.9067266, 25.575459, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 452 2619","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Gqeberha', 'Eastern Cape', '', 'South Africa', -33.8835215, 25.5700284, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 452 6854","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Vukani Petroleum', '', '', 'Unknown', '', '', 'South Africa', -32.9516195, 27.918693, NULL, '[]'::jsonb, 'Unknown Bank', 'Vukani Petroleum', '0000000000', '000000', '', 0.5, 'Vukani Petroleum', '{"Diesel"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', '', '', 'Unknown', '', '', 'South Africa', -32.3557352, 22.5833002, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '792 MC Nab Drive', '', 'Alice', '', '', 'South Africa', -32.7902797, 26.8335331, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 40 653 1700","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'OVK', '', '', 'Unknown', '', '', 'South Africa', -30.212878, 26.5324153, NULL, '[]'::jsonb, 'Unknown Bank', 'OVK', '0000000000', '000000', '', 0.5, 'OVK', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Quest', '', '', 'Unknown', '', '', 'South Africa', -33.4378791, 25.9646063, NULL, '[]'::jsonb, 'Unknown Bank', 'Quest', '0000000000', '000000', '', 0.5, 'Quest', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', 'Douglas Smith Highway', '', 'East London', '', '', 'South Africa', -33.0075309, 27.8830132, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'East London', 'Eastern Cape', '', 'South Africa', -33.0128371, 27.8822628, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 860 300 860","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'East London', 'Eastern Cape', '', 'South Africa', -33.0072173, 27.8844274, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 849 8915","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '30 Maclean Street', '', 'Stutterheim', '', '', 'South Africa', -32.5675154, 27.4292674, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 683 1308","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', 'Koyana Street', '', 'Ibhayi', '', '', 'South Africa', -33.866201, 25.560064, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 464 2917","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'Bizana', '', '4800', 'South Africa', -30.8611889, 29.8524656, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 39 251 0010","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sasol', '', '', 'Lusikisiki', 'Eastern Cape', '4820', 'South Africa', -31.3590795, 29.5580925, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 81 263 0672","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Sasol', '0000000000', '000000', '', 0.5, 'Sasol', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '1 Main Street', '', 'Mount Frere', '', '5090', 'South Africa', -30.9092859, 28.9916777, NULL, '[]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '339 Main Street', '', 'Mount Frere', '', '', 'South Africa', -30.9001367, 28.9944909, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 39 255 0534","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Exel', '', '', 'Unknown', '', '', 'South Africa', -30.8947458, 28.9970046, NULL, '[]'::jsonb, 'Unknown Bank', 'Exel', '0000000000', '000000', '', 0.5, 'Exel', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '1 Nolangeni Street', '', 'Mount Ayliff', '', '', 'South Africa', -30.7980612, 29.3664863, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 39 254 0615","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', '', '', 'Unknown', '', '', 'South Africa', -32.1637222, 25.6055882, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '9 Breezyvale Road', '', 'East London', '', '', 'South Africa', -33.038743, 27.833111, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 736 3533","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP Avontuur', '', '', 'Unknown', '', '', 'South Africa', -33.7286866, 23.1691363, NULL, '[]'::jsonb, 'Unknown Bank', 'BP Avontuur', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Unknown', '', '', 'South Africa', -33.9467185, 23.4861715, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Unknown', '', '', 'South Africa', -33.9710069, 22.4475076, NULL, '[]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'Unknown', '', '', 'South Africa', -34.0025872, 22.3823563, NULL, '[]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', 'Onverwacht Crescent', '', 'Oudtshoorn', '', '', 'South Africa', -33.6131697, 22.2146961, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 44 272 7391","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP Settlers Way', '', '', 'Unknown', '', '', 'South Africa', -33.0318545, 27.8850243, NULL, '[]'::jsonb, 'Unknown Bank', 'BP Settlers Way', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '', '', 'Peddie', '', '', 'South Africa', -33.1956196, 27.1194528, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 40 673 3547","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Quest', '', '', 'Unknown', '', '', 'South Africa', -31.4026221, 23.1172348, NULL, '[]'::jsonb, 'Unknown Bank', 'Quest', '0000000000', '000000', '', 0.5, 'Quest', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '635 Main Street', '', 'Tsolo', '', '', 'South Africa', -31.3097013, 28.756689, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 47 542 0083","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', '78 Queen Street', '', 'Unknown', 'Eastern Cape', '5247', 'South Africa', -32.9749079, 27.8899158, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 726 3210","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '18 Pearce Street', '', 'East London', 'Eastern Cape', '5201', 'South Africa', -32.9930142, 27.9113198, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 726 2095","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'East London', 'Eastern Cape', '', 'South Africa', -32.93451, 27.992552, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 732 1155","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Astron Energy', '', '', 'Gqeberha', 'Eastern Cape', '', 'South Africa', -33.9476257, 25.5563847, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 41 364 1075","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Astron Energy', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Meisie''s Halt', '', '', 'Unknown', '', '', 'South Africa', -32.9358004, 27.9532381, NULL, '[]'::jsonb, 'Unknown Bank', 'Meisie''s Halt', '0000000000', '000000', '', 0.5, 'None', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '10 Gately Street', '', 'East London', 'Eastern Cape', '5205', 'South Africa', -32.995875, 27.9030621, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 742 0607","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '22 Queen Street', '', 'East London', 'Eastern Cape', '5201', 'South Africa', -32.9745789, 27.8936708, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 726 0770","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Berlin Garage', '', '', 'Unknown', '', '', 'South Africa', -32.8838321, 27.5788404, NULL, '[]'::jsonb, 'Unknown Bank', 'Berlin Garage', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'BP', '', '', 'East London', 'Eastern Cape', '5200', 'South Africa', -33.0126172, 27.9015523, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 722 7563","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'BP', '0000000000', '000000', '', 0.5, 'BP', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Buffalo Pass Motors', '', '', 'East London', 'Eastern Cape', '', 'South Africa', -32.9975463, 27.8474307, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 741 1205","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Buffalo Pass Motors', '0000000000', '000000', '', 0.5, 'Astron Energy', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Caltex', '', '', 'Unknown', '', '', 'South Africa', -32.9744946, 27.894345, NULL, '[]'::jsonb, 'Unknown Bank', 'Caltex', '0000000000', '000000', '', 0.5, 'Caltex', '{"Diesel","Petrol (93 ULP)","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engen', '2 Devereux Avenue', '', 'East London', '', '', 'South Africa', -32.9841225, 27.8995457, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 726 3383","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Engen', '0000000000', '000000', '', 0.5, 'Engen', '{"Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'TotalEnergies', '', '', 'East London', '', '5247', 'South Africa', -32.9841132, 27.9005553, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 726 3324","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'TotalEnergies', '0000000000', '000000', '', 0.5, 'Total Energies', '{"Diesel","Petrol (95 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', 'Main Road', '', 'Unknown', 'Eastern Cape', '5252', 'South Africa', -32.9958447, 27.8721767, NULL, '[{"name":"Manager","surname":"","email":"","phone":"+27 43 741 1310","mobile_phone":"","is_primary":true}]'::jsonb, 'Unknown Bank', 'Shell', '0000000000', '000000', '', 0.5, 'Shell', '{"Diesel","Petrol (95 ULP)","Petrol (98 ULP)"}'::text[], '{}'::jsonb, '', '{}'::jsonb, 'active')
ON CONFLICT DO NOTHING;