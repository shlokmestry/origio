"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_H = 64; // fixed nav height + buffer

// ─── Remote-friendly data ─────────────────────────────────────────────────────
const REMOTE_DATA: Record<string, { stars: number; badge: string }> = {
  AE: { stars: 5, badge: "0% tax · Nomad Visa" },
  PT: { stars: 4, badge: "NHR scheme · D8 Visa" },
  SG: { stars: 4, badge: "Low tax · fast internet" },
  IE: { stars: 3, badge: "EU · English · tech hub" },
  NL: { stars: 3, badge: "30% expat ruling · EU" },
};

// ─── FX rates to USD ──────────────────────────────────────────────────────────
const FX_TO_USD: Record<string, number> = {
  UK: 1.27,  US: 1.0,   CA: 0.74,  AU: 0.66,
  DE: 1.09,  IE: 1.09,  NL: 1.09,  SG: 0.74,
  AE: 0.27,  PT: 1.09,
  // 2025/2026 additions
  MX: 0.058, TH: 0.028, GR: 1.08,  CO: 0.00024,
  PA: 1.0,   KR: 0.00074, CZ: 0.044, GE: 0.37,
  VN: 0.000039, HR: 1.08, CR: 0.0019, PL: 0.25,
  // Original 25 countries
  AT: 1.09,  BE: 1.09,  BR: 0.19,  DK: 0.145,
  FI: 1.09,  FR: 1.09,  IN: 0.012, IT: 1.09,
  JP: 0.0067, MY: 0.22, NZ: 0.61,  NO: 0.093,
  ES: 1.09,  SE: 0.094, CH: 1.13,
};

// ─── Tax Data ─────────────────────────────────────────────────────────────────
const TAX_DATA = {
  UK: { currency:"GBP", symbol:"£",   usdSymbol:"$", name:"United Kingdom",       flag:"🇬🇧",
    personalAllowance:12570,
    bands:[{min:0,max:12570,rate:0},{min:12570,max:50270,rate:.20},{min:50270,max:125140,rate:.40},{min:125140,max:Infinity,rate:.45}],
    ni:{threshold:12570,upperLimit:50270,lowerRate:.08,upperRate:.02} },
  US: { currency:"USD", symbol:"$",   usdSymbol:"$", name:"United States",        flag:"🇺🇸",
    standardDeduction:14600,
    bands:[{min:0,max:11925,rate:.10},{min:11925,max:48475,rate:.12},{min:48475,max:103350,rate:.22},{min:103350,max:197300,rate:.24},{min:197300,max:250525,rate:.32},{min:250525,max:626350,rate:.35},{min:626350,max:Infinity,rate:.37}],
    fica:{socialSecurityRate:.062,socialSecurityCap:168600,medicareRate:.0145,additionalMedicareRate:.009,additionalMedicareThreshold:200000} },
  CA: { currency:"CAD", symbol:"CA$", usdSymbol:"$", name:"Canada",               flag:"🇨🇦",
    personalAmount:15705,
    bands:[{min:0,max:57375,rate:.145},{min:57375,max:114750,rate:.205},{min:114750,max:158519,rate:.26},{min:158519,max:220000,rate:.29},{min:220000,max:Infinity,rate:.33}],
    provincialRate:.11, cpp:{exemption:3500,ceiling:68500,rate:.0595} },
  AU: { currency:"AUD", symbol:"A$",  usdSymbol:"$", name:"Australia",            flag:"🇦🇺",
    bands:[{min:0,max:18200,rate:0},{min:18200,max:45000,rate:.19},{min:45000,max:120000,rate:.325},{min:120000,max:180000,rate:.37},{min:180000,max:Infinity,rate:.45}],
    medicare:.02, medicareThreshold:26000 },
  DE: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Germany",              flag:"🇩🇪",
    bands:[{min:0,max:11604,rate:0},{min:11604,max:66761,rate:.14},{min:66761,max:277826,rate:.42},{min:277826,max:Infinity,rate:.45}],
    socialSecurity:{health:.0735,pension:.093,unemployment:.013,nursing:.017}, solidaritySurcharge:.055 },
  IE: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Ireland",              flag:"🇮🇪",
    bands:[{min:0,max:42000,rate:.20},{min:42000,max:Infinity,rate:.40}],
    usc:[{min:0,max:12012,rate:.005},{min:12012,max:25760,rate:.02},{min:25760,max:70044,rate:.04},{min:70044,max:Infinity,rate:.08}],
    prsi:.04, taxCredit:3550 },
  NL: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Netherlands",          flag:"🇳🇱",
    bands:[{min:0,max:75518,rate:.3693},{min:75518,max:Infinity,rate:.495}],
    generalCredit:3070 },
  SG: { currency:"SGD", symbol:"S$",  usdSymbol:"$", name:"Singapore",            flag:"🇸🇬",
    bands:[{min:0,max:20000,rate:0},{min:20000,max:30000,rate:.02},{min:30000,max:40000,rate:.035},{min:40000,max:80000,rate:.07},{min:80000,max:120000,rate:.115},{min:120000,max:160000,rate:.15},{min:160000,max:200000,rate:.18},{min:200000,max:240000,rate:.19},{min:240000,max:280000,rate:.195},{min:280000,max:320000,rate:.20},{min:320000,max:Infinity,rate:.22}],
    cpf:.20 },
  AE: { currency:"AED", symbol:"AED ",usdSymbol:"$", name:"United Arab Emirates", flag:"🇦🇪", bands:[] },
  PT: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Portugal",             flag:"🇵🇹",
    bands:[{min:0,max:7703,rate:.1325},{min:7703,max:11623,rate:.18},{min:11623,max:16472,rate:.23},{min:16472,max:21321,rate:.26},{min:21321,max:27146,rate:.3275},{min:27146,max:39791,rate:.37},{min:39791,max:51997,rate:.435},{min:51997,max:81199,rate:.45},{min:81199,max:Infinity,rate:.48}],
    socialSecurity:.11 },
  MX: { currency:"MXN", symbol:"MX$", usdSymbol:"$", name:"Mexico",               flag:"🇲🇽",
    bands:[{min:0,max:8952,rate:0},{min:8952,max:75984,rate:.0192},{min:75984,max:133536,rate:.064},{min:133536,max:155229,rate:.1088},{min:155229,max:185852,rate:.16},{min:185852,max:374838,rate:.1792},{min:374838,max:590796,rate:.2136},{min:590796,max:1127927,rate:.2352},{min:1127927,max:1503902,rate:.30},{min:1503902,max:4511707,rate:.32},{min:4511707,max:Infinity,rate:.35}],
    socialSecurity:.08 },
  TH: { currency:"THB", symbol:"฿",   usdSymbol:"$", name:"Thailand",             flag:"🇹🇭",
    personalDeduction:150000,
    bands:[{min:0,max:150000,rate:0},{min:150000,max:300000,rate:.05},{min:300000,max:500000,rate:.10},{min:500000,max:750000,rate:.15},{min:750000,max:1000000,rate:.20},{min:1000000,max:2000000,rate:.25},{min:2000000,max:5000000,rate:.30},{min:5000000,max:Infinity,rate:.35}],
    socialSecurity:.05 },
  GR: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Greece",               flag:"🇬🇷",
    bands:[{min:0,max:10000,rate:.09},{min:10000,max:20000,rate:.22},{min:20000,max:30000,rate:.28},{min:30000,max:40000,rate:.36},{min:40000,max:Infinity,rate:.44}],
    socialSecurity:.16 },
  CO: { currency:"COP", symbol:"COP ",usdSymbol:"$", name:"Colombia",              flag:"🇨🇴",
    bands:[{min:0,max:51322000,rate:0},{min:51322000,max:80071000,rate:.19},{min:80071000,max:193063000,rate:.28},{min:193063000,max:408260000,rate:.33},{min:408260000,max:Infinity,rate:.35}],
    socialSecurity:.08 },
  PA: { currency:"USD", symbol:"B/.", usdSymbol:"$", name:"Panama",               flag:"🇵🇦",
    bands:[{min:0,max:11000,rate:0},{min:11000,max:50000,rate:.15},{min:50000,max:Infinity,rate:.25}],
    socialSecurity:.0975 },
  KR: { currency:"KRW", symbol:"₩",  usdSymbol:"$", name:"South Korea",           flag:"🇰🇷",
    bands:[{min:0,max:14000000,rate:.06},{min:14000000,max:50000000,rate:.15},{min:50000000,max:88000000,rate:.24},{min:88000000,max:150000000,rate:.35},{min:150000000,max:300000000,rate:.38},{min:300000000,max:500000000,rate:.40},{min:500000000,max:Infinity,rate:.42}],
    socialSecurity:.09 },
  CZ: { currency:"CZK", symbol:"Kč", usdSymbol:"$", name:"Czech Republic",        flag:"🇨🇿",
    bands:[{min:0,max:1762812,rate:.15},{min:1762812,max:Infinity,rate:.23}],
    socialSecurity:.11 },
  GE: { currency:"GEL", symbol:"₾",  usdSymbol:"$", name:"Georgia",               flag:"🇬🇪",
    bands:[{min:0,max:Infinity,rate:.20}],
    socialSecurity:.02 },
  VN: { currency:"VND", symbol:"₫",  usdSymbol:"$", name:"Vietnam",               flag:"🇻🇳",
    personalDeduction:132000000,
    bands:[{min:0,max:60000000,rate:.05},{min:60000000,max:120000000,rate:.10},{min:120000000,max:216000000,rate:.15},{min:216000000,max:384000000,rate:.20},{min:384000000,max:624000000,rate:.25},{min:624000000,max:960000000,rate:.30},{min:960000000,max:Infinity,rate:.35}],
    socialSecurity:.105 },
  HR: { currency:"EUR", symbol:"€",  usdSymbol:"$", name:"Croatia",               flag:"🇭🇷",
    bands:[{min:0,max:50400,rate:.236},{min:50400,max:Infinity,rate:.354}],
    socialSecurity:.20 },
  CR: { currency:"CRC", symbol:"₡",  usdSymbol:"$", name:"Costa Rica",            flag:"🇨🇷",
    bands:[{min:0,max:10996000,rate:0},{min:10996000,max:16494000,rate:.10},{min:16494000,max:27490000,rate:.15},{min:27490000,max:56725000,rate:.20},{min:56725000,max:Infinity,rate:.25}],
    socialSecurity:.1067 },
  PL: { currency:"PLN", symbol:"zł", usdSymbol:"$", name:"Poland",               flag:"🇵🇱",
    taxFreeAmount:30000,
    bands:[{min:0,max:120000,rate:.12},{min:120000,max:Infinity,rate:.32}],
    socialSecurity:.1371, healthInsurance:.09 },
  AT: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Austria",             flag:"🇦🇹",
    bands:[{min:0,max:12756,rate:0},{min:12756,max:20818,rate:.20},{min:20818,max:34513,rate:.30},{min:34513,max:66612,rate:.40},{min:66612,max:99266,rate:.48},{min:99266,max:1000000,rate:.50},{min:1000000,max:Infinity,rate:.55}],
    socialSecurity:.18 },
  BE: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Belgium",             flag:"🇧🇪",
    bands:[{min:0,max:15200,rate:.25},{min:15200,max:26830,rate:.40},{min:26830,max:46440,rate:.45},{min:46440,max:Infinity,rate:.50}],
    socialSecurity:.1307 },
  BR: { currency:"BRL", symbol:"R$",  usdSymbol:"$", name:"Brazil",              flag:"🇧🇷",
    bands:[{min:0,max:28559,rate:0},{min:28559,max:42750,rate:.075},{min:42750,max:57167,rate:.15},{min:57167,max:71469,rate:.225},{min:71469,max:Infinity,rate:.275}],
    socialSecurity:.09 },
  DK: { currency:"DKK", symbol:"kr",  usdSymbol:"$", name:"Denmark",             flag:"🇩🇰",
    bands:[{min:0,max:50543,rate:.1264},{min:50543,max:571459,rate:.4264},{min:571459,max:Infinity,rate:.5664}],
    amContrib:.08 },
  FI: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Finland",             flag:"🇫🇮",
    bands:[{min:0,max:19900,rate:.1264},{min:19900,max:29700,rate:.19},{min:29700,max:49000,rate:.3025},{min:49000,max:85800,rate:.3425},{min:85800,max:Infinity,rate:.4425}],
    socialSecurity:.0760 },
  FR: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"France",              flag:"🇫🇷",
    bands:[{min:0,max:11294,rate:0},{min:11294,max:28797,rate:.11},{min:28797,max:82341,rate:.30},{min:82341,max:177106,rate:.41},{min:177106,max:Infinity,rate:.45}],
    socialSecurity:.22 },
  IN: { currency:"INR", symbol:"₹",   usdSymbol:"$", name:"India",               flag:"🇮🇳",
    standardDeduction:75000,
    bands:[{min:0,max:300000,rate:0},{min:300000,max:700000,rate:.05},{min:700000,max:1000000,rate:.10},{min:1000000,max:1200000,rate:.15},{min:1200000,max:1500000,rate:.20},{min:1500000,max:Infinity,rate:.30}],
    socialSecurity:.12 },
  IT: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Italy",               flag:"🇮🇹",
    bands:[{min:0,max:28000,rate:.23},{min:28000,max:50000,rate:.35},{min:50000,max:Infinity,rate:.43}],
    socialSecurity:.0919 },
  JP: { currency:"JPY", symbol:"¥",   usdSymbol:"$", name:"Japan",               flag:"🇯🇵",
    basicDeduction:480000,
    bands:[{min:0,max:1950000,rate:.05},{min:1950000,max:3300000,rate:.10},{min:3300000,max:6950000,rate:.20},{min:6950000,max:9000000,rate:.23},{min:9000000,max:18000000,rate:.33},{min:18000000,max:40000000,rate:.40},{min:40000000,max:Infinity,rate:.45}],
    socialSecurity:.1482, residentTaxRate:.10 },
  MY: { currency:"MYR", symbol:"RM",  usdSymbol:"$", name:"Malaysia",            flag:"🇲🇾",
    bands:[{min:0,max:5000,rate:0},{min:5000,max:20000,rate:.01},{min:20000,max:35000,rate:.03},{min:35000,max:50000,rate:.08},{min:50000,max:70000,rate:.13},{min:70000,max:100000,rate:.21},{min:100000,max:400000,rate:.24},{min:400000,max:600000,rate:.245},{min:600000,max:2000000,rate:.25},{min:2000000,max:Infinity,rate:.30}],
    epfEmployee:.11 },
  NZ: { currency:"NZD", symbol:"NZ$", usdSymbol:"$", name:"New Zealand",         flag:"🇳🇿",
    bands:[{min:0,max:14000,rate:.105},{min:14000,max:48000,rate:.175},{min:48000,max:70000,rate:.30},{min:70000,max:180000,rate:.33},{min:180000,max:Infinity,rate:.39}],
    acc:.0139 },
  NO: { currency:"NOK", symbol:"kr",  usdSymbol:"$", name:"Norway",              flag:"🇳🇴",
    bands:[{min:0,max:208050,rate:.22},{min:208050,max:292850,rate:.222},{min:292850,max:670000,rate:.228},{min:670000,max:937900,rate:.256},{min:937900,max:Infinity,rate:.276}],
    socialSecurity:.079 },
  ES: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Spain",               flag:"🇪🇸",
    bands:[{min:0,max:12450,rate:.19},{min:12450,max:20200,rate:.24},{min:20200,max:35200,rate:.30},{min:35200,max:60000,rate:.37},{min:60000,max:300000,rate:.45},{min:300000,max:Infinity,rate:.47}],
    socialSecurity:.064 },
  SE: { currency:"SEK", symbol:"kr",  usdSymbol:"$", name:"Sweden",              flag:"🇸🇪",
    bands:[{min:0,max:614000,rate:.32},{min:614000,max:Infinity,rate:.52}],
    socialSecurity:.07 },
  CH: { currency:"CHF", symbol:"CHF ",usdSymbol:"$", name:"Switzerland",         flag:"🇨🇭",
    bands:[{min:0,max:14500,rate:0},{min:14500,max:31600,rate:.077},{min:31600,max:41400,rate:.088},{min:41400,max:55200,rate:.11},{min:55200,max:72500,rate:.132},{min:72500,max:78100,rate:.132},{min:78100,max:103600,rate:.165},{min:103600,max:134600,rate:.175},{min:134600,max:176000,rate:.175},{min:176000,max:755200,rate:.1954},{min:755200,max:Infinity,rate:.1954}],
    socialSecurity:.065, cantonal:.08 },
};

