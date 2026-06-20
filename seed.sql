-- ============================================================
-- MediShop Seed Data — 20 Indian Medical Products
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

insert into products (name, description, price, mrp, category, stock, requires_prescription, is_active) values

-- Medicines
(
  'Dolo 650 Paracetamol Tablets',
  'Paracetamol 650mg tablets for fever and mild to moderate pain relief. Trusted by doctors and patients alike. Pack of 15 tablets.',
  30, 35, 'Medicines', 200, false, true
),
(
  'Crocin Pain Relief Tablets',
  'Fast-acting pain relief formula with Paracetamol 500mg. Effective for headaches, body aches, and dental pain. Pack of 20 tablets.',
  45, 50, 'Medicines', 150, false, true
),
(
  'Disprin Aspirin Tablets',
  'Dispersible aspirin tablets for quick pain and fever relief. Each tablet contains 300mg aspirin. Pack of 12 tablets.',
  25, 30, 'Medicines', 120, false, true
),
(
  'Digene Antacid Gel',
  'Fast-acting antacid gel for acidity, heartburn, and indigestion. Contains magnesium and aluminum hydroxide. 200ml pack.',
  95, 110, 'Medicines', 80, false, true
),
(
  'Vicks VapoRub 50g',
  'Medicated ointment for cough and cold relief. Apply to chest, throat and back for effective decongestion. Classic 50g jar.',
  175, 195, 'Medicines', 100, false, true
),
(
  'Strepsils Sore Throat Lozenges',
  'Medicated lozenges for sore throat, voice problems, and mouth infections. Contains antibacterial agents. Pack of 16 lozenges.',
  95, 110, 'Medicines', 90, false, true
),
(
  'Himalaya Liv.52 Tablets',
  'Liver protection and restoration formula. Improves liver function and promotes liver health. Pack of 100 tablets.',
  130, 155, 'Medicines', 75, false, true
),
(
  'ORS Electral Powder Sachets',
  'Oral rehydration salts to replace electrolytes lost during diarrhea, vomiting, or dehydration. Lemon flavor. Pack of 5 sachets.',
  55, 65, 'Medicines', 180, false, true
),

-- Vitamins
(
  'Vitamin D3 1000IU Softgels',
  'High-potency Vitamin D3 supplements to support bone health, immunity, and overall wellness. Pack of 60 softgel capsules.',
  299, 350, 'Vitamins', 60, false, true
),
(
  'Revital H Multivitamin Capsules',
  'Complete multivitamin and multimineral supplement with ginseng for energy, vitality, and stamina. Pack of 30 capsules.',
  299, 340, 'Vitamins', 55, false, true
),
(
  'Glucon-D Glucose Powder 500g',
  'Instant energy glucose drink for quick energy replenishment. Rich in vitamins and minerals. Regular flavor, 500g pack.',
  110, 130, 'Vitamins', 70, false, true
),

-- Skincare
(
  'Cetaphil Gentle Skin Cleanser 250ml',
  'Dermatologist-recommended gentle, non-irritating cleanser for sensitive and dry skin. Soap-free and fragrance-free formula. 250ml.',
  399, 450, 'Skincare', 45, false, true
),
(
  'Lacto Calamine Lotion 120ml',
  'Kaolin-based skin toner and moisturizer that controls excess oil, reduces acne, and evens skin tone. 120ml bottle.',
  145, 165, 'Skincare', 65, false, true
),

-- Baby Care
(
  'Johnson Baby Powder 200g',
  'Gentle talc-free baby powder that keeps baby skin fresh, dry, and comfortable all day. With clinically proven mildness. 200g.',
  150, 175, 'Baby Care', 85, false, true
),

-- Surgical
(
  'Latex Examination Gloves Box',
  'Disposable latex examination gloves for medical use. Powder-free, textured fingertips for better grip. Box of 50 pairs.',
  120, 140, 'Surgical', 40, false, true
),
(
  'Band-Aid Adhesive Bandages Box',
  'Sterile adhesive bandages for minor cuts, wounds, and abrasions. Flexible and comfortable. Assorted sizes, box of 20.',
  85, 100, 'Surgical', 110, false, true
),

-- Personal Care
(
  'Betadine Antiseptic Solution 100ml',
  'Povidone-iodine antiseptic solution for wound cleaning and prevention of infection. 10% povidone iodine. 100ml bottle.',
  85, 95, 'Personal Care', 95, false, true
),
(
  'Dettol Antiseptic Liquid 500ml',
  'Multi-purpose antiseptic liquid for cuts, grazes, and everyday hygiene. Kills 99.9% of bacteria and viruses. 500ml.',
  180, 210, 'Personal Care', 80, false, true
),
(
  'Savlon Antiseptic Cream 500ml',
  'Antiseptic and cleansing solution for first aid and personal hygiene. Contains chlorhexidine gluconate. 500ml bottle.',
  165, 190, 'Personal Care', 70, false, true
),
(
  'Volini Pain Relief Spray 40g',
  'Fast-acting topical pain relief spray for muscle pain, joint pain, and sports injuries. Provides instant cooling effect. 40g.',
  195, 220, 'Medicines', 60, false, true
);
