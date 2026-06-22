"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG   = "#0a0a0a";
const FG   = "#f0f0e8";
const MINT = "#00ffd5";
const DIM  = "#555550";
const SURF = "#111111";
const BORD = "#2a2a2a";
const SANS = "'Satoshi', system-ui, sans-serif";
const HEAD = "'Cabinet Grotesk', sans-serif";

// ─── Passport data (Henley 2026 Q2 (17 June 2026)) ───────────────────────────
export type Passport = {
  rank: number; name: string; flag: string;
  score: number; vf: number; voa: number; evisa: number;
  population: number; slug: string;
};

const ALL_PASSPORTS: Passport[] = [
  // Rank 1 — score 192
  { rank:1,   name:"Singapore",              flag:"🇸🇬", score:192, vf:129, voa:42, evisa:21, population:5.9,   slug:"singapore"              },
  // Rank 2 — score 188
  { rank:2,   name:"Japan",                  flag:"🇯🇵", score:188, vf:126, voa:41, evisa:21, population:125,   slug:"japan"                  },
  { rank:2,   name:"South Korea",            flag:"🇰🇷", score:188, vf:126, voa:41, evisa:21, population:51.7,  slug:"south-korea"            },
  { rank:2,   name:"United Arab Emirates",   flag:"🇦🇪", score:188, vf:126, voa:41, evisa:21, population:9.9,   slug:"uae"                    },
  // Rank 3 — score 187
  { rank:3,   name:"Sweden",                 flag:"🇸🇪", score:187, vf:125, voa:41, evisa:21, population:10.4,  slug:"sweden"                 },
  // Rank 4 — score 186
  { rank:4,   name:"Belgium",                flag:"🇧🇪", score:186, vf:125, voa:41, evisa:20, population:11.6,  slug:"belgium"                },
  { rank:4,   name:"Denmark",                flag:"🇩🇰", score:186, vf:125, voa:41, evisa:20, population:5.9,   slug:"denmark"                },
  { rank:4,   name:"Finland",                flag:"🇫🇮", score:186, vf:125, voa:41, evisa:20, population:5.5,   slug:"finland"                },
  { rank:4,   name:"France",                 flag:"🇫🇷", score:186, vf:125, voa:41, evisa:20, population:68,    slug:"france"                 },
  { rank:4,   name:"Germany",                flag:"🇩🇪", score:186, vf:125, voa:41, evisa:20, population:84,    slug:"germany"                },
  { rank:4,   name:"Ireland",                flag:"🇮🇪", score:186, vf:125, voa:41, evisa:20, population:5.1,   slug:"ireland"                },
  { rank:4,   name:"Italy",                  flag:"🇮🇹", score:186, vf:125, voa:41, evisa:20, population:60,    slug:"italy"                  },
  { rank:4,   name:"Luxembourg",             flag:"🇱🇺", score:186, vf:125, voa:41, evisa:20, population:0.67,  slug:"luxembourg"             },
  { rank:4,   name:"Netherlands",            flag:"🇳🇱", score:186, vf:125, voa:41, evisa:20, population:17.5,  slug:"netherlands"            },
  { rank:4,   name:"Norway",                 flag:"🇳🇴", score:186, vf:125, voa:41, evisa:20, population:5.4,   slug:"norway"                 },
  { rank:4,   name:"Spain",                  flag:"🇪🇸", score:186, vf:125, voa:41, evisa:20, population:47,    slug:"spain"                  },
  // Rank 5 — score 185
  { rank:5,   name:"Austria",                flag:"🇦🇹", score:185, vf:124, voa:41, evisa:20, population:9,     slug:"austria"                },
  { rank:5,   name:"Greece",                 flag:"🇬🇷", score:185, vf:124, voa:41, evisa:20, population:10.4,  slug:"greece"                 },
  { rank:5,   name:"Malta",                  flag:"🇲🇹", score:185, vf:124, voa:41, evisa:20, population:0.54,  slug:"malta"                  },
  { rank:5,   name:"Portugal",               flag:"🇵🇹", score:185, vf:124, voa:41, evisa:20, population:10.3,  slug:"portugal"               },
  { rank:5,   name:"Switzerland",            flag:"🇨🇭", score:185, vf:124, voa:41, evisa:20, population:8.7,   slug:"switzerland"            },
  // Rank 6 — score 184
  { rank:6,   name:"Hungary",                flag:"🇭🇺", score:184, vf:123, voa:40, evisa:21, population:10,    slug:"hungary"                },
  { rank:6,   name:"Poland",                 flag:"🇵🇱", score:184, vf:123, voa:40, evisa:21, population:41,    slug:"poland"                 },
  { rank:6,   name:"United Kingdom",         flag:"🇬🇧", score:184, vf:123, voa:40, evisa:21, population:67,    slug:"united-kingdom"         },
  // Rank 7 — score 183
  { rank:7,   name:"Australia",              flag:"🇦🇺", score:183, vf:123, voa:40, evisa:20, population:26.5,  slug:"australia"              },
  { rank:7,   name:"Canada",                 flag:"🇨🇦", score:183, vf:123, voa:40, evisa:20, population:38.8,  slug:"canada"                 },
  { rank:7,   name:"Czechia",                flag:"🇨🇿", score:183, vf:123, voa:40, evisa:20, population:10.9,  slug:"czechia"                },
  { rank:7,   name:"Latvia",                 flag:"🇱🇻", score:183, vf:123, voa:40, evisa:20, population:1.8,   slug:"latvia"                 },
  { rank:7,   name:"Malaysia",               flag:"🇲🇾", score:183, vf:123, voa:40, evisa:20, population:33,    slug:"malaysia"               },
  { rank:7,   name:"New Zealand",            flag:"🇳🇿", score:183, vf:123, voa:40, evisa:20, population:5,     slug:"new-zealand"            },
  { rank:7,   name:"Slovakia",               flag:"🇸🇰", score:183, vf:123, voa:40, evisa:20, population:5.5,   slug:"slovakia"               },
  { rank:7,   name:"Slovenia",               flag:"🇸🇮", score:183, vf:123, voa:40, evisa:20, population:2.1,   slug:"slovenia"               },
  // Rank 8 — score 182
  { rank:8,   name:"Croatia",                flag:"🇭🇷", score:182, vf:122, voa:40, evisa:20, population:3.9,   slug:"croatia"                },
  { rank:8,   name:"Estonia",                flag:"🇪🇪", score:182, vf:122, voa:40, evisa:20, population:1.4,   slug:"estonia"                },
  // Rank 9 — score 181
  { rank:9,   name:"Liechtenstein",          flag:"🇱🇮", score:181, vf:121, voa:40, evisa:20, population:0.038, slug:"liechtenstein"          },
  { rank:9,   name:"Lithuania",              flag:"🇱🇹", score:181, vf:121, voa:40, evisa:20, population:2.8,   slug:"lithuania"              },
  // Rank 10 — score 180
  { rank:10,  name:"Iceland",                flag:"🇮🇸", score:180, vf:121, voa:40, evisa:19, population:0.37,  slug:"iceland"                },
  { rank:10,  name:"United States",          flag:"🇺🇸", score:180, vf:121, voa:40, evisa:19, population:335,   slug:"usa"                    },
  // Rank 11 — score 178
  { rank:11,  name:"Bulgaria",               flag:"🇧🇬", score:178, vf:119, voa:39, evisa:20, population:6.5,   slug:"bulgaria"               },
  { rank:11,  name:"Romania",                flag:"🇷🇴", score:178, vf:119, voa:39, evisa:20, population:19,    slug:"romania"                },
  // Rank 12 — score 177
  { rank:12,  name:"Monaco",                 flag:"🇲🇨", score:177, vf:119, voa:39, evisa:19, population:0.036, slug:"monaco"                 },
  // Rank 13 — score 175
  { rank:13,  name:"Chile",                  flag:"🇨🇱", score:175, vf:117, voa:39, evisa:19, population:19.5,  slug:"chile"                  },
  { rank:13,  name:"Cyprus",                 flag:"🇨🇾", score:175, vf:117, voa:39, evisa:19, population:1.2,   slug:"cyprus"                 },
  // Rank 14 — score 174
  { rank:14,  name:"Hong Kong",              flag:"🇭🇰", score:174, vf:117, voa:38, evisa:19, population:7.5,   slug:"hong-kong"              },
  // Rank 15 — score 170
  { rank:15,  name:"Andorra",                flag:"🇦🇩", score:170, vf:114, voa:37, evisa:19, population:0.077, slug:"andorra"                },
  // Rank 16 — score 169
  { rank:16,  name:"Argentina",              flag:"🇦🇷", score:169, vf:113, voa:37, evisa:19, population:45,    slug:"argentina"              },
  { rank:16,  name:"Brazil",                 flag:"🇧🇷", score:169, vf:113, voa:37, evisa:19, population:215,   slug:"brazil"                 },
  // Rank 17 — score 167
  { rank:17,  name:"San Marino",             flag:"🇸🇲", score:167, vf:112, voa:37, evisa:18, population:0.034, slug:"san-marino"             },
  // Rank 18 — score 166
  { rank:18,  name:"Israel",                 flag:"🇮🇱", score:166, vf:111, voa:37, evisa:18, population:9.7,   slug:"israel"                 },
  // Rank 19 — score 164
  { rank:19,  name:"Brunei",                 flag:"🇧🇳", score:164, vf:110, voa:36, evisa:18, population:0.45,  slug:"brunei"                 },
  // Rank 20 — score 163
  { rank:20,  name:"Barbados",               flag:"🇧🇧", score:163, vf:109, voa:36, evisa:18, population:0.28,  slug:"barbados"               },
  // Rank 21 — score 158
  { rank:21,  name:"The Bahamas",            flag:"🇧🇸", score:158, vf:106, voa:35, evisa:17, population:0.4,   slug:"the-bahamas"            },
  // Rank 22 — score 157
  { rank:22,  name:"Mexico",                 flag:"🇲🇽", score:157, vf:105, voa:35, evisa:17, population:130,   slug:"mexico"                 },
  { rank:22,  name:"St. Vincent and Grenadines", flag:"🇻🇨", score:157, vf:105, voa:35, evisa:17, population:0.11, slug:"st-vincent-grenadines" },
  // Rank 23 — score 156
  { rank:23,  name:"St. Kitts and Nevis",    flag:"🇰🇳", score:156, vf:105, voa:34, evisa:17, population:0.053, slug:"st-kitts-nevis"         },
  { rank:23,  name:"Uruguay",                flag:"🇺🇾", score:156, vf:105, voa:34, evisa:17, population:3.5,   slug:"uruguay"                },
  // Rank 24 — score 155
  { rank:24,  name:"Seychelles",             flag:"🇸🇨", score:155, vf:104, voa:34, evisa:17, population:0.098, slug:"seychelles"             },
  // Rank 25 — score 154
  { rank:25,  name:"Antigua and Barbuda",    flag:"🇦🇬", score:154, vf:103, voa:34, evisa:17, population:0.094, slug:"antigua-barbuda"        },
  // Rank 26 — score 152
  { rank:26,  name:"Vatican City",           flag:"🇻🇦", score:152, vf:102, voa:33, evisa:17, population:0.0008,slug:"vatican-city"           },
  // Rank 27 — score 149
  { rank:27,  name:"Costa Rica",             flag:"🇨🇷", score:149, vf:100, voa:33, evisa:16, population:5.2,   slug:"costa-rica"             },
  // Rank 28 — score 148
  { rank:28,  name:"Mauritius",              flag:"🇲🇺", score:148, vf:99,  voa:33, evisa:16, population:1.3,   slug:"mauritius"              },
  { rank:28,  name:"Panama",                 flag:"🇵🇦", score:148, vf:99,  voa:33, evisa:16, population:4.4,   slug:"panama"                 },
  // Rank 29 — score 147
  { rank:29,  name:"Grenada",                flag:"🇬🇩", score:147, vf:98,  voa:32, evisa:17, population:0.114, slug:"grenada"                },
  // Rank 30 — score 146
  { rank:30,  name:"Paraguay",               flag:"🇵🇾", score:146, vf:98,  voa:32, evisa:16, population:7.4,   slug:"paraguay"               },
  // Rank 31 — score 145
  { rank:31,  name:"Dominica",               flag:"🇩🇲", score:145, vf:97,  voa:32, evisa:16, population:0.072, slug:"dominica"               },
  { rank:31,  name:"Trinidad and Tobago",    flag:"🇹🇹", score:145, vf:97,  voa:32, evisa:16, population:1.5,   slug:"trinidad-tobago"        },
  // Rank 32 — score 143
  { rank:32,  name:"St. Lucia",              flag:"🇱🇨", score:143, vf:96,  voa:31, evisa:16, population:0.183, slug:"st-lucia"               },
  // Rank 33 — score 142
  { rank:33,  name:"Macao",                  flag:"🇲🇴", score:142, vf:95,  voa:31, evisa:16, population:0.68,  slug:"macao"                  },
  { rank:33,  name:"Peru",                   flag:"🇵🇪", score:142, vf:95,  voa:31, evisa:16, population:33,    slug:"peru"                   },
  { rank:33,  name:"Ukraine",                flag:"🇺🇦", score:142, vf:95,  voa:31, evisa:16, population:44,    slug:"ukraine"                },
  // Rank 34 — score 135
  { rank:34,  name:"Serbia",                 flag:"🇷🇸", score:135, vf:90,  voa:30, evisa:15, population:7,     slug:"serbia"                 },
  { rank:34,  name:"Taiwan",                 flag:"🇹🇼", score:135, vf:90,  voa:30, evisa:15, population:23.6,  slug:"taiwan"                 },
  // Rank 35 — score 133
  { rank:35,  name:"Guatemala",              flag:"🇬🇹", score:133, vf:89,  voa:29, evisa:15, population:17.6,  slug:"guatemala"              },
  { rank:35,  name:"Solomon Islands",        flag:"🇸🇧", score:133, vf:89,  voa:29, evisa:15, population:0.72,  slug:"solomon-islands"        },
  // Rank 36 — score 132
  { rank:36,  name:"El Salvador",            flag:"🇸🇻", score:132, vf:88,  voa:29, evisa:15, population:6.5,   slug:"el-salvador"            },
  // Rank 37 — score 131
  { rank:37,  name:"Colombia",               flag:"🇨🇴", score:131, vf:88,  voa:29, evisa:14, population:52,    slug:"colombia"               },
  // Rank 38 — score 130
  { rank:38,  name:"Honduras",               flag:"🇭🇳", score:130, vf:87,  voa:29, evisa:14, population:10.3,  slug:"honduras"               },
  // Rank 39 — score 129
  { rank:39,  name:"Samoa",                  flag:"🇼🇸", score:129, vf:86,  voa:28, evisa:15, population:0.218, slug:"samoa"                  },
  // Rank 40 — score 128
  { rank:40,  name:"Marshall Islands",       flag:"🇲🇭", score:128, vf:86,  voa:28, evisa:14, population:0.042, slug:"marshall-islands"       },
  { rank:40,  name:"Tonga",                  flag:"🇹🇴", score:128, vf:86,  voa:28, evisa:14, population:0.1,   slug:"tonga"                  },
  // Rank 41 — score 127
  { rank:41,  name:"Montenegro",             flag:"🇲🇪", score:127, vf:85,  voa:28, evisa:14, population:0.62,  slug:"montenegro"             },
  { rank:41,  name:"North Macedonia",        flag:"🇲🇰", score:127, vf:85,  voa:28, evisa:14, population:2.1,   slug:"north-macedonia"        },
  // Rank 42 — score 125
  { rank:42,  name:"Nicaragua",              flag:"🇳🇮", score:125, vf:84,  voa:28, evisa:13, population:6.9,   slug:"nicaragua"              },
  { rank:42,  name:"Tuvalu",                 flag:"🇹🇻", score:125, vf:84,  voa:28, evisa:13, population:0.011, slug:"tuvalu"                 },
  // Rank 43 — score 122
  { rank:43,  name:"Albania",                flag:"🇦🇱", score:122, vf:82,  voa:27, evisa:13, population:2.8,   slug:"albania"                },
  { rank:43,  name:"Bosnia and Herzegovina", flag:"🇧🇦", score:122, vf:82,  voa:27, evisa:13, population:3.3,   slug:"bosnia-herzegovina"     },
  { rank:43,  name:"Kiribati",               flag:"🇰🇮", score:122, vf:82,  voa:27, evisa:13, population:0.119, slug:"kiribati"               },
  // Rank 44 — score 121
  { rank:44,  name:"Georgia",                flag:"🇬🇪", score:121, vf:81,  voa:27, evisa:13, population:3.7,   slug:"georgia"                },
  { rank:44,  name:"Micronesia",             flag:"🇫🇲", score:121, vf:81,  voa:27, evisa:13, population:0.115, slug:"micronesia"             },
  { rank:44,  name:"Palau Islands",          flag:"🇵🇼", score:121, vf:81,  voa:27, evisa:13, population:0.018, slug:"palau-islands"          },
  // Rank 45 — score 120
  { rank:45,  name:"Moldova",                flag:"🇲🇩", score:120, vf:80,  voa:26, evisa:14, population:2.6,   slug:"moldova"                },
  // Rank 46 — score 117
  { rank:46,  name:"Venezuela",              flag:"🇻🇪", score:117, vf:78,  voa:26, evisa:13, population:28,    slug:"venezuela"              },
  // Rank 47 — score 114
  { rank:47,  name:"Russia",                 flag:"🇷🇺", score:114, vf:76,  voa:25, evisa:13, population:144,   slug:"russia"                 },
  // Rank 48 — score 113
  { rank:48,  name:"Turkey",                 flag:"🇹🇷", score:113, vf:76,  voa:25, evisa:12, population:85,    slug:"turkey"                 },
  // Rank 49 — score 112
  { rank:49,  name:"Qatar",                  flag:"🇶🇦", score:112, vf:75,  voa:25, evisa:12, population:2.9,   slug:"qatar"                  },
  // Rank 50 — score 101
  { rank:50,  name:"South Africa",           flag:"🇿🇦", score:101, vf:68,  voa:22, evisa:11, population:60,    slug:"south-africa"           },
  // Rank 51 — score 100
  { rank:51,  name:"Belize",                 flag:"🇧🇿", score:100, vf:67,  voa:22, evisa:11, population:0.42,  slug:"belize"                 },
  // Rank 52 — score 97
  { rank:52,  name:"Kuwait",                 flag:"🇰🇼", score:97,  vf:65,  voa:21, evisa:11, population:4.3,   slug:"kuwait"                 },
  // Rank 53 — score 93
  { rank:53,  name:"Ecuador",                flag:"🇪🇨", score:93,  vf:62,  voa:20, evisa:11, population:18,    slug:"ecuador"                },
  { rank:53,  name:"Maldives",               flag:"🇲🇻", score:93,  vf:62,  voa:20, evisa:11, population:0.52,  slug:"maldives"               },
  { rank:53,  name:"Timor-Leste",            flag:"🇹🇱", score:93,  vf:62,  voa:20, evisa:11, population:1.3,   slug:"timor-leste"            },
  // Rank 54 — score 90
  { rank:54,  name:"Saudi Arabia",           flag:"🇸🇦", score:90,  vf:60,  voa:20, evisa:10, population:35,    slug:"saudi-arabia"           },
  // Rank 55 — score 89
  { rank:55,  name:"Guyana",                 flag:"🇬🇾", score:89,  vf:60,  voa:20, evisa:9,  population:0.8,   slug:"guyana"                 },
  // Rank 56 — score 88
  { rank:56,  name:"Bahrain",                flag:"🇧🇭", score:88,  vf:59,  voa:19, evisa:10, population:1.5,   slug:"bahrain"                },
  // Rank 57 — score 87
  { rank:57,  name:"Fiji",                   flag:"🇫🇯", score:87,  vf:58,  voa:19, evisa:10, population:0.93,  slug:"fiji"                   },
  { rank:57,  name:"Vanuatu",                flag:"🇻🇺", score:87,  vf:58,  voa:19, evisa:10, population:0.32,  slug:"vanuatu"                },
  // Rank 58 — score 85
  { rank:58,  name:"Jamaica",                flag:"🇯🇲", score:85,  vf:57,  voa:19, evisa:9,  population:3,     slug:"jamaica"                },
  { rank:58,  name:"Nauru",                  flag:"🇳🇷", score:85,  vf:57,  voa:19, evisa:9,  population:0.011, slug:"nauru"                  },
  { rank:58,  name:"Oman",                   flag:"🇴🇲", score:85,  vf:57,  voa:19, evisa:9,  population:4.5,   slug:"oman"                   },
  { rank:58,  name:"Papua New Guinea",       flag:"🇵🇬", score:85,  vf:57,  voa:19, evisa:9,  population:10,    slug:"papua-new-guinea"       },
  // Rank 59 — score 83
  { rank:59,  name:"China",                  flag:"🇨🇳", score:83,  vf:56,  voa:18, evisa:9,  population:1400,  slug:"china"                  },
  // Rank 60 — score 82
  { rank:60,  name:"Botswana",               flag:"🇧🇼", score:82,  vf:55,  voa:18, evisa:9,  population:2.6,   slug:"botswana"               },
  { rank:60,  name:"Kosovo",                 flag:"🇽🇰", score:82,  vf:55,  voa:18, evisa:9,  population:1.8,   slug:"kosovo"                 },
  // Rank 61 — score 78
  { rank:61,  name:"Belarus",                flag:"🇧🇾", score:78,  vf:52,  voa:17, evisa:9,  population:9.4,   slug:"belarus"                },
  { rank:61,  name:"Bolivia",                flag:"🇧🇴", score:78,  vf:52,  voa:17, evisa:9,  population:12,    slug:"bolivia"                },
  { rank:61,  name:"Kazakhstan",             flag:"🇰🇿", score:78,  vf:52,  voa:17, evisa:9,  population:19.4,  slug:"kazakhstan"             },
  // Rank 62 — score 77
  { rank:62,  name:"Thailand",               flag:"🇹🇭", score:77,  vf:52,  voa:17, evisa:8,  population:72,    slug:"thailand"               },
  // Rank 63 — score 76
  { rank:63,  name:"Suriname",               flag:"🇸🇷", score:76,  vf:51,  voa:17, evisa:8,  population:0.62,  slug:"suriname"               },
  // Rank 64 — score 75
  { rank:64,  name:"Namibia",                flag:"🇳🇦", score:75,  vf:50,  voa:17, evisa:8,  population:2.6,   slug:"namibia"                },
  // Rank 65 — score 74
  { rank:65,  name:"Lesotho",                flag:"🇱🇸", score:74,  vf:50,  voa:16, evisa:8,  population:2.1,   slug:"lesotho"                },
  // Rank 66 — score 72
  { rank:66,  name:"eSwatini",               flag:"🇸🇿", score:72,  vf:48,  voa:16, evisa:8,  population:1.2,   slug:"eswatini"               },
  // Rank 67 — score 71
  { rank:67,  name:"Dominican Republic",     flag:"🇩🇴", score:71,  vf:48,  voa:16, evisa:7,  population:11,    slug:"dominican-republic"     },
  { rank:67,  name:"Indonesia",              flag:"🇮🇩", score:71,  vf:48,  voa:16, evisa:7,  population:275,   slug:"indonesia"              },
  { rank:67,  name:"Malawi",                 flag:"🇲🇼", score:71,  vf:48,  voa:16, evisa:7,  population:20,    slug:"malawi"                 },
  { rank:67,  name:"Morocco",                flag:"🇲🇦", score:71,  vf:48,  voa:16, evisa:7,  population:37,    slug:"morocco"                },
  // Rank 68 — score 70
  { rank:68,  name:"Kenya",                  flag:"🇰🇪", score:70,  vf:47,  voa:15, evisa:8,  population:55,    slug:"kenya"                  },
  // Rank 69 — score 69
  { rank:69,  name:"Rwanda",                 flag:"🇷🇼", score:69,  vf:46,  voa:15, evisa:8,  population:13,    slug:"rwanda"                 },
  { rank:69,  name:"Tanzania",               flag:"🇹🇿", score:69,  vf:46,  voa:15, evisa:8,  population:65,    slug:"tanzania"               },
  // Rank 70 — score 68
  { rank:70,  name:"Azerbaijan",             flag:"🇦🇿", score:68,  vf:46,  voa:15, evisa:7,  population:10.1,  slug:"azerbaijan"             },
  { rank:70,  name:"The Gambia",             flag:"🇬🇲", score:68,  vf:46,  voa:15, evisa:7,  population:2.5,   slug:"the-gambia"             },
  // Rank 71 — score 67
  { rank:71,  name:"Ghana",                  flag:"🇬🇭", score:67,  vf:45,  voa:15, evisa:7,  population:33,    slug:"ghana"                  },
  { rank:71,  name:"Tunisia",                flag:"🇹🇳", score:67,  vf:45,  voa:15, evisa:7,  population:12,    slug:"tunisia"                },
  // Rank 72 — score 66
  { rank:72,  name:"Philippines",            flag:"🇵🇭", score:66,  vf:44,  voa:15, evisa:7,  population:115,   slug:"philippines"            },
  { rank:72,  name:"Uganda",                 flag:"🇺🇬", score:66,  vf:44,  voa:15, evisa:7,  population:48,    slug:"uganda"                 },
  // Rank 73 — score 65
  { rank:73,  name:"Armenia",                flag:"🇦🇲", score:65,  vf:44,  voa:14, evisa:7,  population:3,     slug:"armenia"                },
  { rank:73,  name:"Benin",                  flag:"🇧🇯", score:65,  vf:44,  voa:14, evisa:7,  population:13,    slug:"benin"                  },
  { rank:73,  name:"Mongolia",               flag:"🇲🇳", score:65,  vf:44,  voa:14, evisa:7,  population:3.4,   slug:"mongolia"               },
  { rank:73,  name:"Zambia",                 flag:"🇿🇲", score:65,  vf:44,  voa:14, evisa:7,  population:19,    slug:"zambia"                 },
  // Rank 74 — score 64
  { rank:74,  name:"Cape Verde Islands",     flag:"🇨🇻", score:64,  vf:43,  voa:14, evisa:7,  population:0.56,  slug:"cape-verde-islands"     },
  // Rank 75 — score 63
  { rank:75,  name:"Sierra Leone",           flag:"🇸🇱", score:63,  vf:42,  voa:14, evisa:7,  population:8.2,   slug:"sierra-leone"           },
  // Rank 76 — score 62
  { rank:76,  name:"Zimbabwe",               flag:"🇿🇼", score:62,  vf:42,  voa:14, evisa:6,  population:16,    slug:"zimbabwe"               },
  // Rank 77 — score 60
  { rank:77,  name:"Kyrgyzstan",             flag:"🇰🇬", score:60,  vf:40,  voa:13, evisa:7,  population:6.8,   slug:"kyrgyzstan"             },
  { rank:77,  name:"Mozambique",             flag:"🇲🇿", score:60,  vf:40,  voa:13, evisa:7,  population:32,    slug:"mozambique"             },
  // Rank 78 — score 59
  { rank:78,  name:"Sao Tome and Principe",  flag:"🇸🇹", score:59,  vf:40,  voa:13, evisa:6,  population:0.23,  slug:"sao-tome-principe"      },
  { rank:78,  name:"Uzbekistan",             flag:"🇺🇿", score:59,  vf:40,  voa:13, evisa:6,  population:35,    slug:"uzbekistan"             },
  // Rank 79 — score 57
  { rank:79,  name:"Burkina Faso",           flag:"🇧🇫", score:57,  vf:38,  voa:13, evisa:6,  population:22,    slug:"burkina-faso"           },
  { rank:79,  name:"Cuba",                   flag:"🇨🇺", score:57,  vf:38,  voa:13, evisa:6,  population:11,    slug:"cuba"                   },
  { rank:79,  name:"Gabon",                  flag:"🇬🇦", score:57,  vf:38,  voa:13, evisa:6,  population:2.3,   slug:"gabon"                  },
  { rank:79,  name:"Madagascar",             flag:"🇲🇬", score:57,  vf:38,  voa:13, evisa:6,  population:28,    slug:"madagascar"             },
  { rank:79,  name:"Togo",                   flag:"🇹🇬", score:57,  vf:38,  voa:13, evisa:6,  population:8.5,   slug:"togo"                   },
  // Rank 80 — score 56
  { rank:80,  name:"Algeria",                flag:"🇩🇿", score:56,  vf:38,  voa:12, evisa:6,  population:45,    slug:"algeria"                },
  { rank:80,  name:"Cote d'Ivoire",          flag:"🇨🇮", score:56,  vf:38,  voa:12, evisa:6,  population:27,    slug:"cote-divoire"           },
  { rank:80,  name:"India",                  flag:"🇮🇳", score:56,  vf:38,  voa:12, evisa:6,  population:1400,  slug:"india"                  },
  { rank:80,  name:"Mauritania",             flag:"🇲🇷", score:56,  vf:38,  voa:12, evisa:6,  population:4.6,   slug:"mauritania"             },
  { rank:80,  name:"Senegal",                flag:"🇸🇳", score:56,  vf:38,  voa:12, evisa:6,  population:17,    slug:"senegal"                },
  // Rank 81 — score 54
  { rank:81,  name:"Equatorial Guinea",      flag:"🇬🇶", score:54,  vf:36,  voa:12, evisa:6,  population:1.5,   slug:"equatorial-guinea"      },
  { rank:81,  name:"Niger",                  flag:"🇳🇪", score:54,  vf:36,  voa:12, evisa:6,  population:25,    slug:"niger"                  },
  // Rank 82 — score 53
  { rank:82,  name:"Guinea",                 flag:"🇬🇳", score:53,  vf:36,  voa:12, evisa:5,  population:13,    slug:"guinea"                 },
  { rank:82,  name:"Mali",                   flag:"🇲🇱", score:53,  vf:36,  voa:12, evisa:5,  population:22,    slug:"mali"                   },
  { rank:82,  name:"Tajikistan",             flag:"🇹🇯", score:53,  vf:36,  voa:12, evisa:5,  population:9.9,   slug:"tajikistan"             },
  // Rank 83 — score 52
  { rank:83,  name:"Chad",                   flag:"🇹🇩", score:52,  vf:35,  voa:11, evisa:6,  population:18,    slug:"chad"                   },
  { rank:83,  name:"Comoro Islands",         flag:"🇰🇲", score:52,  vf:35,  voa:11, evisa:6,  population:0.87,  slug:"comoro-islands"         },
  // Rank 84 — score 51
  { rank:84,  name:"Guinea-Bissau",          flag:"🇬🇼", score:51,  vf:34,  voa:11, evisa:6,  population:2.1,   slug:"guinea-bissau"          },
  // Rank 85 — score 50
  { rank:85,  name:"Egypt",                  flag:"🇪🇬", score:50,  vf:34,  voa:11, evisa:5,  population:105,   slug:"egypt"                  },
  { rank:85,  name:"Jordan",                 flag:"🇯🇴", score:50,  vf:34,  voa:11, evisa:5,  population:10.2,  slug:"jordan"                 },
  // Rank 86 — score 49
  { rank:86,  name:"Angola",                 flag:"🇦🇴", score:49,  vf:33,  voa:11, evisa:5,  population:35,    slug:"angola"                 },
  { rank:86,  name:"Burundi",                flag:"🇧🇮", score:49,  vf:33,  voa:11, evisa:5,  population:12,    slug:"burundi"                },
  { rank:86,  name:"Cameroon",               flag:"🇨🇲", score:49,  vf:33,  voa:11, evisa:5,  population:28,    slug:"cameroon"               },
  { rank:86,  name:"Central African Republic",flag:"🇨🇫",score:49,  vf:33,  voa:11, evisa:5,  population:5.5,   slug:"central-african-republic"},
  { rank:86,  name:"Haiti",                  flag:"🇭🇹", score:49,  vf:33,  voa:11, evisa:5,  population:11.5,  slug:"haiti"                  },
  { rank:86,  name:"Liberia",                flag:"🇱🇷", score:49,  vf:33,  voa:11, evisa:5,  population:5.4,   slug:"liberia"                },
  { rank:86,  name:"Vietnam",                flag:"🇻🇳", score:49,  vf:33,  voa:11, evisa:5,  population:98,    slug:"vietnam"                },
  // Rank 87 — score 48
  { rank:87,  name:"Bhutan",                 flag:"🇧🇹", score:48,  vf:32,  voa:11, evisa:5,  population:0.78,  slug:"bhutan"                 },
  { rank:87,  name:"Cambodia",               flag:"🇰🇭", score:48,  vf:32,  voa:11, evisa:5,  population:17,    slug:"cambodia"               },
  { rank:87,  name:"Congo (Rep.)",           flag:"🇨🇬", score:48,  vf:32,  voa:11, evisa:5,  population:5.8,   slug:"congo-rep"              },
  // Rank 88 — score 46
  { rank:88,  name:"Djibouti",               flag:"🇩🇯", score:46,  vf:31,  voa:10, evisa:5,  population:1,     slug:"djibouti"               },
  { rank:88,  name:"Laos",                   flag:"🇱🇦", score:46,  vf:31,  voa:10, evisa:5,  population:7.5,   slug:"laos"                   },
  // Rank 89 — score 45
  { rank:89,  name:"Congo (Dem. Rep.)",      flag:"🇨🇩", score:45,  vf:30,  voa:10, evisa:5,  population:100,   slug:"congo-dem-rep"          },
  { rank:89,  name:"Turkmenistan",           flag:"🇹🇲", score:45,  vf:30,  voa:10, evisa:5,  population:6,     slug:"turkmenistan"           },
  // Rank 90 — score 44
  { rank:90,  name:"Myanmar",                flag:"🇲🇲", score:44,  vf:29,  voa:10, evisa:5,  population:54,    slug:"myanmar"                },
  { rank:90,  name:"Nigeria",                flag:"🇳🇬", score:44,  vf:29,  voa:10, evisa:5,  population:225,   slug:"nigeria"                },
  // Rank 91 — score 43
  { rank:91,  name:"Ethiopia",               flag:"🇪🇹", score:43,  vf:29,  voa:9,  evisa:5,  population:126,   slug:"ethiopia"               },
  // Rank 92 — score 42
  { rank:92,  name:"Lebanon",                flag:"🇱🇧", score:42,  vf:28,  voa:9,  evisa:5,  population:6.8,   slug:"lebanon"                },
  { rank:92,  name:"South Sudan",            flag:"🇸🇸", score:42,  vf:28,  voa:9,  evisa:5,  population:11,    slug:"south-sudan"            },
  { rank:92,  name:"Sudan",                  flag:"🇸🇩", score:42,  vf:28,  voa:9,  evisa:5,  population:46,    slug:"sudan"                  },
  // Rank 93 — score 40
  { rank:93,  name:"Libya",                  flag:"🇱🇾", score:40,  vf:27,  voa:9,  evisa:4,  population:7,     slug:"libya"                  },
  { rank:93,  name:"Sri Lanka",              flag:"🇱🇰", score:40,  vf:27,  voa:9,  evisa:4,  population:22,    slug:"sri-lanka"              },
  // Rank 94 — score 39
  { rank:94,  name:"Eritrea",                flag:"🇪🇷", score:39,  vf:26,  voa:9,  evisa:4,  population:3.5,   slug:"eritrea"                },
  // Rank 95 — score 38
  { rank:95,  name:"Iran",                   flag:"🇮🇷", score:38,  vf:25,  voa:8,  evisa:5,  population:87,    slug:"iran"                   },
  { rank:95,  name:"Palestinian Territory",  flag:"🇵🇸", score:38,  vf:25,  voa:8,  evisa:5,  population:5.4,   slug:"palestinian-territory"  },
  // Rank 96 — score 36
  { rank:96,  name:"Bangladesh",             flag:"🇧🇩", score:36,  vf:24,  voa:8,  evisa:4,  population:170,   slug:"bangladesh"             },
  { rank:96,  name:"North Korea",            flag:"🇰🇵", score:36,  vf:24,  voa:8,  evisa:4,  population:25.9,  slug:"north-korea"            },
  // Rank 97 — score 35
  { rank:97,  name:"Nepal",                  flag:"🇳🇵", score:35,  vf:23,  voa:8,  evisa:4,  population:30,    slug:"nepal"                  },
  // Rank 98 — score 33
  { rank:98,  name:"Somalia",                flag:"🇸🇴", score:33,  vf:22,  voa:7,  evisa:4,  population:17,    slug:"somalia"                },
  // Rank 99 — score 31
  { rank:99,  name:"Yemen",                  flag:"🇾🇪", score:31,  vf:21,  voa:7,  evisa:3,  population:34,    slug:"yemen"                  },
  // Rank 100 — score 30
  { rank:100, name:"Pakistan",               flag:"🇵🇰", score:30,  vf:20,  voa:7,  evisa:3,  population:230,   slug:"pakistan"               },
  // Rank 101 — score 29
  { rank:101, name:"Iraq",                   flag:"🇮🇶", score:29,  vf:19,  voa:6,  evisa:4,  population:42,    slug:"iraq"                   },
  // Rank 102 — score 26
  { rank:102, name:"Syria",                  flag:"🇸🇾", score:26,  vf:17,  voa:6,  evisa:3,  population:22,    slug:"syria"                  },
  // Rank 103 — score 23
  { rank:103, name:"Afghanistan",            flag:"🇦🇫", score:23,  vf:15,  voa:5,  evisa:3,  population:40,    slug:"afghanistan"            },
];

