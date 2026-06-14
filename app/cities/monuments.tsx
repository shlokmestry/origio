// Minimal line-art monument illustrations for each city
// viewBox 0 0 200 130 · stroke only · fill none · strokeLinecap/Join round

const S = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export const MONUMENTS: Record<string, React.ReactNode> = {

  /* ── Europe ── */

  paris: ( // Eiffel Tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="10" x2="68" y2="110" strokeWidth="1.4"/>
      <line x1="100" y1="10" x2="132" y2="110" strokeWidth="1.4"/>
      <line x1="80" y1="55" x2="120" y2="55" strokeWidth="1.4"/>
      <line x1="72" y1="80" x2="128" y2="80" strokeWidth="1.4"/>
      <line x1="75" y1="65" x2="82" y2="55" strokeWidth="1"/>
      <line x1="125" y1="65" x2="118" y2="55" strokeWidth="1"/>
      <line x1="74" y1="70" x2="80" y2="62" strokeWidth="1"/>
      <line x1="126" y1="70" x2="120" y2="62" strokeWidth="1"/>
      <line x1="85" y1="90" x2="90" y2="80" strokeWidth="1"/>
      <line x1="115" y1="90" x2="110" y2="80" strokeWidth="1"/>
      <line x1="88" y1="95" x2="94" y2="80" strokeWidth="1"/>
      <line x1="112" y1="95" x2="106" y2="80" strokeWidth="1"/>
      <line x1="64" y1="110" x2="136" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  london: ( // Big Ben
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="85" y="12" width="30" height="8" strokeWidth="1.2"/>
      <rect x="88" y="20" width="24" height="60" strokeWidth="1.4"/>
      <circle cx="100" cy="42" r="10" strokeWidth="1.2"/>
      <line x1="100" y1="32" x2="100" y2="42" strokeWidth="1"/>
      <line x1="100" y1="42" x2="108" y2="46" strokeWidth="1"/>
      <rect x="80" y="80" width="40" height="30" strokeWidth="1.4"/>
      <line x1="80" y1="95" x2="120" y2="95" strokeWidth="1"/>
      <line x1="94" y1="80" x2="94" y2="110" strokeWidth="1"/>
      <line x1="106" y1="80" x2="106" y2="110" strokeWidth="1"/>
      <line x1="70" y1="110" x2="130" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  dublin: ( // Ha'penny Bridge
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M30 95 Q100 40 170 95" strokeWidth="1.6"/>
      <line x1="30" y1="95" x2="170" y2="95" strokeWidth="1.4"/>
      <line x1="55" y1="95" x2="52" y2="68" strokeWidth="1"/>
      <line x1="75" y1="95" x2="70" y2="56" strokeWidth="1"/>
      <line x1="100" y1="95" x2="100" y2="50" strokeWidth="1"/>
      <line x1="125" y1="95" x2="130" y2="56" strokeWidth="1"/>
      <line x1="145" y1="95" x2="148" y2="68" strokeWidth="1"/>
      <line x1="30" y1="90" x2="30" y2="110" strokeWidth="1.6"/>
      <line x1="170" y1="90" x2="170" y2="110" strokeWidth="1.6"/>
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  amsterdam: ( // Canal house gable
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="56,110 56,50 72,30 88,50 88,110" strokeWidth="1.4"/>
      <polygon points="88,110 88,48 104,28 120,48 120,110" strokeWidth="1.4"/>
      <polygon points="120,110 120,52 136,34 152,52 152,110" strokeWidth="1.4"/>
      <rect x="62" y="68" width="10" height="14" strokeWidth="1"/>
      <rect x="76" y="68" width="10" height="14" strokeWidth="1"/>
      <rect x="94" y="66" width="10" height="14" strokeWidth="1"/>
      <rect x="108" y="66" width="10" height="14" strokeWidth="1"/>
      <rect x="126" y="70" width="10" height="14" strokeWidth="1"/>
      <rect x="140" y="70" width="10" height="14" strokeWidth="1"/>
      <line x1="40" y1="110" x2="165" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  berlin: ( // Brandenburg Gate
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="55" y="40" width="90" height="50" strokeWidth="1.4"/>
      <rect x="55" y="32" width="90" height="12" strokeWidth="1.2"/>
      <line x1="100" y1="20" x2="90" y2="32" strokeWidth="1"/>
      <line x1="100" y1="20" x2="110" y2="32" strokeWidth="1"/>
      <line x1="92" y1="26" x2="108" y2="26" strokeWidth="1"/>
      <line x1="72" y1="40" x2="72" y2="90" strokeWidth="1.2"/>
      <line x1="86" y1="40" x2="86" y2="90" strokeWidth="1.2"/>
      <line x1="100" y1="40" x2="100" y2="90" strokeWidth="1.2"/>
      <line x1="114" y1="40" x2="114" y2="90" strokeWidth="1.2"/>
      <line x1="128" y1="40" x2="128" y2="90" strokeWidth="1.2"/>
      <rect x="58" y="78" width="12" height="12" strokeWidth="1"/>
      <rect x="130" y="78" width="12" height="12" strokeWidth="1"/>
      <line x1="42" y1="110" x2="158" y2="110" strokeWidth="1.4"/>
      <line x1="55" y1="90" x2="55" y2="110" strokeWidth="1.4"/>
      <line x1="145" y1="90" x2="145" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  barcelona: ( // Sagrada Família spires
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="8" x2="100" y2="110" strokeWidth="1.6"/>
      <line x1="82" y1="22" x2="82" y2="110" strokeWidth="1.4"/>
      <line x1="118" y1="22" x2="118" y2="110" strokeWidth="1.4"/>
      <line x1="66" y1="42" x2="66" y2="110" strokeWidth="1.2"/>
      <line x1="134" y1="42" x2="134" y2="110" strokeWidth="1.2"/>
      <ellipse cx="100" cy="10" rx="4" ry="6" strokeWidth="1.2"/>
      <ellipse cx="82" cy="24" rx="3" ry="5" strokeWidth="1.2"/>
      <ellipse cx="118" cy="24" rx="3" ry="5" strokeWidth="1.2"/>
      <ellipse cx="66" cy="44" rx="2.5" ry="4" strokeWidth="1"/>
      <ellipse cx="134" cy="44" rx="2.5" ry="4" strokeWidth="1"/>
      <rect x="72" y="70" width="56" height="40" strokeWidth="1.4"/>
      <path d="M72 82 Q100 72 128 82" strokeWidth="1"/>
      <line x1="50" y1="110" x2="150" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  malaga: ( // Alcazaba fortress
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="45" y="55" width="110" height="55" strokeWidth="1.4"/>
      <rect x="55" y="38" width="20" height="20" strokeWidth="1.4"/>
      <rect x="125" y="38" width="20" height="20" strokeWidth="1.4"/>
      <line x1="55" y1="38" x2="58" y2="32" strokeWidth="1.2"/>
      <line x1="62" y1="38" x2="62" y2="32" strokeWidth="1.2"/>
      <line x1="68" y1="38" x2="66" y2="32" strokeWidth="1.2"/>
      <line x1="74" y1="38" x2="74" y2="32" strokeWidth="1.2"/>
      <line x1="125" y1="38" x2="128" y2="32" strokeWidth="1.2"/>
      <line x1="132" y1="38" x2="132" y2="32" strokeWidth="1.2"/>
      <line x1="138" y1="38" x2="136" y2="32" strokeWidth="1.2"/>
      <line x1="144" y1="38" x2="144" y2="32" strokeWidth="1.2"/>
      <path d="M90 110 L90 85 Q100 78 110 85 L110 110" strokeWidth="1.4"/>
      <line x1="45" y1="110" x2="155" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  tbilisi: ( // Narikala fortress + church
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="60" y1="110" x2="60" y2="60" strokeWidth="1.4"/>
      <line x1="80" y1="110" x2="80" y2="60" strokeWidth="1.4"/>
      <line x1="60" y1="60" x2="70" y2="48" strokeWidth="1.4"/>
      <line x1="80" y1="60" x2="70" y2="48" strokeWidth="1.4"/>
      <line x1="70" y1="48" x2="70" y2="40" strokeWidth="1.2"/>
      <line x1="60" y1="75" x2="80" y2="75" strokeWidth="1"/>
      <rect x="105" y="55" width="40" height="55" strokeWidth="1.4"/>
      <path d="M105 55 Q125 35 145 55" strokeWidth="1.4"/>
      <line x1="125" y1="35" x2="125" y2="28" strokeWidth="1.2"/>
      <line x1="120" y1="32" x2="130" y2="32" strokeWidth="1.2"/>
      <rect x="115" y="80" width="20" height="30" strokeWidth="1.2"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  tallinn: ( // Town Hall spire
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="65" y="65" width="70" height="45" strokeWidth="1.4"/>
      <polygon points="65,65 100,20 135,65" strokeWidth="1.4"/>
      <line x1="100" y1="20" x2="100" y2="10" strokeWidth="1.4"/>
      <line x1="96" y1="14" x2="104" y2="14" strokeWidth="1"/>
      <line x1="80" y1="65" x2="80" y2="110" strokeWidth="1"/>
      <line x1="100" y1="65" x2="100" y2="110" strokeWidth="1"/>
      <line x1="120" y1="65" x2="120" y2="110" strokeWidth="1"/>
      <rect x="88" y="82" width="24" height="28" strokeWidth="1.2"/>
      <line x1="75" y1="80" x2="80" y2="80" strokeWidth="1"/>
      <line x1="120" y1="80" x2="125" y2="80" strokeWidth="1"/>
      <line x1="50" y1="110" x2="150" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  porto: ( // Dom Luís Bridge
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M25 90 Q100 30 175 90" strokeWidth="1.8"/>
      <line x1="25" y1="90" x2="175" y2="90" strokeWidth="1.4"/>
      <line x1="25" y1="68" x2="175" y2="68" strokeWidth="1.2"/>
      <line x1="44" y1="68" x2="40" y2="90" strokeWidth="1"/>
      <line x1="68" y1="68" x2="62" y2="90" strokeWidth="1"/>
      <line x1="100" y1="68" x2="100" y2="90" strokeWidth="1"/>
      <line x1="132" y1="68" x2="138" y2="90" strokeWidth="1"/>
      <line x1="156" y1="68" x2="160" y2="90" strokeWidth="1"/>
      <line x1="25" y1="60" x2="25" y2="90" strokeWidth="1.6"/>
      <line x1="175" y1="60" x2="175" y2="90" strokeWidth="1.6"/>
      <line x1="15" y1="110" x2="185" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  milan: ( // Duomo spires
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="55" y="72" width="90" height="38" strokeWidth="1.4"/>
      <line x1="100" y1="14" x2="100" y2="72" strokeWidth="1.6"/>
      <line x1="82" y1="30" x2="82" y2="72" strokeWidth="1.3"/>
      <line x1="118" y1="30" x2="118" y2="72" strokeWidth="1.3"/>
      <line x1="66" y1="48" x2="66" y2="72" strokeWidth="1.1"/>
      <line x1="134" y1="48" x2="134" y2="72" strokeWidth="1.1"/>
      <line x1="55" y1="72" x2="145" y2="72" strokeWidth="1.4"/>
      <line x1="55" y1="86" x2="145" y2="86" strokeWidth="1"/>
      <path d="M68 86 L68 110 M80 86 L80 110 M92 86 L92 110 M108 86 L108 110 M120 86 L120 110 M132 86 L132 110" strokeWidth="1"/>
      <line x1="42" y1="110" x2="158" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  rome: ( // Colosseum
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <ellipse cx="100" cy="90" rx="75" ry="35" strokeWidth="1.4"/>
      <ellipse cx="100" cy="80" rx="75" ry="35" strokeWidth="1.4"/>
      <ellipse cx="100" cy="68" rx="75" ry="35" strokeWidth="1.4"/>
      <line x1="25" y1="80" x2="25" y2="90" strokeWidth="1.4"/>
      <line x1="175" y1="80" x2="175" y2="90" strokeWidth="1.4"/>
      <line x1="25" y1="68" x2="25" y2="80" strokeWidth="1.4"/>
      <line x1="175" y1="68" x2="175" y2="80" strokeWidth="1.4"/>
      {[40,55,70,85,100,115,130,145,160].map(x => (
        <line key={x} x1={x} y1="68" x2={x} y2="110" strokeWidth="0.9"/>
      ))}
      <line x1="25" y1="110" x2="175" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  athens: ( // Parthenon
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="50,52 100,28 150,52" strokeWidth="1.4"/>
      <rect x="50" y="52" width="100" height="8" strokeWidth="1.2"/>
      {[58,70,82,94,106,118,130,142].map(x => (
        <line key={x} x1={x} y1="60" x2={x} y2="96" strokeWidth="1.3"/>
      ))}
      <rect x="48" y="96" width="104" height="6" strokeWidth="1.2"/>
      <rect x="44" y="102" width="112" height="8" strokeWidth="1.2"/>
      <line x1="35" y1="110" x2="165" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  munich: ( // Frauenkirche twin towers
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="62" y="50" width="28" height="60" strokeWidth="1.4"/>
      <rect x="110" y="50" width="28" height="60" strokeWidth="1.4"/>
      <path d="M62 50 Q76 28 90 50" strokeWidth="1.4"/>
      <path d="M110 50 Q124 28 138 50" strokeWidth="1.4"/>
      <line x1="76" y1="28" x2="76" y2="20" strokeWidth="1.2"/>
      <line x1="124" y1="28" x2="124" y2="20" strokeWidth="1.2"/>
      <rect x="55" y="90" width="90" height="20" strokeWidth="1.4"/>
      <line x1="76" y1="70" x2="76" y2="110" strokeWidth="1"/>
      <line x1="124" y1="70" x2="124" y2="110" strokeWidth="1"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  vienna: ( // St Stephen's Cathedral
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="12" x2="100" y2="110" strokeWidth="1.6"/>
      <polygon points="80,44 100,12 120,44" strokeWidth="1.4"/>
      <rect x="70" y="44" width="60" height="66" strokeWidth="1.4"/>
      <rect x="58" y="66" width="20" height="44" strokeWidth="1.3"/>
      <rect x="122" y="66" width="20" height="44" strokeWidth="1.3"/>
      <rect x="84" y="82" width="32" height="28" strokeWidth="1.2"/>
      <line x1="84" y1="82" x2="116" y2="82" strokeWidth="1"/>
      <line x1="45" y1="110" x2="155" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  prague: ( // Charles Bridge tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="80" y="38" width="40" height="72" strokeWidth="1.4"/>
      <rect x="76" y="30" width="48" height="12" strokeWidth="1.2"/>
      <polygon points="76,30 100,10 124,30" strokeWidth="1.4"/>
      <line x1="100" y1="10" x2="100" y2="4" strokeWidth="1.2"/>
      <rect x="88" y="78" width="24" height="32" strokeWidth="1.2"/>
      <line x1="30" y1="95" x2="170" y2="95" strokeWidth="1.6"/>
      <line x1="30" y1="95" x2="30" y2="110" strokeWidth="1.4"/>
      <line x1="170" y1="95" x2="170" y2="110" strokeWidth="1.4"/>
      <line x1="80" y1="95" x2="80" y2="110" strokeWidth="1"/>
      <line x1="120" y1="95" x2="120" y2="110" strokeWidth="1"/>
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  budapest: ( // Parliament dome
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="35" y="75" width="130" height="35" strokeWidth="1.4"/>
      <line x1="100" y1="22" x2="100" y2="75" strokeWidth="1.4"/>
      <path d="M76 55 Q100 28 124 55" strokeWidth="1.4"/>
      <line x1="76" y1="55" x2="124" y2="55" strokeWidth="1.2"/>
      <rect x="55" y="55" width="20" height="20" strokeWidth="1.2"/>
      <rect x="125" y="55" width="20" height="20" strokeWidth="1.2"/>
      <line x1="35" y1="88" x2="165" y2="88" strokeWidth="1"/>
      {[50,65,80,95,110,125,140,155].map(x => (
        <line key={x} x1={x} y1="88" x2={x} y2="110" strokeWidth="1"/>
      ))}
      <line x1="25" y1="110" x2="175" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  warsaw: ( // Palace of Culture spire
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="8" x2="100" y2="110" strokeWidth="1.4"/>
      <rect x="90" y="22" width="20" height="18" strokeWidth="1.2"/>
      <rect x="82" y="40" width="36" height="16" strokeWidth="1.2"/>
      <rect x="70" y="56" width="60" height="16" strokeWidth="1.4"/>
      <rect x="58" y="72" width="84" height="38" strokeWidth="1.4"/>
      <line x1="58" y1="84" x2="142" y2="84" strokeWidth="1"/>
      <line x1="58" y1="96" x2="142" y2="96" strokeWidth="1"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  stockholm: ( // City Hall tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="55" y="55" width="90" height="55" strokeWidth="1.4"/>
      <rect x="82" y="28" width="36" height="30" strokeWidth="1.4"/>
      <line x1="100" y1="28" x2="100" y2="16" strokeWidth="1.4"/>
      <line x1="94" y1="20" x2="106" y2="20" strokeWidth="1"/>
      <line x1="55" y1="72" x2="145" y2="72" strokeWidth="1"/>
      <rect x="68" y="80" width="16" height="30" strokeWidth="1.2"/>
      <rect x="116" y="80" width="16" height="30" strokeWidth="1.2"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  copenhagen: ( // Nyhavn coloured houses
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="36,110 36,58 50,38 64,58 64,110" strokeWidth="1.4"/>
      <polygon points="68,110 68,52 84,30 100,52 100,110" strokeWidth="1.4"/>
      <polygon points="104,110 104,60 118,42 132,60 132,110" strokeWidth="1.4"/>
      <polygon points="136,110 136,55 150,36 164,55 164,110" strokeWidth="1.4"/>
      <line x1="36" y1="80" x2="64" y2="80" strokeWidth="1"/>
      <line x1="68" y1="76" x2="100" y2="76" strokeWidth="1"/>
      <line x1="104" y1="82" x2="132" y2="82" strokeWidth="1"/>
      <line x1="136" y1="78" x2="164" y2="78" strokeWidth="1"/>
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  helsinki: ( // Cathedral dome
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="45" y="80" width="110" height="30" strokeWidth="1.4"/>
      <rect x="60" y="65" width="80" height="18" strokeWidth="1.3"/>
      <path d="M70 65 Q100 35 130 65" strokeWidth="1.5"/>
      <line x1="100" y1="35" x2="100" y2="24" strokeWidth="1.4"/>
      <line x1="94" y1="28" x2="106" y2="28" strokeWidth="1"/>
      <line x1="45" y1="92" x2="155" y2="92" strokeWidth="1"/>
      {[58,72,86,100,114,128,142].map(x => (
        <line key={x} x1={x} y1="92" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="30" y1="110" x2="170" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  oslo: ( // Opera House angled roof
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="20,110 100,40 180,70 180,110" strokeWidth="1.4"/>
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
      <line x1="100" y1="40" x2="100" y2="110" strokeWidth="1"/>
      <line x1="60" y1="75" x2="60" y2="110" strokeWidth="1"/>
      <line x1="140" y1="55" x2="140" y2="110" strokeWidth="1"/>
      <line x1="20" y1="110" x2="180" y2="70" strokeWidth="1.2"/>
    </svg>
  ),

  brussels: ( // Atomium
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <circle cx="100" cy="35" r="14" strokeWidth="1.4"/>
      <circle cx="60" cy="68" r="11" strokeWidth="1.3"/>
      <circle cx="140" cy="68" r="11" strokeWidth="1.3"/>
      <circle cx="76" cy="95" r="11" strokeWidth="1.3"/>
      <circle cx="124" cy="95" r="11" strokeWidth="1.3"/>
      <line x1="100" y1="49" x2="100" y2="110" strokeWidth="1.4"/>
      <line x1="88" y1="43" x2="70" y2="60" strokeWidth="1.2"/>
      <line x1="112" y1="43" x2="130" y2="60" strokeWidth="1.2"/>
      <line x1="71" y1="79" x2="77" y2="86" strokeWidth="1.2"/>
      <line x1="129" y1="79" x2="123" y2="86" strokeWidth="1.2"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  zurich: ( // Grossmünster twin towers
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="62" y="45" width="30" height="65" strokeWidth="1.4"/>
      <rect x="108" y="45" width="30" height="65" strokeWidth="1.4"/>
      <polygon points="62,45 77,22 92,45" strokeWidth="1.4"/>
      <polygon points="108,45 123,22 138,45" strokeWidth="1.4"/>
      <line x1="77" y1="22" x2="77" y2="14" strokeWidth="1.2"/>
      <line x1="123" y1="22" x2="123" y2="14" strokeWidth="1.2"/>
      <rect x="70" y="72" width="14" height="18" strokeWidth="1.2"/>
      <rect x="116" y="72" width="14" height="18" strokeWidth="1.2"/>
      <rect x="85" y="68" width="30" height="42" strokeWidth="1.4"/>
      <line x1="45" y1="110" x2="155" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  limassol: ( // Medieval castle
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="50" y="52" width="100" height="58" strokeWidth="1.4"/>
      <line x1="50" y1="52" x2="54" y2="42" strokeWidth="1.2"/>
      <line x1="62" y1="52" x2="62" y2="42" strokeWidth="1.2"/>
      <line x1="70" y1="52" x2="68" y2="42" strokeWidth="1.2"/>
      <line x1="78" y1="52" x2="78" y2="42" strokeWidth="1.2"/>
      <line x1="86" y1="52" x2="84" y2="42" strokeWidth="1.2"/>
      <line x1="122" y1="52" x2="122" y2="42" strokeWidth="1.2"/>
      <line x1="130" y1="52" x2="128" y2="42" strokeWidth="1.2"/>
      <line x1="138" y1="52" x2="138" y2="42" strokeWidth="1.2"/>
      <line x1="146" y1="52" x2="144" y2="42" strokeWidth="1.2"/>
      <line x1="150" y1="52" x2="150" y2="42" strokeWidth="1.2"/>
      <path d="M84 110 L84 80 Q100 70 116 80 L116 110" strokeWidth="1.4"/>
      <line x1="35" y1="110" x2="165" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  split: ( // Diocletian's Palace gate
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="40" y="45" width="120" height="65" strokeWidth="1.4"/>
      <rect x="40" y="35" width="120" height="14" strokeWidth="1.2"/>
      <path d="M80 110 L80 75 Q100 62 120 75 L120 110" strokeWidth="1.4"/>
      <rect x="55" y="65" width="18" height="26" strokeWidth="1.2"/>
      <rect x="127" y="65" width="18" height="26" strokeWidth="1.2"/>
      <line x1="40" y1="72" x2="160" y2="72" strokeWidth="1"/>
      <line x1="40" y1="84" x2="73" y2="84" strokeWidth="1"/>
      <line x1="127" y1="84" x2="160" y2="84" strokeWidth="1"/>
      <line x1="25" y1="110" x2="175" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  bucharest: ( // Palace of Parliament
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="30" y="60" width="140" height="50" strokeWidth="1.4"/>
      <rect x="44" y="46" width="112" height="18" strokeWidth="1.2"/>
      <rect x="60" y="36" width="80" height="14" strokeWidth="1.2"/>
      <line x1="30" y1="76" x2="170" y2="76" strokeWidth="1"/>
      <line x1="30" y1="90" x2="170" y2="90" strokeWidth="1"/>
      {[45,60,75,90,100,115,125,140,155].map(x => (
        <line key={x} x1={x} y1="76" x2={x} y2="110" strokeWidth="0.9"/>
      ))}
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  belgrade: ( // Kalemegdan fortress tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="72" y="40" width="56" height="70" strokeWidth="1.4"/>
      <rect x="66" y="32" width="68" height="12" strokeWidth="1.2"/>
      <line x1="66" y1="32" x2="70" y2="24" strokeWidth="1.2"/>
      <line x1="78" y1="32" x2="78" y2="24" strokeWidth="1.2"/>
      <line x1="90" y1="32" x2="88" y2="24" strokeWidth="1.2"/>
      <line x1="110" y1="32" x2="112" y2="24" strokeWidth="1.2"/>
      <line x1="122" y1="32" x2="122" y2="24" strokeWidth="1.2"/>
      <line x1="134" y1="32" x2="130" y2="24" strokeWidth="1.2"/>
      <path d="M86 110 L86 82 Q100 74 114 82 L114 110" strokeWidth="1.4"/>
      <line x1="72" y1="65" x2="128" y2="65" strokeWidth="1"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  /* ── Americas ── */

  'new-york': ( // Empire State Building
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="8" x2="100" y2="18" strokeWidth="1.4"/>
      <rect x="94" y="18" width="12" height="12" strokeWidth="1.2"/>
      <rect x="88" y="30" width="24" height="12" strokeWidth="1.2"/>
      <rect x="82" y="42" width="36" height="10" strokeWidth="1.2"/>
      <rect x="76" y="52" width="48" height="10" strokeWidth="1.3"/>
      <rect x="70" y="62" width="60" height="10" strokeWidth="1.4"/>
      <rect x="62" y="72" width="76" height="38" strokeWidth="1.4"/>
      <line x1="45" y1="110" x2="155" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  toronto: ( // CN Tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="8" x2="100" y2="110" strokeWidth="1.2"/>
      <ellipse cx="100" cy="52" rx="18" ry="10" strokeWidth="1.4"/>
      <ellipse cx="100" cy="46" rx="12" ry="6" strokeWidth="1.2"/>
      <line x1="86" y1="70" x2="84" y2="100" strokeWidth="1.4"/>
      <line x1="114" y1="70" x2="116" y2="100" strokeWidth="1.4"/>
      <line x1="84" y1="100" x2="116" y2="100" strokeWidth="1.4"/>
      <line x1="100" y1="62" x2="100" y2="8" strokeWidth="1.2"/>
      <line x1="60" y1="110" x2="140" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  vancouver: ( // Lions Gate Bridge
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="50" y1="30" x2="50" y2="100" strokeWidth="1.6"/>
      <line x1="150" y1="30" x2="150" y2="100" strokeWidth="1.6"/>
      <path d="M20 82 Q50 55 100 70 Q150 55 180 82" strokeWidth="1.4"/>
      <line x1="20" y1="82" x2="180" y2="82" strokeWidth="1.4"/>
      {[35,50,65,80,100,120,135,150,165].map(x => (
        <line key={x} x1={x} y1="82" x2={x < 100 ? 50 : 150} y2={x < 100 ? (30 + (x-35)*0.7) : (30 + (165-x)*0.7)} strokeWidth="0.9"/>
      ))}
      <line x1="15" y1="110" x2="185" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  miami: ( // Art Deco building
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="72" y="30" width="56" height="80" strokeWidth="1.4"/>
      <rect x="80" y="20" width="40" height="14" strokeWidth="1.2"/>
      <rect x="88" y="14" width="24" height="10" strokeWidth="1.2"/>
      <line x1="72" y1="50" x2="128" y2="50" strokeWidth="1"/>
      <line x1="72" y1="68" x2="128" y2="68" strokeWidth="1"/>
      <line x1="72" y1="86" x2="128" y2="86" strokeWidth="1"/>
      <rect x="84" y="86" width="32" height="24" strokeWidth="1.2"/>
      <line x1="50" y1="110" x2="150" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  medellin: ( // Cable car over mountains
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M20 100 L60 60 L100 80 L140 45 L180 70" strokeWidth="1.4"/>
      <line x1="30" y1="55" x2="170" y2="40" strokeWidth="1.2"/>
      <rect x="88" y="44" width="24" height="18" strokeWidth="1.4"/>
      <line x1="100" y1="44" x2="100" y2="40" strokeWidth="1.2"/>
      <line x1="150" y1="48" x2="150" y2="90" strokeWidth="1.4"/>
      <rect x="140" y="90" width="20" height="14" strokeWidth="1.4"/>
      <line x1="15" y1="110" x2="185" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  'mexico-city': ( // Angel of Independence
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="20" x2="100" y2="75" strokeWidth="1.4"/>
      <path d="M82 32 Q100 20 118 32" strokeWidth="1.3"/>
      <line x1="82" y1="32" x2="78" y2="44" strokeWidth="1.2"/>
      <line x1="118" y1="32" x2="122" y2="44" strokeWidth="1.2"/>
      <circle cx="100" cy="18" r="5" strokeWidth="1.2"/>
      <rect x="88" y="75" width="24" height="12" strokeWidth="1.2"/>
      <rect x="80" y="87" width="40" height="8" strokeWidth="1.2"/>
      <rect x="72" y="95" width="56" height="15" strokeWidth="1.4"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  'buenos-aires': ( // Obelisk
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="92,18 108,18 112,110 88,110" strokeWidth="1.4"/>
      <polygon points="98,10 102,10 108,18 92,18" strokeWidth="1.2"/>
      <line x1="90" y1="45" x2="92" y2="45" strokeWidth="1"/>
      <line x1="108" y1="45" x2="110" y2="45" strokeWidth="1"/>
      <line x1="89" y1="70" x2="91" y2="70" strokeWidth="1"/>
      <line x1="109" y1="70" x2="111" y2="70" strokeWidth="1"/>
      <line x1="88" y1="90" x2="90" y2="90" strokeWidth="1"/>
      <line x1="110" y1="90" x2="112" y2="90" strokeWidth="1"/>
      <line x1="55" y1="110" x2="145" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  'sao-paulo': ( // Paulista skyline
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="30" y="70" width="20" height="40" strokeWidth="1.3"/>
      <rect x="55" y="55" width="18" height="55" strokeWidth="1.3"/>
      <rect x="78" y="42" width="22" height="68" strokeWidth="1.4"/>
      <rect x="105" y="38" width="20" height="72" strokeWidth="1.4"/>
      <rect x="130" y="50" width="18" height="60" strokeWidth="1.3"/>
      <rect x="153" y="65" width="18" height="45" strokeWidth="1.3"/>
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  'panama-city': ( // Bridge of the Americas
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="25" x2="100" y2="90" strokeWidth="1.6"/>
      <line x1="20" y1="90" x2="180" y2="90" strokeWidth="1.6"/>
      <path d="M20 90 Q100 45 180 90" strokeWidth="1.4"/>
      {[40,60,80,100,120,140,160].map(x => {
        const y = 90 - Math.round(Math.sin(((x-20)/160)*Math.PI)*45)
        return <line key={x} x1={x} y1="90" x2={100} y2={25} strokeWidth="0.9"/>
      })}
      <line x1="15" y1="110" x2="185" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  'san-jose-cr': ( // National Theatre
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="45" y="58" width="110" height="52" strokeWidth="1.4"/>
      <polygon points="45,58 100,30 155,58" strokeWidth="1.4"/>
      <line x1="100" y1="30" x2="100" y2="20" strokeWidth="1.2"/>
      {[62,78,100,122,138].map(x => (
        <line key={x} x1={x} y1="58" x2={x} y2="110" strokeWidth="1.2"/>
      ))}
      <rect x="82" y="80" width="36" height="30" strokeWidth="1.2"/>
      <line x1="30" y1="110" x2="170" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  /* ── Asia & Oceania ── */

  singapore: ( // Marina Bay Sands
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="44" y="55" width="20" height="55" strokeWidth="1.4"/>
      <rect x="90" y="55" width="20" height="55" strokeWidth="1.4"/>
      <rect x="136" y="55" width="20" height="55" strokeWidth="1.4"/>
      <path d="M38 55 Q100 30 162 55" strokeWidth="1.6"/>
      <rect x="38" y="48" width="124" height="10" strokeWidth="1.2"/>
      <line x1="30" y1="110" x2="170" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  tokyo: ( // Tokyo Tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="10" x2="100" y2="110" strokeWidth="1.4"/>
      <line x1="100" y1="10" x2="65" y2="110" strokeWidth="1.4"/>
      <line x1="100" y1="10" x2="135" y2="110" strokeWidth="1.4"/>
      <line x1="74" y1="60" x2="126" y2="60" strokeWidth="1.2"/>
      <line x1="68" y1="80" x2="132" y2="80" strokeWidth="1.2"/>
      <line x1="78" y1="42" x2="122" y2="42" strokeWidth="1"/>
      <rect x="88" y="52" width="24" height="16" strokeWidth="1.2"/>
      <line x1="50" y1="110" x2="150" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  osaka: ( // Osaka Castle
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="75" y="62" width="50" height="48" strokeWidth="1.4"/>
      <rect x="68" y="74" width="64" height="10" strokeWidth="1.2"/>
      <rect x="80" y="50" width="40" height="16" strokeWidth="1.3"/>
      <rect x="86" y="38" width="28" height="16" strokeWidth="1.2"/>
      <polygon points="86,38 100,22 114,38" strokeWidth="1.4"/>
      <line x1="100" y1="22" x2="100" y2="15" strokeWidth="1.2"/>
      <line x1="55" y1="110" x2="145" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  seoul: ( // Gyeongbokgung gate
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="40" y="80" width="120" height="30" strokeWidth="1.4"/>
      <rect x="52" y="58" width="96" height="26" strokeWidth="1.4"/>
      <polygon points="52,58 100,30 148,58" strokeWidth="1.4"/>
      <path d="M48 58 Q100 38 152 58" strokeWidth="1"/>
      <path d="M52 60 Q100 36 148 60" strokeWidth="1"/>
      <line x1="40" y1="92" x2="160" y2="92" strokeWidth="1"/>
      <path d="M80 110 L80 92 Q100 84 120 92 L120 110" strokeWidth="1.4"/>
      <line x1="25" y1="110" x2="175" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  sydney: ( // Opera House sails
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M40 95 Q55 45 80 95" strokeWidth="1.6"/>
      <path d="M72 95 Q95 28 118 95" strokeWidth="1.6"/>
      <path d="M112 95 Q128 50 148 95" strokeWidth="1.5"/>
      <path d="M142 95 Q152 60 165 95" strokeWidth="1.3"/>
      <line x1="30" y1="95" x2="175" y2="95" strokeWidth="1.4"/>
      <line x1="20" y1="110" x2="185" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  melbourne: ( // Flinders Street Station dome
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="30" y="72" width="140" height="38" strokeWidth="1.4"/>
      <path d="M80 72 Q100 46 120 72" strokeWidth="1.4"/>
      <rect x="38" y="56" width="30" height="18" strokeWidth="1.3"/>
      <rect x="132" y="56" width="30" height="18" strokeWidth="1.3"/>
      <line x1="30" y1="88" x2="170" y2="88" strokeWidth="1"/>
      <line x1="30" y1="100" x2="170" y2="100" strokeWidth="1"/>
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  auckland: ( // Sky Tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="10" x2="100" y2="110" strokeWidth="1.2"/>
      <ellipse cx="100" cy="58" rx="20" ry="10" strokeWidth="1.4"/>
      <ellipse cx="100" cy="52" rx="14" ry="7" strokeWidth="1.2"/>
      <line x1="88" y1="68" x2="84" y2="95" strokeWidth="1.4"/>
      <line x1="112" y1="68" x2="116" y2="95" strokeWidth="1.4"/>
      <path d="M84 95 Q100 88 116 95" strokeWidth="1.4"/>
      <line x1="60" y1="110" x2="140" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  bangkok: ( // Wat Arun spire
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="12" x2="100" y2="110" strokeWidth="1.4"/>
      <line x1="100" y1="12" x2="88" y2="32" strokeWidth="1.2"/>
      <line x1="100" y1="12" x2="112" y2="32" strokeWidth="1.2"/>
      <line x1="88" y1="32" x2="78" y2="52" strokeWidth="1.2"/>
      <line x1="112" y1="32" x2="122" y2="52" strokeWidth="1.2"/>
      <line x1="78" y1="52" x2="65" y2="72" strokeWidth="1.1"/>
      <line x1="122" y1="52" x2="135" y2="72" strokeWidth="1.1"/>
      <line x1="88" y1="32" x2="112" y2="32" strokeWidth="1"/>
      <line x1="78" y1="52" x2="122" y2="52" strokeWidth="1"/>
      <line x1="65" y1="72" x2="135" y2="72" strokeWidth="1.2"/>
      <rect x="70" y="90" width="60" height="20" strokeWidth="1.4"/>
      <line x1="45" y1="110" x2="155" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  bali: ( // Tanah Lot temple on rock
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M60 90 Q100 78 140 90 Q145 102 140 110 Q100 115 60 110 Q55 102 60 90" strokeWidth="1.4"/>
      <rect x="80" y="72" width="40" height="20" strokeWidth="1.3"/>
      <polygon points="80,72 100,52 120,72" strokeWidth="1.4"/>
      <line x1="100" y1="52" x2="100" y2="44" strokeWidth="1.4"/>
      <line x1="95" y1="48" x2="105" y2="48" strokeWidth="1"/>
      <line x1="72" y1="86" x2="128" y2="86" strokeWidth="1"/>
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  'chiang-mai': ( // Doi Suthep temple
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="100,14 85,45 115,45" strokeWidth="1.4"/>
      <line x1="100" y1="14" x2="100" y2="8" strokeWidth="1.2"/>
      <rect x="82" y="45" width="36" height="20" strokeWidth="1.3"/>
      <rect x="70" y="65" width="60" height="14" strokeWidth="1.3"/>
      <rect x="55" y="79" width="90" height="31" strokeWidth="1.4"/>
      <line x1="55" y1="92" x2="145" y2="92" strokeWidth="1"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  'kuala-lumpur': ( // Petronas Towers
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="58" y="35" width="34" height="75" strokeWidth="1.4"/>
      <rect x="108" y="35" width="34" height="75" strokeWidth="1.4"/>
      <line x1="58" y1="35" x2="75" y2="22" strokeWidth="1.2"/>
      <line x1="92" y1="35" x2="75" y2="22" strokeWidth="1.2"/>
      <line x1="108" y1="35" x2="125" y2="22" strokeWidth="1.2"/>
      <line x1="142" y1="35" x2="125" y2="22" strokeWidth="1.2"/>
      <line x1="75" y1="22" x2="75" y2="15" strokeWidth="1.2"/>
      <line x1="125" y1="22" x2="125" y2="15" strokeWidth="1.2"/>
      <rect x="88" y="68" width="24" height="8" strokeWidth="1.3"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  'da-nang': ( // Dragon Bridge
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M20 85 Q60 55 100 72 Q140 88 180 70" strokeWidth="1.6"/>
      <line x1="20" y1="85" x2="180" y2="85" strokeWidth="1.2"/>
      <path d="M155 72 Q165 60 178 58 Q184 62 180 70" strokeWidth="1.4"/>
      <line x1="175" y1="58" x2="178" y2="50" strokeWidth="1.2"/>
      <line x1="178" y1="50" x2="184" y2="52" strokeWidth="1.2"/>
      {[40,60,80,100,120,140,160].map(x => (
        <line key={x} x1={x} y1="85" x2={x} y2="110" strokeWidth="1"/>
      ))}
      <line x1="15" y1="110" x2="185" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  'ho-chi-minh-city': ( // Reunification Palace
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="35" y="60" width="130" height="50" strokeWidth="1.4"/>
      <rect x="35" y="48" width="130" height="16" strokeWidth="1.2"/>
      <rect x="55" y="36" width="90" height="16" strokeWidth="1.2"/>
      <rect x="72" y="26" width="56" height="14" strokeWidth="1.2"/>
      <line x1="35" y1="76" x2="165" y2="76" strokeWidth="1"/>
      <line x1="35" y1="92" x2="165" y2="92" strokeWidth="1"/>
      {[50,68,86,100,114,132,150].map(x => (
        <line key={x} x1={x} y1="76" x2={x} y2="110" strokeWidth="1"/>
      ))}
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  bangalore: ( // Vidhana Soudha dome
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="35" y="72" width="130" height="38" strokeWidth="1.4"/>
      <rect x="50" y="58" width="100" height="18" strokeWidth="1.3"/>
      <path d="M70 58 Q100 30 130 58" strokeWidth="1.5"/>
      <line x1="100" y1="30" x2="100" y2="22" strokeWidth="1.4"/>
      <line x1="94" y1="26" x2="106" y2="26" strokeWidth="1"/>
      <line x1="35" y1="88" x2="165" y2="88" strokeWidth="1"/>
      {[50,65,80,100,120,135,150].map(x => (
        <line key={x} x1={x} y1="88" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  /* ── Middle East & Africa ── */

  dubai: ( // Burj Khalifa
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="8" x2="100" y2="110" strokeWidth="1.2"/>
      <rect x="94" y="28" width="12" height="20" strokeWidth="1"/>
      <rect x="88" y="48" width="24" height="16" strokeWidth="1.1"/>
      <rect x="82" y="64" width="36" height="14" strokeWidth="1.2"/>
      <rect x="76" y="78" width="48" height="12" strokeWidth="1.3"/>
      <rect x="68" y="90" width="64" height="20" strokeWidth="1.4"/>
      <line x1="50" y1="110" x2="150" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  'cape-town': ( // Table Mountain flat top
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M25 90 L55 45 L145 45 L175 90" strokeWidth="1.6"/>
      <line x1="55" y1="45" x2="145" y2="45" strokeWidth="1.8"/>
      <path d="M25 90 Q100 82 175 90" strokeWidth="1.2"/>
      <line x1="68" y1="45" x2="60" y2="90" strokeWidth="1"/>
      <line x1="90" y1="45" x2="88" y2="90" strokeWidth="1"/>
      <line x1="110" y1="45" x2="112" y2="90" strokeWidth="1"/>
      <line x1="132" y1="45" x2="140" y2="90" strokeWidth="1"/>
      <line x1="15" y1="110" x2="185" y2="110" strokeWidth="1.4"/>
    </svg>
  ),

  'abu-dhabi': ( // Sheikh Zayed Mosque domes
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="30" y="80" width="140" height="30" strokeWidth="1.4"/>
      <path d="M75 80 Q100 48 125 80" strokeWidth="1.5"/>
      <path d="M40 80 Q55 62 70 80" strokeWidth="1.3"/>
      <path d="M130 80 Q145 62 160 80" strokeWidth="1.3"/>
      <line x1="48" y1="62" x2="48" y2="45" strokeWidth="1.4"/>
      <line x1="152" y1="62" x2="152" y2="45" strokeWidth="1.4"/>
      <line x1="44" y1="45" x2="52" y2="45" strokeWidth="1.2"/>
      <line x1="148" y1="45" x2="156" y2="45" strokeWidth="1.2"/>
      <line x1="30" y1="92" x2="170" y2="92" strokeWidth="1"/>
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
    </svg>
  ),
}

export function CityMonument({ slug, stroke = '#f0f0e8', size = 120 }: { slug: string; stroke?: string; size?: number }) {
  const svg = MONUMENTS[slug]
  if (!svg) return <DefaultSkyline stroke={stroke} />
  return (
    <svg
      viewBox="0 0 200 130"
      width={size}
      height={size * 0.65}
      style={{ color: stroke }}
      stroke={stroke}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {(svg as React.ReactElement).props.children}
    </svg>
  )
}

function DefaultSkyline({ stroke }: { stroke: string }) {
  return (
    <svg viewBox="0 0 200 130" width="160" height="104" stroke={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="30" y="75" width="20" height="35" strokeWidth="1.3"/>
      <rect x="55" y="60" width="18" height="50" strokeWidth="1.3"/>
      <rect x="78" y="48" width="22" height="62" strokeWidth="1.4"/>
      <rect x="105" y="44" width="20" height="66" strokeWidth="1.4"/>
      <rect x="130" y="58" width="18" height="52" strokeWidth="1.3"/>
      <rect x="153" y="70" width="18" height="40" strokeWidth="1.3"/>
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.4"/>
    </svg>
  )
}
