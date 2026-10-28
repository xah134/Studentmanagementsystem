-- Demo seed for Cape Horizon University and Harbour Technical College.
-- Idempotent on fixed IDs: skips rows that already exist.

-- Institutions
INSERT INTO institutions (
  id, name, logo, email, website, phone, address, city, state, country, zip,
  latitude, longitude, institution_type, description, is_deleted, created_at, updated_at
) VALUES
(
  'a0000000-0000-4000-8000-000000000001',
  'Cape Horizon University',
  'https://api.dicebear.com/9.x/initials/svg?seed=CHU&backgroundColor=0f766e&textColor=ffffff',
  'hello@capehorizon.ac.za',
  'https://www.capehorizon.ac.za',
  '+27 21 555 0100',
  '1 University Avenue',
  'Cape Town',
  'Western Cape',
  'South Africa',
  '7700',
  -33.9575,
  18.4612,
  'UNIVERSITY',
  'A multi-campus research university serving the Western Cape.',
  false,
  NOW(),
  NOW()
),
(
  'a0000000-0000-4000-8000-000000000002',
  'Harbour Technical College',
  'https://api.dicebear.com/9.x/initials/svg?seed=HTC&backgroundColor=1d4ed8&textColor=ffffff',
  'info@harbourtech.ac.za',
  'https://www.harbourtech.ac.za',
  '+27 21 555 0200',
  '88 Dock Road',
  'Cape Town',
  'Western Cape',
  'South Africa',
  '8001',
  -33.9065,
  18.4200,
  'COLLEGE',
  'Applied technology and vocational programmes.',
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Campuses (sites)
INSERT INTO sites (
  id, name, address, city, state, zip, latitude, longitude, description,
  is_deleted, created_at, updated_at, institution_id
) VALUES
('b0000000-0000-4000-8000-000000000001', 'Main Campus', '1 University Avenue', 'Cape Town', 'Western Cape', '7700', -33.9575, 18.4612, 'Primary teaching and research campus.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001'),
('b0000000-0000-4000-8000-000000000002', 'City Campus', '120 Long Street', 'Cape Town', 'Western Cape', '8001', -33.9249, 18.4241, 'Business and commerce campus in the CBD.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001'),
('b0000000-0000-4000-8000-000000000003', 'Atlantic Campus', '45 Beach Road', 'Cape Town', 'Western Cape', '8005', -33.9140, 18.3875, 'Health sciences and marine studies.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001'),
('b0000000-0000-4000-8000-000000000004', 'Dockside Campus', '88 Dock Road', 'Cape Town', 'Western Cape', '8001', -33.9065, 18.4200, 'Harbour Technical College main site.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002'),
('b0000000-0000-4000-8000-000000000005', 'Industrial Campus', '12 Factory Lane', 'Bellville', 'Western Cape', '7530', -33.9030, 18.6290, 'Engineering workshops and labs.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Faculties / departments
INSERT INTO faculties (
  id, name, code, description, is_deleted, created_at, updated_at, institution_id, site_id
) VALUES
('c0000000-0000-4000-8000-000000000001', 'Faculty of Science', 'SCI', 'Natural and computational sciences.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001'),
('c0000000-0000-4000-8000-000000000002', 'Faculty of Commerce', 'COM', 'Business, finance, and economics.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002'),
('c0000000-0000-4000-8000-000000000003', 'Faculty of Health Sciences', 'HEA', 'Clinical and public health programmes.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003'),
('c0000000-0000-4000-8000-000000000004', 'Faculty of Humanities', 'HUM', 'Arts, languages, and social sciences.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', NULL),
('c0000000-0000-4000-8000-000000000005', 'School of Engineering', 'ENG', 'Mechanical, electrical, and civil trades.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000005'),
('c0000000-0000-4000-8000-000000000006', 'School of ICT', 'ICT', 'Software and networking diplomas.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004')
ON CONFLICT (id) DO NOTHING;

-- Courses
INSERT INTO courses (
  id, name, code, description, is_deleted, created_at, updated_at, institution_id, faculty_id, site_id
) VALUES
('d0000000-0000-4000-8000-000000000001', 'BSc Computer Science', 'BSC-CS', 'Undergraduate computer science.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001'),
('d0000000-0000-4000-8000-000000000002', 'BSc Data Science', 'BSC-DS', 'Statistics and machine learning.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001'),
('d0000000-0000-4000-8000-000000000003', 'BCom Accounting', 'BCOM-ACC', 'Chartered accounting pathway.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002'),
('d0000000-0000-4000-8000-000000000004', 'BCom Marketing', 'BCOM-MKT', 'Brand and digital marketing.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002'),
('d0000000-0000-4000-8000-000000000005', 'BSc Nursing', 'BSC-NUR', 'Professional nursing qualification.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003'),
('d0000000-0000-4000-8000-000000000006', 'BA Psychology', 'BA-PSY', 'Undergraduate psychology.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004', NULL),
('d0000000-0000-4000-8000-000000000007', 'National Diploma Mechanical Engineering', 'ND-MECH', 'Workshop-based mechanical programme.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000005'),
('d0000000-0000-4000-8000-000000000008', 'National Diploma Information Technology', 'ND-IT', 'Software development diploma.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000004'),
('d0000000-0000-4000-8000-000000000009', 'BSc Environmental Science', 'BSC-ENV', 'Ecology and sustainability.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003'),
('d0000000-0000-4000-8000-000000000010', 'Higher Certificate in Business', 'HC-BUS', 'Entry-level commerce certificate.', false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000004')
ON CONFLICT (id) DO NOTHING;

-- Modules (requires modules table from earlier migration)
INSERT INTO modules (
  id, name, code, description, credits, is_deleted, created_at, updated_at, institution_id, course_id
) VALUES
('e0000000-0000-4000-8000-000000000001', 'Introduction to Programming', 'CS101', 'Python and problem solving.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001'),
('e0000000-0000-4000-8000-000000000002', 'Discrete Mathematics', 'CS102', 'Logic, sets, and graphs.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001'),
('e0000000-0000-4000-8000-000000000003', 'Data Structures', 'CS201', 'Lists, trees, and hashing.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001'),
('e0000000-0000-4000-8000-000000000004', 'Databases', 'CS220', 'Relational modelling and SQL.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001'),
('e0000000-0000-4000-8000-000000000005', 'Statistical Inference', 'DS110', 'Estimation and hypothesis testing.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002'),
('e0000000-0000-4000-8000-000000000006', 'Machine Learning I', 'DS210', 'Supervised learning foundations.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002'),
('e0000000-0000-4000-8000-000000000007', 'Financial Accounting I', 'ACC101', 'Introductory financial accounting.', 18, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000003'),
('e0000000-0000-4000-8000-000000000008', 'Management Accounting', 'ACC201', 'Costing and budgeting.', 18, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000003'),
('e0000000-0000-4000-8000-000000000009', 'Consumer Behaviour', 'MKT120', 'Buyer psychology and research.', 12, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000004'),
('e0000000-0000-4000-8000-000000000010', 'Digital Marketing', 'MKT220', 'Campaigns and analytics.', 12, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000004'),
('e0000000-0000-4000-8000-000000000011', 'Fundamentals of Nursing', 'NUR100', 'Clinical fundamentals.', 20, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000005'),
('e0000000-0000-4000-8000-000000000012', 'Community Health', 'NUR210', 'Public health nursing.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000005'),
('e0000000-0000-4000-8000-000000000013', 'Introduction to Psychology', 'PSY101', 'Core psychological theories.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000006'),
('e0000000-0000-4000-8000-000000000014', 'Developmental Psychology', 'PSY201', 'Lifespan development.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000006'),
('e0000000-0000-4000-8000-000000000015', 'Engineering Drawing', 'MECH110', 'CAD and technical drawing.', 12, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000007'),
('e0000000-0000-4000-8000-000000000016', 'Workshop Practice', 'MECH120', 'Machining and safety.', 12, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000007'),
('e0000000-0000-4000-8000-000000000017', 'Web Development', 'IT110', 'HTML, CSS, and JavaScript.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000008'),
('e0000000-0000-4000-8000-000000000018', 'Systems Analysis', 'IT210', 'Requirements and design.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000008'),
('e0000000-0000-4000-8000-000000000019', 'Ecology', 'ENV110', 'Ecosystems of Southern Africa.', 16, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000009'),
('e0000000-0000-4000-8000-000000000020', 'Business Communication', 'BUS100', 'Workplace writing and presenting.', 12, false, NOW(), NOW(), 'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000010')
ON CONFLICT (id) DO NOTHING;

-- Lecturers
INSERT INTO lecturers (
  id, phone, foreign_national, passport_number, id_number, date_of_birth, gender, nationality,
  address, city, state, zip, country, site_id, institution_id, department_id,
  verification_status, is_deleted, created_at, updated_at, user_id
) VALUES
('11000000-0000-4000-8000-000000000001', '+27 82 100 0001', false, NULL, '8001015009087', '1980-01-01', 'MALE', 'South African', '12 Oak Street', 'Cape Town', 'Western Cape', '7700', 'South Africa', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'VERIFIED', false, NOW(), NOW(), NULL),
('11000000-0000-4000-8000-000000000002', '+27 82 100 0002', false, NULL, '8502154001083', '1985-02-15', 'FEMALE', 'South African', '8 Rose Avenue', 'Cape Town', 'Western Cape', '7700', 'South Africa', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'VERIFIED', false, NOW(), NOW(), NULL),
('11000000-0000-4000-8000-000000000003', '+27 82 100 0003', true, 'A12345678', NULL, '1978-06-20', 'MALE', 'Kenyan', '55 Loop Street', 'Cape Town', 'Western Cape', '8001', 'South Africa', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'PENDING', false, NOW(), NOW(), NULL),
('11000000-0000-4000-8000-000000000004', '+27 82 100 0004', false, NULL, '7909304800081', '1979-09-30', 'FEMALE', 'South African', '3 Market Street', 'Cape Town', 'Western Cape', '8001', 'South Africa', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'VERIFIED', false, NOW(), NOW(), NULL),
('11000000-0000-4000-8000-000000000005', '+27 82 100 0005', false, NULL, '7605125001089', '1976-05-12', 'MALE', 'South African', '19 Sea Point Drive', 'Cape Town', 'Western Cape', '8005', 'South Africa', 'b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'VERIFIED', false, NOW(), NOW(), NULL),
('11000000-0000-4000-8000-000000000006', '+27 82 100 0006', false, NULL, '8807074800085', '1988-07-07', 'FEMALE', 'South African', '7 Kloof Road', 'Cape Town', 'Western Cape', '8001', 'South Africa', NULL, 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004', 'PENDING', false, NOW(), NOW(), NULL),
('11000000-0000-4000-8000-000000000007', '+27 82 100 0007', false, NULL, '7201015009081', '1972-01-01', 'MALE', 'South African', '2 Factory Lane', 'Bellville', 'Western Cape', '7530', 'South Africa', 'b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000005', 'VERIFIED', false, NOW(), NOW(), NULL),
('11000000-0000-4000-8000-000000000008', '+27 82 100 0008', false, NULL, '9104044800087', '1991-04-04', 'FEMALE', 'South African', '44 Dock Road', 'Cape Town', 'Western Cape', '8001', 'South Africa', 'b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000006', 'VERIFIED', false, NOW(), NOW(), NULL),
('11000000-0000-4000-8000-000000000009', '+27 82 100 0009', false, NULL, '8308185001082', '1983-08-18', 'MALE', 'South African', '9 Main Road', 'Cape Town', 'Western Cape', '7700', 'South Africa', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'REJECTED', false, NOW(), NOW(), NULL),
('11000000-0000-4000-8000-000000000010', '+27 82 100 0010', true, 'B99887766', NULL, '1987-11-11', 'FEMALE', 'Nigerian', '16 Wale Street', 'Cape Town', 'Western Cape', '8001', 'South Africa', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'VERIFIED', false, NOW(), NOW(), NULL),
('11000000-0000-4000-8000-000000000011', '+27 82 100 0011', false, NULL, '7503035009084', '1975-03-03', 'MALE', 'South African', '21 Hospital Bend', 'Cape Town', 'Western Cape', '8005', 'South Africa', 'b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'PENDING', false, NOW(), NOW(), NULL),
('11000000-0000-4000-8000-000000000012', '+27 82 100 0012', false, NULL, '8606264800080', '1986-06-26', 'FEMALE', 'South African', '5 Harbour Way', 'Cape Town', 'Western Cape', '8001', 'South Africa', 'b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000006', 'VERIFIED', false, NOW(), NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

-- Students
INSERT INTO students (
  id, phone, address, city, state, zip, country, foreign_national, passport_number, id_number,
  date_of_birth, gender, nationality, site_id, verification_status, is_deleted, created_at, updated_at, user_id
) VALUES
('f0000000-0000-4000-8000-000000000001', '+27 71 200 0001', '101 Campus Road', 'Cape Town', 'Western Cape', '7700', 'South Africa', false, NULL, '0501015800083', '2005-01-01', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000002', '+27 71 200 0002', '14 Grove Street', 'Cape Town', 'Western Cape', '7700', 'South Africa', false, NULL, '0402155800089', '2004-02-15', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000003', '+27 71 200 0003', '22 Pine Close', 'Cape Town', 'Western Cape', '7700', 'South Africa', false, NULL, '0603204800081', '2006-03-20', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'PENDING', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000004', '+27 71 200 0004', '8 Birch Lane', 'Cape Town', 'Western Cape', '7700', 'South Africa', true, 'C11223344', NULL, '2005-07-07', 'MALE', 'Zimbabwean', 'b0000000-0000-4000-8000-000000000001', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000005', '+27 71 200 0005', '33 Long Street', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0309095800085', '2003-09-09', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000006', '+27 71 200 0006', '9 Bree Street', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0412125800087', '2004-12-12', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'PENDING', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000007', '+27 71 200 0007', '17 Adderley Street', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0505054800082', '2005-05-05', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000008', '+27 71 200 0008', '4 Loop Street', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0606065800084', '2006-06-06', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'REJECTED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000009', '+27 71 200 0009', '28 Beach Road', 'Cape Town', 'Western Cape', '8005', 'South Africa', false, NULL, '0404044800086', '2004-04-04', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000003', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000010', '+27 71 200 0010', '11 Victoria Road', 'Cape Town', 'Western Cape', '8005', 'South Africa', false, NULL, '0508085800088', '2005-08-08', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000003', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000011', '+27 71 200 0011', '6 Hospital Street', 'Cape Town', 'Western Cape', '8005', 'South Africa', false, NULL, '0303034800080', '2003-03-03', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000003', 'PENDING', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000012', '+27 71 200 0012', '15 Dock Road', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0502025800081', '2005-02-02', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000004', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000013', '+27 71 200 0013', '2 Harbour Lane', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0410104800083', '2004-10-10', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000004', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000014', '+27 71 200 0014', '19 Quay Street', 'Cape Town', 'Western Cape', '8001', 'South Africa', true, 'D55667788', NULL, '2006-01-20', 'MALE', 'Congolese', 'b0000000-0000-4000-8000-000000000004', 'PENDING', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000015', '+27 71 200 0015', '7 Factory Lane', 'Bellville', 'Western Cape', '7530', 'South Africa', false, NULL, '0307075800085', '2003-07-07', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000005', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000016', '+27 71 200 0016', '21 Industrial Road', 'Bellville', 'Western Cape', '7530', 'South Africa', false, NULL, '0509094800087', '2005-09-09', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000005', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000017', '+27 71 200 0017', '3 Workshop Close', 'Bellville', 'Western Cape', '7530', 'South Africa', false, NULL, '0411115800089', '2004-11-11', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000005', 'PENDING', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000018', '+27 71 200 0018', '44 Main Campus Way', 'Cape Town', 'Western Cape', '7700', 'South Africa', false, NULL, '0601014800081', '2006-01-01', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000019', '+27 71 200 0019', '90 City Block', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0503035800083', '2005-03-03', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000020', '+27 71 200 0020', '12 Atlantic View', 'Cape Town', 'Western Cape', '8005', 'South Africa', false, NULL, '0405054800085', '2004-05-05', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000003', 'PENDING', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000021', '+27 71 200 0021', '66 Dockside Flat', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0602025800087', '2006-02-02', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000004', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000022', '+27 71 200 0022', '18 Forge Street', 'Bellville', 'Western Cape', '7530', 'South Africa', false, NULL, '0308084800089', '2003-08-08', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000005', 'VERIFIED', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000023', '+27 71 200 0023', '27 Rondebosch Road', 'Cape Town', 'Western Cape', '7700', 'South Africa', false, NULL, '0512125800081', '2005-12-12', 'FEMALE', 'South African', 'b0000000-0000-4000-8000-000000000001', 'PENDING', false, NOW(), NOW(), NULL),
('f0000000-0000-4000-8000-000000000024', '+27 71 200 0024', '5 Gardens Mews', 'Cape Town', 'Western Cape', '8001', 'South Africa', false, NULL, '0401014800083', '2004-01-01', 'MALE', 'South African', 'b0000000-0000-4000-8000-000000000002', 'VERIFIED', false, NOW(), NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

-- Guardians (a selection across students)
INSERT INTO guardians (id, name, relationship, phone, email, student_id, created_at, updated_at) VALUES
('g0000000-0000-4000-8000-000000000001', 'Thandi Nkosi', 'Mother', '+27 82 300 0001', 'thandi.nkosi@example.com', 'f0000000-0000-4000-8000-000000000001', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000002', 'Sipho Nkosi', 'Father', '+27 82 300 0002', 'sipho.nkosi@example.com', 'f0000000-0000-4000-8000-000000000001', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000003', 'Jane Botha', 'Mother', '+27 82 300 0003', 'jane.botha@example.com', 'f0000000-0000-4000-8000-000000000002', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000004', 'Amina Patel', 'Guardian', '+27 82 300 0004', 'amina.patel@example.com', 'f0000000-0000-4000-8000-000000000003', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000005', 'David Moyo', 'Father', '+27 82 300 0005', 'david.moyo@example.com', 'f0000000-0000-4000-8000-000000000004', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000006', 'Grace Moyo', 'Mother', '+27 82 300 0006', NULL, 'f0000000-0000-4000-8000-000000000004', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000007', 'Lebo Dlamini', 'Mother', '+27 82 300 0007', 'lebo.dlamini@example.com', 'f0000000-0000-4000-8000-000000000005', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000008', 'Pieter Venter', 'Father', '+27 82 300 0008', 'pieter.venter@example.com', 'f0000000-0000-4000-8000-000000000006', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000009', 'Naledi Khumalo', 'Mother', '+27 82 300 0009', 'naledi.khumalo@example.com', 'f0000000-0000-4000-8000-000000000007', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000010', 'Fatima Abrahams', 'Mother', '+27 82 300 0010', 'fatima.abrahams@example.com', 'f0000000-0000-4000-8000-000000000009', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000011', 'Johan du Plessis', 'Father', '+27 82 300 0011', NULL, 'f0000000-0000-4000-8000-000000000010', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000012', 'Carmen Jacobs', 'Guardian', '+27 82 300 0012', 'carmen.jacobs@example.com', 'f0000000-0000-4000-8000-000000000012', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000013', 'Michelle September', 'Mother', '+27 82 300 0013', 'michelle.september@example.com', 'f0000000-0000-4000-8000-000000000013', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000014', 'Andile Ngcobo', 'Father', '+27 82 300 0014', 'andile.ngcobo@example.com', 'f0000000-0000-4000-8000-000000000015', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000015', 'Sarah Williams', 'Mother', '+27 82 300 0015', 'sarah.williams@example.com', 'f0000000-0000-4000-8000-000000000016', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000016', 'Kevin Adams', 'Father', '+27 82 300 0016', 'kevin.adams@example.com', 'f0000000-0000-4000-8000-000000000018', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000017', 'Nomsa Zulu', 'Mother', '+27 82 300 0017', 'nomsa.zulu@example.com', 'f0000000-0000-4000-8000-000000000019', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000018', 'Riaan Steyn', 'Father', '+27 82 300 0018', NULL, 'f0000000-0000-4000-8000-000000000020', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000019', 'Ayesha Khan', 'Mother', '+27 82 300 0019', 'ayesha.khan@example.com', 'f0000000-0000-4000-8000-000000000021', NOW(), NOW()),
('g0000000-0000-4000-8000-000000000020', 'Teboho Molefe', 'Guardian', '+27 82 300 0020', 'teboho.molefe@example.com', 'f0000000-0000-4000-8000-000000000024', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