const ALL_COUNTRY_KEYS = Object.keys(TAX_DATA) as (keyof typeof TAX_DATA)[];

// ─── Salary data (median gross, local currency, 2025 market rates) ────────────
const ROLE_SALARIES: Record<string, Record<string, number>> = {
  "Software Engineer":         { UK:75000,  US:130000, CA:110000, AU:120000, DE:72000,  IE:80000,  NL:75000,  SG:95000,  AE:280000, PT:35000,  MX:580000,   TH:1130000,  GR:35000,  CO:72000000,  PA:55000, KR:85000000,  CZ:1200000,  GE:70000,  VN:600000000,  HR:42000,  CR:28000000,  PL:180000,  AT:65000,  BE:72000,  BR:180000, DK:620000, FI:68000,  FR:52000,  IN:1800000, IT:40000,  JP:8000000,  MY:108000, NZ:110000, NO:780000, ES:42000,  SE:680000, CH:145000 },
  "Product Manager":           { UK:85000,  US:145000, CA:120000, AU:130000, DE:80000,  IE:90000,  NL:85000,  SG:110000, AE:320000, PT:40000,  MX:680000,   TH:1400000,  GR:42000,  CO:90000000,  PA:65000, KR:100000000, CZ:1400000,  GE:85000,  VN:750000000,  HR:50000,  CR:35000000,  PL:210000,  AT:76000,  BE:82000,  BR:200000, DK:720000, FI:76000,  FR:62000,  IN:2200000, IT:48000,  JP:9500000,  MY:130000, NZ:120000, NO:900000, ES:50000,  SE:790000, CH:170000 },
  "UX/UI Designer":            { UK:55000,  US:95000,  CA:85000,  AU:90000,  DE:58000,  IE:60000,  NL:60000,  SG:72000,  AE:200000, PT:28000,  MX:400000,   TH:840000,   GR:28000,  CO:55000000,  PA:45000, KR:68000000,  CZ:900000,   GE:50000,  VN:420000000,  HR:32000,  CR:21000000,  PL:130000,  AT:50000,  BE:55000,  BR:130000, DK:520000, FI:55000,  FR:44000,  IN:1200000, IT:30000,  JP:6500000,  MY:84000,  NZ:88000,  NO:620000, ES:35000,  SE:580000, CH:118000 },
  "Data Scientist":            { UK:70000,  US:125000, CA:105000, AU:110000, DE:70000,  IE:75000,  NL:72000,  SG:90000,  AE:260000, PT:32000,  MX:540000,   TH:1050000,  GR:34000,  CO:68000000,  PA:52000, KR:82000000,  CZ:1150000,  GE:65000,  VN:560000000,  HR:40000,  CR:26000000,  PL:170000,  AT:63000,  BE:70000,  BR:170000, DK:600000, FI:66000,  FR:52000,  IN:1700000, IT:38000,  JP:8500000,  MY:105000, NZ:105000, NO:760000, ES:42000,  SE:660000, CH:140000 },
  "DevOps Engineer":           { UK:72000,  US:128000, CA:108000, AU:115000, DE:74000,  IE:78000,  NL:76000,  SG:92000,  AE:270000, PT:33000,  MX:560000,   TH:1100000,  GR:36000,  CO:75000000,  PA:57000, KR:88000000,  CZ:1250000,  GE:72000,  VN:620000000,  HR:43000,  CR:29000000,  PL:185000,  AT:66000,  BE:73000,  BR:175000, DK:630000, FI:68000,  FR:54000,  IN:1900000, IT:40000,  JP:8800000,  MY:110000, NZ:108000, NO:780000, ES:44000,  SE:680000, CH:142000 },
  "Marketing Manager":         { UK:52000,  US:85000,  CA:75000,  AU:85000,  DE:55000,  IE:58000,  NL:58000,  SG:75000,  AE:200000, PT:25000,  MX:420000,   TH:700000,   GR:28000,  CO:48000000,  PA:48000, KR:60000000,  CZ:850000,   GE:45000,  VN:360000000,  HR:34000,  CR:16000000,  PL:110000,  AT:48000,  BE:55000,  BR:120000, DK:480000, FI:52000,  FR:42000,  IN:1000000, IT:30000,  JP:7000000,  MY:78000,  NZ:82000,  NO:600000, ES:32000,  SE:540000, CH:110000 },
  "Financial Analyst":         { UK:58000,  US:90000,  CA:78000,  AU:88000,  DE:60000,  IE:62000,  NL:62000,  SG:78000,  AE:220000, PT:26000,  MX:360000,   TH:780000,   GR:30000,  CO:45000000,  PA:50000, KR:65000000,  CZ:900000,   GE:48000,  VN:380000000,  HR:36000,  CR:18000000,  PL:120000,  AT:52000,  BE:58000,  BR:130000, DK:520000, FI:55000,  FR:44000,  IN:900000,  IT:32000,  JP:7500000,  MY:84000,  NZ:88000,  NO:640000, ES:36000,  SE:560000, CH:115000 },
  "Cybersecurity Analyst":     { UK:68000,  US:115000, CA:95000,  AU:105000, DE:68000,  IE:72000,  NL:70000,  SG:85000,  AE:250000, PT:30000,  MX:500000,   TH:980000,   GR:33000,  CO:65000000,  PA:54000, KR:78000000,  CZ:1100000,  GE:62000,  VN:520000000,  HR:40000,  CR:25000000,  PL:160000,  AT:61000,  BE:68000,  BR:160000, DK:580000, FI:63000,  FR:50000,  IN:1600000, IT:36000,  JP:8200000,  MY:100000, NZ:100000, NO:730000, ES:40000,  SE:630000, CH:130000 },
  "Sales Manager":             { UK:65000,  US:110000, CA:90000,  AU:100000, DE:65000,  IE:68000,  NL:65000,  SG:85000,  AE:240000, PT:28000,  MX:380000,   TH:800000,   GR:30000,  CO:50000000,  PA:52000, KR:64000000,  CZ:880000,   GE:46000,  VN:380000000,  HR:34000,  CR:17000000,  PL:120000,  AT:58000,  BE:64000,  BR:140000, DK:560000, FI:58000,  FR:46000,  IN:1000000, IT:32000,  JP:7200000,  MY:86000,  NZ:90000,  NO:680000, ES:36000,  SE:580000, CH:118000 },
  "HR Manager":                { UK:50000,  US:80000,  CA:72000,  AU:80000,  DE:52000,  IE:55000,  NL:55000,  SG:70000,  AE:190000, PT:24000,  MX:300000,   TH:660000,   GR:26000,  CO:40000000,  PA:42000, KR:55000000,  CZ:780000,   GE:38000,  VN:300000000,  HR:30000,  CR:14000000,  PL:100000,  AT:45000,  BE:50000,  BR:110000, DK:450000, FI:48000,  FR:38000,  IN:800000,  IT:28000,  JP:6000000,  MY:72000,  NZ:76000,  NO:580000, ES:28000,  SE:500000, CH:100000 },
  "AI / ML Engineer":          { UK:90000,  US:185000, CA:150000, AU:155000, DE:95000,  IE:100000, NL:92000,  SG:150000, AE:350000, PT:42000,  MX:720000,   TH:1600000,  GR:44000,  CO:100000000, PA:75000, KR:120000000, CZ:1600000,  GE:95000,  VN:900000000,  HR:55000,  CR:42000000,  PL:250000,  AT:82000,  BE:90000,  BR:220000, DK:800000, FI:85000,  FR:72000,  IN:2800000, IT:55000,  JP:11000000, MY:155000, NZ:148000, NO:1000000,ES:58000,  SE:860000, CH:185000 },
  "Cloud Architect":           { UK:85000,  US:170000, CA:140000, AU:148000, DE:90000,  IE:95000,  NL:88000,  SG:135000, AE:325000, PT:38000,  MX:680000,   TH:1500000,  GR:42000,  CO:95000000,  PA:70000, KR:110000000, CZ:1500000,  GE:88000,  VN:840000000,  HR:52000,  CR:38000000,  PL:230000,  AT:78000,  BE:85000,  BR:210000, DK:760000, FI:80000,  FR:68000,  IN:2500000, IT:52000,  JP:10500000, MY:145000, NZ:140000, NO:950000, ES:55000,  SE:820000, CH:175000 },
  "Dentist":                   { UK:82000,  US:180000, CA:165000, AU:175000, DE:80000,  IE:100000, NL:100000, SG:160000, AE:330000, PT:40000,  MX:600000,   TH:1800000,  GR:50000,  CO:80000000,  PA:80000, KR:130000000, CZ:1500000,  GE:80000,  VN:700000000,  HR:60000,  CR:45000000,  PL:200000,  AT:75000,  BE:90000,  BR:200000, DK:700000, FI:78000,  FR:70000,  IN:1800000, IT:55000,  JP:11000000, MY:140000, NZ:150000, NO:880000, ES:50000,  SE:760000, CH:180000 },
  "Physiotherapist":           { UK:43000,  US:82000,  CA:85000,  AU:90000,  DE:47000,  IE:52000,  NL:52000,  SG:68000,  AE:160000, PT:24000,  MX:280000,   TH:600000,   GR:26000,  CO:38000000,  PA:38000, KR:48000000,  CZ:700000,   GE:30000,  VN:240000000,  HR:28000,  CR:12000000,  PL:90000,   AT:40000,  BE:46000,  BR:100000, DK:420000, FI:42000,  FR:35000,  IN:600000,  IT:30000,  JP:5500000,  MY:55000,  NZ:82000,  NO:520000, ES:28000,  SE:470000, CH:90000  },
  "Psychologist":              { UK:46000,  US:95000,  CA:85000,  AU:95000,  DE:52000,  IE:57000,  NL:56000,  SG:70000,  AE:185000, PT:28000,  MX:300000,   TH:720000,   GR:28000,  CO:42000000,  PA:42000, KR:52000000,  CZ:800000,   GE:35000,  VN:280000000,  HR:32000,  CR:14000000,  PL:100000,  AT:44000,  BE:50000,  BR:110000, DK:460000, FI:48000,  FR:40000,  IN:700000,  IT:32000,  JP:6200000,  MY:62000,  NZ:88000,  NO:560000, ES:30000,  SE:510000, CH:100000 },
  "Renewable Energy Engineer": { UK:68000,  US:112000, CA:108000, AU:122000, DE:73000,  IE:67000,  NL:72000,  SG:92000,  AE:255000, PT:37000,  MX:480000,   TH:1050000,  GR:36000,  CO:60000000,  PA:55000, KR:80000000,  CZ:1100000,  GE:60000,  VN:520000000,  HR:42000,  CR:24000000,  PL:155000,  AT:62000,  BE:68000,  BR:155000, DK:580000, FI:64000,  FR:52000,  IN:1400000, IT:40000,  JP:8000000,  MY:95000,  NZ:105000, NO:720000, ES:42000,  SE:620000, CH:130000 },
  "Pilot":                     { UK:90000,  US:170000, CA:145000, AU:150000, DE:95000,  IE:85000,  NL:100000, SG:165000, AE:450000, PT:65000,  MX:900000,   TH:3200000,  GR:65000,  CO:180000000, PA:120000,KR:180000000, CZ:2500000,  GE:160000, VN:1800000000, HR:80000,  CR:70000000,  PL:380000,  AT:90000,  BE:95000,  BR:280000, DK:880000, FI:88000,  FR:85000,  IN:3500000, IT:75000,  JP:16000000, MY:200000, NZ:145000, NO:1200000,ES:70000,  SE:1000000,CH:200000 },
  "Graphic Designer":          { UK:41000,  US:72000,  CA:63000,  AU:70000,  DE:46000,  IE:45000,  NL:49000,  SG:56000,  AE:128000, PT:21000,  MX:240000,   TH:540000,   GR:22000,  CO:32000000,  PA:35000, KR:42000000,  CZ:620000,   GE:28000,  VN:240000000,  HR:26000,  CR:11000000,  PL:85000,   AT:38000,  BE:43000,  BR:90000,  DK:380000, FI:40000,  FR:32000,  IN:600000,  IT:24000,  JP:5200000,  MY:52000,  NZ:65000,  NO:480000, ES:24000,  SE:430000, CH:82000  },
  "Biomedical Engineer":       { UK:55000,  US:112000, CA:98000,  AU:105000, DE:68000,  IE:68000,  NL:67000,  SG:90000,  AE:215000, PT:30000,  MX:380000,   TH:900000,   GR:30000,  CO:55000000,  PA:50000, KR:70000000,  CZ:950000,   GE:50000,  VN:380000000,  HR:35000,  CR:22000000,  PL:135000,  AT:60000,  BE:65000,  BR:150000, DK:560000, FI:62000,  FR:50000,  IN:1400000, IT:38000,  JP:8500000,  MY:95000,  NZ:100000, NO:700000, ES:38000,  SE:600000, CH:128000 },
  "Supply Chain Manager":      { UK:64000,  US:110000, CA:110000, AU:118000, DE:80000,  IE:80000,  NL:80000,  SG:102000, AE:260000, PT:38000,  MX:420000,   TH:1100000,  GR:35000,  CO:60000000,  PA:58000, KR:75000000,  CZ:1050000,  GE:55000,  VN:480000000,  HR:42000,  CR:24000000,  PL:150000,  AT:60000,  BE:68000,  BR:160000, DK:600000, FI:62000,  FR:52000,  IN:1300000, IT:40000,  JP:8000000,  MY:100000, NZ:105000, NO:760000, ES:42000,  SE:640000, CH:132000 },
};