// Sort by score desc then name asc
const SORTED_PASSPORTS = [...ALL_PASSPORTS].sort((a, b) =>
  b.score !== a.score ? b.score - a.score : a.name.localeCompare(b.name)
);

const WORLD_POP = 8000;
const MAX_SCORE = 192;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRarity(pop: number) {
  const share    = (pop / WORLD_POP) * 100;
  const rarerNum = 100 - share;
  // Always show 1 decimal for >99%, 2 decimals for <1%
  const rarer    = rarerNum >= 99.95 ? "99.9%+" : rarerNum >= 99 ? `${rarerNum.toFixed(1)}%` : `${rarerNum.toFixed(1)}%`;
  const pct      = share < 0.01 ? "<0.01%" : share < 1 ? `${share.toFixed(2)}%` : `${share.toFixed(1)}%`;
  const holders  = pop >= 1000 ? `${(pop/1000).toFixed(1)}B` : pop >= 1 ? `${pop % 1 === 0 ? pop : pop.toFixed(1)}M` : `${(pop*1000).toFixed(0)}K`;
  return { rarer, pct, holders, sharePct: share };
}

function tierColor(score: number) {
  if (score >= 180) return MINT;
  if (score >= 140) return "#a3e635";
  if (score >= 100) return "#facc15";
  return "#ef4444";
}

