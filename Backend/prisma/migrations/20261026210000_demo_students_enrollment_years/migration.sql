-- Spread existing demo students across enrollment years (created_at)
UPDATE students SET created_at = '2023-02-14 10:00:00+00', updated_at = NOW()
WHERE id IN (
  'f0000000-0000-4000-8000-000000000001',
  'f0000000-0000-4000-8000-000000000002',
  'f0000000-0000-4000-8000-000000000005',
  'f0000000-0000-4000-8000-000000000012',
  'f0000000-0000-4000-8000-000000000015'
);

UPDATE students SET created_at = '2024-03-08 10:00:00+00', updated_at = NOW()
WHERE id IN (
  'f0000000-0000-4000-8000-000000000003',
  'f0000000-0000-4000-8000-000000000006',
  'f0000000-0000-4000-8000-000000000009',
  'f0000000-0000-4000-8000-000000000013',
  'f0000000-0000-4000-8000-000000000016',
  'f0000000-0000-4000-8000-000000000018'
);

UPDATE students SET created_at = '2025-01-22 10:00:00+00', updated_at = NOW()
WHERE id IN (
  'f0000000-0000-4000-8000-000000000004',
  'f0000000-0000-4000-8000-000000000007',
  'f0000000-0000-4000-8000-000000000010',
  'f0000000-0000-4000-8000-000000000014',
  'f0000000-0000-4000-8000-000000000017',
  'f0000000-0000-4000-8000-000000000019',
  'f0000000-0000-4000-8000-000000000021'
);

UPDATE students SET created_at = '2026-02-05 10:00:00+00', updated_at = NOW()
WHERE id IN (
  'f0000000-0000-4000-8000-000000000008',
  'f0000000-0000-4000-8000-000000000011',
  'f0000000-0000-4000-8000-000000000020',
  'f0000000-0000-4000-8000-000000000022',
  'f0000000-0000-4000-8000-000000000023',
  'f0000000-0000-4000-8000-000000000024'
);

-- Extra students for denser charts (Cape Horizon + Harbour)
INSERT INTO students (
  id, phone, address, city, state, zip, country, foreign_national, passport_number, id_number,
  date_of_birth, gender, nationality, site_id, verification_status, is_deleted, created_at, updated_at, user_id
) VALUES
-- Cape Horizon Main 2023–2026
('f0000000-0000-4000-8000-000000000025', '+27 71 200 0025', '55 Observatory Rd', 'Cape Town', 'Western Cape', '7925', 'South Africa', false, NULL, '0504145800082', '2005-04-14', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'VERIFIED', false, '2023-03-01 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000026', '+27 71 200 0026', '12 Liesbeek Ave', 'Cape Town', 'Western Cape', '7700', 'South Africa', false, NULL, '0408225800084', '2004-08-22', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'VERIFIED', false, '2023-06-15 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000027', '+27 71 200 0027', '8 Woolsack Dr', 'Cape Town', 'Western Cape', '7700', 'South Africa', false, NULL, '0601094800086', '2006-01-09', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'PENDING', false, '2024-02-12 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000028', '+27 71 200 0028', '19 Rosebank Lane', 'Cape Town', 'Western Cape', '7700', 'South Africa', false, NULL, '0507185800088', '2005-07-18', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'VERIFIED', false, '2024-08-20 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000029', '+27 71 200 0029', '3 Mowbray Close', 'Cape Town', 'Western Cape', '7700', 'South Africa', true, 'E77889900', NULL, '2005-11-30', 'FEMALE', 'Namibian', 'b0000000-0000-4000-8000-000000000001', 'VERIFIED', false, '2025-03-04 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-00000000002a', '+27 71 200 0030', '41 Campus Gate', 'Cape Town', 'Western Cape', '7700', 'South Africa', false, NULL, '0412054800080', '2004-12-05', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'VERIFIED', false, '2025-07-11 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-00000000002b', '+27 71 200 0031', '16 Rhodes Ave', 'Cape Town', 'Western Cape', '7700', 'South Africa', false, NULL, '0604285800082', '2006-04-28', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'PENDING', false, '2026-01-19 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-00000000002c', '+27 71 200 0032', '70 University Ave', 'Cape Town', 'Western Cape', '7700', 'South Africa', false, NULL, '0509024800084', '2005-09-02', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'VERIFIED', false, '2026-03-02 09:00:00+00', NOW(), NULL),

-- Cape Horizon City
('f0000000-0000-4000-8000-00000000002d', '+27 71 200 0033', '101 Strand St', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0305165800086', '2003-05-16', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'VERIFIED', false, '2023-04-10 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-00000000002e', '+27 71 200 0034', '55 Wale St', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0411304800088', '2004-11-30', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'VERIFIED', false, '2024-01-18 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-00000000002f', '+27 71 200 0035', '9 Castle St', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0506245800080', '2005-06-24', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'PENDING', false, '2024-09-05 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000030', '+27 71 200 0036', '22 Loop St', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0603154800082', '2006-03-15', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'VERIFIED', false, '2025-02-20 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000031', '+27 71 200 0037', '8 Buitengracht', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0410085800084', '2004-10-08', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'VERIFIED', false, '2025-08-14 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000032', '+27 71 200 0038', '33 Shortmarket', 'Cape Town', 'Western Cape', '8001', 'South Africa', true, 'F99001122', NULL, '2005-12-01', 'MALE', 'Malawian', 'b0000000-0000-4000-8000-000000000002', 'VERIFIED', false, '2026-01-26 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000033', '+27 71 200 0039', '14 Waterkant', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0505114800086', '2005-05-11', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'PENDING', false, '2026-04-08 09:00:00+00', NOW(), NULL),