const ROLES = Object.keys(ROLE_SALARIES);
const LEVEL_MULTIPLIERS: Record<string, number> = { Junior: 0.65, Mid: 1.0, Senior: 1.45 };
const LEVELS = ["Junior", "Mid", "Senior"] as const;
type Level = typeof LEVELS[number];

function getSalaryForRole(role: string, country: string): number {
  return ROLE_SALARIES[role]?.[country] ?? 50000;
}

// ─── Benchmark data ───────────────────────────────────────────────────────────
const PPP_INDEX: Record<string, number> = { UK:88, US:100, CA:92, AU:95, DE:97, IE:90, NL:96, SG:104, AE:115, PT:78, MX:48, TH:42, GR:75, CO:36, PA:68, KR:82, CZ:72, GE:38, VN:32, HR:66, CR:55, PL:65, AT:96, BE:94, BR:40, DK:98, FI:92, FR:90, IN:22, IT:80, JP:84, MY:52, NZ:88, NO:107, ES:80, SE:96, CH:120 };
const AVG_RENT_MONTHLY: Record<string, number> = { UK:1850, US:2400, CA:2100, AU:2300, DE:1300, IE:2000, NL:1800, SG:3200, AE:6500, PT:1100, MX:950, TH:850, GR:900, CO:530, PA:1200, KR:900, CZ:1050, GE:650, VN:560, HR:700, CR:970, PL:1000, AT:1350, BE:1500, BR:650, DK:1900, FI:1400, FR:1600, IN:350, IT:1100, JP:1200, MY:700, NZ:2000, NO:1800, ES:1100, SE:1700, CH:2200 };

