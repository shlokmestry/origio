// Line-art monument illustrations · viewBox 0 0 200 130 · stroke only · fill none
// strokeWidth: 1.8 = primary structure · 1.1 = secondary detail

const S = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export const MONUMENTS: Record<string, React.ReactNode> = {

  /* ── Europe ── */

  lisbon: ( // Belém Tower — Manueline stone tower rising from the Tagus
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="78" y="30" width="44" height="72" strokeWidth="1.8"/>
      <rect x="70" y="88" width="60" height="14" strokeWidth="1.8"/>
      <path d="M78 30 Q100 14 122 30" strokeWidth="1.8"/>
      <line x1="100" y1="14" x2="100" y2="6" strokeWidth="1.8"/>
      <line x1="93" y1="10" x2="107" y2="10" strokeWidth="1.1"/>
      <rect x="84" y="40" width="10" height="14" strokeWidth="1.1"/>
      <rect x="106" y="40" width="10" height="14" strokeWidth="1.1"/>
      <rect x="84" y="62" width="10" height="14" strokeWidth="1.1"/>
      <rect x="106" y="62" width="10" height="14" strokeWidth="1.1"/>
      <line x1="78" y1="56" x2="122" y2="56" strokeWidth="1.1"/>
      <line x1="70" y1="88" x2="130" y2="88" strokeWidth="1.1"/>
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
      <path d="M4 110 Q52 100 70 102 Q80 110 4 110" strokeWidth="1.1"/>
      <path d="M196 110 Q148 100 130 102 Q120 110 196 110" strokeWidth="1.1"/>
    </svg>
  ),

  paris: ( // Eiffel Tower — arched legs + lattice
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="5" x2="100" y2="18" strokeWidth="1.8"/>
      <line x1="100" y1="18" x2="68" y2="110" strokeWidth="1.8"/>
      <line x1="100" y1="18" x2="132" y2="110" strokeWidth="1.8"/>
      <path d="M68 110 Q100 92 132 110" strokeWidth="1.1"/>
      <line x1="79" y1="52" x2="121" y2="52" strokeWidth="1.8"/>
      <line x1="71" y1="78" x2="129" y2="78" strokeWidth="1.8"/>
      <line x1="82" y1="68" x2="87" y2="52" strokeWidth="1.1"/>
      <line x1="118" y1="68" x2="113" y2="52" strokeWidth="1.1"/>
      <line x1="80" y1="75" x2="85" y2="60" strokeWidth="1.1"/>
      <line x1="120" y1="75" x2="115" y2="60" strokeWidth="1.1"/>
      <line x1="84" y1="92" x2="89" y2="78" strokeWidth="1.1"/>
      <line x1="116" y1="92" x2="111" y2="78" strokeWidth="1.1"/>
      <line x1="88" y1="98" x2="94" y2="78" strokeWidth="1.1"/>
      <line x1="112" y1="98" x2="106" y2="78" strokeWidth="1.1"/>
      <line x1="56" y1="110" x2="144" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  london: ( // Big Ben — clock tower with Gothic crown
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="6" x2="100" y2="16" strokeWidth="1.8"/>
      <polygon points="84,16 100,6 116,16" strokeWidth="1.1"/>
      <rect x="86" y="16" width="28" height="10" strokeWidth="1.1"/>
      <rect x="88" y="26" width="24" height="56" strokeWidth="1.8"/>
      <circle cx="100" cy="42" r="10" strokeWidth="1.1"/>
      <line x1="100" y1="32" x2="100" y2="42" strokeWidth="1.1"/>
      <line x1="100" y1="42" x2="108" y2="47" strokeWidth="1.1"/>
      <rect x="80" y="82" width="40" height="28" strokeWidth="1.8"/>
      <line x1="80" y1="96" x2="120" y2="96" strokeWidth="1.1"/>
      <line x1="93" y1="82" x2="93" y2="110" strokeWidth="1.1"/>
      <line x1="107" y1="82" x2="107" y2="110" strokeWidth="1.1"/>
      <line x1="64" y1="110" x2="136" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  dublin: ( // Ha'penny Bridge — bigger arch, fewer rods
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M20 92 Q100 26 180 92" strokeWidth="1.8"/>
      <line x1="20" y1="92" x2="180" y2="92" strokeWidth="1.8"/>
      <line x1="20" y1="86" x2="20" y2="110" strokeWidth="1.8"/>
      <line x1="180" y1="86" x2="180" y2="110" strokeWidth="1.8"/>
      <line x1="48" y1="92" x2="44" y2="60" strokeWidth="1.1"/>
      <line x1="76" y1="92" x2="70" y2="44" strokeWidth="1.1"/>
      <line x1="100" y1="92" x2="100" y2="36" strokeWidth="1.1"/>
      <line x1="124" y1="92" x2="130" y2="44" strokeWidth="1.1"/>
      <line x1="152" y1="92" x2="156" y2="60" strokeWidth="1.1"/>
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  edinburgh: ( // Edinburgh Castle — fortress on volcanic rock
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M26 110 Q54 88 74 86 Q88 72 112 74 Q134 76 174 110" strokeWidth="1.8"/>
      <rect x="70" y="44" width="52" height="36" strokeWidth="1.8"/>
      <rect x="58" y="56" width="18" height="24" strokeWidth="1.1"/>
      <rect x="122" y="54" width="16" height="26" strokeWidth="1.1"/>
      <line x1="70" y1="44" x2="74" y2="34" strokeWidth="1.1"/>
      <line x1="84" y1="44" x2="84" y2="34" strokeWidth="1.1"/>
      <line x1="96" y1="44" x2="94" y2="34" strokeWidth="1.1"/>
      <line x1="108" y1="44" x2="108" y2="34" strokeWidth="1.1"/>
      <line x1="122" y1="44" x2="126" y2="34" strokeWidth="1.1"/>
      <rect x="88" y="58" width="16" height="22" strokeWidth="1.1"/>
      <line x1="12" y1="110" x2="188" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  manchester: ( // Worker bee + mill skyline
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="42" y="70" width="20" height="40" strokeWidth="1.1"/>
      <rect x="66" y="56" width="24" height="54" strokeWidth="1.8"/>
      <rect x="94" y="48" width="14" height="62" strokeWidth="1.1"/>
      <rect x="112" y="64" width="28" height="46" strokeWidth="1.8"/>
      <line x1="70" y1="56" x2="70" y2="30" strokeWidth="1.1"/>
      <line x1="82" y1="56" x2="82" y2="24" strokeWidth="1.8"/>
      <ellipse cx="130" cy="36" rx="14" ry="10" strokeWidth="1.8"/>
      <circle cx="130" cy="24" r="5" strokeWidth="1.1"/>
      <line x1="122" y1="34" x2="114" y2="24" strokeWidth="1.1"/>
      <line x1="138" y1="34" x2="146" y2="24" strokeWidth="1.1"/>
      <line x1="124" y1="42" x2="136" y2="42" strokeWidth="1.1"/>
      <line x1="126" y1="30" x2="126" y2="44" strokeWidth="1.1"/>
      <line x1="134" y1="30" x2="134" y2="44" strokeWidth="1.1"/>
      <line x1="24" y1="110" x2="176" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  bristol: ( // Clifton Suspension Bridge — twin towers + suspended deck
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="54" y1="26" x2="54" y2="92" strokeWidth="1.8"/>
      <line x1="146" y1="26" x2="146" y2="92" strokeWidth="1.8"/>
      <path d="M18 72 Q54 38 100 50 Q146 38 182 72" strokeWidth="1.8"/>
      <line x1="18" y1="92" x2="182" y2="92" strokeWidth="1.8"/>
      {[30,46,54,70,86,100,114,130,146,154,170].map(x => {
        const cx = 100, sag = 28, dx = (x - cx) / 100
        const y = Math.round(50 + sag * dx * dx)
        return <line key={x} x1={x} y1={Math.min(y, 92)} x2={x} y2="92" strokeWidth="1.1"/>
      })}
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  glasgow: ( // Finnieston Crane — giant cantilever dock crane
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="58" y1="30" x2="58" y2="110" strokeWidth="1.8"/>
      <line x1="58" y1="30" x2="136" y2="30" strokeWidth="1.8"/>
      <line x1="136" y1="30" x2="168" y2="52" strokeWidth="1.8"/>
      <line x1="58" y1="42" x2="132" y2="42" strokeWidth="1.1"/>
      <line x1="72" y1="30" x2="94" y2="66" strokeWidth="1.1"/>
      <line x1="90" y1="30" x2="108" y2="60" strokeWidth="1.1"/>
      <line x1="108" y1="30" x2="124" y2="54" strokeWidth="1.1"/>
      <line x1="136" y1="30" x2="136" y2="94" strokeWidth="1.1"/>
      <line x1="136" y1="58" x2="152" y2="58" strokeWidth="1.1"/>
      <line x1="152" y1="58" x2="152" y2="92" strokeWidth="1.1"/>
      <rect x="46" y="94" width="24" height="16" strokeWidth="1.1"/>
      <line x1="24" y1="110" x2="176" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  amsterdam: ( // Canal house gables — three stepped facades
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="42,110 42,54 58,30 74,54 74,110" strokeWidth="1.8"/>
      <polygon points="76,110 76,50 94,24 112,50 112,110" strokeWidth="1.8"/>
      <polygon points="114,110 114,56 130,34 146,56 146,110" strokeWidth="1.8"/>
      <rect x="48" y="70" width="12" height="16" strokeWidth="1.1"/>
      <rect x="62" y="70" width="12" height="16" strokeWidth="1.1"/>
      <rect x="82" y="68" width="12" height="16" strokeWidth="1.1"/>
      <rect x="98" y="68" width="12" height="16" strokeWidth="1.1"/>
      <rect x="120" y="72" width="12" height="16" strokeWidth="1.1"/>
      <rect x="134" y="72" width="12" height="16" strokeWidth="1.1"/>
      <line x1="26" y1="110" x2="162" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  berlin: ( // Brandenburg Gate — Doric columns under pediment
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="46,32 100,16 154,32" strokeWidth="1.8"/>
      <rect x="46" y="32" width="108" height="10" strokeWidth="1.1"/>
      <rect x="46" y="42" width="108" height="48" strokeWidth="1.8"/>
      <line x1="64" y1="42" x2="64" y2="90" strokeWidth="1.1"/>
      <line x1="80" y1="42" x2="80" y2="90" strokeWidth="1.1"/>
      <line x1="96" y1="42" x2="96" y2="90" strokeWidth="1.1"/>
      <line x1="112" y1="42" x2="112" y2="90" strokeWidth="1.1"/>
      <line x1="128" y1="42" x2="128" y2="90" strokeWidth="1.1"/>
      <line x1="144" y1="42" x2="144" y2="90" strokeWidth="1.1"/>
      <rect x="52" y="76" width="14" height="14" strokeWidth="1.1"/>
      <rect x="134" y="76" width="14" height="14" strokeWidth="1.1"/>
      <line x1="46" y1="90" x2="46" y2="110" strokeWidth="1.8"/>
      <line x1="154" y1="90" x2="154" y2="110" strokeWidth="1.8"/>
      <line x1="32" y1="110" x2="168" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  barcelona: ( // Sagrada Família — five spires with bulbous finials
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="12" x2="100" y2="110" strokeWidth="1.8"/>
      <ellipse cx="100" cy="10" rx="5" ry="7" strokeWidth="1.8"/>
      <line x1="80" y1="26" x2="80" y2="110" strokeWidth="1.8"/>
      <ellipse cx="80" cy="24" rx="4" ry="6" strokeWidth="1.1"/>
      <line x1="120" y1="26" x2="120" y2="110" strokeWidth="1.8"/>
      <ellipse cx="120" cy="24" rx="4" ry="6" strokeWidth="1.1"/>
      <line x1="62" y1="46" x2="62" y2="110" strokeWidth="1.1"/>
      <ellipse cx="62" cy="44" rx="3" ry="5" strokeWidth="1.1"/>
      <line x1="138" y1="46" x2="138" y2="110" strokeWidth="1.1"/>
      <ellipse cx="138" cy="44" rx="3" ry="5" strokeWidth="1.1"/>
      <rect x="68" y="68" width="64" height="42" strokeWidth="1.8"/>
      <path d="M68 84 Q100 74 132 84" strokeWidth="1.1"/>
      <path d="M80 110 L80 82 Q100 72 120 82 L120 110" strokeWidth="1.1"/>
      <line x1="44" y1="110" x2="156" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  malaga: ( // Alcazaba fortress — crenellated battlements
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="34" y="56" width="132" height="54" strokeWidth="1.8"/>
      <rect x="46" y="36" width="28" height="24" strokeWidth="1.8"/>
      <rect x="126" y="36" width="28" height="24" strokeWidth="1.8"/>
      <line x1="46" y1="36" x2="49" y2="28" strokeWidth="1.1"/>
      <line x1="56" y1="36" x2="56" y2="28" strokeWidth="1.1"/>
      <line x1="63" y1="36" x2="61" y2="28" strokeWidth="1.1"/>
      <line x1="70" y1="36" x2="70" y2="28" strokeWidth="1.1"/>
      <line x1="126" y1="36" x2="129" y2="28" strokeWidth="1.1"/>
      <line x1="136" y1="36" x2="136" y2="28" strokeWidth="1.1"/>
      <line x1="143" y1="36" x2="141" y2="28" strokeWidth="1.1"/>
      <line x1="152" y1="36" x2="152" y2="28" strokeWidth="1.1"/>
      <path d="M86 110 L86 82 Q100 72 114 82 L114 110" strokeWidth="1.8"/>
      <line x1="34" y1="78" x2="166" y2="78" strokeWidth="1.1"/>
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  tbilisi: ( // Narikala fortress tower + Sameba cathedral
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="46" y="58" width="32" height="52" strokeWidth="1.8"/>
      <polygon points="46,58 62,36 78,58" strokeWidth="1.8"/>
      <line x1="62" y1="36" x2="62" y2="26" strokeWidth="1.1"/>
      <line x1="46" y1="78" x2="78" y2="78" strokeWidth="1.1"/>
      <rect x="108" y="54" width="46" height="56" strokeWidth="1.8"/>
      <path d="M108 54 Q131 26 154 54" strokeWidth="1.8"/>
      <line x1="131" y1="26" x2="131" y2="16" strokeWidth="1.8"/>
      <line x1="125" y1="21" x2="137" y2="21" strokeWidth="1.1"/>
      <rect x="118" y="80" width="26" height="30" strokeWidth="1.1"/>
      <line x1="28" y1="110" x2="172" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  tallinn: ( // Old Town Hall — steep Gothic spire over hall
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="56" y="62" width="88" height="48" strokeWidth="1.8"/>
      <polygon points="56,62 100,12 144,62" strokeWidth="1.8"/>
      <line x1="100" y1="12" x2="100" y2="4" strokeWidth="1.8"/>
      <line x1="95" y1="8" x2="105" y2="8" strokeWidth="1.1"/>
      <line x1="76" y1="62" x2="76" y2="110" strokeWidth="1.1"/>
      <line x1="100" y1="62" x2="100" y2="110" strokeWidth="1.1"/>
      <line x1="124" y1="62" x2="124" y2="110" strokeWidth="1.1"/>
      <rect x="84" y="80" width="32" height="30" strokeWidth="1.1"/>
      <line x1="56" y1="80" x2="144" y2="80" strokeWidth="1.1"/>
      <line x1="38" y1="110" x2="162" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  porto: ( // Dom Luís Bridge — double-deck iron arch
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M12 90 Q100 24 188 90" strokeWidth="1.8"/>
      <line x1="12" y1="90" x2="188" y2="90" strokeWidth="1.8"/>
      <line x1="12" y1="66" x2="188" y2="66" strokeWidth="1.1"/>
      <line x1="12" y1="56" x2="12" y2="90" strokeWidth="1.8"/>
      <line x1="188" y1="56" x2="188" y2="90" strokeWidth="1.8"/>
      <line x1="34" y1="66" x2="30" y2="90" strokeWidth="1.1"/>
      <line x1="60" y1="66" x2="54" y2="90" strokeWidth="1.1"/>
      <line x1="100" y1="66" x2="100" y2="90" strokeWidth="1.1"/>
      <line x1="140" y1="66" x2="146" y2="90" strokeWidth="1.1"/>
      <line x1="166" y1="66" x2="170" y2="90" strokeWidth="1.1"/>
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  milan: ( // Duomo — forest of Gothic spires + nave
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="46" y="70" width="108" height="40" strokeWidth="1.8"/>
      <line x1="100" y1="10" x2="100" y2="70" strokeWidth="1.8"/>
      <line x1="78" y1="26" x2="78" y2="70" strokeWidth="1.8"/>
      <line x1="122" y1="26" x2="122" y2="70" strokeWidth="1.8"/>
      <line x1="60" y1="44" x2="60" y2="70" strokeWidth="1.1"/>
      <line x1="140" y1="44" x2="140" y2="70" strokeWidth="1.1"/>
      <line x1="46" y1="70" x2="154" y2="70" strokeWidth="1.8"/>
      <line x1="46" y1="86" x2="154" y2="86" strokeWidth="1.1"/>
      <path d="M60 86 L60 110 M76 86 L76 110 M92 86 L92 110 M108 86 L108 110 M124 86 L124 110 M140 86 L140 110" strokeWidth="1.1"/>
      <line x1="30" y1="110" x2="170" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  rome: ( // Colosseum — three tiers of arched ellipses
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <ellipse cx="100" cy="86" rx="80" ry="28" strokeWidth="1.8"/>
      <ellipse cx="100" cy="72" rx="80" ry="28" strokeWidth="1.8"/>
      <ellipse cx="100" cy="58" rx="80" ry="28" strokeWidth="1.8"/>
      <line x1="20" y1="72" x2="20" y2="86" strokeWidth="1.8"/>
      <line x1="180" y1="72" x2="180" y2="86" strokeWidth="1.8"/>
      <line x1="20" y1="58" x2="20" y2="72" strokeWidth="1.8"/>
      <line x1="180" y1="58" x2="180" y2="72" strokeWidth="1.8"/>
      {[36,52,68,84,100,116,132,148,164].map(x => (
        <line key={x} x1={x} y1="58" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  athens: ( // Parthenon — pediment over Doric columns on stepped platform
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="42,50 100,20 158,50" strokeWidth="1.8"/>
      <rect x="42" y="50" width="116" height="8" strokeWidth="1.1"/>
      {[54,67,80,93,106,119,132,145].map(x => (
        <line key={x} x1={x} y1="58" x2={x} y2="96" strokeWidth="1.1"/>
      ))}
      <rect x="40" y="96" width="120" height="6" strokeWidth="1.1"/>
      <rect x="34" y="102" width="132" height="8" strokeWidth="1.8"/>
      <line x1="22" y1="110" x2="178" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  munich: ( // Frauenkirche — twin onion domes over nave
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="52" y="50" width="34" height="60" strokeWidth="1.8"/>
      <rect x="114" y="50" width="34" height="60" strokeWidth="1.8"/>
      <path d="M52 50 Q58 28 69 20 Q80 28 86 50" strokeWidth="1.8"/>
      <path d="M114 50 Q120 28 131 20 Q142 28 148 50" strokeWidth="1.8"/>
      <line x1="69" y1="20" x2="69" y2="10" strokeWidth="1.1"/>
      <line x1="131" y1="20" x2="131" y2="10" strokeWidth="1.1"/>
      <rect x="46" y="88" width="108" height="22" strokeWidth="1.8"/>
      <line x1="69" y1="68" x2="69" y2="110" strokeWidth="1.1"/>
      <line x1="131" y1="68" x2="131" y2="110" strokeWidth="1.1"/>
      <line x1="32" y1="110" x2="168" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  vienna: ( // St Stephen's Cathedral — soaring Gothic spire + nave
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="6" x2="100" y2="110" strokeWidth="1.8"/>
      <polygon points="76,44 100,6 124,44" strokeWidth="1.8"/>
      <rect x="66" y="44" width="68" height="66" strokeWidth="1.8"/>
      <rect x="52" y="66" width="22" height="44" strokeWidth="1.1"/>
      <rect x="126" y="66" width="22" height="44" strokeWidth="1.1"/>
      <path d="M66 68 Q100 56 134 68" strokeWidth="1.1"/>
      <rect x="82" y="82" width="36" height="28" strokeWidth="1.1"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  prague: ( // Charles Bridge Old Town Tower + long bridge deck
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="78" y="36" width="44" height="56" strokeWidth="1.8"/>
      <rect x="74" y="28" width="52" height="12" strokeWidth="1.1"/>
      <polygon points="74,28 100,6 126,28" strokeWidth="1.8"/>
      <line x1="100" y1="6" x2="100" y2="2" strokeWidth="1.1"/>
      <rect x="88" y="76" width="24" height="16" strokeWidth="1.1"/>
      <line x1="6" y1="92" x2="194" y2="92" strokeWidth="1.8"/>
      <line x1="6" y1="92" x2="6" y2="110" strokeWidth="1.8"/>
      <line x1="194" y1="92" x2="194" y2="110" strokeWidth="1.8"/>
      <line x1="78" y1="92" x2="78" y2="110" strokeWidth="1.1"/>
      <line x1="122" y1="92" x2="122" y2="110" strokeWidth="1.1"/>
      {[32,56,144,168].map(x => (
        <line key={x} x1={x} y1="92" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  budapest: ( // Hungarian Parliament — central dome + flanking towers
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="22" y="72" width="156" height="38" strokeWidth="1.8"/>
      <line x1="100" y1="18" x2="100" y2="72" strokeWidth="1.8"/>
      <path d="M74 50 Q100 22 126 50" strokeWidth="1.8"/>
      <line x1="74" y1="50" x2="126" y2="50" strokeWidth="1.1"/>
      <rect x="48" y="50" width="24" height="24" strokeWidth="1.1"/>
      <rect x="128" y="50" width="24" height="24" strokeWidth="1.1"/>
      <line x1="22" y1="86" x2="178" y2="86" strokeWidth="1.1"/>
      {[38,56,74,92,108,126,144,162].map(x => (
        <line key={x} x1={x} y1="86" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="10" y1="110" x2="190" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  warsaw: ( // Palace of Culture — Stalinist wedding cake spire
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="6" x2="100" y2="24" strokeWidth="1.8"/>
      <rect x="92" y="24" width="16" height="14" strokeWidth="1.1"/>
      <rect x="84" y="38" width="32" height="12" strokeWidth="1.1"/>
      <rect x="72" y="50" width="56" height="12" strokeWidth="1.8"/>
      <rect x="56" y="62" width="88" height="12" strokeWidth="1.8"/>
      <rect x="44" y="74" width="112" height="36" strokeWidth="1.8"/>
      <line x1="44" y1="86" x2="156" y2="86" strokeWidth="1.1"/>
      <line x1="44" y1="98" x2="156" y2="98" strokeWidth="1.1"/>
      <line x1="28" y1="110" x2="172" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  stockholm: ( // Stockholm City Hall — tower with golden crown
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="44" y="54" width="112" height="56" strokeWidth="1.8"/>
      <rect x="76" y="26" width="48" height="32" strokeWidth="1.8"/>
      <line x1="100" y1="26" x2="100" y2="12" strokeWidth="1.8"/>
      <line x1="92" y1="19" x2="108" y2="19" strokeWidth="1.1"/>
      <line x1="44" y1="72" x2="156" y2="72" strokeWidth="1.1"/>
      <rect x="60" y="80" width="22" height="30" strokeWidth="1.1"/>
      <rect x="118" y="80" width="22" height="30" strokeWidth="1.1"/>
      <path d="M76 26 Q100 18 124 26" strokeWidth="1.1"/>
      <line x1="28" y1="110" x2="172" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  copenhagen: ( // Nyhavn — four narrow gabled houses facing waterfront
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="24,110 24,58 40,32 56,58 56,110" strokeWidth="1.8"/>
      <polygon points="58,110 58,52 76,24 94,52 94,110" strokeWidth="1.8"/>
      <polygon points="96,110 96,60 112,36 128,60 128,110" strokeWidth="1.8"/>
      <polygon points="130,110 130,54 146,28 162,54 162,110" strokeWidth="1.8"/>
      <rect x="30" y="70" width="10" height="14" strokeWidth="1.1"/>
      <rect x="42" y="70" width="10" height="14" strokeWidth="1.1"/>
      <rect x="64" y="68" width="10" height="14" strokeWidth="1.1"/>
      <rect x="78" y="68" width="10" height="14" strokeWidth="1.1"/>
      <rect x="102" y="72" width="10" height="14" strokeWidth="1.1"/>
      <rect x="116" y="72" width="10" height="14" strokeWidth="1.1"/>
      <rect x="136" y="70" width="10" height="14" strokeWidth="1.1"/>
      <rect x="150" y="70" width="10" height="14" strokeWidth="1.1"/>
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  helsinki: ( // Helsinki Cathedral — white dome + four side towers
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="34" y="78" width="132" height="32" strokeWidth="1.8"/>
      <rect x="52" y="62" width="96" height="20" strokeWidth="1.1"/>
      <path d="M62 62 Q100 26 138 62" strokeWidth="1.8"/>
      <line x1="100" y1="26" x2="100" y2="14" strokeWidth="1.8"/>
      <line x1="93" y1="20" x2="107" y2="20" strokeWidth="1.1"/>
      <rect x="38" y="56" width="14" height="24" strokeWidth="1.1"/>
      <rect x="148" y="56" width="14" height="24" strokeWidth="1.1"/>
      <line x1="34" y1="92" x2="166" y2="92" strokeWidth="1.1"/>
      {[52,68,84,100,116,132,148].map(x => (
        <line key={x} x1={x} y1="92" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="20" y1="110" x2="180" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  oslo: ( // Oslo Opera House — white marble ramp rising from fjord
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="6,110 6,110 100,26 194,62 194,110" strokeWidth="1.8"/>
      <line x1="6" y1="110" x2="194" y2="110" strokeWidth="1.8"/>
      <line x1="100" y1="26" x2="194" y2="62" strokeWidth="1.1"/>
      <line x1="52" y1="68" x2="52" y2="110" strokeWidth="1.1"/>
      <line x1="100" y1="26" x2="100" y2="110" strokeWidth="1.1"/>
      <line x1="150" y1="44" x2="150" y2="110" strokeWidth="1.1"/>
      <line x1="26" y1="90" x2="194" y2="64" strokeWidth="1.1"/>
    </svg>
  ),

  brussels: ( // Atomium — reduced cluster, bolder read
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <circle cx="100" cy="24" r="16" strokeWidth="1.8"/>
      <circle cx="62" cy="58" r="13" strokeWidth="1.8"/>
      <circle cx="138" cy="58" r="13" strokeWidth="1.8"/>
      <circle cx="78" cy="92" r="12" strokeWidth="1.1"/>
      <circle cx="122" cy="92" r="12" strokeWidth="1.1"/>
      <line x1="100" y1="40" x2="100" y2="110" strokeWidth="1.8"/>
      <line x1="88" y1="36" x2="71" y2="49" strokeWidth="1.1"/>
      <line x1="112" y1="36" x2="129" y2="49" strokeWidth="1.1"/>
      <line x1="70" y1="70" x2="82" y2="82" strokeWidth="1.1"/>
      <line x1="130" y1="70" x2="118" y2="82" strokeWidth="1.1"/>
      <line x1="30" y1="110" x2="170" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  zurich: ( // Grossmünster — twin Romanesque towers flanking nave
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="54" y="44" width="36" height="66" strokeWidth="1.8"/>
      <rect x="110" y="44" width="36" height="66" strokeWidth="1.8"/>
      <polygon points="54,44 72,18 90,44" strokeWidth="1.8"/>
      <polygon points="110,44 128,18 146,44" strokeWidth="1.8"/>
      <line x1="72" y1="18" x2="72" y2="8" strokeWidth="1.1"/>
      <line x1="128" y1="18" x2="128" y2="8" strokeWidth="1.1"/>
      <rect x="62" y="72" width="20" height="22" strokeWidth="1.1"/>
      <rect x="118" y="72" width="20" height="22" strokeWidth="1.1"/>
      <rect x="88" y="64" width="24" height="46" strokeWidth="1.8"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  limassol: ( // Limassol Medieval Castle — crenellated keep
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="38" y="52" width="124" height="58" strokeWidth="1.8"/>
      <rect x="38" y="40" width="124" height="16" strokeWidth="1.1"/>
      <line x1="38" y1="40" x2="42" y2="30" strokeWidth="1.1"/>
      <line x1="52" y1="40" x2="52" y2="30" strokeWidth="1.1"/>
      <line x1="64" y1="40" x2="62" y2="30" strokeWidth="1.1"/>
      <line x1="76" y1="40" x2="76" y2="30" strokeWidth="1.1"/>
      <line x1="100" y1="40" x2="100" y2="30" strokeWidth="1.1"/>
      <line x1="124" y1="40" x2="124" y2="30" strokeWidth="1.1"/>
      <line x1="136" y1="40" x2="134" y2="30" strokeWidth="1.1"/>
      <line x1="148" y1="40" x2="148" y2="30" strokeWidth="1.1"/>
      <line x1="158" y1="40" x2="162" y2="30" strokeWidth="1.1"/>
      <path d="M80 110 L80 78 Q100 66 120 78 L120 110" strokeWidth="1.8"/>
      <line x1="22" y1="110" x2="178" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  split: ( // Diocletian's Palace — arched gatehouse + columns
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="28" y="44" width="144" height="66" strokeWidth="1.8"/>
      <rect x="28" y="32" width="144" height="16" strokeWidth="1.1"/>
      <path d="M76 110 L76 74 Q100 58 124 74 L124 110" strokeWidth="1.8"/>
      <rect x="44" y="64" width="22" height="30" strokeWidth="1.1"/>
      <rect x="134" y="64" width="22" height="30" strokeWidth="1.1"/>
      <line x1="28" y1="68" x2="172" y2="68" strokeWidth="1.1"/>
      <line x1="28" y1="82" x2="68" y2="82" strokeWidth="1.1"/>
      <line x1="132" y1="82" x2="172" y2="82" strokeWidth="1.1"/>
      <line x1="12" y1="110" x2="188" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  bucharest: ( // Palace of Parliament — massive colonnaded facade
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="18" y="58" width="164" height="52" strokeWidth="1.8"/>
      <rect x="32" y="44" width="136" height="18" strokeWidth="1.1"/>
      <rect x="50" y="32" width="100" height="16" strokeWidth="1.1"/>
      <line x1="18" y1="74" x2="182" y2="74" strokeWidth="1.1"/>
      <line x1="18" y1="90" x2="182" y2="90" strokeWidth="1.1"/>
      {[34,52,70,88,100,114,130,148,166].map(x => (
        <line key={x} x1={x} y1="74" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="6" y1="110" x2="194" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  belgrade: ( // Kalemegdan fortress — crenellated tower over cliff
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="66" y="40" width="68" height="70" strokeWidth="1.8"/>
      <rect x="60" y="28" width="80" height="16" strokeWidth="1.1"/>
      <line x1="60" y1="28" x2="64" y2="18" strokeWidth="1.1"/>
      <line x1="76" y1="28" x2="76" y2="18" strokeWidth="1.1"/>
      <line x1="92" y1="28" x2="90" y2="18" strokeWidth="1.1"/>
      <line x1="108" y1="28" x2="110" y2="18" strokeWidth="1.1"/>
      <line x1="124" y1="28" x2="124" y2="18" strokeWidth="1.1"/>
      <line x1="140" y1="28" x2="136" y2="18" strokeWidth="1.1"/>
      <path d="M82 110 L82 80 Q100 70 118 80 L118 110" strokeWidth="1.8"/>
      <line x1="66" y1="64" x2="134" y2="64" strokeWidth="1.1"/>
      <line x1="30" y1="110" x2="170" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  /* ── Americas ── */

  'new-york': ( // Empire State Building — stepped Art Deco tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="4" x2="100" y2="16" strokeWidth="1.8"/>
      <rect x="94" y="16" width="12" height="14" strokeWidth="1.1"/>
      <rect x="88" y="30" width="24" height="12" strokeWidth="1.1"/>
      <rect x="82" y="42" width="36" height="10" strokeWidth="1.1"/>
      <rect x="74" y="52" width="52" height="10" strokeWidth="1.8"/>
      <rect x="64" y="62" width="72" height="10" strokeWidth="1.8"/>
      <rect x="54" y="72" width="92" height="38" strokeWidth="1.8"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'san-francisco': ( // Golden Gate Bridge — twin towers + catenary cables
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="58" y1="14" x2="58" y2="94" strokeWidth="1.8"/>
      <line x1="142" y1="14" x2="142" y2="94" strokeWidth="1.8"/>
      <path d="M6 68 Q58 30 100 46 Q142 30 194 68" strokeWidth="1.8"/>
      <line x1="6" y1="94" x2="194" y2="94" strokeWidth="1.8"/>
      {[18,34,58,72,88,100,112,128,142,158,174].map(x => {
        const cx = 100, sag = 38, dx = (x - cx) / 100
        const y = Math.round(46 + sag * dx * dx)
        return <line key={x} x1={x} y1={Math.min(y, 94)} x2={x} y2="94" strokeWidth="1.1"/>
      })}
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  utrecht: ( // Dom Tower — narrow Gothic belfry
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="82" y="36" width="36" height="74" strokeWidth="1.8"/>
      <polygon points="82,36 100,18 118,36" strokeWidth="1.8"/>
      <line x1="100" y1="18" x2="100" y2="8" strokeWidth="1.1"/>
      <line x1="90" y1="48" x2="110" y2="48" strokeWidth="1.1"/>
      <line x1="90" y1="62" x2="110" y2="62" strokeWidth="1.1"/>
      <line x1="90" y1="76" x2="110" y2="76" strokeWidth="1.1"/>
      <rect x="88" y="84" width="24" height="26" strokeWidth="1.1"/>
      <line x1="66" y1="110" x2="134" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  austin: ( // Congress bridge + bat arc
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M40 38 Q52 28 64 38 Q76 22 88 38 Q100 26 112 38 Q124 22 136 38 Q148 28 160 38" strokeWidth="1.1"/>
      <line x1="24" y1="74" x2="176" y2="74" strokeWidth="1.8"/>
      <line x1="34" y1="74" x2="28" y2="96" strokeWidth="1.8"/>
      <line x1="64" y1="74" x2="58" y2="96" strokeWidth="1.1"/>
      <line x1="94" y1="74" x2="88" y2="96" strokeWidth="1.1"/>
      <line x1="124" y1="74" x2="118" y2="96" strokeWidth="1.1"/>
      <line x1="154" y1="74" x2="148" y2="96" strokeWidth="1.8"/>
      <line x1="46" y1="96" x2="40" y2="74" strokeWidth="1.8"/>
      <line x1="76" y1="96" x2="70" y2="74" strokeWidth="1.1"/>
      <line x1="106" y1="96" x2="100" y2="74" strokeWidth="1.1"/>
      <line x1="136" y1="96" x2="130" y2="74" strokeWidth="1.1"/>
      <line x1="166" y1="96" x2="160" y2="74" strokeWidth="1.8"/>
      <line x1="20" y1="96" x2="180" y2="96" strokeWidth="1.8"/>
      <line x1="30" y1="110" x2="170" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  calgary: ( // Calgary Tower — pod + flared legs
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="8" x2="100" y2="110" strokeWidth="1.1"/>
      <ellipse cx="100" cy="48" rx="20" ry="12" strokeWidth="1.8"/>
      <ellipse cx="100" cy="42" rx="12" ry="7" strokeWidth="1.1"/>
      <line x1="100" y1="60" x2="100" y2="110" strokeWidth="1.8"/>
      <line x1="90" y1="72" x2="82" y2="100" strokeWidth="1.8"/>
      <line x1="110" y1="72" x2="118" y2="100" strokeWidth="1.8"/>
      <line x1="82" y1="100" x2="118" y2="100" strokeWidth="1.8"/>
      <line x1="62" y1="110" x2="138" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  toronto: ( // CN Tower — needle + observation pod + tripod legs
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="4" x2="100" y2="110" strokeWidth="1.1"/>
      <ellipse cx="100" cy="52" rx="22" ry="12" strokeWidth="1.8"/>
      <ellipse cx="100" cy="46" rx="15" ry="8" strokeWidth="1.1"/>
      <line x1="100" y1="60" x2="100" y2="110" strokeWidth="1.8"/>
      <line x1="84" y1="70" x2="80" y2="100" strokeWidth="1.8"/>
      <line x1="116" y1="70" x2="120" y2="100" strokeWidth="1.8"/>
      <line x1="80" y1="100" x2="120" y2="100" strokeWidth="1.8"/>
      <line x1="54" y1="110" x2="146" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  vancouver: ( // Lions Gate Bridge — suspension with twin towers
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="56" y1="18" x2="56" y2="94" strokeWidth="1.8"/>
      <line x1="144" y1="18" x2="144" y2="94" strokeWidth="1.8"/>
      <path d="M10 76 Q56 42 100 58 Q144 42 190 76" strokeWidth="1.8"/>
      <line x1="10" y1="94" x2="190" y2="94" strokeWidth="1.8"/>
      {[22,42,56,72,88,100,112,128,144,158,178].map(x => {
        const cx = 100, sag = 32, dx = (x - cx) / 100
        const y = Math.round(58 + sag * dx * dx)
        return <line key={x} x1={x} y1={Math.min(y, 94)} x2={x} y2="94" strokeWidth="1.1"/>
      })}
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  miami: ( // South Beach Art Deco — stepped facade with neon crown
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="64" y="28" width="72" height="82" strokeWidth="1.8"/>
      <rect x="72" y="18" width="56" height="14" strokeWidth="1.1"/>
      <rect x="80" y="10" width="40" height="12" strokeWidth="1.1"/>
      <line x1="64" y1="46" x2="136" y2="46" strokeWidth="1.1"/>
      <line x1="64" y1="62" x2="136" y2="62" strokeWidth="1.1"/>
      <line x1="64" y1="78" x2="136" y2="78" strokeWidth="1.1"/>
      <rect x="76" y="82" width="48" height="28" strokeWidth="1.1"/>
      <line x1="44" y1="110" x2="156" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  medellin: ( // Cable car gondola suspended over mountain valley
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M6 110 L44 52 L90 74 L136 38 L180 60" strokeWidth="1.8"/>
      <line x1="14" y1="38" x2="192" y2="24" strokeWidth="1.1"/>
      <rect x="90" y="34" width="28" height="22" strokeWidth="1.8"/>
      <line x1="104" y1="34" x2="104" y2="24" strokeWidth="1.1"/>
      <line x1="90" y1="45" x2="84" y2="50" strokeWidth="1.1"/>
      <line x1="118" y1="45" x2="124" y2="48" strokeWidth="1.1"/>
      <line x1="6" y1="110" x2="194" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'mexico-city': ( // Angel of Independence — winged figure on column
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="14" x2="100" y2="74" strokeWidth="1.8"/>
      <circle cx="100" cy="12" r="6" strokeWidth="1.1"/>
      <path d="M78 26 Q100 14 122 26" strokeWidth="1.1"/>
      <line x1="78" y1="26" x2="70" y2="42" strokeWidth="1.1"/>
      <line x1="122" y1="26" x2="130" y2="42" strokeWidth="1.1"/>
      <rect x="86" y="74" width="28" height="14" strokeWidth="1.1"/>
      <rect x="76" y="88" width="48" height="10" strokeWidth="1.8"/>
      <rect x="62" y="98" width="76" height="12" strokeWidth="1.8"/>
      <line x1="34" y1="110" x2="166" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'buenos-aires': ( // Obelisk — tapered stone monument
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="95,8 105,8 113,110 87,110" strokeWidth="1.8"/>
      <polygon points="99,4 101,4 105,8 95,8" strokeWidth="1.1"/>
      <line x1="89" y1="38" x2="91" y2="38" strokeWidth="1.1"/>
      <line x1="109" y1="38" x2="111" y2="38" strokeWidth="1.1"/>
      <line x1="88" y1="62" x2="90" y2="62" strokeWidth="1.1"/>
      <line x1="110" y1="62" x2="112" y2="62" strokeWidth="1.1"/>
      <line x1="87" y1="86" x2="89" y2="86" strokeWidth="1.1"/>
      <line x1="111" y1="86" x2="113" y2="86" strokeWidth="1.1"/>
      <line x1="44" y1="110" x2="156" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'sao-paulo': ( // São Paulo skyline — dense high-rise canyon
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="14" y="70" width="18" height="40" strokeWidth="1.1"/>
      <rect x="34" y="54" width="20" height="56" strokeWidth="1.1"/>
      <rect x="56" y="38" width="24" height="72" strokeWidth="1.8"/>
      <line x1="56" y1="62" x2="80" y2="62" strokeWidth="1.1"/>
      <rect x="82" y="28" width="22" height="82" strokeWidth="1.8"/>
      <line x1="82" y1="52" x2="104" y2="52" strokeWidth="1.1"/>
      <rect x="106" y="42" width="20" height="68" strokeWidth="1.1"/>
      <rect x="128" y="56" width="22" height="54" strokeWidth="1.1"/>
      <rect x="152" y="66" width="20" height="44" strokeWidth="1.1"/>
      <rect x="174" y="76" width="12" height="34" strokeWidth="1.1"/>
      <line x1="6" y1="110" x2="194" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'panama-city': ( // Bridge of the Americas — suspension over Canal
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="18" x2="100" y2="90" strokeWidth="1.8"/>
      <line x1="8" y1="90" x2="192" y2="90" strokeWidth="1.8"/>
      <path d="M8 90 Q100 38 192 90" strokeWidth="1.8"/>
      {[30,52,74,100,126,148,170].map(x => (
        <line key={x} x1={x} y1="90" x2={100} y2={18} strokeWidth="1.1"/>
      ))}
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'san-jose-cr': ( // National Theatre — Neo-Renaissance pediment facade
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="30" y="56" width="140" height="54" strokeWidth="1.8"/>
      <polygon points="30,56 100,22 170,56" strokeWidth="1.8"/>
      <line x1="100" y1="22" x2="100" y2="12" strokeWidth="1.1"/>
      {[50,70,100,130,150].map(x => (
        <line key={x} x1={x} y1="56" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <rect x="76" y="76" width="48" height="34" strokeWidth="1.1"/>
      <line x1="16" y1="110" x2="184" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  /* ── Asia & Oceania ── */

  singapore: ( // Marina Bay Sands — three towers + cantilever SkyPark boat
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="34" y="54" width="24" height="56" strokeWidth="1.8"/>
      <rect x="88" y="54" width="24" height="56" strokeWidth="1.8"/>
      <rect x="142" y="54" width="24" height="56" strokeWidth="1.8"/>
      <path d="M26 54 Q100 24 182 54" strokeWidth="1.8"/>
      <line x1="22" y1="46" x2="188" y2="46" strokeWidth="1.1"/>
      <line x1="22" y1="54" x2="188" y2="54" strokeWidth="1.8"/>
      <path d="M188 54 L196 46" strokeWidth="1.1"/>
      <line x1="14" y1="110" x2="186" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  tokyo: ( // Tokyo Tower — Eiffel-inspired lattice tower
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="6" x2="100" y2="110" strokeWidth="1.8"/>
      <line x1="100" y1="6" x2="62" y2="110" strokeWidth="1.8"/>
      <line x1="100" y1="6" x2="138" y2="110" strokeWidth="1.8"/>
      <line x1="73" y1="56" x2="127" y2="56" strokeWidth="1.1"/>
      <line x1="67" y1="78" x2="133" y2="78" strokeWidth="1.1"/>
      <line x1="77" y1="38" x2="123" y2="38" strokeWidth="1.1"/>
      <rect x="86" y="50" width="28" height="18" strokeWidth="1.1"/>
      <line x1="46" y1="110" x2="154" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  osaka: ( // Osaka Castle — five-story keep with curved roofs
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="66" y="62" width="68" height="48" strokeWidth="1.8"/>
      <rect x="58" y="72" width="84" height="10" strokeWidth="1.1"/>
      <rect x="72" y="48" width="56" height="18" strokeWidth="1.8"/>
      <rect x="80" y="36" width="40" height="16" strokeWidth="1.1"/>
      <polygon points="80,36 100,16 120,36" strokeWidth="1.8"/>
      <path d="M72 48 Q100 42 128 48" strokeWidth="1.1"/>
      <path d="M66 62 Q100 56 134 62" strokeWidth="1.1"/>
      <line x1="100" y1="16" x2="100" y2="8" strokeWidth="1.1"/>
      <line x1="42" y1="110" x2="158" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  kyoto: ( // Torii gate — cleaner, more iconic
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="62" y1="26" x2="62" y2="110" strokeWidth="1.8"/>
      <line x1="138" y1="26" x2="138" y2="110" strokeWidth="1.8"/>
      <line x1="46" y1="34" x2="154" y2="34" strokeWidth="1.8"/>
      <line x1="54" y1="46" x2="146" y2="46" strokeWidth="1.1"/>
      <line x1="76" y1="46" x2="76" y2="110" strokeWidth="1.1"/>
      <line x1="124" y1="46" x2="124" y2="110" strokeWidth="1.1"/>
      <path d="M70 92 Q100 78 130 92" strokeWidth="1.1"/>
      <line x1="34" y1="110" x2="166" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  fukuoka: ( // Fukuoka Tower — tapering glass triangle
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M100 10 L62 110 L138 110 Z" strokeWidth="1.8"/>
      <line x1="100" y1="10" x2="100" y2="110" strokeWidth="1.1"/>
      <line x1="86" y1="46" x2="114" y2="46" strokeWidth="1.1"/>
      <line x1="78" y1="66" x2="122" y2="66" strokeWidth="1.1"/>
      <line x1="70" y1="86" x2="130" y2="86" strokeWidth="1.1"/>
      <rect x="88" y="58" width="24" height="18" strokeWidth="1.1"/>
      <line x1="48" y1="110" x2="152" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  seoul: ( // Gyeongbokgung — curved hip roofs over gate
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="28" y="80" width="144" height="30" strokeWidth="1.8"/>
      <rect x="42" y="56" width="116" height="28" strokeWidth="1.8"/>
      <path d="M34 56 Q100 26 166 56" strokeWidth="1.8"/>
      <path d="M42 58 Q100 34 158 58" strokeWidth="1.1"/>
      <line x1="28" y1="94" x2="172" y2="94" strokeWidth="1.1"/>
      <path d="M76 110 L76 92 Q100 82 124 92 L124 110" strokeWidth="1.8"/>
      <line x1="12" y1="110" x2="188" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  sydney: ( // Opera House — sail shells rising from harbour
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M26 96 Q44 36 76 96" strokeWidth="1.8"/>
      <path d="M66 96 Q94 18 122 96" strokeWidth="1.8"/>
      <path d="M116 96 Q134 44 156 96" strokeWidth="1.8"/>
      <path d="M150 96 Q160 56 174 96" strokeWidth="1.1"/>
      <line x1="16" y1="96" x2="184" y2="96" strokeWidth="1.8"/>
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  melbourne: ( // Flinders Street Station — dome + twin clock towers
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="18" y="70" width="164" height="40" strokeWidth="1.8"/>
      <path d="M74 70 Q100 38 126 70" strokeWidth="1.8"/>
      <rect x="24" y="52" width="34" height="22" strokeWidth="1.1"/>
      <rect x="142" y="52" width="34" height="22" strokeWidth="1.1"/>
      <line x1="41" y1="52" x2="41" y2="38" strokeWidth="1.1"/>
      <line x1="159" y1="52" x2="159" y2="38" strokeWidth="1.1"/>
      <line x1="18" y1="86" x2="182" y2="86" strokeWidth="1.1"/>
      <line x1="18" y1="100" x2="182" y2="100" strokeWidth="1.1"/>
      <line x1="6" y1="110" x2="194" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  perth: ( // Bell Tower — leaning sail-like frame
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M74 110 L94 18 L122 110" strokeWidth="1.8"/>
      <path d="M94 18 Q120 26 140 54 Q128 78 122 110" strokeWidth="1.8"/>
      <line x1="88" y1="48" x2="126" y2="48" strokeWidth="1.1"/>
      <line x1="84" y1="68" x2="128" y2="68" strokeWidth="1.1"/>
      <rect x="98" y="58" width="16" height="18" strokeWidth="1.1"/>
      <line x1="56" y1="110" x2="146" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  auckland: ( // Sky Tower — needle pod on tripod shaft
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="6" x2="100" y2="110" strokeWidth="1.1"/>
      <ellipse cx="100" cy="54" rx="24" ry="12" strokeWidth="1.8"/>
      <ellipse cx="100" cy="48" rx="16" ry="8" strokeWidth="1.1"/>
      <line x1="85" y1="66" x2="80" y2="96" strokeWidth="1.8"/>
      <line x1="115" y1="66" x2="120" y2="96" strokeWidth="1.8"/>
      <path d="M80 96 Q100 90 120 96" strokeWidth="1.8"/>
      <line x1="50" y1="110" x2="150" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  bangkok: ( // Wat Arun — steep Khmer prang with side buttresses
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <polygon points="93,6 107,6 110,38 90,38" strokeWidth="1.8"/>
      <path d="M90 38 L72 66 L82 66" strokeWidth="1.8"/>
      <path d="M110 38 L128 66 L118 66" strokeWidth="1.8"/>
      <line x1="82" y1="66" x2="118" y2="66" strokeWidth="1.8"/>
      <path d="M82 66 L62 90 L74 90" strokeWidth="1.1"/>
      <path d="M118 66 L138 90 L126 90" strokeWidth="1.1"/>
      <line x1="74" y1="90" x2="126" y2="90" strokeWidth="1.1"/>
      <rect x="66" y="90" width="68" height="20" strokeWidth="1.8"/>
      <line x1="66" y1="100" x2="134" y2="100" strokeWidth="1.1"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  bali: ( // Tanah Lot — meru temple on rocky sea outcrop with waves
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M44 94 Q60 76 80 72 Q100 68 120 72 Q140 76 156 94 Q148 108 100 110 Q52 108 44 94" strokeWidth="1.8"/>
      <path d="M16 108 Q30 104 44 108" strokeWidth="1.1"/>
      <path d="M156 108 Q170 104 184 108" strokeWidth="1.1"/>
      <path d="M10 104 Q28 100 44 104" strokeWidth="1.1"/>
      <path d="M156 104 Q172 100 190 104" strokeWidth="1.1"/>
      <polygon points="86,58 100,40 114,58" strokeWidth="1.8"/>
      <polygon points="82,66 100,50 118,66" strokeWidth="1.1"/>
      <rect x="80" y="66" width="40" height="8" strokeWidth="1.1"/>
      <rect x="76" y="74" width="48" height="10" strokeWidth="1.8"/>
      <line x1="100" y1="40" x2="100" y2="30" strokeWidth="1.8"/>
      <line x1="6" y1="110" x2="194" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'chiang-mai': ( // Doi Suthep chedi — rounded bell stupa on tiered base
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="6" x2="100" y2="20" strokeWidth="1.8"/>
      <ellipse cx="100" cy="22" rx="7" ry="4" strokeWidth="1.1"/>
      <path d="M86 28 Q80 42 82 56 Q90 66 100 68 Q110 66 118 56 Q120 42 114 28" strokeWidth="1.8"/>
      <ellipse cx="100" cy="70" rx="20" ry="5" strokeWidth="1.1"/>
      <rect x="82" y="75" width="36" height="7" strokeWidth="1.1"/>
      <rect x="68" y="82" width="64" height="8" strokeWidth="1.8"/>
      <rect x="50" y="90" width="100" height="20" strokeWidth="1.8"/>
      <line x1="50" y1="100" x2="150" y2="100" strokeWidth="1.1"/>
      <line x1="28" y1="110" x2="172" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'kuala-lumpur': ( // Petronas Towers — twin spires with skybridge
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="50" y="36" width="38" height="74" strokeWidth="1.8"/>
      <path d="M50 36 Q69 14 88 36" strokeWidth="1.8"/>
      <line x1="69" y1="14" x2="69" y2="6" strokeWidth="1.8"/>
      <rect x="112" y="36" width="38" height="74" strokeWidth="1.8"/>
      <path d="M112 36 Q131 14 150 36" strokeWidth="1.8"/>
      <line x1="131" y1="14" x2="131" y2="6" strokeWidth="1.8"/>
      <rect x="88" y="64" width="24" height="10" strokeWidth="1.8"/>
      <line x1="50" y1="58" x2="88" y2="58" strokeWidth="1.1"/>
      <line x1="50" y1="82" x2="88" y2="82" strokeWidth="1.1"/>
      <line x1="112" y1="58" x2="150" y2="58" strokeWidth="1.1"/>
      <line x1="112" y1="82" x2="150" y2="82" strokeWidth="1.1"/>
      <line x1="28" y1="110" x2="172" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'da-nang': ( // Dragon Bridge — serpentine dragon head + long span
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M8 80 Q56 48 100 66 Q144 82 178 62" strokeWidth="1.8"/>
      <line x1="8" y1="80" x2="192" y2="80" strokeWidth="1.1"/>
      <path d="M162 62 Q174 52 186 50 Q194 54 192 62" strokeWidth="1.8"/>
      <line x1="184" y1="50" x2="186" y2="40" strokeWidth="1.1"/>
      <line x1="186" y1="40" x2="194" y2="42" strokeWidth="1.1"/>
      {[30,52,74,100,126,152].map(x => (
        <line key={x} x1={x} y1="80" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'ho-chi-minh-city': ( // Reunification Palace — stepped modernist facade
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="22" y="58" width="156" height="52" strokeWidth="1.8"/>
      <rect x="22" y="44" width="156" height="18" strokeWidth="1.1"/>
      <rect x="44" y="32" width="112" height="16" strokeWidth="1.1"/>
      <rect x="64" y="20" width="72" height="16" strokeWidth="1.1"/>
      <line x1="22" y1="76" x2="178" y2="76" strokeWidth="1.1"/>
      <line x1="22" y1="94" x2="178" y2="94" strokeWidth="1.1"/>
      {[40,60,80,100,120,140,160].map(x => (
        <line key={x} x1={x} y1="76" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  bangalore: ( // Vidhana Soudha — central dome + colonnaded wings
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="22" y="70" width="156" height="40" strokeWidth="1.8"/>
      <rect x="38" y="56" width="124" height="18" strokeWidth="1.1"/>
      <path d="M62 56 Q100 22 138 56" strokeWidth="1.8"/>
      <line x1="100" y1="22" x2="100" y2="12" strokeWidth="1.8"/>
      <line x1="93" y1="17" x2="107" y2="17" strokeWidth="1.1"/>
      <line x1="22" y1="86" x2="178" y2="86" strokeWidth="1.1"/>
      {[38,58,78,100,122,142,162].map(x => (
        <line key={x} x1={x} y1="86" x2={x} y2="110" strokeWidth="1.1"/>
      ))}
      <line x1="8" y1="110" x2="192" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  /* ── Middle East & Africa ── */

  dubai: ( // Burj Khalifa — world's tallest stepped needle
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="4" x2="100" y2="22" strokeWidth="1.8"/>
      <rect x="96" y="22" width="8" height="14" strokeWidth="1.1"/>
      <rect x="92" y="36" width="16" height="10" strokeWidth="1.1"/>
      <rect x="87" y="46" width="26" height="10" strokeWidth="1.1"/>
      <rect x="82" y="56" width="36" height="10" strokeWidth="1.8"/>
      <rect x="76" y="66" width="48" height="10" strokeWidth="1.8"/>
      <rect x="68" y="76" width="64" height="10" strokeWidth="1.8"/>
      <rect x="56" y="86" width="88" height="24" strokeWidth="1.8"/>
      <line x1="36" y1="110" x2="164" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'cape-town': ( // Table Mountain — flat-topped massif over city
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <path d="M12 92 L50 38 L150 38 L188 92" strokeWidth="1.8"/>
      <line x1="50" y1="38" x2="150" y2="38" strokeWidth="1.8"/>
      <path d="M12 92 Q100 80 188 92" strokeWidth="1.1"/>
      <line x1="64" y1="38" x2="56" y2="92" strokeWidth="1.1"/>
      <line x1="88" y1="38" x2="86" y2="92" strokeWidth="1.1"/>
      <line x1="112" y1="38" x2="114" y2="92" strokeWidth="1.1"/>
      <line x1="136" y1="38" x2="144" y2="92" strokeWidth="1.1"/>
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'madrid': ( // Royal Palace — symmetrical facade, pitched roof, two flanking towers
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="20" y="54" width="160" height="56" strokeWidth="1.8"/>
      <rect x="8" y="66" width="28" height="44" strokeWidth="1.8"/>
      <rect x="164" y="66" width="28" height="44" strokeWidth="1.8"/>
      <line x1="8" y1="66" x2="36" y2="54" strokeWidth="1.1"/>
      <line x1="164" y1="66" x2="192" y2="54" strokeWidth="1.1"/>
      <rect x="84" y="36" width="32" height="18" strokeWidth="1.1"/>
      <line x1="100" y1="20" x2="100" y2="36" strokeWidth="1.8"/>
      <line x1="94" y1="26" x2="106" y2="26" strokeWidth="1.1"/>
      {[40,60,80,100,120,140,160].map(x => <line key={x} x1={x} y1="54" x2={x} y2="110" strokeWidth="1.1"/>)}
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'taipei': ( // Taipei 101 — tapered segmented tower with pagoda-style notches
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <line x1="100" y1="4" x2="100" y2="24" strokeWidth="1.8"/>
      <rect x="90" y="24" width="20" height="6" strokeWidth="1.1"/>
      <rect x="84" y="30" width="32" height="10" strokeWidth="1.8"/>
      <rect x="80" y="40" width="40" height="10" strokeWidth="1.1"/>
      <rect x="76" y="50" width="48" height="10" strokeWidth="1.8"/>
      <rect x="72" y="60" width="56" height="10" strokeWidth="1.1"/>
      <rect x="68" y="70" width="64" height="10" strokeWidth="1.8"/>
      <rect x="64" y="80" width="72" height="10" strokeWidth="1.1"/>
      <rect x="60" y="90" width="80" height="10" strokeWidth="1.8"/>
      <rect x="56" y="100" width="88" height="10" strokeWidth="1.1"/>
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'nairobi': ( // Kenyatta ICC — cylindrical tower with disc crown above city skyline
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="86" y="32" width="28" height="72" strokeWidth="1.8"/>
      <path d="M76 32 Q100 18 124 32" strokeWidth="1.8"/>
      <ellipse cx="100" cy="32" rx="24" ry="6" strokeWidth="1.1"/>
      <line x1="100" y1="18" x2="100" y2="8" strokeWidth="1.8"/>
      <line x1="94" y1="14" x2="106" y2="14" strokeWidth="1.1"/>
      <rect x="30" y="74" width="18" height="36" strokeWidth="1.1"/>
      <rect x="56" y="82" width="14" height="28" strokeWidth="1.1"/>
      <rect x="130" y="78" width="16" height="32" strokeWidth="1.1"/>
      <rect x="154" y="86" width="18" height="24" strokeWidth="1.1"/>
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
    </svg>
  ),

  'abu-dhabi': ( // Sheikh Zayed Grand Mosque — central dome + twin minarets
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" {...S}>
      <rect x="16" y="78" width="168" height="32" strokeWidth="1.8"/>
      <path d="M66 78 Q100 40 134 78" strokeWidth="1.8"/>
      <path d="M30 78 Q47 60 64 78" strokeWidth="1.1"/>
      <path d="M136 78 Q153 60 170 78" strokeWidth="1.1"/>
      <line x1="36" y1="60" x2="36" y2="36" strokeWidth="1.8"/>
      <line x1="164" y1="60" x2="164" y2="36" strokeWidth="1.8"/>
      <line x1="29" y1="36" x2="43" y2="36" strokeWidth="1.1"/>
      <line x1="157" y1="36" x2="171" y2="36" strokeWidth="1.1"/>
      <line x1="16" y1="92" x2="184" y2="92" strokeWidth="1.1"/>
      <line x1="4" y1="110" x2="196" y2="110" strokeWidth="1.8"/>
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
      <rect x="14" y="70" width="22" height="40" strokeWidth="1.1"/>
      <rect x="40" y="54" width="22" height="56" strokeWidth="1.1"/>
      <rect x="66" y="40" width="26" height="70" strokeWidth="1.8"/>
      <rect x="96" y="34" width="22" height="76" strokeWidth="1.8"/>
      <rect x="122" y="50" width="22" height="60" strokeWidth="1.1"/>
      <rect x="148" y="64" width="20" height="46" strokeWidth="1.1"/>
      <line x1="6" y1="110" x2="194" y2="110" strokeWidth="1.8"/>
    </svg>
  )
}