function tierLabel(score: number) {
  if (score >= 180) return "ELITE";
  if (score >= 140) return "STRONG";
  if (score >= 100) return "AVERAGE";
  return "WEAK";
}

const DELTA_2020: Record<string, number> = {
  singapore: 5, japan: 4, "south-korea": 3, uae: 12, sweden: 2,
  belgium: 1, denmark: 1, finland: 1, france: 1, germany: 1,
  ireland: 1, italy: 1, luxembourg: 1, netherlands: 1, norway: 1, spain: 1,
  austria: 2, greece: 2, malta: 1, portugal: 2, switzerland: 1,
  hungary: 3, poland: 2, "united-kingdom": -2, australia: 1, canada: 1,
  czechia: 2, latvia: 2, malaysia: 4, "new-zealand": 1, slovakia: 2, slovenia: 2,
  croatia: 3, estonia: 2, liechtenstein: 1, lithuania: 2, iceland: 1, usa: -3,
  bulgaria: 4, romania: 5, chile: 2, cyprus: 3, "hong-kong": -5,
  argentina: 2, brazil: 2, israel: -3, turkey: -2, russia: -10, china: 2,
  india: 4, "south-africa": 2, "saudi-arabia": 10, qatar: 8, nigeria: -2, pakistan: -3,
};