function computeBenchmark(role: string, country: string, salary: number) {
  const salaryUSD = salary * (FX_TO_USD[country] ?? 1);
  let aboveCount = 0, totalCount = 0;
  for (const r of ROLES) {
    for (const c of ALL_COUNTRY_KEYS) {
      const sUSD = (ROLE_SALARIES[r]?.[c] ?? 50000) * (FX_TO_USD[c] ?? 1);
      totalCount++;
      if (salaryUSD >= sUSD) aboveCount++;
    }
  }
  const percentile = Math.round((aboveCount / totalCount) * 100);
  const topPct = 100 - percentile;
  return {
    globalRank: topPct <= 50 ? `Top ${Math.max(1, topPct)}%` : `Bottom ${percentile}%`,
    pppIndex: PPP_INDEX[country] ?? 100,
    rentMonthly: AVG_RENT_MONTHLY[country] ?? 1500,
  };
}

// ─── Tax Calculators ──────────────────────────────────────────────────────────
function calcBanded(gross: number, bands: {min:number;max:number;rate:number}[]) {
  let tax = 0;
  for (const b of bands) {
    if (gross <= b.min) break;
    tax += (Math.min(gross, b.max) - b.min) * b.rate;
  }
  return tax;
}

function calcUK(g: number) {
  const d = TAX_DATA.UK;
  // Personal allowance tapers £1 per £2 over £100k
  let pa = d.personalAllowance;
  if (g > 100000) pa = Math.max(0, pa - (g - 100000) / 2);
  const taxable = Math.max(0, g - pa);
  // Income tax on taxable income (bands relative to taxable, not gross)
  const it = calcBanded(taxable, [
    { min: 0,      max: 37700,    rate: 0.20 },
    { min: 37700,  max: 125140,   rate: 0.40 },
    { min: 125140, max: Infinity, rate: 0.45 },
  ]);
  // NI on gross: 8% on £12,570–£50,270, 2% above
  const ni =
    Math.max(0, Math.min(g, d.ni.upperLimit) - d.ni.threshold) * d.ni.lowerRate +
    Math.max(0, g - d.ni.upperLimit) * d.ni.upperRate;
  const total = it + ni;
  return { items: [{ label: "Income Tax", v: it }, { label: "National Insurance", v: ni }], total, net: g - total, rate: total / g };
}

function calcUS(g: number) {
  const d = TAX_DATA.US;
  const taxable = Math.max(0, g - d.standardDeduction);
  const it = calcBanded(taxable, d.bands);
  const ss = Math.min(g, d.fica.socialSecurityCap) * d.fica.socialSecurityRate;
  const med = g * d.fica.medicareRate + Math.max(0, g - d.fica.additionalMedicareThreshold) * d.fica.additionalMedicareRate;
  const state = g * 0.05; // ~5% avg state income tax
  const total = it + ss + med + state;
  return { items: [{ label: "Federal Income Tax", v: it }, { label: "Social Security", v: ss }, { label: "Medicare", v: med }, { label: "State Tax (avg)", v: state }], total, net: g - total, rate: total / g };
}

function calcCA(g: number) {
  const d = TAX_DATA.CA;
  const fed = calcBanded(Math.max(0, g - d.personalAmount), d.bands);
  const prov = g * d.provincialRate; // ~11% avg provincial
  const cpp = Math.max(0, Math.min(g, d.cpp.ceiling) - d.cpp.exemption) * d.cpp.rate;
  const ei = Math.min(g, 63200) * 0.0166; // EI premium 2025
  const total = fed + prov + cpp + ei;
  return { items: [{ label: "Federal Tax", v: fed }, { label: "Provincial Tax", v: prov }, { label: "CPP", v: cpp }, { label: "EI", v: ei }], total, net: g - total, rate: total / g };
}

function calcAU(g: number) {
  const d = TAX_DATA.AU;
  const raw = calcBanded(g, d.bands);
  // Low Income Tax Offset (LITO) 2025
  const lito = g <= 37500 ? 700 : g <= 45000 ? 700 - (g - 37500) * 0.05 : g <= 66667 ? 325 - (g - 45000) * 0.015 : 0;
  const it = Math.max(0, raw - lito);
  const med = g > d.medicareThreshold ? g * d.medicare : 0;
  const total = it + med;
  return { items: [{ label: "Income Tax", v: it }, { label: "Medicare Levy", v: med }], total, net: g - total, rate: total / g };
}

function calcDE(g: number) {
  const d = TAX_DATA.DE;
  // Progressive German income tax formula
  let it = 0;
  if (g <= 11604) {
    it = 0;
  } else if (g <= 17006) {
    const y = (g - 11604) / 10000;
    it = (979.18 * y + 1400) * y;
  } else if (g <= 66761) {
    const z = (g - 17005) / 10000;
    it = (192.59 * z + 2397) * z + 966;
  } else if (g <= 277826) {
    it = 0.42 * g - 10602;
  } else {
    it = 0.45 * g - 18936;
  }
  // Solidarity surcharge: only applies if income tax > €18,130
  const sol = it > 18130 ? it * d.solidaritySurcharge : 0;
  const ss = (d.socialSecurity.health + d.socialSecurity.pension + d.socialSecurity.unemployment + d.socialSecurity.nursing) * g;
  const total = it + sol + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Solidarity Surcharge", v: sol }, { label: "Social Insurance", v: ss }], total, net: g - total, rate: total / g };
}

function calcIE(g: number) {
  const d = TAX_DATA.IE;
  const it = Math.max(0, calcBanded(g, d.bands) - d.taxCredit);
  const usc = calcBanded(g, d.usc);
  const prsi = g * d.prsi;
  const total = it + usc + prsi;
  return { items: [{ label: "Income Tax", v: it }, { label: "USC", v: usc }, { label: "PRSI", v: prsi }], total, net: g - total, rate: total / g };
}

function calcNL(g: number) {
  const d = TAX_DATA.NL;
  const raw = calcBanded(g, d.bands);
  // General tax credit (arbeidskorting excluded for simplicity — affects lower incomes)
  const it = Math.max(0, raw - d.generalCredit);
  return { items: [{ label: "Income Tax / Social Premiums", v: it }], total: it, net: g - it, rate: it / g };
}

function calcSG(g: number) {
  const d = TAX_DATA.SG;
  const it = calcBanded(g, d.bands);
  // CPF capped at OW ceiling $6,800/mo * 12 = $81,600; employee rate 20% below 55
  const cpf = Math.min(g * d.cpf, 16320); // OW ceiling $68k * 20% + AW contribution cap
  const total = it + cpf;
  return { items: [{ label: "Income Tax", v: it }, { label: "CPF (Employee)", v: cpf }], total, net: g - total, rate: total / g };
}

function calcAE(_g: number) {
  return { items: [{ label: "Income Tax", v: 0 }], total: 0, net: _g, rate: 0 };
}

function calcPT(g: number) {
  const d = TAX_DATA.PT;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social Security", v: ss }], total, net: g - total, rate: total / g };
}

function calcMX(g: number) {
  const d = TAX_DATA.MX;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax (ISR)", v: it }, { label: "Social Security (IMSS)", v: ss }], total, net: g - total, rate: total / g };
}

function calcTH(g: number) {
  const d = TAX_DATA.TH;
  const deduction = Math.min(g * 0.5, 100000);
  const personalAllowance = 60000;
  const taxable = Math.max(0, g - deduction - personalAllowance - (d.personalDeduction ?? 0));
  const it = calcBanded(taxable, d.bands);
  const ss = Math.min(g * d.socialSecurity, 9000);
  const total = it + ss;
  return { items: [{ label: "Income Tax (PIT)", v: it }, { label: "Social Security", v: ss }], total, net: g - total, rate: total / g };
}

function calcGR(g: number) {
  const d = TAX_DATA.GR;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social Security", v: ss }], total, net: g - total, rate: total / g };
}

