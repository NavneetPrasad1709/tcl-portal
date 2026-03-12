-- TCL Customer Portal — Seed Data

-- ── Products ──────────────────────────────────────────────

DELETE FROM products;

INSERT INTO products (id, sku, name, category, turnaround_days, starting_price, is_featured, print_types_available) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'TEE-GILDAN-64000',        'Gildan Softstyle Tee',              'T-Shirts',   10, 8.50,  true,  ARRAY['screen_print','puff_print','foil']::print_type[]),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'TEE-BELLA-3001',          'Bella+Canvas Unisex Tee',           'T-Shirts',   10, 11.00, true,  ARRAY['screen_print','dye_sublimation','foil']::print_type[]),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'CREW-INDEPENDENT-SS3000', 'Independent Trading Crewneck',      'Sweatshirts',12, 22.00, true,  ARRAY['screen_print','embroidery','puff_print']::print_type[]),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'HOOD-GILDAN-18500',       'Gildan Heavy Blend Hoodie',         'Sweatshirts',12, 24.00, true,  ARRAY['screen_print','embroidery','puff_print']::print_type[]),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'HAT-RICHARDSON-112',      'Richardson 112 Trucker Hat',        'Headwear',   14, 18.00, false, ARRAY['embroidery','puff_print']::print_type[]),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'HAT-YUPOONG-6606',        'Yupoong Snapback',                  'Headwear',   14, 16.00, false, ARRAY['embroidery','screen_print']::print_type[]),
  ('aaaaaaaa-0000-0000-0000-000000000007', 'POLO-PORT-K500',          'Port Authority Performance Polo',   'Polos',      14, 28.00, false, ARRAY['embroidery','screen_print']::print_type[]),
  ('aaaaaaaa-0000-0000-0000-000000000008', 'JACKET-CHARLES-J317',     'Charles River Pullover Jacket',     'Outerwear',  18, 45.00, false, ARRAY['embroidery','screen_print']::print_type[]),
  ('aaaaaaaa-0000-0000-0000-000000000009', 'TANK-NEXT-3633',          'Next Level Racerback Tank',         'T-Shirts',   10, 9.00,  false, ARRAY['screen_print','dye_sublimation']::print_type[]),
  ('aaaaaaaa-0000-0000-0000-000000000010', 'CREW-COMFORT-1566',       'Comfort Colors Crewneck',           'Sweatshirts',12, 26.00, true,  ARRAY['screen_print','embroidery']::print_type[]);

-- ── Users ─────────────────────────────────────────────────
-- These require matching auth.users rows.
-- To seed without auth, first run:
--   ALTER TABLE users DROP CONSTRAINT users_id_fkey;
-- Then re-add after seeding if needed.

INSERT INTO users (id, name, email, organization, school, user_type, loyalty_points) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Madison Clarke',  'madison.clarke@alphaphi.org',  'Alpha Phi',         'University of Alabama',   'customer',        320),
  ('00000000-0000-0000-0000-000000000002', 'Tyler Nguyen',    'tyler.nguyen@sigchi.org',       'Sigma Chi',         'University of Georgia',   'customer',         85),
  ('00000000-0000-0000-0000-000000000003', 'Brianna Walsh',   'brianna.walsh@kappakappa.org',  'Kappa Kappa Gamma', 'Ohio State University',   'customer',        510),
  ('00000000-0000-0000-0000-000000000004', 'Jordan Reed',     'jordan.reed@pikappalpha.org',   'Pi Kappa Alpha',    'University of Tennessee', 'customer',          0),
  ('00000000-0000-0000-0000-000000000005', 'Alexis Monroe',   'alexis.monroe@deltazeta.org',   'Delta Zeta',        'Auburn University',       'customer',        210),
  ('00000000-0000-0000-0000-000000000006', 'Chris Patel',     'chris.patel@tcl.com',           NULL,                'TCL HQ',                  'account_manager',   0),
  ('00000000-0000-0000-0000-000000000007', 'Samantha Lee',    'samantha.lee@tcl.com',          NULL,                'TCL HQ',                  'account_manager',   0),
  ('00000000-0000-0000-0000-000000000008', 'Jake Turner',     'jake.turner@uga.edu',           'TCL Campus Reps',   'University of Georgia',   'campus_rep',      150),
  ('00000000-0000-0000-0000-000000000009', 'Priya Sharma',    'priya.sharma@ua.edu',           'TCL Campus Reps',   'University of Alabama',   'campus_rep',       90),
  ('00000000-0000-0000-0000-000000000010', 'Noah Castillo',   'noah.castillo@osu.edu',         'TCL Campus Reps',   'Ohio State University',   'campus_rep',       60);

-- ── Orders ────────────────────────────────────────────────