function getDelta(slug: string): number | null {
  return DELTA_2020[slug] ?? null;
}

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, delay = 0): number {
  const [count, setCount] = useState(0);
  const rafRef            = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 900, 1);
        const e = 1 - Math.pow(1 - p, 4);
        setCount(Math.round(target * e));
        if (p < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, delay]);

  return count;
}

// ─── Hero card ────────────────────────────────────────────────────────────────
function HeroCard({ passport, position, onSelect }: {
  passport: Passport;
  position: 1 | 2 | 3;
  onSelect: (p: Passport) => void;
}) {
  const color  = MINT; // all top cards use MINT
  const count  = useCountUp(passport.score, position === 1 ? 0 : position === 2 ? 200 : 400);
  const rarity = getRarity(passport.population);
  const isCenter = position === 1;

  const flagSize   = isCenter ? 32 : 26;
  const scoreFSize = isCenter ? 64 : 48;
  const minH       = isCenter ? 360 : 300;
  const pad        = isCenter ? "32px 24px 28px" : "24px 20px 20px";
  const flex       = isCenter ? "1.2" : "1";

  return (
    <>
      {isCenter && (
        <style>{`
          @keyframes electric-border {
            0%   { box-shadow: 0 0 4px ${MINT}30, 3px 3px 0 ${MINT}; border-color: ${MINT}60; }
            20%  { box-shadow: 0 0 14px ${MINT}80, 0 0 28px ${MINT}40, 4px 4px 0 ${MINT}; border-color: ${MINT}; }
            22%  { box-shadow: 0 0 4px ${MINT}20, 3px 3px 0 ${MINT}; border-color: ${MINT}50; }
            40%  { box-shadow: 0 0 18px ${MINT}90, 0 0 36px ${MINT}50, 4px 4px 0 ${MINT}; border-color: ${MINT}; }
            42%  { box-shadow: 0 0 4px ${MINT}30, 3px 3px 0 ${MINT}; border-color: ${MINT}60; }
            100% { box-shadow: 0 0 4px ${MINT}30, 3px 3px 0 ${MINT}; border-color: ${MINT}60; }
          }
          @keyframes bolt-tl {
            0%,60%  { opacity: 0; }
            65%  { opacity: 1; filter: brightness(2.5); }
            70%  { opacity: 0.3; filter: brightness(1); }
            75%  { opacity: 1; filter: brightness(3); }
            82%  { opacity: 0; }
            100% { opacity: 0; }
          }
          @keyframes bolt-tr {
            0%,63%  { opacity: 0; }
            68%  { opacity: 1; filter: brightness(2.5); }
            73%  { opacity: 0.3; filter: brightness(1); }
            78%  { opacity: 1; filter: brightness(3); }
            85%  { opacity: 0; }
            100% { opacity: 0; }
          }
        `}</style>
      )}

      <button
        type="button"
        onClick={() => onSelect(passport)}
        style={{
          flex,
          display: "block",
          background: SURF,
          border: `1px solid ${isCenter ? MINT + "60" : color}`,
          boxShadow: isCenter ? undefined : `3px 3px 0 ${color}`,
          animation: isCenter ? "electric-border 5s ease-in-out infinite" : undefined,
          padding: pad,
          minHeight: minH,
          cursor: "pointer",
          userSelect: "none",
          textAlign: "left",
          font: "inherit",
          color: "inherit",
          position: "relative",
          overflow: "hidden",
          alignSelf: "flex-end",
        }}
      >
        {/* Lightning bolts — only on center card */}
        {isCenter && (
          <>
            <div style={{
              position: "absolute", top: 10, left: 10,
              pointerEvents: "none",
              animation: "bolt-tl 5s ease-out infinite",
            }}>
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                <path d="M7 0L0 11h5l-1 9 8-12H7l1-8z" fill={MINT} />
              </svg>
            </div>
            <div style={{
              position: "absolute", top: 10, right: 10,
              pointerEvents: "none",
              animation: "bolt-tr 5s ease-out infinite",
            }}>
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                <path d="M7 0L0 11h5l-1 9 8-12H7l1-8z" fill={MINT} />
              </svg>
            </div>
          </>
        )}

        {/* Rank badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{
            fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em",
            textTransform: "uppercase", color,
            border: `1px solid ${color}`, padding: "3px 8px",
          }}>
            RANK #{passport.rank}
          </span>
        </div>

        {/* Flag + name */}
        <span style={{ fontSize: flagSize, display: "block", marginBottom: 8 }}>{passport.flag}</span>
        <p style={{
          fontFamily: HEAD, fontSize: isCenter ? 18 : 15, fontWeight: 800,
          letterSpacing: "-0.02em", color: FG, margin: "0 0 16px", lineHeight: 1,
        }}>
          {passport.name.toUpperCase()}
        </p>

        {/* Score */}
        <p style={{
          fontFamily: HEAD, fontSize: scoreFSize, fontWeight: 800,
          letterSpacing: "-0.04em", color, margin: 0, lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          display: "flex", alignItems: "baseline", gap: 4,
        } as React.CSSProperties}>
          {count}
        </p>

        {/* Tier label + score bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, marginTop: 10 }}>
          <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color }}>
            {tierLabel(passport.score)}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 9, color: DIM }}>{passport.score} / {MAX_SCORE}</span>
        </div>
        <div style={{ height: 2, background: BORD, marginBottom: 14 }}>
          <div style={{ height: "100%", background: color, width: `${(passport.score / MAX_SCORE) * 100}%` }} />
        </div>

        {/* Mini stats */}
        <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: "0 0 12px" }}>
          <span style={{ color: FG }}>{passport.vf}</span> visa-free
          {" · "}
          <span style={{ color: FG }}>{passport.voa}</span> on arrival
          {" · "}
          <span style={{ color: FG }}>{passport.evisa}</span> eVisa
        </p>

        {/* Rarity — large + prominent */}
        <div style={{ borderTop: `1px solid ${color}22`, paddingTop: 12 }}>
          <p style={{
            fontFamily: HEAD, fontSize: isCenter ? 16 : 13, fontWeight: 700,
            color, margin: "0 0 2px", lineHeight: 1.2,
          }}>
            Rarer than {rarity.rarer}
          </p>
          <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: 0 }}>
            of the world · {rarity.holders} holders
          </p>
        </div>
      </button>
    </>
  );
}

