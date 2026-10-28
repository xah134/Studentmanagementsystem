-- AlterTable
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "first_name" TEXT;
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "last_name" TEXT;
ALTER TABLE "lecturers" ADD COLUMN IF NOT EXISTS "first_name" TEXT;
ALTER TABLE "lecturers" ADD COLUMN IF NOT EXISTS "last_name" TEXT;

-- Backfill demo student names
UPDATE students SET first_name = 'Amahle', last_name = 'Nkosi' WHERE id = 'f0000000-0000-4000-8000-000000000001';
UPDATE students SET first_name = 'Johan', last_name = 'Botha' WHERE id = 'f0000000-0000-4000-8000-000000000002';
UPDATE students SET first_name = 'Fatima', last_name = 'Patel' WHERE id = 'f0000000-0000-4000-8000-000000000003';
UPDATE students SET first_name = 'Tendai', last_name = 'Moyo' WHERE id = 'f0000000-0000-4000-8000-000000000004';
UPDATE students SET first_name = 'Lebo', last_name = 'Dlamini' WHERE id = 'f0000000-0000-4000-8000-000000000005';
UPDATE students SET first_name = 'Pieter', last_name = 'Venter' WHERE id = 'f0000000-0000-4000-8000-000000000006';
UPDATE students SET first_name = 'Naledi', last_name = 'Khumalo' WHERE id = 'f0000000-0000-4000-8000-000000000007';
UPDATE students SET first_name = 'Sibusiso', last_name = 'Zulu' WHERE id = 'f0000000-0000-4000-8000-000000000008';
UPDATE students SET first_name = 'Carmen', last_name = 'Abrahams' WHERE id = 'f0000000-0000-4000-8000-000000000009';
UPDATE students SET first_name = 'Thabo', last_name = 'Molefe' WHERE id = 'f0000000-0000-4000-8000-000000000010';
UPDATE students SET first_name = 'Grace', last_name = 'September' WHERE id = 'f0000000-0000-4000-8000-000000000011';
UPDATE students SET first_name = 'Andile', last_name = 'Ngcobo' WHERE id = 'f0000000-0000-4000-8000-000000000012';
UPDATE students SET first_name = 'Michelle', last_name = 'Jacobs' WHERE id = 'f0000000-0000-4000-8000-000000000013';
UPDATE students SET first_name = 'Jean', last_name = 'Mwamba' WHERE id = 'f0000000-0000-4000-8000-000000000014';
UPDATE students SET first_name = 'Sarah', last_name = 'Williams' WHERE id = 'f0000000-0000-4000-8000-000000000015';
UPDATE students SET first_name = 'Kevin', last_name = 'Adams' WHERE id = 'f0000000-0000-4000-8000-000000000016';
UPDATE students SET first_name = 'Nomsa', last_name = 'Zulu' WHERE id = 'f0000000-0000-4000-8000-000000000017';
UPDATE students SET first_name = 'Riaan', last_name = 'Steyn' WHERE id = 'f0000000-0000-4000-8000-000000000018';
UPDATE students SET first_name = 'Ayesha', last_name = 'Khan' WHERE id = 'f0000000-0000-4000-8000-000000000019';
UPDATE students SET first_name = 'Teboho', last_name = 'Molefe' WHERE id = 'f0000000-0000-4000-8000-000000000020';
UPDATE students SET first_name = 'Lindiwe', last_name = 'Ndlovu' WHERE id = 'f0000000-0000-4000-8000-000000000021';
UPDATE students SET first_name = 'Willem', last_name = 'de Villiers' WHERE id = 'f0000000-0000-4000-8000-000000000022';
UPDATE students SET first_name = 'Zanele', last_name = 'Mthembu' WHERE id = 'f0000000-0000-4000-8000-000000000023';
UPDATE students SET first_name = 'Daniel', last_name = 'Meyer' WHERE id = 'f0000000-0000-4000-8000-000000000024';
UPDATE students SET
  first_name = COALESCE(first_name, 'Student'),
  last_name = COALESCE(last_name, RIGHT(id::text, 4))
WHERE first_name IS NULL OR last_name IS NULL;

-- Backfill demo lecturer names
UPDATE lecturers SET first_name = 'Sipho', last_name = 'Mabaso' WHERE id = '11000000-0000-4000-8000-000000000001';
UPDATE lecturers SET first_name = 'Helen', last_name = 'van Wyk' WHERE id = '11000000-0000-4000-8000-000000000002';
UPDATE lecturers SET first_name = 'Rajesh', last_name = 'Naidoo' WHERE id = '11000000-0000-4000-8000-000000000003';
UPDATE lecturers SET first_name = 'Thandi', last_name = 'Mokoena' WHERE id = '11000000-0000-4000-8000-000000000004';
UPDATE lecturers SET first_name = 'Peter', last_name = 'Johnson' WHERE id = '11000000-0000-4000-8000-000000000005';
UPDATE lecturers SET first_name = 'Nadia', last_name = 'Isaacs' WHERE id = '11000000-0000-4000-8000-000000000006';
UPDATE lecturers SET first_name = 'Musa', last_name = 'Khumalo' WHERE id = '11000000-0000-4000-8000-000000000007';
UPDATE lecturers SET first_name = 'Claire', last_name = 'Bennett' WHERE id = '11000000-0000-4000-8000-000000000008';
UPDATE lecturers SET first_name = 'David', last_name = 'Pillay' WHERE id = '11000000-0000-4000-8000-000000000009';
UPDATE lecturers SET first_name = 'Amara', last_name = 'Okafor' WHERE id = '11000000-0000-4000-8000-000000000010';
UPDATE lecturers SET first_name = 'Johan', last_name = 'Smit' WHERE id = '11000000-0000-4000-8000-000000000011';
UPDATE lecturers SET first_name = 'Priya', last_name = 'Reddy' WHERE id = '11000000-0000-4000-8000-000000000012';
UPDATE lecturers SET
  first_name = COALESCE(first_name, 'Lecturer'),
  last_name = COALESCE(last_name, RIGHT(id::text, 4))
WHERE first_name IS NULL OR last_name IS NULL;