INSERT INTO orders (id, customer_id, event_name, due_date, status, order_type, products_selected, print_type, front_design_description, back_design_description) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Alpha Phi Bid Day 2025',    '2025-02-28', 'proof_ready',   'group_order', ARRAY['aaaaaaaa-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000009']::uuid[], 'screen_print',    'Alpha Phi letters with bid day sun motif – coral and white', 'Back text: Bid Day 2025 University of Alabama'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Sigma Chi Derby Days',      '2025-03-10', 'proof_pending', 'group_order', ARRAY['aaaaaaaa-0000-0000-0000-000000000001']::uuid[],                                     'screen_print',    'Sigma Chi crest with Derby Days text in navy and gold',      NULL),
  ('bbbbbbbb-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'KKG Big Little Reveal',     '2025-02-20', 'approved',      'group_order', ARRAY['aaaaaaaa-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000004']::uuid[], 'embroidery',      'KKG logo embroidered on left chest in blue and gold',        NULL),
  ('bbbbbbbb-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Pike Formal 2025',          '2025-04-05', 'new',           'group_order', ARRAY['aaaaaaaa-0000-0000-0000-000000000008']::uuid[],                                     'embroidery',      'Pi Kappa Alpha shield on left chest',                        NULL),
  ('bbbbbbbb-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Delta Zeta Spring Semi',    '2025-03-22', 'in_production', 'group_order', ARRAY['aaaaaaaa-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000009']::uuid[], 'dye_sublimation', 'Full front sublimation – DZ roses watercolor graphic',       'Back: Spring Semi 2025 Auburn'),
  ('bbbbbbbb-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Alpha Phi Philanthropy 5K', '2025-04-12', 'new',           'group_order', ARRAY['aaaaaaaa-0000-0000-0000-000000000001']::uuid[],                                     'screen_print',    '5K race graphic with Alpha Phi heart logo in red',           'Back: participant list in two columns'),
  ('bbbbbbbb-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'KKG Recruitment 2025',      '2025-03-01', 'shipped',       'group_order', ARRAY['aaaaaaaa-0000-0000-0000-000000000002']::uuid[],                                     'screen_print',    'KKG owl mascot with Find Your People tagline',               'Back: KKG Ohio State chapter URL and QR code'),
  ('bbbbbbbb-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000005', 'DZ Sisterhood Retreat',     '2025-03-15', 'complete',      'group_order', ARRAY['aaaaaaaa-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000006']::uuid[], 'screen_print',    'DZ letters stacked with pine tree retreat graphic',          NULL),
  ('bbbbbbbb-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', 'Sig Chi Homecoming',        '2025-10-18', 'new',           'group_order', ARRAY['aaaaaaaa-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000003']::uuid[], 'puff_print',      'Sigma Chi letters puff raised with homecoming year',         'Back: Derby Days Champion banner'),
  ('bbbbbbbb-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000004', 'Pike Rush Fall 2025',       '2025-08-20', 'new',           'group_order', ARRAY['aaaaaaaa-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000005']::uuid[], 'screen_print',    'Minimalist PIKE wordmark in black on white tee',             NULL);

-- ── Proofs ────────────────────────────────────────────────

INSERT INTO proofs (id, order_id, product_id, proof_number, color, print_type, est_ship_date, price_tiers, mockup_image_url, status, uploaded_at) VALUES
  ('cccccccc-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 1, 'Heather Peach', 'screen_print',    '2025-02-24', '{"24-47":"$13.50","48-71":"$12.00","72+":"$10.75"}', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'approved', '2025-02-10T14:32:00Z'),
  ('cccccccc-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000009', 1, 'Coral',         'screen_print',    '2025-02-24', '{"24-47":"$11.50","48-71":"$10.25","72+":"$9.00"}',  'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400', 'approved', '2025-02-10T14:35:00Z'),
  ('cccccccc-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 1, 'Navy',          'screen_print',    '2025-03-06', '{"24-47":"$10.50","48-71":"$9.25","72+":"$8.00"}',   'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400', 'pending',  '2025-02-12T09:15:00Z'),
  ('cccccccc-0000-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', 1, 'Royal Blue',    'embroidery',      '2025-02-17', '{"12-23":"$28.00","24-47":"$25.50","48+":"$23.00"}', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'approved', '2025-02-05T11:00:00Z'),
  ('cccccccc-0000-0000-0000-000000000005', 'bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', 1, 'White',         'dye_sublimation', '2025-03-18', '{"24-47":"$18.00","48-71":"$16.50","72+":"$14.75"}', 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400', 'pending',  '2025-02-08T16:45:00Z');

-- ── Revision Requests ─────────────────────────────────────

INSERT INTO revision_requests (id, proof_id, customer_id, notes, created_at) VALUES
  ('dddddddd-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'The gold color on the crest looks more yellow than PMS 124. Please match our brand guidelines. Also the text kerning on Derby Days feels too tight.', '2025-02-13T08:55:00Z');