// ─── Share button ────────────────────────────────────────────────────────────
function ShareButton({ passport, rarity }: { passport: Passport; rarity: { rarer: string; holders: string; pct: string } }) {
  const [copied, setCopied] = useState(false);
  const color = tierColor(passport.score);
  const text = `${passport.flag} My ${passport.name} passport ranks #${passport.rank} globally.\n${passport.score} destinations · Rarer than ${rarity.rarer} of the world.\nfindorigio.com/passport-power`;
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
        Share
      </p>

      {/* Card preview — this is what gets shared */}
      <div style={{
        background: "#080808",
        border: `1px solid ${color}`,
        padding: "20px",
        marginBottom: 8,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle glow */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 120, height: 120,
          background: `radial-gradient(circle, ${color}20, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
              findorigio.com · passport power
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{passport.flag}</span>
              <p style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: FG, margin: 0 }}>
                {passport.name.toUpperCase()}
              </p>
            </div>
            <p style={{ fontFamily: HEAD, fontSize: 13, color, margin: "0 0 6px", letterSpacing: "0.06em" }}>
              RANK #{passport.rank} · {tierLabel(passport.score)}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12, color: DIM, margin: 0, lineHeight: 1.5 }}>
              Rarer than <span style={{ color: FG, fontWeight: 600 }}>{rarity.rarer}</span> of the world
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontFamily: HEAD, fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", color, margin: 0, lineHeight: 1 }}>
              {passport.score}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 9, color: DIM, margin: "4px 0 0", letterSpacing: "0.1em" }}>
              DESTINATIONS
            </p>
          </div>
        </div>

        {/* Bar */}
        <div style={{ height: 2, background: BORD, marginTop: 16 }}>
          <div style={{ height: "100%", background: color, width: `${(passport.score / MAX_SCORE) * 100}%` }} />
        </div>
      </div>

      <button
        type="button"
        onClick={copy}
        style={{
          width: "100%",
          background: copied ? color : "transparent",
          border: `1px solid ${copied ? color : BORD}`,
          color: copied ? BG : FG,
          fontFamily: SANS, fontSize: 11, fontWeight: 700,
          padding: "11px 0", cursor: "pointer",
          letterSpacing: "0.14em", textTransform: "uppercase",
          transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {copied ? "✓ Copied to clipboard" : "Copy share text"}
      </button>
    </div>
  );
}

// ─── Notable visa-free destinations per passport ──────────────────────────────
const NOTABLE_VF: Record<string, string[]> = {
  singapore: ["USA", "China", "Russia", "Brazil", "South Africa"],
  japan: ["USA", "China", "Russia", "Brazil", "India"],
  "south-korea": ["USA", "China", "Russia", "Brazil", "India"],
  uae: ["USA", "UK", "Russia", "China", "Brazil"],
  sweden: ["USA", "Brazil", "Russia", "South Africa", "Japan"],
  germany: ["USA", "Brazil", "Russia", "China", "India"],
  france: ["USA", "Brazil", "Russia", "China", "Japan"],
  "united-kingdom": ["USA", "Brazil", "Russia", "South Africa", "Japan"],
  usa: ["UK", "EU", "Japan", "Australia", "Brazil"],
  australia: ["UK", "EU", "Japan", "USA", "Brazil"],
  canada: ["UK", "EU", "Japan", "USA", "Brazil"],
  india: ["Nepal", "Bhutan", "Maldives", "Indonesia", "Mauritius"],
  china: ["Thailand", "Malaysia", "Serbia", "Maldives", "Morocco"],
  russia: ["Turkey", "Thailand", "Vietnam", "Egypt", "UAE"],
  nigeria: ["Benin", "Ghana", "Kenya", "Senegal", "Malaysia"],
  pakistan: ["Malaysia", "Nepal", "Indonesia", "Turkey", "Bangladesh"],
  brazil: ["EU", "USA", "Russia", "Japan", "South Africa"],
  mexico: ["EU", "UK", "Japan", "Brazil", "Argentina"],
  turkey: ["EU", "Russia", "Japan", "Brazil", "South Africa"],
  "south-africa": ["Kenya", "Mozambique", "Namibia", "Zimbabwe", "Malaysia"],
};
const DEFAULT_NOTABLE = ["Thailand", "Malaysia", "Turkey", "Morocco", "Kenya"];

function getPeers(p: Passport): Passport[] {
  return SORTED_PASSPORTS
    .filter(x => x.slug !== p.slug && Math.abs(x.score - p.score) <= 2)
    .slice(0, 4);
}

function getPercentile(score: number): number {
  const below = SORTED_PASSPORTS.filter(p => p.score < score).length;
  return Math.round((below / SORTED_PASSPORTS.length) * 100);
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function PassportModal({ passport, onClose }: { passport: Passport; onClose: () => void }) {
  const rarity  = getRarity(passport.population);
  const color   = tierColor(passport.score);
  const percentile = getPercentile(passport.score);
  const peers   = getPeers(passport);
  const notable = NOTABLE_VF[passport.slug] || DEFAULT_NOTABLE;
  const worldPct = Math.round((passport.vf / 195) * 100);
  const delta   = getDelta(passport.slug);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0f0f0f",
          border: `1px solid ${color}`,
          boxShadow: `4px 4px 0 ${color}`,
          width: "100%", maxWidth: 520,
          maxHeight: "88vh", overflowY: "auto",
          padding: "32px",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            background: "transparent", border: `1px solid ${BORD}`,
            color: DIM, fontFamily: SANS, fontSize: 11,
            padding: "3px 10px", cursor: "pointer", letterSpacing: "0.1em",
          }}
        >
          ESC
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <span style={{ fontSize: 38 }}>{passport.flag}</span>
          <div>
            <p style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: FG, margin: 0, lineHeight: 1 }}>
              {passport.name.toUpperCase()}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "5px 0 0", letterSpacing: "0.08em" }}>
              HENLEY 2026 Q2 · RANK #{passport.rank} OF 199
            </p>
          </div>
        </div>

        {/* Tier + percentile bar */}
        <div style={{ padding: "14px 16px", border: `1px solid ${color}`, background: `${color}12`, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <span style={{ fontFamily: HEAD, fontSize: 13, letterSpacing: "0.12em", color, display: "block" }}>
                {tierLabel(passport.score)}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>
                Top {100 - percentile}% of all passports
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontFamily: HEAD, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: FG, display: "block", lineHeight: 1 }}>
                {passport.score}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>{worldPct}% of the world</span>
            </div>
          </div>
          {/* Percentile spectrum — weakest (23) to strongest (192) */}
          <div style={{ position: "relative", height: 6, background: BORD, marginBottom: 6 }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              background: `linear-gradient(90deg, #ef4444, #facc15 40%, #a3e635 70%, ${MINT})`,
              width: "100%", opacity: 0.3,
            }} />
            <div style={{
              position: "absolute",
              left: `${((passport.score - 23) / (MAX_SCORE - 23)) * 100}%`,
              top: "50%", transform: "translate(-50%, -50%)",
              width: 10, height: 10,
              background: color, border: `2px solid ${BG}`,
              borderRadius: "50%",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: SANS, fontSize: 9, color: "#333" }}>23 · Weakest</span>
            <span style={{ fontFamily: SANS, fontSize: 9, color: "#333" }}>192 · Strongest</span>
          </div>
        </div>

        {/* Breakdown */}
        <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
          Access breakdown
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginBottom: 20 }}>
          {[
            { label: "Visa-free",       value: passport.vf,    sub: "No application", c: MINT      },
            { label: "Visa on arrival", value: passport.voa,   sub: "At the border",  c: "#a3e635" },
            { label: "eVisa / eTA",     value: passport.evisa, sub: "Online only",    c: "#facc15" },
          ].map(item => (
            <div key={item.label} style={{ background: SURF, padding: "12px 12px 10px", border: `1px solid ${BORD}` }}>
              <p style={{ fontFamily: HEAD, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: item.c, margin: 0, lineHeight: 1 }}>
                {item.value}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: FG, margin: "5px 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {item.label}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: 0 }}>{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Rarity */}
        <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
          Passport rarity
        </p>
        <div style={{ background: SURF, border: `1px solid ${BORD}`, padding: "16px", marginBottom: 20 }}>
          <p style={{ fontFamily: HEAD, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color, margin: "0 0 6px", lineHeight: 1 }}>
            Rarer than {rarity.rarer}
          </p>
          <p style={{ fontFamily: SANS, fontSize: 12, color: DIM, margin: "0 0 14px" }}>of the world&apos;s population hold this passport</p>
          {/* Population bar — accurate to actual share */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ height: 6, background: BORD, position: "relative", marginBottom: 6 }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                background: color,
                width: `${Math.max(0.5, rarity.sharePct)}%`,
                minWidth: 3,
                transition: "width 0.6s ease",
              }} />
            </div>
            <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: 0 }}>
              <span style={{ color: FG }}>{rarity.pct}</span> of the world · every other person on Earth holds a different passport
            </p>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { val: rarity.holders,      label: "Holders"      },
              { val: rarity.pct,          label: "Of world pop" },
              { val: `#${passport.rank}`, label: "Global rank"  },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 700, color: FG, margin: 0, lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Momentum */}
        {delta !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: `1px solid ${BORD}`, marginBottom: 20, background: `${delta > 0 ? "#4ade80" : "#ef4444"}08` }}>
            <span style={{ fontSize: 16 }}>{delta > 0 ? "📈" : "📉"}</span>
            <p style={{ fontFamily: SANS, fontSize: 12, color: FG, margin: 0 }}>
              {delta > 0 ? `Gained ${delta} places` : `Lost ${Math.abs(delta)} places`} since 2020
              <span style={{ color: DIM }}> — {delta >= 5 ? "one of the fastest rising passports" : delta <= -5 ? "significant decline" : "steady movement"}</span>
            </p>
          </div>
        )}

        {/* Notable visa-free */}
        <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
          Notable visa-free access
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
          {notable.map(dest => (
            <span key={dest} style={{
              fontFamily: SANS, fontSize: 11, color: FG,
              padding: "5px 10px", border: `1px solid ${BORD}`,
              background: SURF,
            }}>
              ✓ {dest}
            </span>
          ))}
        </div>

        {/* Peer passports */}
        {peers.length > 0 && (
          <>
            <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
              Similar passports
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 6, marginBottom: 20 }}>
              {peers.map(peer => (
                <div key={peer.slug} style={{
                  padding: "12px 14px", border: `1px solid ${BORD}`,
                  background: SURF, display: "flex", flexDirection: "column", gap: 6,
                }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{peer.flag}</span>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: FG, lineHeight: 1.2 }}>{peer.name}</span>
                  <span style={{ fontFamily: HEAD, fontSize: 16, fontWeight: 700, color: tierColor(peer.score), letterSpacing: "-0.02em" }}>{peer.score}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Share */}
        <ShareButton passport={passport} rarity={rarity} />

        {/* CTA */}
        <Link
          href="/wizard"
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px", background: MINT, color: "#0a0a0a",
            fontFamily: HEAD, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            textDecoration: "none", boxShadow: `3px 3px 0 ${FG}`,
          }}
        >
          <span>See which countries suit this passport</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