-- Cape Horizon Atlantic
('f0000000-0000-4000-8000-000000000034', '+27 71 200 0040', '2 Sea Point Rd', 'Cape Town', 'Western Cape', '8005', 'South Africa', false, NULL, '0402195800088', '2004-02-19', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000003', 'VERIFIED', false, '2023-05-22 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000035', '+27 71 200 0041', '18 Beach Rd', 'Cape Town', 'Western Cape', '8005', 'South Africa', false, NULL, '0507074800080', '2005-07-07', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000003', 'VERIFIED', false, '2024-04-03 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000036', '+27 71 200 0042', '6 Hospital Bend', 'Cape Town', 'Western Cape', '8005', 'South Africa', false, NULL, '0601215800082', '2006-01-21', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000003', 'PENDING', false, '2025-01-15 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000037', '+27 71 200 0043', '29 Victoria Rd', 'Cape Town', 'Western Cape', '8005', 'South Africa', false, NULL, '0410164800084', '2004-10-16', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000003', 'VERIFIED', false, '2025-09-09 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000038', '+27 71 200 0044', '11 Fresnaye Ave', 'Cape Town', 'Western Cape', '8005', 'South Africa', false, NULL, '0508305800086', '2005-08-30', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000003', 'VERIFIED', false, '2026-02-11 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000039', '+27 71 200 0045', '44 Bantry Bay', 'Cape Town', 'Western Cape', '8005', 'South Africa', false, NULL, '0605034800088', '2006-05-03', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000003', 'PENDING', false, '2026-05-01 09:00:00+00', NOW(), NULL),

-- Harbour Dockside
('f0000000-0000-4000-8000-00000000003a', '+27 71 200 0046', '3 Quay Walk', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0309125800080', '2003-09-12', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000004', 'VERIFIED', false, '2023-02-28 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-00000000003b', '+27 71 200 0047', '17 Jetty St', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0502284800082', '2005-02-28', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000004', 'VERIFIED', false, '2024-03-19 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-00000000003c', '+27 71 200 0048', '9 Harbour View', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0412125800084', '2004-12-12', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000004', 'PENDING', false, '2024-10-07 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-00000000003d', '+27 71 200 0049', '55 Dock Rd', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0606064800086', '2006-06-06', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000004', 'VERIFIED', false, '2025-04-22 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-00000000003e', '+27 71 200 0050', '21 Portside', 'Cape Town', 'Western Cape', '8001', 'South Africa', true, 'G33445566', NULL, '2005-03-17', 'MALE', 'Mozambican', 'b0000000-0000-4000-8000-000000000004', 'VERIFIED', false, '2025-11-03 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-00000000003f', '+27 71 200 0051', '8 Crane Lane', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0404015800088', '2004-04-01', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000004', 'PENDING', false, '2026-02-02 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000040', '+27 71 200 0052', '36 Berth Ave', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0509194800080', '2005-09-19', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000004', 'VERIFIED', false, '2026-04-15 09:00:00+00', NOW(), NULL),

-- Harbour Industrial
('f0000000-0000-4000-8000-000000000041', '+27 71 200 0053', '4 Factory Gate', 'Bellville', 'Western Cape', '7530', 'South Africa', false, NULL, '0308085800082', '2003-08-08', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000005', 'VERIFIED', false, '2023-03-20 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000042', '+27 71 200 0054', '15 Workshop Rd', 'Bellville', 'Western Cape', '7530', 'South Africa', false, NULL, '0501014800084', '2005-01-01', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000005', 'VERIFIED', false, '2024-05-14 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000043', '+27 71 200 0055', '28 Industrial Way', 'Bellville', 'Western Cape', '7530', 'South Africa', false, NULL, '0410105800086', '2004-10-10', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000005', 'PENDING', false, '2024-11-25 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000044', '+27 71 200 0056', '7 Forge Close', 'Bellville', 'Western Cape', '7530', 'South Africa', false, NULL, '0602224800088', '2006-02-22', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000005', 'VERIFIED', false, '2025-06-18 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000045', '+27 71 200 0057', '42 Mill St', 'Bellville', 'Western Cape', '7530', 'South Africa', false, NULL, '0505055800080', '2005-05-05', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000005', 'VERIFIED', false, '2025-10-28 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000046', '+27 71 200 0058', '11 Lathe Ave', 'Bellville', 'Western Cape', '7530', 'South Africa', false, NULL, '0412124800082', '2004-12-12', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000005', 'PENDING', false, '2026-01-28 09:00:00+00', NOW(), NULL),
('f0000000-0000-4000-8000-000000000047', '+27 71 200 0059', '19 Weld Rd', 'Bellville', 'Western Cape', '7530', 'South Africa', false, NULL, '0608085800084', '2006-08-08', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000005', 'VERIFIED', false, '2026-03-20 09:00:00+00', NOW(), NULL)
ON CONFLICT (id) DO NOTHING;
