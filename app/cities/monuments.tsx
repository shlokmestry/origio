// Line-art monument illustrations · viewBox 0 0 200 130 · stroke only · fill none
// strokeWidth: 1.8 = primary structure · 1.1 = secondary detail

const S = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export const MONUMENTS: Record<string, React.ReactNode> = {

  /* ── Europe ── */

  paris: ( // Eiffel Tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="8" x2="62" y2="110" strokeWidth="1.8"/>
      <line x1="100" y1="8" x2="138" y2="110" strokeWidth="1.8"/>
      <line x1="78" y1="52" x2="122" y2="52" strokeWidth="1.8"/>
      <line x1="70" y1="78" x2="130" y2="78" strokeWidth="1.8"/>
      <line x1="73" y1="63" x2="80" y2="52" strokeWidth="1.1"/>
      <line x1="127" y1="63" x2="120" y2="52" strokeWidth="1.1"/>
      <line x1="71" y1="69" x2="78" y2="60" strokeWidth="1.1"/>
      <line x1="129" y1="69" x2="122" y2="60" strokeWidth="1.1"/>
      <line x1="83" y1="90" x2="88" y2="78" strokeWidth="1.1"/>
      <line x1="117" y1="90" x2="112" y2="78" strokeWidth="1.1"/>
      <line x1="87" y1="96" x2="93" y2="78" strokeWidth="1.1"/>
      <line x1="113" y1="96" x2="107" y2="78" strokeWidth="1.1"/>
      <line x1="60" y1="110" x2="140" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  london: ( // Big Ben
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="84" y="10" width="32" height="9" strokeWidth="1.8"/>
      <rect x="87" y="19" width="26" height="62" strokeWidth="1.8"/>
      <circle cx="100" cy="40" r="11" strokeWidth="1.1"/>
      <line x1="100" y1="29" x2="100" y2="40" strokeWidth="1.1"/>
      <line x1="100" y1="40" x2="109" y2="44" strokeWidth="1.1"/>
      <rect x="78" y="81" width="44" height="29" strokeWidth="1.8"/>
      <line x1="78" y1="96" x2="122" y2="96" strokeWidth="1.1"/>
      <line x1="93" y1="81" x2="93" y2="110" strokeWidth="1.1"/>
      <line x1="107" y1="81" x2="107" y2="110" strokeWidth="1.1"/>
      <line x1="65" y1="110" x2="135" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  dublin: ( // Ha'penny Bridge
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M22 92 Q100 36 178 92" strokeWidth="1.8"/>
      <line x1="22" y1="92" x2="178" y2="92" strokeWidth="1.8"/>
      <line x1="48" y1="92" x2="44" y2="63" strokeWidth="1.1"/>
      <line x1="70" y1="92" x2="65" y2="52" strokeWidth="1.1"/>
      <line x1="100" y1="92" x2="100" y2="46" strokeWidth="1.1"/>
      <line x1="130" y1="92" x2="135" y2="52" strokeWidth="1.1"/>
      <line x1="152" y1="92" x2="156" y2="63" strokeWidth="1.1"/>
      <line x1="22" y1="86" x2="22" y2="110" strokeWidth="1.8"/>
      <line x1="178" y1="86" x2="178" y2="110" strokeWidth="1.8"/>
      <line x1="12" y1="110" x2="188" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  amsterdam: ( // Canal house gables
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="48,110 48,52 66,28 84,52 84,110" strokeWidth="1.8"/>
      <polygon points="84,110 84,48 102,24 120,48 120,110" strokeWidth="1.8"/>
      <polygon points="120,110 120,54 138,32 156,54 156,110" strokeWidth="1.8"/>
      <rect x="55" y="68" width="12" height="16" strokeWidth="1.1"/>
      <rect x="69" y="68" width="12" height="16" strokeWidth="1.1"/>
      <rect x="91" y="66" width="12" height="16" strokeWidth="1.1"/>
      <rect x="106" y="66" width="12" height="16" strokeWidth="1.1"/>
      <rect x="127" y="70" width="12" height="16" strokeWidth="1.1"/>
      <rect x="142" y="70" width="12" height="16" strokeWidth="1.1"/>
      <line x1="32" y1="110" x2="170" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  berlin: ( // Brandenburg Gate
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="50" y="38" width="100" height="52" strokeWidth="1.8"/>
      <rect x="50" y="28" width="100" height="14" strokeWidth="1.1"/>
      <line x1="100" y1="16" x2="88" y2="28" strokeWidth="1.1"/>
      <line x1="100" y1="16" x2="112" y2="28" strokeWidth="1.1"/>
      <line x1="90" y1="22" x2="110" y2="22" strokeWidth="1.1"/>
      <line x1="70" y1="38" x2="70" y2="90" strokeWidth="1.1"/>
      <line x1="86" y1="38" x2="86" y2="90" strokeWidth="1.1"/>
      <line x1="100" y1="38" x2="100" y2="90" strokeWidth="1.1"/>
      <line x1="114" y1="38" x2="114" y2="90" strokeWidth="1.1"/>
      <line x1="130" y1="38" x2="130" y2="90" strokeWidth="1.1"/>
      <rect x="54" y="76" width="14" height="14" strokeWidth="1.1"/>
      <rect x="132" y="76" width="14" height="14" strokeWidth="1.1"/>
      <line x1="50" y1="90" x2="50" y2="110" strokeWidth="1.8"/>
      <line x1="150" y1="90" x2="150" y2="110" strokeWidth="1.8"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  barcelona: ( // Sagrada Família spires
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="6" x2="100" y2="110" strokeWidth="1.8"/>
      <line x1="81" y1="20" x2="81" y2="110" strokeWidth="1.8"/>
      <line x1="119" y1="20" x2="119" y2="110" strokeWidth="1.8"/>
      <line x1="63" y1="40" x2="63" y2="110" strokeWidth="1.1"/>
      <line x1="137" y1="40" x2="137" y2="110" strokeWidth="1.1"/>
      <ellipse cx="100" cy="8" rx="4" ry="6" strokeWidth="1.1"/>
      <ellipse cx="81" cy="22" rx="3.5" ry="5" strokeWidth="1.1"/>
      <ellipse cx="119" cy="22" rx="3.5" ry="5" strokeWidth="1.1"/>
      <ellipse cx="63" cy="42" rx="3" ry="4" strokeWidth="1.1"/>
      <ellipse cx="137" cy="42" rx="3" ry="4" strokeWidth="1.1"/>
      <rect x="70" y="68" width="60" height="42" strokeWidth="1.8"/>
      <path d="M70 82 Q100 72 130 82" strokeWidth="1.1"/>
      <line x1="46" y1="110" x2="154" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  malaga: ( // Alcazaba fortress
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="38" y="52" width="124" height="58" strokeWidth="1.8"/>
      <rect x="50" y="34" width="24" height="22" strokeWidth="1.8"/>
      <rect x="126" y="34" width="24" height="22" strokeWidth="1.8"/>
      <line x1="50" y1="34" x2="53" y2="26" strokeWidth="1.1"/>
      <line x1="59" y1="34" x2="59" y2="26" strokeWidth="1.1"/>
      <line x1="66" y1="34" x2="64" y2="26" strokeWidth="1.1"/>
      <line x1="73" y1="34" x2="73" y2="26" strokeWidth="1.1"/>
      <line x1="126" y1="34" x2="129" y2="26" strokeWidth="1.1"/>
      <line x1="135" y1="34" x2="135" y2="26" strokeWidth="1.1"/>
      <line x1="142" y1="34" x2="140" y2="26" strokeWidth="1.1"/>
      <line x1="149" y1="34" x2="149" y2="26" strokeWidth="1.1"/>
      <path d="M88 110 L88 82 Q100 74 112 82 L112 110" strokeWidth="1.8"/>
      <line x1="38" y1="110" x2="162" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  tbilisi: ( // Narikala fortress + Sameba church
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="52" y1="110" x2="52" y2="54" strokeWidth="1.8"/>
      <line x1="76" y1="110" x2="76" y2="54" strokeWidth="1.8"/>
      <line x1="52" y1="54" x2="64" y2="40" strokeWidth="1.8"/>
      <line x1="76" y1="54" x2="64" y2="40" strokeWidth="1.8"/>
      <line x1="64" y1="40" x2="64" y2="30" strokeWidth="1.1"/>
      <line x1="52" y1="72" x2="76" y2="72" strokeWidth="1.1"/>
      <rect x="104" y="52" width="44" height="58" strokeWidth="1.8"/>
      <path d="M104 52 Q126 28 148 52" strokeWidth="1.8"/>
      <line x1="126" y1="28" x2="126" y2="18" strokeWidth="1.1"/>
      <line x1="120" y1="23" x2="132" y2="23" strokeWidth="1.1"/>
      <rect x="114" y="78" width="24" height="32" strokeWidth="1.1"/>
      <line x1="32" y1="110" x2="168" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  tallinn: ( // Town Hall spire
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="60" y="62" width="80" height="48" strokeWidth="1.8"/>
      <polygon points="60,62 100,14 140,62" strokeWidth="1.8"/>
      <line x1="100" y1="14" x2="100" y2="6" strokeWidth="1.8"/>
      <line x1="95" y1="10" x2="105" y2="10" strokeWidth="1.1"/>
      <line x1="78" y1="62" x2="78" y2="110" strokeWidth="1.1"/>
      <line x1="100" y1="62" x2="100" y2="110" strokeWidth="1.1"/>
      <line x1="122" y1="62" x2="122" y2="110" strokeWidth="1.1"/>
      <rect x="86" y="80" width="28" height="30" strokeWidth="1.1"/>
      <line x1="42" y1="110" x2="158" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  porto: ( // Dom Luís Bridge
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M18 88 Q100 26 182 88" strokeWidth="1.8"/>
      <line x1="18" y1="88" x2="182" y2="88" strokeWidth="1.8"/>
      <line x1="18" y1="66" x2="182" y2="66" strokeWidth="1.1"/>
      <line x1="38" y1="66" x2="34" y2="88" strokeWidth="1.1"/>
      <line x1="64" y1="66" x2="58" y2="88" strokeWidth="1.1"/>
      <line x1="100" y1="66" x2="100" y2="88" strokeWidth="1.1"/>
      <line x1="136" y1="66" x2="142" y2="88" strokeWidth="1.1"/>
      <line x1="162" y1="66" x2="166" y2="88" strokeWidth="1.1"/>
      <line x1="18" y1="58" x2="18" y2="88" strokeWidth="1.8"/>
      <line x1="182" y1="58" x2="182" y2="88" strokeWidth="1.8"/>
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  milan: ( // Duomo spires
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="50" y="70" width="100" height="40" strokeWidth="1.8"/>
      <line x1="100" y1="12" x2="100" y2="70" strokeWidth="1.8"/>
      <line x1="80" y1="28" x2="80" y2="70" strokeWidth="1.8"/>
      <line x1="120" y1="28" x2="120" y2="70" strokeWidth="1.8"/>
      <line x1="62" y1="46" x2="62" y2="70" strokeWidth="1.1"/>
      <line x1="138" y1="46" x2="138" y2="70" strokeWidth="1.1"/>
      <line x1="50" y1="70" x2="150" y2="70" strokeWidth="1.8"/>
      <line x1="50" y1="84" x2="150" y2="84" strokeWidth="1.1"/>
      <path d="M62 84 L62 110 M76 84 L76 110 M90 84 L90 110 M110 84 L110 110 M124 84 L124 110 M138 84 L138 110" strokeWidth="1.1"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  rome: ( // Colosseum
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <ellipse cx="100" cy="88" rx="78" ry="32" strokeWidth="1.8"/>
      <ellipse cx="100" cy="76" rx="78" ry="32" strokeWidth="1.8"/>
      <ellipse cx="100" cy="62" rx="78" ry="32" strokeWidth="1.8"/>
      <line x1="22" y1="76" x2="22" y2="88" strokeWidth="1.8"/>
      <line x1="178" y1="76" x2="178" y2="88" strokeWidth="1.8"/>
      <line x1="22" y1="62" x2="22" y2="76" strokeWidth="1.8"/>
      <line x1="178" y1="62" x2="178" y2="76" strokeWidth="1.8"/>
      {[36,52,68,84,100,116,132,148,164].map(x => (
        <line key={x} x1={x} y1="62" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="22" y1="110" x2="178" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  athens: ( // Parthenon
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="44,50 100,22 156,50" strokeWidth="1.8"/>
      <rect x="44" y="50" width="112" height="9" strokeWidth="1.1"/>
      {[55,68,81,94,107,120,133,146].map(x => (
        <line key={x} x1={x} y1="59" x2={x} y2="96" strokeWidth="1.1"/>
      ))}
      <rect x="42" y="96" width="116" height="7" strokeWidth="1.1"/>
      <rect x="36" y="103" width="128" height="7" strokeWidth="1.8"/>
      <line x1="26" y1="110" x2="174" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  munich: ( // Frauenkirche twin towers
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="56" y="46" width="32" height="64" strokeWidth="1.8"/>
      <rect x="112" y="46" width="32" height="64" strokeWidth="1.8"/>
      <path d="M56 46 Q72 22 88 46" strokeWidth="1.8"/>
      <path d="M112 46 Q128 22 144 46" strokeWidth="1.8"/>
      <line x1="72" y1="22" x2="72" y2="12" strokeWidth="1.1"/>
      <line x1="128" y1="22" x2="128" y2="12" strokeWidth="1.1"/>
      <rect x="50" y="88" width="100" height="22" strokeWidth="1.8"/>
      <line x1="72" y1="68" x2="72" y2="110" strokeWidth="1.1"/>
      <line x1="128" y1="68" x2="128" y2="110" strokeWidth="1.1"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  vienna: ( // St Stephen's Cathedral
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="10" x2="100" y2="110" strokeWidth="1.8"/>
      <polygon points="78,42 100,10 122,42" strokeWidth="1.8"/>
      <rect x="68" y="42" width="64" height="68" strokeWidth="1.8"/>
      <rect x="54" y="64" width="22" height="46" strokeWidth="1.1"/>
      <rect x="124" y="64" width="22" height="46" strokeWidth="1.1"/>
      <rect x="82" y="80" width="36" height="30" strokeWidth="1.1"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  prague: ( // Charles Bridge with Old Town Tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="80" y="36" width="40" height="56" strokeWidth="1.8"/>
      <rect x="75" y="28" width="50" height="12" strokeWidth="1.1"/>
      <polygon points="75,28 100,8 125,28" strokeWidth="1.8"/>
      <line x1="100" y1="8" x2="100" y2="2" strokeWidth="1.1"/>
      <rect x="88" y="76" width="24" height="16" strokeWidth="1.1"/>
      <line x1="14" y1="92" x2="186" y2="92" strokeWidth="1.8"/>
      <line x1="14" y1="92" x2="14" y2="110" strokeWidth="1.8"/>
      <line x1="186" y1="92" x2="186" y2="110" strokeWidth="1.8"/>
      <line x1="78" y1="92" x2="78" y2="110" strokeWidth="1.1"/>
      <line x1="122" y1="92" x2="122" y2="110" strokeWidth="1.1"/>
      {[38,54,148,164].map(x => (
        <line key={x} x1={x} y1="92" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  budapest: ( // Parliament dome
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="28" y="72" width="144" height="38" strokeWidth="1.8"/>
      <line x1="100" y1="20" x2="100" y2="72" strokeWidth="1.8"/>
      <path d="M74 52 Q100 24 126 52" strokeWidth="1.8"/>
      <line x1="74" y1="52" x2="126" y2="52" strokeWidth="1.1"/>
      <rect x="50" y="52" width="22" height="22" strokeWidth="1.1"/>
      <rect x="128" y="52" width="22" height="22" strokeWidth="1.1"/>
      <line x1="28" y1="86" x2="172" y2="86" strokeWidth="1.1"/>
      {[44,60,76,92,108,124,140,156].map(x => (
        <line key={x} x1={x} y1="86" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="18" y1="110" x2="182" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  warsaw: ( // Palace of Culture spire
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="6" x2="100" y2="110" strokeWidth="1.8"/>
      <rect x="90" y="20" width="20" height="18" strokeWidth="1.1"/>
      <rect x="82" y="38" width="36" height="14" strokeWidth="1.1"/>
      <rect x="70" y="52" width="60" height="14" strokeWidth="1.8"/>
      <rect x="56" y="66" width="88" height="44" strokeWidth="1.8"/>
      <line x1="56" y1="78" x2="144" y2="78" strokeWidth="1.1"/>
      <line x1="56" y1="90" x2="144" y2="90" strokeWidth="1.1"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  stockholm: ( // City Hall tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="48" y="52" width="104" height="58" strokeWidth="1.8"/>
      <rect x="78" y="24" width="44" height="32" strokeWidth="1.8"/>
      <line x1="100" y1="24" x2="100" y2="10" strokeWidth="1.8"/>
      <line x1="93" y1="17" x2="107" y2="17" strokeWidth="1.1"/>
      <line x1="48" y1="70" x2="152" y2="70" strokeWidth="1.1"/>
      <rect x="62" y="78" width="20" height="32" strokeWidth="1.1"/>
      <rect x="118" y="78" width="20" height="32" strokeWidth="1.1"/>
      <line x1="32" y1="110" x2="168" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  copenhagen: ( // Nyhavn coloured houses
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="28,110 28,56 44,32 60,56 60,110" strokeWidth="1.8"/>
      <polygon points="62,110 62,50 80,26 98,50 98,110" strokeWidth="1.8"/>
      <polygon points="100,110 100,58 116,36 132,58 132,110" strokeWidth="1.8"/>
      <polygon points="134,110 134,52 150,30 166,52 166,110" strokeWidth="1.8"/>
      <line x1="28" y1="80" x2="60" y2="80" strokeWidth="1.1"/>
      <line x1="62" y1="76" x2="98" y2="76" strokeWidth="1.1"/>
      <line x1="100" y1="82" x2="132" y2="82" strokeWidth="1.1"/>
      <line x1="134" y1="78" x2="166" y2="78" strokeWidth="1.1"/>
      <line x1="12" y1="110" x2="184" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  helsinki: ( // Cathedral dome
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="38" y="78" width="124" height="32" strokeWidth="1.8"/>
      <rect x="55" y="62" width="90" height="20" strokeWidth="1.1"/>
      <path d="M66 62 Q100 28 134 62" strokeWidth="1.8"/>
      <line x1="100" y1="28" x2="100" y2="16" strokeWidth="1.8"/>
      <line x1="93" y1="22" x2="107" y2="22" strokeWidth="1.1"/>
      <line x1="38" y1="90" x2="162" y2="90" strokeWidth="1.1"/>
      {[54,70,86,100,114,130,146].map(x => (
        <line key={x} x1={x} y1="90" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="24" y1="110" x2="176" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  oslo: ( // Oslo Opera House — massive angled roof plane rising from water
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="10,110 10,110 100,30 190,62 190,110" strokeWidth="1.8"/>
      <line x1="10" y1="110" x2="190" y2="110" strokeWidth="1.8"/>
      <line x1="100" y1="30" x2="190" y2="62" strokeWidth="1.1"/>
      <line x1="55" y1="70" x2="55" y2="110" strokeWidth="1.1"/>
      <line x1="100" y1="30" x2="100" y2="110" strokeWidth="1.1"/>
      <line x1="148" y1="47" x2="148" y2="110" strokeWidth="1.1"/>
      <line x1="30" y1="90" x2="190" y2="66" strokeWidth="1.1"/>
    </svg>
  ),

  brussels: ( // Atomium
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <circle cx="100" cy="28" r="16" strokeWidth="1.8"/>
      <circle cx="56" cy="66" r="13" strokeWidth="1.8"/>
      <circle cx="144" cy="66" r="13" strokeWidth="1.8"/>
      <circle cx="72" cy="96" r="13" strokeWidth="1.1"/>
      <circle cx="128" cy="96" r="13" strokeWidth="1.1"/>
      <line x1="100" y1="44" x2="100" y2="110" strokeWidth="1.8"/>
      <line x1="86" y1="36" x2="68" y2="56" strokeWidth="1.1"/>
      <line x1="114" y1="36" x2="132" y2="56" strokeWidth="1.1"/>
      <line x1="67" y1="79" x2="73" y2="85" strokeWidth="1.1"/>
      <line x1="133" y1="79" x2="127" y2="85" strokeWidth="1.1"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  zurich: ( // Grossmünster twin towers
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="56" y="42" width="34" height="68" strokeWidth="1.8"/>
      <rect x="110" y="42" width="34" height="68" strokeWidth="1.8"/>
      <polygon points="56,42 73,18 90,42" strokeWidth="1.8"/>
      <polygon points="110,42 127,18 144,42" strokeWidth="1.8"/>
      <line x1="73" y1="18" x2="73" y2="8" strokeWidth="1.1"/>
      <line x1="127" y1="18" x2="127" y2="8" strokeWidth="1.1"/>
      <rect x="64" y="70" width="18" height="20" strokeWidth="1.1"/>
      <rect x="118" y="70" width="18" height="20" strokeWidth="1.1"/>
      <rect x="86" y="66" width="28" height="44" strokeWidth="1.8"/>
      <line x1="38" y1="110" x2="162" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  limassol: ( // Medieval castle
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="42" y="50" width="116" height="60" strokeWidth="1.8"/>
      <line x1="42" y1="50" x2="46" y2="40" strokeWidth="1.1"/>
      <line x1="56" y1="50" x2="56" y2="40" strokeWidth="1.1"/>
      <line x1="66" y1="50" x2="64" y2="40" strokeWidth="1.1"/>
      <line x1="76" y1="50" x2="76" y2="40" strokeWidth="1.1"/>
      <line x1="86" y1="50" x2="84" y2="40" strokeWidth="1.1"/>
      <line x1="120" y1="50" x2="120" y2="40" strokeWidth="1.1"/>
      <line x1="130" y1="50" x2="128" y2="40" strokeWidth="1.1"/>
      <line x1="140" y1="50" x2="140" y2="40" strokeWidth="1.1"/>
      <line x1="150" y1="50" x2="148" y2="40" strokeWidth="1.1"/>
      <line x1="158" y1="50" x2="158" y2="40" strokeWidth="1.1"/>
      <path d="M82 110 L82 78 Q100 68 118 78 L118 110" strokeWidth="1.8"/>
      <line x1="26" y1="110" x2="174" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  split: ( // Diocletian's Palace gate
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="32" y="42" width="136" height="68" strokeWidth="1.8"/>
      <rect x="32" y="32" width="136" height="14" strokeWidth="1.1"/>
      <path d="M78 110 L78 72 Q100 57 122 72 L122 110" strokeWidth="1.8"/>
      <rect x="48" y="62" width="20" height="28" strokeWidth="1.1"/>
      <rect x="132" y="62" width="20" height="28" strokeWidth="1.1"/>
      <line x1="32" y1="68" x2="168" y2="68" strokeWidth="1.1"/>
      <line x1="32" y1="82" x2="70" y2="82" strokeWidth="1.1"/>
      <line x1="130" y1="82" x2="168" y2="82" strokeWidth="1.1"/>
      <line x1="16" y1="110" x2="184" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  bucharest: ( // Palace of Parliament
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="22" y="58" width="156" height="52" strokeWidth="1.8"/>
      <rect x="36" y="44" width="128" height="18" strokeWidth="1.1"/>
      <rect x="54" y="32" width="92" height="16" strokeWidth="1.1"/>
      <line x1="22" y1="74" x2="178" y2="74" strokeWidth="1.1"/>
      <line x1="22" y1="90" x2="178" y2="90" strokeWidth="1.1"/>
      {[38,56,74,90,100,116,130,144,162].map(x => (
        <line key={x} x1={x} y1="74" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="12" y1="110" x2="188" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  belgrade: ( // Kalemegdan fortress
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="68" y="38" width="64" height="72" strokeWidth="1.8"/>
      <rect x="62" y="28" width="76" height="14" strokeWidth="1.1"/>
      <line x1="62" y1="28" x2="66" y2="18" strokeWidth="1.1"/>
      <line x1="76" y1="28" x2="76" y2="18" strokeWidth="1.1"/>
      <line x1="90" y1="28" x2="88" y2="18" strokeWidth="1.1"/>
      <line x1="110" y1="28" x2="112" y2="18" strokeWidth="1.1"/>
      <line x1="124" y1="28" x2="124" y2="18" strokeWidth="1.1"/>
      <line x1="138" y1="28" x2="134" y2="18" strokeWidth="1.1"/>
      <path d="M84 110 L84 80 Q100 70 116 80 L116 110" strokeWidth="1.8"/>
      <line x1="68" y1="62" x2="132" y2="62" strokeWidth="1.1"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  /* ── Americas ── */

  'new-york': ( // Empire State Building
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="6" x2="100" y2="16" strokeWidth="1.8"/>
      <rect x="94" y="16" width="12" height="12" strokeWidth="1.1"/>
      <rect x="88" y="28" width="24" height="12" strokeWidth="1.1"/>
      <rect x="82" y="40" width="36" height="10" strokeWidth="1.1"/>
      <rect x="76" y="50" width="48" height="10" strokeWidth="1.1"/>
      <rect x="68" y="60" width="64" height="10" strokeWidth="1.8"/>
      <rect x="58" y="70" width="84" height="40" strokeWidth="1.8"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'san-francisco': ( // Golden Gate Bridge
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="54" y1="20" x2="54" y2="92" strokeWidth="1.8"/>
      <line x1="146" y1="20" x2="146" y2="92" strokeWidth="1.8"/>
      <path d="M10 70 Q54 36 100 50 Q146 36 190 70" strokeWidth="1.8"/>
      <line x1="10" y1="92" x2="190" y2="92" strokeWidth="1.8"/>
      {[22,36,54,68,84,100,116,132,146,162,178].map(x => {
        const cx = 100
        const sag = 34
        const dx = (x - cx) / 90
        const y = 50 + sag * dx * dx
        return <line key={x} x1={x} y1={Math.round(y)} x2={x} y2="92" strokeWidth="1.1"/>
      })}
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  austin: ( // Texas State Capitol dome
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="8" x2="100" y2="22" strokeWidth="1.8"/>
      <path d="M80 40 Q100 18 120 40" strokeWidth="1.8"/>
      <line x1="80" y1="40" x2="120" y2="40" strokeWidth="1.1"/>
      <rect x="72" y="40" width="56" height="22" strokeWidth="1.1"/>
      <rect x="54" y="62" width="92" height="48" strokeWidth="1.8"/>
      <line x1="54" y1="78" x2="146" y2="78" strokeWidth="1.1"/>
      <line x1="54" y1="94" x2="146" y2="94" strokeWidth="1.1"/>
      {[68,84,100,116,132].map(x => (
        <line key={x} x1={x} y1="62" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  toronto: ( // CN Tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="6" x2="100" y2="110" strokeWidth="1.1"/>
      <ellipse cx="100" cy="50" rx="20" ry="11" strokeWidth="1.8"/>
      <ellipse cx="100" cy="44" rx="14" ry="7" strokeWidth="1.1"/>
      <line x1="85" y1="68" x2="82" y2="100" strokeWidth="1.8"/>
      <line x1="115" y1="68" x2="118" y2="100" strokeWidth="1.8"/>
      <line x1="82" y1="100" x2="118" y2="100" strokeWidth="1.8"/>
      <line x1="58" y1="110" x2="142" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  vancouver: ( // Lions Gate Bridge
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="52" y1="24" x2="52" y2="96" strokeWidth="1.8"/>
      <line x1="148" y1="24" x2="148" y2="96" strokeWidth="1.8"/>
      <path d="M14 78 Q52 48 100 64 Q148 48 186 78" strokeWidth="1.8"/>
      <line x1="14" y1="78" x2="186" y2="78" strokeWidth="1.8"/>
      {[30,52,72,90,100,110,128,148,170].map(x => {
        const cx = 100; const dx = (x - cx)/90
        const cableY = x < 100 ? (24 + (52-24)*(x-14)/(52-14)) : (24 + (148-24)*(x-148)/(186-148))
        return <line key={x} x1={x} y1={Math.max(24, Math.round(cableY))} x2={x} y2="78" strokeWidth="1.1"/>
      })}
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  miami: ( // Art Deco building
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="68" y="28" width="64" height="82" strokeWidth="1.8"/>
      <rect x="76" y="18" width="48" height="14" strokeWidth="1.1"/>
      <rect x="84" y="10" width="32" height="12" strokeWidth="1.1"/>
      <line x1="68" y1="48" x2="132" y2="48" strokeWidth="1.1"/>
      <line x1="68" y1="66" x2="132" y2="66" strokeWidth="1.1"/>
      <line x1="68" y1="84" x2="132" y2="84" strokeWidth="1.1"/>
      <rect x="80" y="84" width="40" height="26" strokeWidth="1.1"/>
      <line x1="46" y1="110" x2="154" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  medellin: ( // Cable car gondola over steep valleys
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M10 108 L48 54 L90 76 L132 40 L178 62" strokeWidth="1.8"/>
      <line x1="18" y1="42" x2="188" y2="28" strokeWidth="1.1"/>
      <rect x="88" y="36" width="26" height="20" strokeWidth="1.8"/>
      <line x1="101" y1="36" x2="101" y2="28" strokeWidth="1.1"/>
      <line x1="88" y1="46" x2="82" y2="50" strokeWidth="1.1"/>
      <line x1="114" y1="46" x2="120" y2="48" strokeWidth="1.1"/>
      <line x1="10" y1="110" x2="190" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'mexico-city': ( // Angel of Independence
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="16" x2="100" y2="70" strokeWidth="1.8"/>
      <path d="M80 28 Q100 16 120 28" strokeWidth="1.1"/>
      <line x1="80" y1="28" x2="76" y2="42" strokeWidth="1.1"/>
      <line x1="120" y1="28" x2="124" y2="42" strokeWidth="1.1"/>
      <circle cx="100" cy="14" r="6" strokeWidth="1.1"/>
      <rect x="86" y="70" width="28" height="12" strokeWidth="1.1"/>
      <rect x="78" y="82" width="44" height="8" strokeWidth="1.8"/>
      <rect x="66" y="90" width="68" height="20" strokeWidth="1.8"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'buenos-aires': ( // Obelisk — properly scaled
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="94,12 106,12 114,110 86,110" strokeWidth="1.8"/>
      <polygon points="98,6 102,6 106,12 94,12" strokeWidth="1.1"/>
      <line x1="88" y1="40" x2="90" y2="40" strokeWidth="1.1"/>
      <line x1="110" y1="40" x2="112" y2="40" strokeWidth="1.1"/>
      <line x1="87" y1="64" x2="89" y2="64" strokeWidth="1.1"/>
      <line x1="111" y1="64" x2="113" y2="64" strokeWidth="1.1"/>
      <line x1="86" y1="86" x2="88" y2="86" strokeWidth="1.1"/>
      <line x1="112" y1="86" x2="114" y2="86" strokeWidth="1.1"/>
      <line x1="46" y1="110" x2="154" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'sao-paulo': ( // Paulista skyline
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="18" y="68" width="22" height="42" strokeWidth="1.1"/>
      <rect x="44" y="52" width="20" height="58" strokeWidth="1.1"/>
      <rect x="68" y="38" width="24" height="72" strokeWidth="1.8"/>
      <rect x="96" y="32" width="22" height="78" strokeWidth="1.8"/>
      <rect x="122" y="46" width="20" height="64" strokeWidth="1.1"/>
      <rect x="146" y="60" width="20" height="50" strokeWidth="1.1"/>
      <rect x="170" y="72" width="14" height="38" strokeWidth="1.1"/>
      <line x1="10" y1="110" x2="190" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'panama-city': ( // Bridge of the Americas
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="22" x2="100" y2="88" strokeWidth="1.8"/>
      <line x1="12" y1="88" x2="188" y2="88" strokeWidth="1.8"/>
      <path d="M12 88 Q100 42 188 88" strokeWidth="1.8"/>
      {[36,56,76,100,124,144,164].map(x => (
        <line key={x} x1={x} y1="88" x2={100} y2={22} strokeWidth="1.1"/>
      ))}
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'san-jose-cr': ( // National Theatre
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="36" y="56" width="128" height="54" strokeWidth="1.8"/>
      <polygon points="36,56 100,26 164,56" strokeWidth="1.8"/>
      <line x1="100" y1="26" x2="100" y2="16" strokeWidth="1.1"/>
      {[56,74,100,126,144].map(x => (
        <line key={x} x1={x} y1="56" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <rect x="78" y="78" width="44" height="32" strokeWidth="1.1"/>
      <line x1="22" y1="110" x2="178" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  /* ── Asia & Oceania ── */

  singapore: ( // Marina Bay Sands
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="38" y="50" width="22" height="60" strokeWidth="1.8"/>
      <rect x="89" y="50" width="22" height="60" strokeWidth="1.8"/>
      <rect x="140" y="50" width="22" height="60" strokeWidth="1.8"/>
      <path d="M32 50 Q100 22 168 50" strokeWidth="1.8"/>
      <rect x="32" y="42" width="136" height="12" strokeWidth="1.1"/>
      <line x1="22" y1="110" x2="178" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  tokyo: ( // Tokyo Tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="8" x2="100" y2="110" strokeWidth="1.8"/>
      <line x1="100" y1="8" x2="62" y2="110" strokeWidth="1.8"/>
      <line x1="100" y1="8" x2="138" y2="110" strokeWidth="1.8"/>
      <line x1="72" y1="58" x2="128" y2="58" strokeWidth="1.1"/>
      <line x1="66" y1="78" x2="134" y2="78" strokeWidth="1.1"/>
      <line x1="76" y1="40" x2="124" y2="40" strokeWidth="1.1"/>
      <rect x="86" y="50" width="28" height="18" strokeWidth="1.1"/>
      <line x1="46" y1="110" x2="154" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  osaka: ( // Osaka Castle
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="70" y="60" width="60" height="50" strokeWidth="1.8"/>
      <rect x="62" y="72" width="76" height="10" strokeWidth="1.1"/>
      <rect x="76" y="46" width="48" height="18" strokeWidth="1.8"/>
      <rect x="82" y="34" width="36" height="16" strokeWidth="1.1"/>
      <polygon points="82,34 100,18 118,34" strokeWidth="1.8"/>
      <line x1="100" y1="18" x2="100" y2="10" strokeWidth="1.1"/>
      <line x1="46" y1="110" x2="154" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  kyoto: ( // Kinkaku-ji / Golden Pavilion
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="58" y="62" width="84" height="14" strokeWidth="1.8"/>
      <rect x="66" y="48" width="68" height="16" strokeWidth="1.8"/>
      <polygon points="58,62 100,44 142,62" strokeWidth="1.1"/>
      <polygon points="66,48 100,34 134,48" strokeWidth="1.1"/>
      <rect x="78" y="34" width="44" height="16" strokeWidth="1.1"/>
      <polygon points="78,34 100,20 122,34" strokeWidth="1.8"/>
      <line x1="100" y1="20" x2="100" y2="12" strokeWidth="1.1"/>
      <rect x="86" y="76" width="28" height="34" strokeWidth="1.1"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  seoul: ( // Gyeongbokgung gate
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="32" y="78" width="136" height="32" strokeWidth="1.8"/>
      <rect x="46" y="55" width="108" height="28" strokeWidth="1.8"/>
      <polygon points="46,55 100,26 154,55" strokeWidth="1.8"/>
      <path d="M42 55 Q100 34 158 55" strokeWidth="1.1"/>
      <line x1="32" y1="92" x2="168" y2="92" strokeWidth="1.1"/>
      <path d="M78 110 L78 90 Q100 80 122 90 L122 110" strokeWidth="1.8"/>
      <line x1="18" y1="110" x2="182" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  sydney: ( // Opera House sails
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M30 94 Q48 40 76 94" strokeWidth="1.8"/>
      <path d="M68 94 Q94 22 122 94" strokeWidth="1.8"/>
      <path d="M116 94 Q134 46 156 94" strokeWidth="1.8"/>
      <path d="M150 94 Q160 58 172 94" strokeWidth="1.1"/>
      <line x1="20" y1="94" x2="180" y2="94" strokeWidth="1.8"/>
      <line x1="12" y1="110" x2="188" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  melbourne: ( // Flinders Street Station dome
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="22" y="70" width="156" height="40" strokeWidth="1.8"/>
      <path d="M76 70 Q100 42 124 70" strokeWidth="1.8"/>
      <rect x="30" y="52" width="36" height="20" strokeWidth="1.1"/>
      <rect x="134" y="52" width="36" height="20" strokeWidth="1.1"/>
      <line x1="22" y1="86" x2="178" y2="86" strokeWidth="1.1"/>
      <line x1="22" y1="100" x2="178" y2="100" strokeWidth="1.1"/>
      <line x1="10" y1="110" x2="190" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  auckland: ( // Sky Tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="8" x2="100" y2="110" strokeWidth="1.1"/>
      <ellipse cx="100" cy="56" rx="22" ry="11" strokeWidth="1.8"/>
      <ellipse cx="100" cy="50" rx="16" ry="8" strokeWidth="1.1"/>
      <line x1="86" y1="67" x2="82" y2="96" strokeWidth="1.8"/>
      <line x1="114" y1="67" x2="118" y2="96" strokeWidth="1.8"/>
      <path d="M82 96 Q100 88 118 96" strokeWidth="1.8"/>
      <line x1="54" y1="110" x2="146" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  bangkok: ( // Wat Arun spire
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="10" x2="100" y2="110" strokeWidth="1.8"/>
      <line x1="100" y1="10" x2="86" y2="30" strokeWidth="1.1"/>
      <line x1="100" y1="10" x2="114" y2="30" strokeWidth="1.1"/>
      <line x1="86" y1="30" x2="74" y2="52" strokeWidth="1.1"/>
      <line x1="114" y1="30" x2="126" y2="52" strokeWidth="1.1"/>
      <line x1="74" y1="52" x2="60" y2="74" strokeWidth="1.1"/>
      <line x1="126" y1="52" x2="140" y2="74" strokeWidth="1.1"/>
      <line x1="86" y1="30" x2="114" y2="30" strokeWidth="1.1"/>
      <line x1="74" y1="52" x2="126" y2="52" strokeWidth="1.1"/>
      <line x1="60" y1="74" x2="140" y2="74" strokeWidth="1.8"/>
      <rect x="66" y="88" width="68" height="22" strokeWidth="1.8"/>
      <line x1="38" y1="110" x2="162" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  bali: ( // Tanah Lot temple on rock
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M52 88 Q100 74 148 88 Q154 100 148 110 Q100 116 52 110 Q46 100 52 88" strokeWidth="1.8"/>
      <rect x="76" y="70" width="48" height="20" strokeWidth="1.1"/>
      <polygon points="76,70 100,48 124,70" strokeWidth="1.8"/>
      <line x1="100" y1="48" x2="100" y2="38" strokeWidth="1.8"/>
      <line x1="94" y1="44" x2="106" y2="44" strokeWidth="1.1"/>
      <line x1="68" y1="84" x2="132" y2="84" strokeWidth="1.1"/>
      <line x1="14" y1="110" x2="186" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'chiang-mai': ( // Doi Suthep temple
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="100,12 84,44 116,44" strokeWidth="1.8"/>
      <line x1="100" y1="12" x2="100" y2="6" strokeWidth="1.1"/>
      <rect x="80" y="44" width="40" height="20" strokeWidth="1.1"/>
      <rect x="66" y="64" width="68" height="14" strokeWidth="1.8"/>
      <rect x="48" y="78" width="104" height="32" strokeWidth="1.8"/>
      <line x1="48" y1="92" x2="152" y2="92" strokeWidth="1.1"/>
      <line x1="30" y1="110" x2="170" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'kuala-lumpur': ( // Petronas Towers
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="54" y="32" width="36" height="78" strokeWidth="1.8"/>
      <rect x="110" y="32" width="36" height="78" strokeWidth="1.8"/>
      <line x1="54" y1="32" x2="72" y2="18" strokeWidth="1.1"/>
      <line x1="90" y1="32" x2="72" y2="18" strokeWidth="1.1"/>
      <line x1="110" y1="32" x2="128" y2="18" strokeWidth="1.1"/>
      <line x1="146" y1="32" x2="128" y2="18" strokeWidth="1.1"/>
      <line x1="72" y1="18" x2="72" y2="10" strokeWidth="1.1"/>
      <line x1="128" y1="18" x2="128" y2="10" strokeWidth="1.1"/>
      <rect x="86" y="65" width="28" height="8" strokeWidth="1.8"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'da-nang': ( // Dragon Bridge
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M14 82 Q58 50 100 66 Q142 82 180 64" strokeWidth="1.8"/>
      <line x1="14" y1="82" x2="186" y2="82" strokeWidth="1.1"/>
      <path d="M158 66 Q170 54 182 52 Q188 56 186 64" strokeWidth="1.8"/>
      <line x1="178" y1="52" x2="182" y2="44" strokeWidth="1.1"/>
      <line x1="182" y1="44" x2="188" y2="46" strokeWidth="1.1"/>
      {[36,58,80,100,120,142,164].map(x => (
        <line key={x} x1={x} y1="82" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'ho-chi-minh-city': ( // Reunification Palace
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="28" y="58" width="144" height="52" strokeWidth="1.8"/>
      <rect x="28" y="44" width="144" height="18" strokeWidth="1.1"/>
      <rect x="48" y="32" width="104" height="16" strokeWidth="1.1"/>
      <rect x="68" y="22" width="64" height="14" strokeWidth="1.1"/>
      <line x1="28" y1="74" x2="172" y2="74" strokeWidth="1.1"/>
      <line x1="28" y1="90" x2="172" y2="90" strokeWidth="1.1"/>
      {[44,64,84,100,116,136,156].map(x => (
        <line key={x} x1={x} y1="74" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="14" y1="110" x2="186" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  bangalore: ( // Vidhana Soudha dome
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="28" y="70" width="144" height="40" strokeWidth="1.8"/>
      <rect x="44" y="55" width="112" height="18" strokeWidth="1.1"/>
      <path d="M66 55 Q100 26 134 55" strokeWidth="1.8"/>
      <line x1="100" y1="26" x2="100" y2="16" strokeWidth="1.8"/>
      <line x1="93" y1="21" x2="107" y2="21" strokeWidth="1.1"/>
      <line x1="28" y1="86" x2="172" y2="86" strokeWidth="1.1"/>
      {[44,62,80,100,120,138,156].map(x => (
        <line key={x} x1={x} y1="86" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="14" y1="110" x2="186" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  /* ── Middle East & Africa ── */

  dubai: ( // Burj Khalifa — full-height stepped silhouette
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="6" x2="100" y2="20" strokeWidth="1.8"/>
      <rect x="96" y="20" width="8" height="16" strokeWidth="1.1"/>
      <rect x="92" y="36" width="16" height="12" strokeWidth="1.1"/>
      <rect x="87" y="48" width="26" height="10" strokeWidth="1.1"/>
      <rect x="82" y="58" width="36" height="10" strokeWidth="1.8"/>
      <rect x="76" y="68" width="48" height="10" strokeWidth="1.8"/>
      <rect x="68" y="78" width="64" height="10" strokeWidth="1.8"/>
      <rect x="58" y="88" width="84" height="22" strokeWidth="1.8"/>
      <line x1="40" y1="110" x2="160" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'cape-town': ( // Table Mountain flat top
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M18 92 L52 40 L148 40 L182 92" strokeWidth="1.8"/>
      <line x1="52" y1="40" x2="148" y2="40" strokeWidth="1.8"/>
      <path d="M18 92 Q100 82 182 92" strokeWidth="1.1"/>
      <line x1="66" y1="40" x2="58" y2="92" strokeWidth="1.1"/>
      <line x1="90" y1="40" x2="88" y2="92" strokeWidth="1.1"/>
      <line x1="110" y1="40" x2="112" y2="92" strokeWidth="1.1"/>
      <line x1="134" y1="40" x2="142" y2="92" strokeWidth="1.1"/>
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'abu-dhabi': ( // Sheikh Zayed Mosque domes + minarets
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="22" y="78" width="156" height="32" strokeWidth="1.8"/>
      <path d="M70 78 Q100 44 130 78" strokeWidth="1.8"/>
      <path d="M32 78 Q48 60 64 78" strokeWidth="1.1"/>
      <path d="M136 78 Q152 60 168 78" strokeWidth="1.1"/>
      <line x1="40" y1="60" x2="40" y2="40" strokeWidth="1.8"/>
      <line x1="160" y1="60" x2="160" y2="40" strokeWidth="1.8"/>
      <line x1="34" y1="40" x2="46" y2="40" strokeWidth="1.1"/>
      <line x1="154" y1="40" x2="166" y2="40" strokeWidth="1.1"/>
      <line x1="22" y1="92" x2="178" y2="92" strokeWidth="1.1"/>
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
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
      <rect x="26" y="72" width="24" height="38" strokeWidth="1.1"/>
      <rect x="54" y="56" width="22" height="54" strokeWidth="1.1"/>
      <rect x="80" y="42" width="26" height="68" strokeWidth="1.8"/>
      <rect x="110" y="36" width="22" height="74" strokeWidth="1.8"/>
      <rect x="136" y="52" width="20" height="58" strokeWidth="1.1"/>
      <rect x="160" y="66" width="20" height="44" strokeWidth="1.1"/>
      <line x1="14" y1="110" x2="186" y2="110" strokeWidth="1.8"/>
    </svg>
  )
}