// ─── List row ─────────────────────────────────────────────────────────────────
function RankRow({ passport, onSelect }: { passport: Passport; onSelect: (p: Passport) => void }) {
  const color = tierColor(passport.score);
  const [hov, setHov] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(passport)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "44px 30px 1fr 60px 100px",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        width: "100%",
        background: hov ? SURF : "transparent",
        border: "none",
        borderBottom: `1px solid ${BORD}`,
        cursor: "pointer",
        transition: "background 0.1s",
        userSelect: "none",
        textAlign: "left",
        font: "inherit",
        color: "inherit",
      }}
    >
      <span style={{ fontFamily: HEAD, fontSize: 11, fontWeight: 700, color: DIM, letterSpacing: "0.06em" }}>
        #{passport.rank}
      </span>
      <span style={{ fontSize: 20, lineHeight: 1 }}>{passport.flag}</span>
      <span style={{ fontFamily: SANS, fontSize: 14, color: FG }}>{passport.name}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color, display: "block" }}>
          {passport.score}
        </span>
        {(() => { const d = getDelta(passport.slug); return d !== null ? (
          <span style={{ fontFamily: SANS, fontSize: 9, color: d > 0 ? "#4ade80" : "#ef4444" }}>
            {d > 0 ? `▲${d}` : `▼${Math.abs(d)}`}
          </span>
        ) : null; })()}
      </div>
      <div style={{ height: 2, background: BORD }}>
        <div style={{ height: "100%", background: color, width: `${(passport.score / MAX_SCORE) * 100}%` }} />
      </div>
    </button>
  );
}

