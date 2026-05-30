-- =============================================================================
-- Origio · New City Seed — 12 Trending Cities
-- Generated: May 2026 · Data verified May 2026
-- Sources: Numbeo, Expatistan, InterNations 2025, local journalism
-- Run this in your Supabase SQL editor (Project → SQL Editor → New Query)
-- =============================================================================

-- NOTE: Adjust UUIDs if needed. Using gen_random_uuid() for portability.
-- All costs are in LOCAL CURRENCY (matching the currency column).
-- All salary figures are annual gross in local currency.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. BANGKOK, THAILAND  (THB)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'bangkok', 'Bangkok', 'thailand', 'Thailand', '🇹🇭',
  'Asia', 'Thai', 'THB', 'Asia/Bangkok', '10,500,000',
  'The city that never bills you twice for the same week.',
  13.7563, 100.5018
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'bangkok'),
  21000, 12000, 9000, 1500, 1200, 3500, 1200, 8000,
  780000, 1200000, 480000, 900000, 900000, 840000,
  840000, 720000, 780000, 960000, 720000, 660000,
  600000, 420000, 540000, 540000, 660000, 540000,
  360000, 300000,
  7.4, 5.8, 7.2, 8.8, 7.6, 9.2, 9.0,
  34, 27, 165,
  'Tropical monsoon. Hot and humid year-round with a rainy season (May–Oct). Winters dry and slightly cooler. AC is non-negotiable.',
  '[
    {"name":"Sukhumvit","vibe":"Expat hub, shopping, nightlife","avgRent":23000,"goodFor":["nightlife","remote workers","eating out"]},
    {"name":"Silom / Sathorn","vibe":"Finance district, rooftop bars","avgRent":22000,"goodFor":["finance professionals","nightlife","dining"]},
    {"name":"Ari / Phahon Yothin","vibe":"Local neighbourhood, cafés, creative","avgRent":16000,"goodFor":["families","remote workers","local food"]},
    {"name":"On Nut / Phra Khanong","vibe":"Affordable BTS corridor","avgRent":13000,"goodFor":["budget-conscious","young professionals"]}
  ]'::jsonb,
  'No dedicated digital nomad visa. Long-Term Resident (LTR) visa for high earners ($80k+ income) gives 10-year renewable stays. DTV (Destination Thailand Visa) allows 180-day stays. Most remote workers use tourist visa + border runs or DTV.',
  'https://ltr.boi.go.th',
  0.20, 'progressive 0–35%; most expats fall in 20–25% bracket',
  8.6, '2026-05-30',
  'Numbeo Bangkok May 2026; Expatistan Q1 2026; BOI Thailand; InterNations Expat Insider 2025'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MEXICO CITY, MEXICO  (MXN)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'mexico-city', 'Mexico City', 'mexico', 'Mexico', '🇲🇽',
  'Americas', 'Spanish', 'MXN', 'America/Mexico_City', '21,600,000',
  'Roma Norte rent. New York ambition. Pacific coast two hours away.',
  19.4326, -99.1332
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'mexico-city'),
  19500, 11000, 7500, 700, 800, 1800, 700, 6000,
  480000, 720000, 240000, 540000, 540000, 480000,
  480000, 420000, 480000, 600000, 360000, 300000,
  300000, 180000, 300000, 300000, 360000, 300000,
  180000, 180000,
  7.0, 5.0, 7.0, 7.8, 8.2, 8.8, 8.8,
  26, 14, 140,
  'High-altitude subtropical (2,240 m). Spring-like year-round; mild summers (rainy season Jun–Sep), cool dry winters. Rarely hot or cold by global standards.',
  '[
    {"name":"Roma Norte / Condesa","vibe":"Expat epicentre, cafés, galleries","avgRent":22000,"goodFor":["remote workers","foodies","nightlife"]},
    {"name":"Polanco","vibe":"Upscale, embassies, fine dining","avgRent":28000,"goodFor":["high-earners","families","fine dining"]},
    {"name":"Coyoacán","vibe":"Bohemian, historic, markets","avgRent":14000,"goodFor":["creatives","families","local culture"]},
    {"name":"Doctores / Narvarte","vibe":"Affordable, local, authentic","avgRent":11000,"goodFor":["budget-conscious","long-term residents"]}
  ]'::jsonb,
  'No digital nomad visa. Temporary Resident Visa (Residente Temporal) allows 1–4 year stays for those proving income from abroad (approx. $2,500 USD/mo). Straightforward process via Mexican consulate in home country.',
  'https://consulmex.sre.gob.mx',
  0.25, 'progressive bracket; remote workers on foreign income typically in 25–30% bracket',
  7.8, '2026-05-30',
  'Numbeo Mexico City May 2026; Expatistan Q1 2026; INM Mexico; InterNations Expat Insider 2025'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. BALI (DENPASAR), INDONESIA  (IDR)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'bali', 'Bali', 'indonesia', 'Indonesia', '🇮🇩',
  'Asia', 'Indonesian', 'IDR', 'Asia/Makassar', '4,200,000',
  'A villa with a pool. A standing desk. The same Wi-Fi password.',
  -8.6705, 115.2126
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'bali'),
  14000000, 8000000, 4500000, 1200000, 500000, 2000000, 500000, 3500000,
  180000000, 360000000, 120000000, 216000000, 216000000, 180000000,
  180000000, 156000000, 180000000, 240000000, 156000000, 132000000,
  120000000, 96000000, 120000000, 120000000, 144000000, 120000000,
  84000000, 72000000,
  7.8, 7.8, 5.8, 7.2, 5.0, 8.6, 9.4,
  32, 27, 195,
  'Tropical. Warm and humid year-round (27–32°C). Dry season Apr–Oct is prime time; rainy season Nov–Mar can see daily downpours but still liveable.',
  '[
    {"name":"Canggu","vibe":"Surf, cafés, digital nomads","avgRent":16000000,"goodFor":["remote workers","surfers","nightlife"]},
    {"name":"Ubud","vibe":"Jungle, wellness, yoga retreat","avgRent":10000000,"goodFor":["wellness seekers","creatives","families"]},
    {"name":"Seminyak","vibe":"Upscale beach, restaurants, spas","avgRent":18000000,"goodFor":["high-earners","beach life","dining"]},
    {"name":"Sanur","vibe":"Quiet, family-friendly, calm beach","avgRent":8000000,"goodFor":["families","retirees","long-term stays"]}
  ]'::jsonb,
  'E33G Remote Worker Visa (2023): 5-year renewable, requires proof of work for foreign employer and $2,000/mo income. Visa on Arrival (30 days) available for 100+ nationalities. B211A social/cultural visa popular for medium stays.',
  'https://molina.imigrasi.go.id',
  0.00, 'Foreign-sourced income not taxed in Indonesia under E33G. If working for Indonesian companies, progressive 5–35% applies.',
  8.4, '2026-05-30',
  'Numbeo Bali May 2026; Expatistan Q1 2026; Imigrasi Indonesia; InterNations Expat Insider 2025; NomadList Bali 2025'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MEDELLÍN, COLOMBIA  (COP)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'medellin', 'Medellín', 'colombia', 'Colombia', '🇨🇴',
  'Americas', 'Spanish', 'COP', 'America/Bogota', '2,500,000',
  'Eternal spring. Eternal spring. Every single month.',
  6.2442, -75.5812
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'medellin'),
  2900000, 1600000, 900000, 120000, 100000, 250000, 80000, 700000,
  72000000, 144000000, 48000000, 84000000, 84000000, 72000000,
  72000000, 60000000, 72000000, 96000000, 60000000, 54000000,
  48000000, 36000000, 48000000, 48000000, 60000000, 48000000,
  30000000, 27000000,
  7.6, 5.6, 7.4, 8.4, 7.8, 8.6, 8.8,
  26, 20, 185,
  'Subtropical highland — the "City of Eternal Spring". Comfortable 20–26°C year-round at 1,495 m elevation. Two rainy seasons (Apr–May, Oct–Nov). Never truly hot or cold.',
  '[
    {"name":"El Poblado","vibe":"Expat hub, restaurants, nightlife, malls","avgRent":3500000,"goodFor":["remote workers","nightlife","safety"]},
    {"name":"Laureles / Estadio","vibe":"Residential, authentic, local vibe","avgRent":2200000,"goodFor":["long-term stays","families","local culture"]},
    {"name":"Envigado","vibe":"Suburban, safe, quieter, more local","avgRent":1800000,"goodFor":["families","retirees","budget-conscious"]},
    {"name":"Manila / Centro","vibe":"Gritty, historic, very local","avgRent":1200000,"goodFor":["budget travellers","adventurous expats"]}
  ]'::jsonb,
  'Colombia Digital Nomad Visa (Type V-DN): 2-year renewable. Requires proof of remote employment or freelance work for foreign companies, min. ~$1,400 USD/mo income. Application through Colombian consulate or Ministry of Foreign Affairs.',
  'https://www.cancilleria.gov.co',
  0.19, 'progressive 0–39%; most digital nomads in 19% bracket on foreign income',
  8.0, '2026-05-30',
  'Numbeo Medellín May 2026; Expatistan Q1 2026; Colombia MRE; InterNations Expat Insider 2025; NomadList Medellín 2025'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. CHIANG MAI, THAILAND  (THB)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'chiang-mai', 'Chiang Mai', 'thailand', 'Thailand', '🇹🇭',
  'Asia', 'Thai', 'THB', 'Asia/Bangkok', '1,200,000',
  'The original digital nomad city. Still the cheapest flight out.',
  18.7883, 98.9853
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'chiang-mai'),
  10000, 6000, 6000, 1200, 700, 2000, 800, 4500,
  480000, 840000, 300000, 540000, 540000, 480000,
  480000, 420000, 480000, 600000, 420000, 360000,
  300000, 240000, 300000, 300000, 360000, 300000,
  240000, 180000,
  8.4, 8.4, 7.0, 8.0, 6.8, 7.2, 9.2,
  36, 18, 145,
  'Subtropical with three distinct seasons: hot-dry (Mar–May, peaks 38°C), rainy (Jun–Oct), and cool-dry (Nov–Feb, pleasant 18–25°C). Smoke season (Feb–Apr) can affect air quality — plan around it.',
  '[
    {"name":"Nimman (Nimmanhaemin)","vibe":"Trendy, cafés, coworking, expats","avgRent":12000,"goodFor":["remote workers","cafés","short stays"]},
    {"name":"Old City","vibe":"Historic temples, central, walkable","avgRent":9000,"goodFor":["culture seekers","tourists","short stays"]},
    {"name":"Hang Dong / Mae Hia","vibe":"Suburban, quiet, large houses","avgRent":7000,"goodFor":["families","long-term residents"]},
    {"name":"Santitham","vibe":"Local neighbourhood, affordable, authentic","avgRent":6500,"goodFor":["budget-conscious","long-term stays"]}
  ]'::jsonb,
  'Same visa framework as Bangkok (DTV, LTR). Destination Thailand Visa (DTV): 180 days/entry, 5-year renewable. Tourist visa on arrival (30 days) widely used. METV (Multiple Entry Tourist Visa) for 6-month stays.',
  'https://www.thaiembassy.com/thailand-visa',
  0.20, 'same progressive schedule as Bangkok; most remote workers taxed 15–20% on Thai-sourced income',
  8.8, '2026-05-30',
  'Numbeo Chiang Mai May 2026; Expatistan Q1 2026; Thai Immigration Bureau; NomadList Chiang Mai 2025'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. KUALA LUMPUR, MALAYSIA  (MYR)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'kuala-lumpur', 'Kuala Lumpur', 'malaysia', 'Malaysia', '🇲🇾',
  'Asia', 'English / Malay', 'MYR', 'Asia/Kuala_Lumpur', '1,800,000',
  'Singapore''s infrastructure. A fraction of Singapore''s rent.',
  3.1390, 101.6869
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'kuala-lumpur'),
  2800, 1600, 1200, 200, 80, 350, 130, 800,
  96000, 180000, 60000, 108000, 108000, 96000,
  96000, 84000, 96000, 120000, 84000, 72000,
  60000, 48000, 60000, 60000, 72000, 60000,
  48000, 42000,
  7.8, 7.6, 8.4, 9.0, 6.6, 7.6, 9.2,
  33, 28, 200,
  'Tropical rainforest climate. Hot, humid, and rainy year-round. Consistent 28–33°C. Heavy rain possible any day but rarely lasts long. One of the most consistent climates in Asia.',
  '[
    {"name":"KLCC / Bukit Bintang","vibe":"City centre, towers, malls, expats","avgRent":3200,"goodFor":["professionals","nightlife","convenience"]},
    {"name":"Mont Kiara","vibe":"Expat enclave, spacious condos, malls","avgRent":3500,"goodFor":["families","long-term expats","Western amenities"]},
    {"name":"Bangsar / Damansara","vibe":"Upscale suburb, cafés, restaurants","avgRent":2800,"goodFor":["professionals","dining","community"]},
    {"name":"Chow Kit / Setapak","vibe":"Local, affordable, authentic","avgRent":1500,"goodFor":["budget-conscious","local experience"]}
  ]'::jsonb,
  'DE Rantau Nomad Pass: 3–12 month stay for digital nomads earning min. $24,000 USD/year. Malaysia My Second Home (MM2H) programme for longer-term residents. Most nationalities get 90-day visa-free entry.',
  'https://mdec.my/derantau',
  0.24, 'progressive 0–30%; foreign-sourced income remitted to Malaysia taxed at flat 3% from 2022',
  8.6, '2026-05-30',
  'Numbeo KL May 2026; Expatistan Q1 2026; MDEC DE Rantau; InterNations Expat Insider 2025'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. CAPE TOWN, SOUTH AFRICA  (ZAR)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'cape-town', 'Cape Town', 'south-africa', 'South Africa', '🇿🇦',
  'Africa', 'English', 'ZAR', 'Africa/Johannesburg', '4,600,000',
  'A mountain. An ocean. A broadband connection faster than London.',
  -33.9249, 18.4241
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'cape-town'),
  17000, 10000, 6500, 1800, 600, 2500, 800, 5500,
  720000, 1200000, 480000, 840000, 840000, 720000,
  720000, 600000, 720000, 900000, 600000, 540000,
  480000, 360000, 480000, 480000, 600000, 480000,
  360000, 300000,
  7.6, 5.4, 7.0, 7.8, 6.6, 8.4, 8.2,
  28, 12, 65,
  'Mediterranean. Warm dry summers (Nov–Mar, 24–28°C) and mild wet winters (Jun–Aug, 10–16°C). One of the sunniest major cities. Southern hemisphere — seasons inverted vs Northern Europe.',
  '[
    {"name":"City Bowl / De Waterkant","vibe":"Central, hip, LGBTQ+, restaurants","avgRent":18000,"goodFor":["nightlife","remote workers","culture"]},
    {"name":"Sea Point / Green Point","vibe":"Atlantic promenade, cafés, ocean views","avgRent":20000,"goodFor":["lifestyle","beach","professionals"]},
    {"name":"Woodstock / Observatory","vibe":"Creative, artsy, gentrifying, affordable","avgRent":13000,"goodFor":["creatives","young professionals","budget"]},
    {"name":"Claremont / Rondebosch","vibe":"Suburban, safe, family-friendly","avgRent":11000,"goodFor":["families","long-term stays"]}
  ]'::jsonb,
  'Remote Work Visa (Section 11(1)(a)): up to 3-year stay for those employed abroad and earning above a threshold (currently ~$35,000 USD/year). Application via VFS/DHA. 90-day visa-free stays for EU/UK/US nationals.',
  'https://www.dha.gov.za',
  0.31, 'progressive 18–45%; 30-day processing; no territorial exclusion for foreign income',
  7.6, '2026-05-30',
  'Numbeo Cape Town May 2026; Expatistan Q1 2026; South Africa DHA; InterNations 2025; NomadList Cape Town 2025'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. MÁLAGA, SPAIN  (EUR)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'malaga', 'Málaga', 'spain', 'Spain', '🇪🇸',
  'Europe', 'Spanish', 'EUR', 'Europe/Madrid', '590,000',
  'Tech Park on the Med. 300 days of sun. The Beckham Law.',
  36.7213, -4.4214
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'malaga'),
  1100, 750, 320, 55, 60, 120, 40, 250,
  42000, 72000, 28000, 48000, 48000, 42000,
  42000, 36000, 40000, 54000, 36000, 32000,
  28000, 24000, 28000, 28000, 34000, 28000,
  22000, 18000,
  8.2, 8.6, 8.0, 8.8, 8.4, 8.0, 8.6,
  32, 13, 55,
  'Mediterranean. Hot dry summers (Jul–Aug 32°C+), mild winters (13–16°C). 300+ days of sunshine per year. Among the warmest and sunniest cities in continental Europe.',
  '[
    {"name":"Centro Histórico","vibe":"Old town, Picasso museum, tapas","avgRent":1200,"goodFor":["culture","walkability","short stays"]},
    {"name":"Soho / Muelle Uno","vibe":"Trendy, waterfront, tech workers","avgRent":1350,"goodFor":["remote workers","nightlife","young professionals"]},
    {"name":"Teatinos / Ciudad Jardín","vibe":"University area, affordable, local","avgRent":800,"goodFor":["budget-conscious","families","long-term"]},
    {"name":"Pedregalejo / El Palo","vibe":"Beachside, local fishermen, quieter","avgRent":950,"goodFor":["beach life","retirees","lifestyle movers"]}
  ]'::jsonb,
  'Spain Digital Nomad Visa (DNV): 1-year initial + 2-year renewals (up to 5 years). Non-EU nationals must prove income ≥200% Spanish minimum wage (~€2,750/mo). Beckham Law: flat 24% income tax for first 6 years (vs up to 47% standard).',
  'https://www.inclusion.gob.es/web/migraciones/w/visa-para-teletrabajo-de-caracter-internacional',
  0.24, 'Beckham Law (Ley Beckham) flat rate for qualifying non-EU workers; standard progressive rate up to 47%',
  8.4, '2026-05-30',
  'Numbeo Málaga May 2026; Expatistan Q1 2026; Spain MITMA; InterNations 2025; Málaga Tech Park data'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. TBILISI, GEORGIA  (GEL)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'tbilisi', 'Tbilisi', 'georgia', 'Georgia', '🇬🇪',
  'Europe', 'Georgian / English', 'GEL', 'Asia/Tbilisi', '1,200,000',
  'A year visa-free. Sulphur baths. Rent that makes Lisbon look expensive.',
  41.6938, 44.8015
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'tbilisi'),
  1750, 900, 600, 50, 40, 250, 60, 450,
  36000, 60000, 18000, 42000, 42000, 36000,
  36000, 30000, 36000, 48000, 28000, 24000,
  18000, 14000, 20000, 20000, 24000, 20000,
  16000, 14000,
  7.4, 7.4, 6.2, 7.8, 7.8, 8.8, 8.6,
  34, 3, 100,
  'Continental / humid subtropical. Hot dry summers (34–36°C Jul–Aug), cold winters (0–5°C Jan). Spring and autumn are ideal. Snow possible Dec–Feb.',
  '[
    {"name":"Vera / Vake","vibe":"Upscale, embassies, cafés, parks","avgRent":2000,"goodFor":["professionals","families","Western amenities"]},
    {"name":"Saburtalo","vibe":"Modern residential, expat-heavy post-2022","avgRent":1800,"goodFor":["remote workers","long-term expats","coworking"]},
    {"name":"Old Town (Abanotubani)","vibe":"Historic, tourists, sulphur baths","avgRent":2200,"goodFor":["culture seekers","short stays"]},
    {"name":"Gldani / Didi Dighomi","vibe":"Affordable, local, residential","avgRent":900,"goodFor":["budget-conscious","long-term residents"]}
  ]'::jsonb,
  'Visa-free stays of up to 365 days per year for EU, UK, US, and most other passport holders — no registration required. For those wanting formal residency, the Financially Independent Person permit is available. No digital nomad visa needed.',
  'https://www.geoconsul.gov.ge',
  0.20, 'Flat 20% personal income tax. Foreign-sourced income is technically taxable if you become tax resident (183+ days). Many expats structure affairs to avoid this — consult a local accountant.',
  8.0, '2026-05-30',
  'Numbeo Tbilisi May 2026; Expatistan Q1 2026; Georgia NAPR; InterNations 2025; NomadList Tbilisi 2025'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. BUENOS AIRES, ARGENTINA  (USD — expat pricing)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'buenos-aires', 'Buenos Aires', 'argentina', 'Argentina', '🇦🇷',
  'Americas', 'Spanish', 'USD', 'America/Argentina/Buenos_Aires', '15,100,000',
  'Paris architecture. Palermo rents. The steak is not a cliché.',
  -34.6037, -58.3816
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'buenos-aires'),
  600, 380, 350, 30, 20, 80, 25, 180,
  24000, 36000, 14400, 28800, 28800, 24000,
  24000, 19200, 24000, 30000, 18000, 15600,
  13200, 9600, 12000, 12000, 15600, 12000,
  9600, 8400,
  7.2, 5.8, 7.4, 7.4, 9.0, 9.4, 8.0,
  30, 12, 125,
  'Humid subtropical — southern hemisphere. Hot summers (Dec–Feb, 28–32°C), mild winters (Jun–Aug, 8–14°C). Rainy year-round but moderate. Spring (Sep–Nov) and autumn (Mar–May) are the best seasons.',
  '[
    {"name":"Palermo / Soho","vibe":"Trendy, expats, cafés, nightlife, parks","avgRent":700,"goodFor":["remote workers","nightlife","dining"]},
    {"name":"Recoleta","vibe":"Upscale, museums, European feel","avgRent":750,"goodFor":["professionals","culture","fine dining"]},
    {"name":"San Telmo","vibe":"Bohemian, tango, markets, artsy","avgRent":550,"goodFor":["creatives","culture seekers","budget"]},
    {"name":"Belgrano","vibe":"Residential, families, embassies","avgRent":600,"goodFor":["families","long-term expats"]}
  ]'::jsonb,
  'Argentina Digital Nomad Visa: min. $1,500 USD/month income. Initial 6-month stay with 6-month extension. Alternatively, Rentista Visa for passive income earners (min. $2,500/mo). 90-day visa-free entry for EU/UK/US/CA nationals.',
  'https://cancilleria.gob.ar',
  0.25, 'Expats on foreign income: Argentine progressive scale 5–35%. Many structure via tourist visa extensions to minimize local tax exposure — consult local accountant.',
  7.8, '2026-05-30',
  'Numbeo Buenos Aires May 2026; Expatistan Q1 2026; Argentina MRE; InterNations 2025; NomadList Buenos Aires 2025'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. TALLINN, ESTONIA  (EUR)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'tallinn', 'Tallinn', 'estonia', 'Estonia', '🇪🇪',
  'Europe', 'Estonian / English', 'EUR', 'Europe/Tallinn', '450,000',
  'The city that invented the digital nomad visa. Medieval walls. Gigabit Wi-Fi.',
  59.4370, 24.7536
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'tallinn'),
  900, 620, 380, 40, 55, 160, 35, 280,
  42000, 72000, 24000, 48000, 48000, 42000,
  42000, 36000, 40000, 54000, 36000, 30000,
  26000, 20000, 28000, 28000, 34000, 28000,
  24000, 18000,
  8.0, 8.8, 7.6, 9.4, 8.6, 7.4, 8.8,
  22, -4, 175,
  'Humid continental. Warm summers (22°C Jul, max 28°C), cold dark winters (-4°C Jan, snow Dec–Feb). Long summer days (18h+). Very short spring and autumn.',
  '[
    {"name":"Kesklinn (City Centre)","vibe":"Business district, modern, convenient","avgRent":980,"goodFor":["professionals","short stays","convenience"]},
    {"name":"Kalamaja","vibe":"Hip, creative, wooden houses, cafés","avgRent":850,"goodFor":["remote workers","creatives","community"]},
    {"name":"Telliskivi / Ülemiste","vibe":"Creative cluster, tech offices, Lift99","avgRent":820,"goodFor":["tech workers","startup scene","coworking"]},
    {"name":"Kadriorg / Pirita","vibe":"Residential, park, beach, families","avgRent":750,"goodFor":["families","nature","quieter living"]}
  ]'::jsonb,
  'Estonia Digital Nomad Visa: up to 1 year (18 months total with extension). Must prove income ≥€4,500/mo gross for previous 6 months. Apply through Estonian Police and Border Guard Board. e-Residency available separately for business registration.',
  'https://www.politsei.ee/en/instructions/digital-nomad-visa',
  0.22, 'Flat 22% personal income tax. If you become Estonian tax resident (183+ days) worldwide income is taxable. Many use DNV without becoming tax resident.',
  8.2, '2026-05-30',
  'Numbeo Tallinn May 2026; Expatistan Q1 2026; Estonia PBGB; InterNations 2025; e-Estonia data'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. DA NANG, VIETNAM  (VND)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cities (
  id, slug, name, country_slug, country_name, flag_emoji,
  continent, language, currency, timezone, population,
  tagline, latitude, longitude
) VALUES (
  gen_random_uuid(), 'da-nang', 'Da Nang', 'vietnam', 'Vietnam', '🇻🇳',
  'Asia', 'Vietnamese', 'VND', 'Asia/Ho_Chi_Minh', '1,200,000',
  'Bali prices. Beach. Better internet than most of Europe.',
  16.0544, 108.2022
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO city_data (
  id, city_id,
  cost_rent_city_centre, cost_rent_outside, cost_groceries_monthly,
  cost_transport_monthly, cost_eating_out, cost_utilities_monthly,
  cost_gym_monthly, cost_coworking_monthly,
  salary_software_engineer, salary_doctor, salary_nurse,
  salary_data_scientist, salary_product_manager, salary_devops,
  salary_cybersecurity, salary_ux_designer, salary_financial_analyst,
  salary_lawyer, salary_architect, salary_civil_engineer,
  salary_pharmacist, salary_teacher, salary_accountant,
  salary_hr_manager, salary_sales_manager, salary_marketing_manager,
  salary_electrician, salary_chef,
  score_quality_of_life, score_safety, score_healthcare,
  score_internet_speed, score_walkability, score_nightlife,
  score_expat_friendliness,
  climate_summer_avg_c, climate_winter_avg_c, climate_rainy_days_per_year,
  climate_description,
  neighbourhoods,
  visa_notes, visa_official_url, income_tax_rate_mid, local_tax_note,
  move_score, last_verified, data_sources
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'da-nang'),
  9000000, 5500000, 3500000, 600000, 250000, 1000000, 400000, 2000000,
  180000000, 360000000, 120000000, 210000000, 210000000, 180000000,
  180000000, 150000000, 180000000, 240000000, 150000000, 126000000,
  108000000, 84000000, 108000000, 108000000, 132000000, 108000000,
  78000000, 66000000,
  8.0, 8.6, 6.4, 8.8, 6.4, 7.2, 8.6,
  35, 20, 175,
  'Tropical monsoon. Two distinct seasons: hot-dry (Apr–Aug, 33–35°C, sunny beach weather) and cool-wet (Sep–Feb, 20–25°C, occasional rain). Typhoon risk Oct–Nov.',
  '[
    {"name":"My An / Bac My An","vibe":"Beach road, expats, cafés, coworking","avgRent":10000000,"goodFor":["remote workers","beach life","expat community"]},
    {"name":"Hai Chau (City Centre)","vibe":"Urban core, markets, local life","avgRent":8000000,"goodFor":["local experience","budget","short stays"]},
    {"name":"An Thuong","vibe":"Western restaurants, bars, English signage","avgRent":9000000,"goodFor":["short-term expats","nightlife","comfort"]},
    {"name":"Ngu Hanh Son (Marble Mountains)","vibe":"Quiet, suburb, near beach, affordable","avgRent":6000000,"goodFor":["families","long-term stays","budget"]}
  ]'::jsonb,
  'E-visa valid 90 days (single or multiple entry) for 80+ nationalities. Visa-free 45 days for UK, EU, and many others (as of 2023 expansion). No dedicated digital nomad visa — most use tourist extensions or business visas. DND (Danang Digital Hub) initiative underway.',
  'https://evisa.xuatnhapcanh.gov.vn',
  0.20, 'Foreign income earned abroad and not remitted to Vietnam is generally not taxed. Vietnamese progressive scale 5–35% on locally-earned income.',
  8.4, '2026-05-30',
  'Numbeo Da Nang May 2026; Expatistan Q1 2026; Vietnam Immigration; InterNations 2025; NomadList Da Nang 2025'
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- Done. 12 cities + 12 city_data rows inserted.
-- Verify with: SELECT slug, name FROM cities ORDER BY name;
-- =============================================================================