function calcCO(g: number) {
  const d = TAX_DATA.CO;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax (DIAN)", v: it }, { label: "Social Security", v: ss }], total, net: g - total, rate: total / g };
}

function calcPA(g: number) {
  const d = TAX_DATA.PA;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social Security (CSS)", v: ss }], total, net: g - total, rate: total / g };
}

function calcKR(g: number) {
  const d = TAX_DATA.KR;
  const it = calcBanded(g, d.bands);
  const localSurtax = it * 0.1;
  const ss = g * d.socialSecurity;
  const total = it + localSurtax + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Local Surtax (10%)", v: localSurtax }, { label: "Social Insurance", v: ss }], total, net: g - total, rate: total / g };
}

function calcCZ(g: number) {
  const d = TAX_DATA.CZ;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social & Health Insurance", v: ss }], total, net: g - total, rate: total / g };
}

function calcGE(g: number) {
  const d = TAX_DATA.GE;
  const it = g * 0.20;
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax (flat 20%)", v: it }, { label: "Pension Contribution", v: ss }], total, net: g - total, rate: total / g };
}

function calcVN(g: number) {
  const d = TAX_DATA.VN;
  const taxable = Math.max(0, g - (d.personalDeduction ?? 0));
  const it = calcBanded(taxable, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Personal Income Tax (PIT)", v: it }, { label: "Social Insurance", v: ss }], total, net: g - total, rate: total / g };
}

function calcHR(g: number) {
  const d = TAX_DATA.HR;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social Security (pension + health)", v: ss }], total, net: g - total, rate: total / g };
}

function calcCR(g: number) {
  const d = TAX_DATA.CR;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social Security (CCSS)", v: ss }], total, net: g - total, rate: total / g };
}

function calcPL(g: number) {
  const d = TAX_DATA.PL;
  const taxable = Math.max(0, g - d.taxFreeAmount);
  const it = calcBanded(taxable, d.bands);
  const ss = g * d.socialSecurity;
  const health = g * d.healthInsurance;
  const total = it + ss + health;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social Insurance (ZUS)", v: ss }, { label: "Health Insurance", v: health }], total, net: g - total, rate: total / g };
}

function calcAT(g: number) {
  const d = TAX_DATA.AT;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social Security", v: ss }], total, net: g - total, rate: total / g };
}

function calcBE(g: number) {
  const d = TAX_DATA.BE;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social Security (ONSS)", v: ss }], total, net: g - total, rate: total / g };
}

function calcBR(g: number) {
  const d = TAX_DATA.BR;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax (IRPF)", v: it }, { label: "Social Security (INSS)", v: ss }], total, net: g - total, rate: total / g };
}

function calcDK(g: number) {
  const d = TAX_DATA.DK;
  const amBase = Math.max(0, g * (1 - (d as any).amContrib));
  const it = calcBanded(amBase, d.bands);
  const am = g * (d as any).amContrib;
  const total = it + am;
  return { items: [{ label: "Income Tax", v: it }, { label: "AM (Labour Market)", v: am }], total, net: g - total, rate: total / g };
}

function calcFI(g: number) {
  const d = TAX_DATA.FI;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social Insurance", v: ss }], total, net: g - total, rate: total / g };
}

function calcFR(g: number) {
  const d = TAX_DATA.FR;
  const taxable = Math.max(0, g - g * 0.1);
  const it = calcBanded(taxable, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax (IRPP)", v: it }, { label: "Social Contributions (CSG/CRDS)", v: ss }], total, net: g - total, rate: total / g };
}

function calcIN(g: number) {
  const d = TAX_DATA.IN;
  const taxable = Math.max(0, g - (d as any).standardDeduction);
  const it = calcBanded(taxable, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "EPF (Employee)", v: ss }], total, net: g - total, rate: total / g };
}

function calcIT(g: number) {
  const d = TAX_DATA.IT;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax (IRPEF)", v: it }, { label: "Social Security (INPS)", v: ss }], total, net: g - total, rate: total / g };
}

function calcJP(g: number) {
  const d = TAX_DATA.JP;
  const taxable = Math.max(0, g - (d as any).basicDeduction);
  const it = calcBanded(taxable, d.bands);
  const resident = g * (d as any).residentTaxRate;
  const ss = g * d.socialSecurity;
  const total = it + resident + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Resident Tax", v: resident }, { label: "Social Insurance", v: ss }], total, net: g - total, rate: total / g };
}

function calcMY(g: number) {
  const d = TAX_DATA.MY;
  const it = calcBanded(g, d.bands);
  const epf = g * (d as any).epfEmployee;
  const total = it + epf;
  return { items: [{ label: "Income Tax", v: it }, { label: "EPF (Employee)", v: epf }], total, net: g - total, rate: total / g };
}

function calcNZ(g: number) {
  const d = TAX_DATA.NZ;
  const it = calcBanded(g, d.bands);
  const acc = g * (d as any).acc;
  const total = it + acc;
  return { items: [{ label: "Income Tax (PAYE)", v: it }, { label: "ACC Levy", v: acc }], total, net: g - total, rate: total / g };
}

function calcNO(g: number) {
  const d = TAX_DATA.NO;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "National Insurance", v: ss }], total, net: g - total, rate: total / g };
}

function calcES(g: number) {
  const d = TAX_DATA.ES;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax (IRPF)", v: it }, { label: "Social Security", v: ss }], total, net: g - total, rate: total / g };
}

function calcSE(g: number) {
  const d = TAX_DATA.SE;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social Insurance", v: ss }], total, net: g - total, rate: total / g };
}

function calcCH(g: number) {
  const d = TAX_DATA.CH;
  const federal = calcBanded(g, d.bands);
  const cantonal = g * (d as any).cantonal;
  const ss = g * d.socialSecurity;
  const total = federal + cantonal + ss;
  return { items: [{ label: "Federal Income Tax", v: federal }, { label: "Cantonal Tax (avg)", v: cantonal }, { label: "Social Insurance (AHV/IV)", v: ss }], total, net: g - total, rate: total / g };
}

function calcCountry(c: keyof typeof TAX_DATA, g: number) {
  switch (c) {
    case "UK": return calcUK(g);
    case "US": return calcUS(g);
    case "CA": return calcCA(g);
    case "AU": return calcAU(g);
    case "DE": return calcDE(g);
    case "IE": return calcIE(g);
    case "NL": return calcNL(g);
    case "SG": return calcSG(g);
    case "AE": return calcAE(g);
    case "PT": return calcPT(g);
    case "MX": return calcMX(g);
    case "TH": return calcTH(g);
    case "GR": return calcGR(g);
    case "CO": return calcCO(g);
    case "PA": return calcPA(g);
    case "KR": return calcKR(g);
    case "CZ": return calcCZ(g);
    case "GE": return calcGE(g);
    case "VN": return calcVN(g);
    case "HR": return calcHR(g);
    case "CR": return calcCR(g);
    case "PL": return calcPL(g);
    case "AT": return calcAT(g);
    case "BE": return calcBE(g);
    case "BR": return calcBR(g);
    case "DK": return calcDK(g);
    case "FI": return calcFI(g);
    case "FR": return calcFR(g);
    case "IN": return calcIN(g);
    case "IT": return calcIT(g);
    case "JP": return calcJP(g);
    case "MY": return calcMY(g);
    case "NZ": return calcNZ(g);
    case "NO": return calcNO(g);
    case "ES": return calcES(g);
    case "SE": return calcSE(g);
    case "CH": return calcCH(g);
  }
}

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, format = (n: number) => Math.round(n).toLocaleString("en"), durationMs = 380, style }: {
  value: number;
  format?: (n: number) => string;
  durationMs?: number;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef(0);
  const targetRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = display;
    targetRef.current = value;
    startRef.current = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = (t: number) => {
      const elapsed = t - startRef.current;
      const p = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = fromRef.current + (targetRef.current - fromRef.current) * eased;
      setDisplay(next);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span style={style}>{format(display)}</span>;
}

// ─── Currency Toggle ──────────────────────────────────────────────────────────
function CurrencyToggle({ showUSD, onToggle, localCurrency }: { showUSD: boolean; onToggle: () => void; localCurrency: string }) {
  return (
    <button
      onClick={onToggle}
      title={showUSD ? "Switch to local currency" : "Switch to USD equivalent"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 10px 5px 7px",
        background: showUSD ? "rgba(77,230,204,0.1)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${showUSD ? "rgba(77,230,204,0.3)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 100, cursor: "pointer",
        transition: "all 180ms ease",
        outline: "none",
      }}
    >
      {/* Track */}
      <span style={{
        display: "flex", alignItems: "center",
        width: 28, height: 14, background: showUSD ? "#4de6cc" : "rgba(255,255,255,0.15)",
        borderRadius: 100, position: "relative", transition: "background 180ms ease",
        flexShrink: 0,
      }}>
        <span style={{
          position: "absolute",
          left: showUSD ? 16 : 2,
          width: 10, height: 10,
          background: "#ffffff",
          borderRadius: "50%",
          transition: "left 180ms ease",
        }} />
      </span>
      <span style={{
        fontFamily: "Satoshi, sans-serif", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: showUSD ? "#4de6cc" : "rgba(255,255,255,0.4)",
        transition: "color 180ms ease",
        whiteSpace: "nowrap",
      }}>
        {showUSD ? "USD" : localCurrency}
      </span>
    </button>
  );
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────
function StatTile({ label, value, sub, blurred, format }: {
  label: string; value: number; sub?: string; blurred?: boolean; format: (n: number) => string;
}) {
  return (
    <div style={{
      flex: 1, minWidth: 0, padding: "18px 20px",
      background: "#111111", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 500,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.45)", marginBottom: 12,
      }}>{label}</div>
      <div style={{ filter: blurred ? "blur(10px)" : "none", userSelect: blurred ? "none" : "auto", transition: "filter 200ms ease" }}>
        <div style={{
          fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 700,
          fontSize: "clamp(22px, 2.6vw, 32px)", color: "#ffffff",
          lineHeight: 1.05, letterSpacing: "-0.01em",
        }}>
          <AnimatedNumber value={value} format={format} />
        </div>
        {sub && (
          <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>{sub}</div>
        )}
      </div>
      {blurred && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(17,17,17,0.55)", backdropFilter: "blur(2px)",
        }}>
          <Link href="/pro" style={{
            fontFamily: "Satoshi, sans-serif", fontSize: 11, fontWeight: 500,
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#4de6cc",
            padding: "8px 14px", border: "1px solid rgba(77,230,204,0.25)",
            borderRadius: 100, background: "#0a0a0a", textDecoration: "none",
          }}>Unlock with Pro</Link>
        </div>
      )}
    </div>
  );
}