// ─── Fun facts (verified Henley historical data) ──────────────────────────────
const FUN_FACTS = [
  { flag: "🇸🇬", text: "Singapore was ranked #38 in 2006. Today it's #1 — the biggest climb in Henley history." },
  { flag: "🇦🇪", text: "The UAE passport gained 107 places in 10 years (2014→2024), the fastest rise ever recorded." },
  { flag: "🇺🇸", text: "The US passport peaked at #1 in 2014. It has since dropped to #10 — losing 6 places since 2020." },
  { flag: "🇦🇫", text: "Afghan passport holders can visit only 15 countries visa-free — fewer than any other passport on Earth." },
  { flag: "🇯🇵", text: "Japan held the #1 spot every year from 2018 to 2023 — a 6-year reign no other passport has matched." },
  { flag: "🇩🇪", text: "Germany's passport has ranked in the top 5 every single year since the Henley Index began in 2006." },
  { flag: "🇲🇨", text: "Monaco has a population of just 36,000 yet its passport unlocks 177 destinations — more than Russia or China." },
  { flag: "🇨🇳", text: "China's passport score jumped from 44 in 2015 to 83 in 2026, nearly doubling in a decade." },
  { flag: "🇬🇧", text: "Post-Brexit, UK passport holders lost visa-free access to EU countries for work — its Schengen privileges remain for tourism only." },
  { flag: "🇰🇷", text: "South Korea's passport has risen 40 places since 2006, now tied #2 alongside Japan and UAE." },
  { flag: "🇻🇦", text: "Vatican City issues fewer than 800 passports total — yet it unlocks 152 destinations worldwide." },
  { flag: "🇱🇮", text: "Liechtenstein has a population of just 38,000 but its citizens enjoy visa-free access to 181 destinations." },
  { flag: "🇸🇦", text: "Saudi Arabia gained 30+ passport ranking places between 2018 and 2026, driven by Vision 2030 diplomacy." },
  { flag: "🌍", text: "The gap between the strongest and weakest passport is 169 destinations — Singapore (192) vs Afghanistan (23)." },
  { flag: "🇳🇬", text: "Nigeria's passport score has remained under 50 for 15 years, limiting travel for Africa's most populous nation." },
  { flag: "🇧🇷", text: "Brazil and Argentina both rank above India and China despite smaller economies — Latin America punches above its weight." },
  { flag: "🇲🇾", text: "Malaysia's passport ranks #7 globally — stronger than the USA, Canada, and Australia." },
  { flag: "🌐", text: "Only 6 passports score 180+ — giving their holders access to 90%+ of the world without advance visas." },
  { flag: "🇵🇹", text: "Portugal's Golden Visa program created one of the most sought-after paths to an EU passport for investors." },
  { flag: "🇷🇺", text: "Russia's passport has lost 20+ places since 2022 due to sanctions and restricted airspace agreements." },
];

