-- ============================================================
-- Seed Data: Sample placement drives Jan 2026 – Jun 2027
-- Run AFTER migration and after creating at least one admin user
-- Replace 'YOUR_ADMIN_USER_ID' with actual auth.users UUID
-- ============================================================

-- First, manually set your admin users:
-- UPDATE public.profiles SET role = 'admin' WHERE email IN ('admin1@college.edu', 'admin2@college.edu');

-- Sample drives (update created_by UUID to match your admin user ID)
-- INSERT INTO public.drives (company_name, drive_type, process_stages, assigned_date, poc_name, notes, status, created_by)
-- VALUES
--   ('Google', 'Final Placement', ARRAY['PPT', 'Aptitude/Coding Test', 'PI'], '2026-01-15', 'Rahul Sharma', 'On-campus drive for SWE roles', 'fixed', 'YOUR_ADMIN_UUID'),
--   ('Microsoft', 'Summer Internship', ARRAY['PPT', 'Aptitude/Coding Test', 'GD', 'PI'], '2026-02-10', 'Priya Patel', 'Hybrid mode', 'tentative', 'YOUR_ADMIN_UUID'),
--   ('Amazon', 'Final Placement', ARRAY['Aptitude/Coding Test', 'PI'], '2026-03-05', 'Ankit Verma', 'SDE-1 roles', 'tentative', 'YOUR_ADMIN_UUID'),
--   ('Infosys', 'Both', ARRAY['PPT', 'Aptitude/Coding Test'], '2026-04-20', 'Sneha Gupta', 'Mass hiring drive', 'fixed', 'YOUR_ADMIN_UUID'),
--   ('TCS', 'Final Placement', ARRAY['Aptitude/Coding Test', 'PI'], '2026-05-12', 'Vikram Singh', 'TCS Smart Hiring', 'tentative', 'YOUR_ADMIN_UUID');