// ─── Comparison Chart ─────────────────────────────────────────────────────────
function ComparisonChart({ role, selectedCountry, level, showUSD }: {
  role: string; selectedCountry: keyof typeof TAX_DATA; level: Level; showUSD: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [chartMode, setChartMode] = useState<"gross" | "net">("gross");

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, [role, level, selectedCountry]);

  const rows = useMemo(() => {
    const arr = ALL_COUNTRY_KEYS.map(c => {
      const local = Math.round(getSalaryForRole(role, c) * LEVEL_MULTIPLIERS[level]);
      const usd = Math.round(local * (FX_TO_USD[c] ?? 1));
      const netLocal = calcCountry(c, local)?.net ?? Math.round(local * 0.7);
      const netUSD = Math.round(netLocal * (FX_TO_USD[c] ?? 1));
      return { code: c, local, usd, netLocal, netUSD, d: TAX_DATA[c] };
    });
    arr.sort((a, b) => b.usd - a.usd);
    const maxGrossUSD = Math.max(...arr.map(r => r.usd));
    const maxNetUSD = Math.max(...arr.map(r => r.netUSD));
    return arr.map(r => ({
      ...r,
      grossWidthPct: (r.usd / maxGrossUSD) * 100,
      netWidthPct: (r.netUSD / maxNetUSD) * 100,
    }));
  }, [role, level]);

  return (
    <section style={{
      padding: "22px 24px", background: "#111111",
      border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, gap: 12, flexWrap: "wrap",
      }}>
        <div>
          <div style={{
            fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800,
            letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
          }}>Across countries · {role} · {level}</div>
          <div style={{
            fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 500,
            letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)", marginTop: 3,
          }}>{showUSD ? "USD equivalent · ranked by USD" : "local currency · ranked by USD equivalent"}</div>
        </div>
        {/* Gross / Net pill toggle */}
        <div style={{
          display: "inline-flex", borderRadius: 100,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.03)",
          padding: 3, gap: 2,
        }}>
          {(["gross", "net"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setChartMode(mode)}
              style={{
                padding: "5px 14px",
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
                fontFamily: "Satoshi, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: chartMode === mode ? "#222222" : "transparent",
                color: chartMode === mode ? "#ffffff" : "rgba(255,255,255,0.35)",
                transition: "background 150ms ease, color 150ms ease",
              }}
            >
              {mode === "gross" ? "Gross" : "Net"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto", marginLeft: -4, marginRight: -4, padding: "0 4px" }}>
        <div style={{ minWidth: 280 }}>
          {rows.map((r, i) => {
            const selected = r.code === selectedCountry;
            const widthPct = chartMode === "gross" ? r.grossWidthPct : r.netWidthPct;
            const localVal = chartMode === "gross" ? r.local : r.netLocal;
            const usdVal = chartMode === "gross" ? r.usd : r.netUSD;
            const displayVal = showUSD
              ? `$${usdVal.toLocaleString("en")}`
              : `${r.d.symbol}${localVal.toLocaleString("en")}`;
            return (
              <div key={r.code} style={{
                display: "grid", gridTemplateColumns: "minmax(0, clamp(80px, 22vw, 140px)) 1fr minmax(0, clamp(70px, 18vw, 120px))",
                alignItems: "center", gap: 14, padding: "9px 0",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(4px)",
                transition: `opacity 280ms ease ${i * 30}ms, transform 280ms ease ${i * 30}ms`,
              }}>
                <div style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 500,
                  color: selected ? "#ffffff" : "rgba(255,255,255,0.55)",
                  display: "flex", alignItems: "center", gap: 9,
                  overflow: "hidden", minWidth: 0,
                }}>
                  <span style={{ fontSize: 13, lineHeight: 1, width: 16, flexShrink: 0 }}>{r.d.flag}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.d.name}</span>
                </div>
                <div style={{
                  height: 8, background: "rgba(255,255,255,0.04)",
                  borderRadius: 100, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: mounted ? `${widthPct}%` : "0%",
                    background: selected ? "#4de6cc" : "rgba(255,255,255,0.85)",
                    borderRadius: 100,
                    transition: `width 700ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 30}ms`,
                  }} />
                </div>
                <div style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 500,
                  color: selected ? "#4de6cc" : "rgba(255,255,255,0.55)",
                  textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis",
                }}>{displayVal}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Benchmark Row ────────────────────────────────────────────────────────────
function BenchmarkRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{
        fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)", marginBottom: 8,
      }}>{label}</div>
      <div style={{
        fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 700, fontSize: 26,
        lineHeight: 1.05, color: "#ffffff", letterSpacing: "-0.01em",
      }}>{value}</div>
      {sub && (
        <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

// ─── Market Fit Gauge ─────────────────────────────────────────────────────────
function MarketFitGauge({ grossLocal, role, country }: {
  grossLocal: number;
  role: string;
  country: keyof typeof TAX_DATA;
}) {
  const median = getSalaryForRole(role, country);
  const p25 = Math.round(median * 0.75);
  const p50 = median;
  const p75 = Math.round(median * 1.4);

  const salary = grossLocal;

  let dotColor = "#4de6cc";
  let fitLabel = "Competitive";
  if (salary < p25) { dotColor = "#ef4444"; fitLabel = "Below market"; }
  else if (salary < p50) { dotColor = "#f97316"; fitLabel = "At lower end"; }
  else if (salary <= p75) { dotColor = "#4de6cc"; fitLabel = "Competitive"; }
  else { dotColor = "#ffffff"; fitLabel = "Above market"; }

  // Clamp dot position 0–100% across the track from p25 to p75
  const trackMin = p25 * 0.85; // a bit of padding before p25
  const trackMax = p75 * 1.1;
  const dotPct = Math.max(0, Math.min(100, ((salary - trackMin) / (trackMax - trackMin)) * 100));

  const sym = TAX_DATA[country].symbol;
  const fmt = (n: number) => `${sym}${Math.round(n / 1000)}k`;

  return (
    <div style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{
        fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)", marginBottom: 12,
      }}>Market Fit</div>

      {/* Track */}
      <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 100, marginBottom: 20 }}>
        {/* Filled portion from p25 to p75 on the track */}
        <div style={{
          position: "absolute",
          left: `${Math.max(0, Math.min(100, ((p25 - trackMin) / (trackMax - trackMin)) * 100))}%`,
          width: `${Math.max(0, Math.min(100, ((p75 - p25) / (trackMax - trackMin)) * 100))}%`,
          height: "100%",
          background: "rgba(77,230,204,0.15)",
          borderRadius: 100,
        }} />
        {/* Dot */}
        <div style={{
          position: "absolute",
          left: `${dotPct}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 12, height: 12,
          background: dotColor,
          borderRadius: "50%",
          boxShadow: `0 0 8px ${dotColor}88`,
          transition: "left 400ms cubic-bezier(0.22,1,0.36,1)",
        }} />
      </div>

      {/* Labels row */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        {[{ label: "P25", val: p25 }, { label: "P50", val: p50 }, { label: "P75", val: p75 }].map(p => (
          <div key={p.label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{p.label}</div>
            <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{fmt(p.val)}</div>
          </div>
        ))}
      </div>

      {/* Fit label */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
        <span style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, fontWeight: 600, color: dotColor }}>{fitLabel}</span>
      </div>
    </div>
  );
}

function HowDisclosure({ country }: { country: keyof typeof TAX_DATA }) {
  const [open, setOpen] = useState(false);
  const d = TAX_DATA[country];
  return (
    <div style={{ marginTop: 18, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
      <button onClick={() => setOpen(v => !v)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: 0, background: "none", border: "none",
        cursor: "pointer", color: "rgba(255,255,255,0.55)",
        fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 500, textAlign: "left",
      }}>
        <span>How we calculate this</span>
        <span style={{
          fontSize: 14, color: "rgba(255,255,255,0.45)",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 160ms ease", lineHeight: 1, display: "inline-block",
        }}>⌄</span>
      </button>
      {open && (
        <div style={{
          marginTop: 12, fontFamily: "Satoshi, sans-serif", fontSize: 12,
          lineHeight: 1.55, color: "rgba(255,255,255,0.45)",
        }}>
          <p style={{ margin: 0 }}>
            Uses {d.name}&apos;s 2025/26 tax brackets plus mandatory deductions ({d.currency}).
            Salaries reflect median market rates; Junior = 65%, Mid = 100%, Senior = 145% of median.
          </p>
          <p style={{ margin: "8px 0 0" }}>
            Global rank compares USD-equivalent salary across all {ROLES.length} roles × {ALL_COUNTRY_KEYS.length} countries.
            USD conversion uses approximate 2025 FX rates.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Cities CTA ───────────────────────────────────────────────────────────────
function CitiesCTA() {
  return (
    <Link href="/cities" style={{ textDecoration: "none", display: "block", marginTop: 18 }}>
      <div style={{
        background: "#0d0d0d",
        borderLeft: "3px solid #4de6cc",
        border: "1px solid rgba(255,255,255,0.05)",
        borderLeftWidth: 3,
        borderLeftColor: "#4de6cc",
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "background 150ms ease",
      }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#111111"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#0d0d0d"}
      >
        <div style={{
          fontFamily: "Satoshi, sans-serif", fontSize: 13, fontWeight: 600,
          color: "#ffffff", lineHeight: 1.35, marginBottom: 6,
        }}>
          Know your take-home?<br />See what it buys.
        </div>
        <div style={{
          fontFamily: "Satoshi, sans-serif", fontSize: 12,
          color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 4,
        }}>
          Compare rent, food &amp; lifestyle costs across 12 cities →
        </div>
      </div>
    </Link>
  );
}

// ─── Country Compare Section ──────────────────────────────────────────────────
function CountryCompareSection({ pinnedCountries, selectedCountry, role, level, onClear }: {
  pinnedCountries: (keyof typeof TAX_DATA)[];
  selectedCountry: keyof typeof TAX_DATA;
  role: string;
  level: Level;
  onClear: () => void;
}) {
  // Build list: selected country always first, then pinned (deduped)
  const allCodes = [selectedCountry, ...pinnedCountries.filter(c => c !== selectedCountry)] as (keyof typeof TAX_DATA)[];

  return (
    <div style={{
      padding: "20px 22px",
      background: "#111111",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16,
      }}>
        <div style={{
          fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800,
          letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
        }}>Compare Countries</div>
        <button onClick={onClear} style={{
          fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 500,
          color: "rgba(255,255,255,0.35)", background: "none", border: "none",
          cursor: "pointer", padding: "4px 8px",
          borderRadius: 6,
          letterSpacing: "0.06em",
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"}
        >Clear comparison</button>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {allCodes.map(c => {
          const td = TAX_DATA[c];
          const gross = Math.round(getSalaryForRole(role, c) * LEVEL_MULTIPLIERS[level]);
          const taxResult = calcCountry(c, gross);
          const net = taxResult?.net ?? gross;
          const rate = ((taxResult?.rate ?? 0) * 100).toFixed(1);
          const netPct = Math.round((net / gross) * 100);
          const taxPct = 100 - netPct;
          const isSelected = c === selectedCountry;

          return (
            <div key={c} style={{
              flex: "1 1 140px", minWidth: 130, maxWidth: 180,
              padding: "14px 14px 12px",
              background: "#0d0d0d",
              border: `1px solid ${isSelected ? "rgba(77,230,204,0.4)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 12,
              position: "relative",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 15 }}>{td.flag}</span>
                <span style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 700,
                  color: isSelected ? "#4de6cc" : "#ffffff",
                }}>{c}</span>
              </div>
              {/* Gross */}
              <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>Gross</div>
              <div style={{
                fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 700, fontSize: 15,
                color: "#ffffff", marginBottom: 6, letterSpacing: "-0.01em",
              }}>
                {td.symbol}{gross.toLocaleString("en")}
              </div>
              {/* Net */}
              <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>Net</div>
              <div style={{
                fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 700, fontSize: 15,
                color: "#4de6cc", marginBottom: 8, letterSpacing: "-0.01em",
              }}>
                {td.symbol}{Math.round(net).toLocaleString("en")}
              </div>
              {/* Tax rate */}
              <div style={{
                fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 500,
                color: "rgba(255,255,255,0.4)", marginBottom: 8,
              }}>{rate}% effective tax</div>
              {/* Visual bar */}
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ display: "flex", height: "100%" }}>
                  <div style={{ width: `${taxPct}%`, background: "#ef4444", opacity: 0.7 }} />
                  <div style={{ width: `${netPct}%`, background: "#4de6cc", opacity: 0.8 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalaryCalculator() {
  const [country, setCountry] = useState<keyof typeof TAX_DATA>("UK");
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState<Level>("Mid");
  const [roleOpen, setRoleOpen] = useState(false);
  const [showUSD, setShowUSD] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const [isPro, setIsPro] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  // Editable salary state
  const [customSalary, setCustomSalary] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Remote filter
  const [remoteFilter, setRemoteFilter] = useState(false);

  // Country search
  const [countrySearch, setCountrySearch] = useState("");

  // Pinned countries for comparison
  const [pinnedCountries, setPinnedCountries] = useState<(keyof typeof TAX_DATA)[]>([]);

  const fetchPro = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("is_pro").eq("id", userId).single();
    setIsPro(data?.is_pro ?? false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await fetchPro(session.user.id);
      setAuthLoaded(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (session?.user) await fetchPro(session.user.id);
      else setIsPro(false);
    });
    return () => subscription.unsubscribe();
  }, [fetchPro]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Reset custom salary when role or country changes
  useEffect(() => {
    setCustomSalary(null);
  }, [role, country]);

  // Focus input when editing starts
  useEffect(() => {
    if (editing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editing]);

  const baseSalary = useMemo(() =>
    Math.round(getSalaryForRole(role, country) * LEVEL_MULTIPLIERS[level]),
    [role, country, level]
  );

  const grossLocal = customSalary ?? baseSalary;
  const grossUSD = useMemo(() => Math.round(grossLocal * (FX_TO_USD[country] ?? 1)), [grossLocal, country]);

  const result = useMemo(() => calcCountry(country, grossLocal), [country, grossLocal]);
  const d = TAX_DATA[country];

  const takeHomeAnnual = result?.net ?? 0;
  const takeHomeMonthly = takeHomeAnnual / 12;
  const effectiveRate = (result?.rate ?? 0) * 100;

  const takeHomeAnnualUSD = Math.round(takeHomeAnnual * (FX_TO_USD[country] ?? 1));
  const takeHomeMonthlyUSD = Math.round(takeHomeMonthly * (FX_TO_USD[country] ?? 1));

  const bench = useMemo(() => computeBenchmark(role, country, grossLocal), [role, country, grossLocal]);
  const rentPctOfTakeHome = takeHomeMonthly > 0 ? Math.round((bench.rentMonthly / takeHomeMonthly) * 100) : 0;
  const rentMonthlyUSD = Math.round(bench.rentMonthly * (FX_TO_USD[country] ?? 1));

  const localSym = d.symbol;
  const fmtLocal = (n: number) => `${localSym}${Math.round(n).toLocaleString("en")}`;
  const fmtUSD   = (n: number) => `$${Math.round(n).toLocaleString("en")}`;
  const fmtMoney = showUSD ? fmtUSD : fmtLocal;
  const fmtPct   = (n: number) => `${n.toFixed(1)}%`;

  // When showUSD, display gross in USD too
  const displayGross     = showUSD ? grossUSD : grossLocal;
  const displayGrossSym  = showUSD ? "$" : localSym;
  const displayTakeHomeA = showUSD ? takeHomeAnnualUSD : takeHomeAnnual;
  const displayTakeHomeM = showUSD ? takeHomeMonthlyUSD : takeHomeMonthly;

  const stickyTop = NAV_H + 16;

  function startEdit() {
    setEditVal(grossLocal.toLocaleString("en"));
    setEditing(true);
  }

  function commitEdit() {
    const raw = editVal.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(raw);
    if (parsed > 0 && !isNaN(parsed)) {
      setCustomSalary(Math.round(parsed));
    } else {
      setCustomSalary(null);
    }
    setEditing(false);
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setEditing(false);
    }
  }

  function togglePin(c: keyof typeof TAX_DATA) {
    setPinnedCountries(prev => {
      if (prev.includes(c)) return prev.filter(x => x !== c);
      if (prev.length >= 3) return prev;
      return [...prev, c];
    });
  }

  const displayedCountries = useMemo(() => {
    let list = remoteFilter ? ALL_COUNTRY_KEYS.filter(c => REMOTE_DATA[c]) : ALL_COUNTRY_KEYS;
    if (countrySearch.trim()) {
      const q = countrySearch.toLowerCase();
      list = list.filter(c => TAX_DATA[c].name.toLowerCase().includes(q) || c.toLowerCase().includes(q));
    }
    return list;
  }, [remoteFilter, countrySearch]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Nav countries={[]} onCountrySelect={() => {}} />

      <main className="flex-1" style={{ paddingTop: NAV_H + 24, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div
          style={{
            maxWidth: 1440, margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "280px 1fr 260px",
            gap: 24,
            alignItems: "start",
          }}
          className="salary-app-shell"
        >

          {/* ══ LEFT: Sidebar ══ */}
          <aside style={{
            display: "flex", flexDirection: "column", gap: 28,
            padding: 24, background: "#0d0d0d",
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14,
            alignSelf: "flex-start", position: "sticky", top: stickyTop,
          }}>
            <div>
              <div style={{ fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 800, fontSize: 16, color: "#ffffff" }}>Origio</div>
              <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>Salary calculator</div>
            </div>

            {/* Country List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Country</div>
                {/* Remote filter toggle */}
                <button
                  onClick={() => setRemoteFilter(v => !v)}
                  style={{
                    padding: "3px 9px",
                    borderRadius: 100,
                    border: `1px solid ${remoteFilter ? "rgba(77,230,204,0.3)" : "rgba(255,255,255,0.1)"}`,
                    background: remoteFilter ? "rgba(77,230,204,0.12)" : "transparent",
                    color: remoteFilter ? "#4de6cc" : "rgba(255,255,255,0.35)",
                    fontFamily: "Satoshi, sans-serif", fontSize: 9, fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    cursor: "pointer", transition: "all 150ms ease",
                    whiteSpace: "nowrap",
                  }}
                >REMOTE ✦</button>
              </div>
              <input
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Search countries…"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, outline: "none",
                  color: "#fff", fontFamily: "Satoshi, sans-serif",
                  fontSize: 12, fontWeight: 400,
                }}
              />
              <div className="country-list" style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 340, overflowY: "auto", paddingRight: 2 }}>
                {displayedCountries.map((c) => {
                  const active = country === c;
                  const pinned = pinnedCountries.includes(c);
                  const remoteInfo = REMOTE_DATA[c];
                  return (
                    <button key={c} onClick={() => setCountry(c)} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                      background: active ? "#161616" : "transparent",
                      border: "1px solid", borderColor: active ? "rgba(255,255,255,0.07)" : "transparent",
                      borderLeft: "2px solid", borderLeftColor: active ? "#4de6cc" : "transparent",
                      borderRadius: 10, cursor: "pointer", textAlign: "left",
                      color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
                      fontFamily: "Satoshi, sans-serif", fontSize: 13, fontWeight: 500,
                      transition: "background 120ms ease, color 120ms ease, border-color 120ms ease",
                      position: "relative",
                    }}>
                      <span style={{ fontSize: 16, lineHeight: 1, width: 18, textAlign: "center", flexShrink: 0 }}>{TAX_DATA[c].flag}</span>
                      <span style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, minWidth: 0 }}>
                        <span>{TAX_DATA[c].name}</span>
                        {remoteFilter && remoteInfo && (
                          <span style={{ fontSize: 9, color: "#4de6cc", letterSpacing: "0.04em", fontWeight: 500 }}>
                            {"★".repeat(remoteInfo.stars)} {remoteInfo.badge}
                          </span>
                        )}
                      </span>
                      <span style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", color: active ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)", flexShrink: 0 }}>{c}</span>
                      {/* Pin button */}
                      <span
                        role="button"
                        onClick={e => { e.stopPropagation(); togglePin(c); }}
                        title={pinned ? "Unpin" : "Pin for comparison"}
                        style={{
                          width: 16, height: 16,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: "50%",
                          background: pinned ? "rgba(77,230,204,0.2)" : "rgba(255,255,255,0.06)",
                          color: pinned ? "#4de6cc" : "rgba(255,255,255,0.3)",
                          fontSize: 10, fontWeight: 700,
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "background 120ms ease, color 120ms ease",
                          lineHeight: 1,
                        }}
                      >{pinned ? "✕" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Dropdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Role</div>
              <div ref={roleRef} style={{ position: "relative" }}>
                <button onClick={() => setRoleOpen(v => !v)} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, padding: "12px 14px", background: "#111111",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10,
                  cursor: "pointer", color: "#ffffff", fontFamily: "Satoshi, sans-serif",
                  fontSize: 13, fontWeight: 500, textAlign: "left", outline: "none",
                  transition: "border-color 120ms ease",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = roleOpen ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)"}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{role}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", transform: roleOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms ease", display: "inline-block", lineHeight: 1, flexShrink: 0 }}>⌄</span>
                </button>
                {roleOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    background: "#111111", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10, maxHeight: 260, overflowY: "auto", zIndex: 20, padding: 4,
                  }}>
                    {ROLES.map(r => {
                      const active = r === role;
                      return (
                        <button key={r} onClick={() => { setRole(r); setRoleOpen(false); }} style={{
                          display: "block", width: "100%", textAlign: "left", padding: "9px 12px",
                          background: active ? "#1c1c1c" : "transparent", border: "none", borderRadius: 7,
                          cursor: "pointer", color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
                          fontFamily: "Satoshi, sans-serif", fontSize: 13, fontWeight: 500,
                          transition: "background 100ms ease, color 100ms ease",
                        }}
                          onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "#161616"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; } }}
                          onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; } }}
                        >{r}</button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Level Toggle */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Experience</div>
              <div style={{ display: "flex", gap: 6 }}>
                {LEVELS.map(l => {
                  const active = level === l;
                  return (
                    <button key={l} onClick={() => setLevel(l)} style={{
                      flex: 1, padding: "10px 0",
                      background: active ? "#222222" : "transparent",
                      border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100,
                      cursor: "pointer", color: active ? "#ffffff" : "rgba(255,255,255,0.3)",
                      fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 500,
                      transition: "background 120ms ease, color 120ms ease",
                    }}>{l}</button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ══ CENTER: Main display ══ */}
          <section style={{ display: "flex", flexDirection: "column", gap: 28, minWidth: 0 }}>

            {/* Gross heading + currency toggle */}
            <div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 12, marginBottom: 14, flexWrap: "wrap",
              }}>
                <div style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800,
                  letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
                }}>
                  Gross annual · {role} · {d.name} · {level}
                  {customSalary !== null && (
                    <span style={{
                      marginLeft: 8, color: "#4de6cc", letterSpacing: "0.08em",
                    }}>· custom</span>
                  )}
                </div>
                <CurrencyToggle
                  showUSD={showUSD}
                  onToggle={() => setShowUSD(v => !v)}
                  localCurrency={d.currency}
                />
              </div>

              {/* Editable gross number */}
              {editing ? (
                <div style={{
                  fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 800,
                  fontSize: "clamp(52px, 8vw, 96px)", lineHeight: 1,
                  letterSpacing: "-0.035em", color: "#ffffff", fontVariantNumeric: "tabular-nums",
                  display: "flex", alignItems: "baseline", gap: 0,
                }}>
                  <span style={{
                    fontFamily: "Satoshi, sans-serif", fontSize: "0.35em", fontWeight: 500,
                    color: "rgba(255,255,255,0.45)", verticalAlign: "0.55em", marginRight: 8, letterSpacing: 0,
                    flexShrink: 0,
                  }}>{displayGrossSym}</span>
                  <input
                    ref={editInputRef}
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleEditKeyDown}
                    style={{
                      fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 800,
                      fontSize: "inherit", lineHeight: 1,
                      letterSpacing: "-0.035em", color: "#ffffff",
                      fontVariantNumeric: "tabular-nums",
                      background: "transparent",
                      border: "none",
                      borderBottom: "2px solid rgba(77,230,204,0.6)",
                      outline: "none",
                      width: "100%",
                      minWidth: 0,
                      padding: 0,
                    }}
                  />
                </div>
              ) : (
                <div
                  onClick={startEdit}
                  title="Click to enter a custom salary"
                  style={{
                    fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 800,
                    fontSize: "clamp(52px, 8vw, 96px)", lineHeight: 1,
                    letterSpacing: "-0.035em", color: "#ffffff", fontVariantNumeric: "tabular-nums",
                    cursor: "pointer",
                    display: "inline-flex", alignItems: "baseline", gap: 0,
                    borderBottom: "2px solid transparent",
                    transition: "border-color 160ms ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderBottomColor = "rgba(255,255,255,0.18)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderBottomColor = "transparent";
                  }}
                >
                  <span style={{
                    fontFamily: "Satoshi, sans-serif", fontSize: "0.35em", fontWeight: 500,
                    color: "rgba(255,255,255,0.45)", verticalAlign: "0.55em", marginRight: 8, letterSpacing: 0,
                    flexShrink: 0,
                  }}>{displayGrossSym}</span>
                  <AnimatedNumber value={displayGross} format={(n) => Math.round(n).toLocaleString("en")} />
                  <span style={{
                    fontSize: "0.22em", marginLeft: 12, color: "rgba(255,255,255,0.25)",
                    fontFamily: "Satoshi, sans-serif", fontWeight: 500, letterSpacing: "0.02em",
                    alignSelf: "center",
                    transition: "color 160ms ease",
                  }}>✏</span>
                </div>
              )}

              {showUSD && country !== "US" && (
                <div style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)",
                  marginTop: 6, letterSpacing: "0.02em",
                }}>
                  {localSym}{grossLocal.toLocaleString("en")} {d.currency} at approx. {FX_TO_USD[country]} USD/unit
                </div>
              )}
            </div>

            {/* Stat tiles */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <StatTile
                label="Take-home · annual"
                value={displayTakeHomeA}
                sub={showUSD ? "USD after tax" : `${d.currency} after tax`}
                blurred={!isPro && authLoaded}
                format={fmtMoney}
              />
              <StatTile
                label="Take-home · monthly"
                value={displayTakeHomeM}
                sub="per month"
                blurred={!isPro && authLoaded}
                format={fmtMoney}
              />
              <StatTile
                label="Effective tax rate"
                value={effectiveRate}
                sub={result?.items?.filter(i => i.v > 0).map(i => i.label).join(" · ")}
                blurred={false}
                format={fmtPct}
              />
            </div>

            {/* Country comparison section */}
            {pinnedCountries.length > 0 && (
              <CountryCompareSection
                pinnedCountries={pinnedCountries}
                selectedCountry={country}
                role={role}
                level={level}
                onClear={() => setPinnedCountries([])}
              />
            )}

            {/* Comparison chart */}
            <ComparisonChart
              key={`${role}-${level}`}
              selectedCountry={country}
              role={role}
              level={level}
              showUSD={showUSD}
            />
          </section>

          {/* ══ RIGHT: Benchmark ══ */}
          <aside style={{
            padding: "22px 22px 18px", background: "#0d0d0d",
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14,
            alignSelf: "flex-start", position: "sticky", top: stickyTop,
          }}>
            <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Benchmark</div>
            <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>{role} · {d.name}</div>

            {/* Market Fit Gauge — before Global rank */}
            <MarketFitGauge grossLocal={grossLocal} role={role} country={country} />

            <BenchmarkRow
              label="Global rank"
              value={bench.globalRank}
              sub="vs all roles, USD-equivalent"
            />
            <BenchmarkRow
              label="Purchasing power"
              value={String(bench.pppIndex)}
              sub="index · 100 = global median basket"
            />
            <BenchmarkRow
              label="Rent / take-home"
              value={isPro ? `${rentPctOfTakeHome}%` : "—%"}
              sub={isPro
                ? `${showUSD ? `$${rentMonthlyUSD.toLocaleString("en")}` : `${localSym}${bench.rentMonthly.toLocaleString("en")}`} / mo · 1-bed, major city`
                : "Pro · requires take-home"}
            />

            <HowDisclosure country={country} />

            {/* Cities CTA */}
            <CitiesCTA />
          </aside>
        </div>
      </main>

      <style>{`
        @media (max-width: 1100px) {
          .salary-app-shell {
            grid-template-columns: 1fr !important;
          }
          .salary-app-shell > aside,
          .salary-app-shell > section {
            position: static !important;
          }
          .country-list {
            flex-direction: row !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            max-height: none !important;
            gap: 6px !important;
            padding-bottom: 4px;
          }
          .country-list::-webkit-scrollbar { height: 4px; }
        }
      `}</style>

      <Footer />
    </div>
  );
}