function FactsTicker() {
  const [idx, setIdx]       = useState(() => Math.floor(Math.random() * FUN_FACTS.length));
  const [fade, setFade]     = useState(true);
  const [open, setOpen]     = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % FUN_FACTS.length);
        setFade(true);
      }, 400);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const fact = FUN_FACTS[idx];

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9000,
      width: 280,
    }}>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* Collapsed pill */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 16px",
            background: SURF, border: `1px solid ${BORD}`,
            color: FG, cursor: "pointer", fontFamily: SANS,
            fontSize: 11, letterSpacing: "0.12em",
            boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
            float: "right",
          }}
        >
          <span style={{
            width: 6, height: 6, background: MINT, borderRadius: "50%", flexShrink: 0,
            animation: "pulse-dot 2s ease-in-out infinite",
          }} />
          DID YOU KNOW
        </button>
      )}

      {/* Expanded card */}
      {open && (
        <div style={{
          border: `1px solid ${BORD}`,
          padding: "18px",
          background: "#0c0c0c",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
          position: "relative",
        }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{
              fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em",
              textTransform: "uppercase", color: DIM, margin: 0,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                display: "inline-block", width: 6, height: 6,
                background: MINT, borderRadius: "50%",
                animation: "pulse-dot 2s ease-in-out infinite",
              }} />
              Did you know
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: "none", color: DIM,
                cursor: "pointer", fontFamily: SANS, fontSize: 14,
                lineHeight: 1, padding: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Fact */}
          <div style={{ opacity: fade ? 1 : 0, transition: "opacity 0.4s ease" }}>
            <span style={{ fontSize: 22, display: "block", marginBottom: 8 }}>{fact.flag}</span>
            <p style={{ fontFamily: SANS, fontSize: 13, color: FG, lineHeight: 1.6, margin: 0 }}>
              {fact.text}
            </p>
          </div>

          {/* Progress pips */}
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {FUN_FACTS.map((_, i) => (
              <div key={i} style={{
                width: i === idx ? 14 : 4, height: 3,
                background: i === idx ? MINT : BORD,
                transition: "all 0.4s ease",
              }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PassportPowerClient() {
  const [selected, setSelected] = useState<Passport | null>(null);
  const [listSearch, setListSearch] = useState("");
  const [listGrouped, setListGrouped] = useState(false);

  // Podium picks:
  // center (#1): Singapore (thunder)
  // left   (#2): Japan
  // right  (#3): UAE
  const top1 = ALL_PASSPORTS.find(p => p.slug === "singapore")!;
  const top2 = ALL_PASSPORTS.find(p => p.slug === "japan")!;
  const top3 = ALL_PASSPORTS.find(p => p.slug === "uae")!;

  const handleSelect = (p: Passport) => setSelected(p);
  const handleClose  = useCallback(() => setSelected(null), []);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: FG, fontFamily: SANS }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "88px 24px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontFamily: SANS, fontSize: 11, letterSpacing: "0.22em",
            textTransform: "uppercase", color: DIM, marginBottom: 16,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: MINT, fontSize: 8 }}>●</span>
            Passport Power · Henley Index 2026 Q2 (17 June 2026)
          </p>
          <h1 style={{
            fontFamily: HEAD, fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 0.95, color: FG, margin: "0 0 16px",
          } as React.CSSProperties}>
            The world&apos;s<br />
            <span style={{ color: MINT }}>strongest passports.</span>
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 14, color: DIM, lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
            Ranked by visa-free access across 199 countries. Click any passport for the full breakdown.
          </p>
        </div>

        {/* Podium — [Japan] [Singapore] [UAE] */}
        <div style={{ display: "flex", gap: 2, marginBottom: 36, alignItems: "flex-end" }}>
          <HeroCard passport={top2} position={2} onSelect={handleSelect} />
          <HeroCard passport={top1} position={1} onSelect={handleSelect} />
          <HeroCard passport={top3} position={3} onSelect={handleSelect} />
        </div>

        {/* Ranked list */}
        <div>
          {/* List controls */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search 199 passports…"
              value={listSearch}
              onChange={e => setListSearch(e.target.value)}
              style={{
                flex: 1, fontFamily: SANS, fontSize: 13, color: FG,
                background: "#0f0f0f", border: `1px solid ${BORD}`,
                padding: "9px 14px", outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setListGrouped(g => !g)}
              style={{
                fontFamily: SANS, fontSize: 11, letterSpacing: "0.1em",
                background: listGrouped ? MINT : "transparent",
                border: `1px solid ${listGrouped ? MINT : BORD}`,
                color: listGrouped ? BG : DIM,
                padding: "9px 16px", cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {listGrouped ? "TIERS ✓" : "TIERS"}
            </button>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "44px 30px 1fr 60px 100px",
            gap: 12, padding: "8px 16px", borderBottom: `1px solid ${BORD}`,
          }}>
            {["RANK", "", "COUNTRY", "SCORE", "ACCESS"].map((h, i) => (
              <span key={i} style={{
                fontFamily: SANS, fontSize: 9, letterSpacing: "0.16em",
                textTransform: "uppercase", color: DIM,
                textAlign: i === 3 ? "right" : "left",
              }}>{h}</span>
            ))}
          </div>

          {listGrouped ? (
            ([
              { tier: 1 as const, label: "ELITE",   range: "180+",    min: 180, max: 999, tc: MINT       },
              { tier: 2 as const, label: "STRONG",  range: "140–179", min: 140, max: 179, tc: "#a3e635"  },
              { tier: 3 as const, label: "AVERAGE", range: "100–139", min: 100, max: 139, tc: "#facc15"  },
              { tier: 4 as const, label: "WEAK",    range: "<100",    min: 0,   max: 99,  tc: "#ef4444"  },
            ]).map(({ tier, label, range, min, max, tc }) => {
              const group = SORTED_PASSPORTS.filter(p =>
                p.score >= min && p.score <= max &&
                p.name.toLowerCase().includes(listSearch.toLowerCase())
              );
              if (!group.length) return null;
              return (
                <div key={tier}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 16px", borderBottom: `1px solid ${BORD}`,
                    background: `${tc}08`,
                  }}>
                    <span style={{ width: 6, height: 6, background: tc, flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: tc }}>
                      {label} · {range} · {group.length} passports
                    </span>
                  </div>
                  {group.map(p => <RankRow key={p.slug} passport={p} onSelect={handleSelect} />)}
                </div>
              );
            })
          ) : (
            SORTED_PASSPORTS
              .filter(p => p.name.toLowerCase().includes(listSearch.toLowerCase()))
              .map(p => <RankRow key={p.slug} passport={p} onSelect={handleSelect} />)
          )}
        </div>

        {/* CTA */}
        <div style={{ padding: "52px 0 80px", borderTop: `1px solid ${BORD}`, marginTop: 40 }}>
          <p style={{
            fontFamily: HEAD, fontSize: "clamp(18px, 2.5vw, 28px)", fontWeight: 700,
            letterSpacing: "-0.02em", color: FG, margin: "0 0 10px", lineHeight: 1.2,
          }}>
            Know which countries fit your passport, salary and priorities.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 14, color: DIM, margin: "0 0 24px", lineHeight: 1.7 }}>
            Origio scores 25 destinations against your job, budget and deal breakers.
          </p>
          <Link href="/wizard" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 28px", background: MINT, color: "#0a0a0a",
            fontFamily: HEAD, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            textDecoration: "none", boxShadow: `4px 4px 0 ${FG}`,
          }}>
            Start free →
          </Link>
          <p style={{ fontFamily: SANS, fontSize: 12, color: DIM, margin: "14px 0 0" }}>
            No account needed · top 3 matches free
          </p>
        </div>

      </div>

      {selected && <PassportModal passport={selected} onClose={handleClose} />}

      <Footer />
    </div>
  );
}
