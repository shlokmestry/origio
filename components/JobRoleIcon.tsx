'use client'

interface P { size?: number; color?: string; className?: string }

function b(sz: number, c: string) {
  return {
    width: sz, height: sz, viewBox: '0 0 24 24',
    fill: 'none', stroke: c, strokeWidth: 1.5,
    strokeLinecap: 'square' as const,
    strokeLinejoin: 'miter' as const,
  }
}

// Terminal with </> operator
export function SoftwareEngineerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <rect x="2" y="3" width="20" height="18" />
      <line x1="2" y1="8.5" x2="22" y2="8.5" />
      <rect x="4" y="5.5" width="1.5" height="1.5" fill={color} stroke="none" />
      <rect x="7.5" y="5.5" width="1.5" height="1.5" fill={color} stroke="none" />
      <polyline points="8,13.5 5.5,16 8,18.5" />
      <line x1="11" y1="18.5" x2="13" y2="13.5" />
      <polyline points="16,13.5 18.5,16 16,18.5" />
    </svg>
  )
}

// Stethoscope — earpieces + tube + chest piece
export function DoctorIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <line x1="7" y1="2" x2="7" y2="7" />
      <line x1="17" y1="2" x2="17" y2="7" />
      <line x1="7" y1="7" x2="17" y2="7" />
      <line x1="12" y1="7" x2="12" y2="15" />
      <path d="M12,15 Q12,20 17,20" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="19" cy="20" r="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ID badge with medical cross
export function NurseIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <rect x="4" y="4" width="16" height="18" />
      <rect x="9" y="2" width="6" height="4" />
      <line x1="12" y1="10" x2="12" y2="18" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  )
}

// Scatter plot with regression trend line
export function DataScientistIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <line x1="3" y1="3" x2="3" y2="21" />
      <line x1="3" y1="21" x2="21" y2="21" />
      <rect x="5.5" y="17" width="2.5" height="2.5" fill={color} stroke="none" />
      <rect x="9.5" y="12.5" width="2.5" height="2.5" fill={color} stroke="none" />
      <rect x="13.5" y="8.5" width="2.5" height="2.5" fill={color} stroke="none" />
      <rect x="17" y="5" width="2.5" height="2.5" fill={color} stroke="none" />
      <line x1="4" y1="20" x2="21" y2="4" strokeDasharray="2 1.5" />
    </svg>
  )
}

// Gantt / roadmap bars at different completion states
export function ProductManagerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <line x1="2" y1="4" x2="2" y2="20" />
      <line x1="2" y1="20" x2="22" y2="20" />
      <rect x="4" y="5" width="16" height="3.5" />
      <rect x="4" y="10.5" width="10" height="3.5" />
      <rect x="4" y="16" width="13" height="3.5" />
      <line x1="11" y1="5" x2="11" y2="8.5" stroke={color} strokeWidth="2.5" />
      <line x1="8" y1="10.5" x2="8" y2="14" stroke={color} strokeWidth="2.5" />
    </svg>
  )
}

// CI/CD cycle — two opposing arcs with arrowheads
export function DevOpsIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5,12 Q5,4 12,4 Q19,4 19,12" />
      <polyline points="16,7 19,4 22,7" />
      <path d="M19,12 Q19,20 12,20 Q5,20 5,12" />
      <polyline points="8,17 5,20 2,17" />
    </svg>
  )
}

// Shield with padlock inside
export function CybersecurityIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <path d="M12,2 L20,5 L20,13 Q20,19 12,22 Q4,19 4,13 L4,5 Z" />
      <rect x="9" y="12" width="6" height="5" />
      <path d="M10,12 L10,10 Q10,8 12,8 Q14,8 14,10 L14,12" />
      <rect x="11.5" y="13.5" width="1" height="2" fill={color} stroke="none" />
    </svg>
  )
}

// Wireframe UI layout with cursor arrow
export function UXDesignerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <rect x="2" y="2" width="13" height="11" />
      <rect x="3.5" y="3.5" width="4" height="3" />
      <rect x="9.5" y="3.5" width="4" height="3" />
      <rect x="3.5" y="8" width="10" height="2.5" />
      <path d="M15,14 L15,22 L18,19 L21,22.5 L22.5,21 L19.5,17.5 L22,15 Z" />
    </svg>
  )
}

// Candlestick chart — 3 candles, alternating bull/bear
export function FinancialAnalystIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <line x1="2" y1="22" x2="22" y2="22" />
      {/* Bear candle (filled) */}
      <line x1="6" y1="3" x2="6" y2="6" />
      <rect x="4" y="6" width="4" height="8" fill={color} />
      <line x1="6" y1="14" x2="6" y2="18" />
      {/* Bull candle (hollow) */}
      <line x1="12" y1="6" x2="12" y2="9" />
      <rect x="10" y="9" width="4" height="6" />
      <line x1="12" y1="15" x2="12" y2="19" />
      {/* Bear candle (filled, small) */}
      <line x1="18" y1="5" x2="18" y2="8" />
      <rect x="16" y="8" width="4" height="4" fill={color} />
      <line x1="18" y1="12" x2="18" y2="16" />
    </svg>
  )
}

// Scales of justice — beam, column, two pans
export function LawyerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="7" y1="21" x2="17" y2="21" />
      <line x1="4" y1="8" x2="20" y2="8" />
      <rect x="11" y="3" width="2" height="2" fill={color} stroke="none" />
      <line x1="6" y1="8" x2="6" y2="15" />
      <line x1="18" y1="8" x2="18" y2="15" />
      <path d="M3,15 Q6,18.5 9,15" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M15,15 Q18,18.5 21,15" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// Top-down floor plan with interior walls + door arc
export function ArchitectIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <rect x="2" y="2" width="20" height="20" />
      <line x1="13" y1="2" x2="13" y2="15" />
      <line x1="13" y1="15" x2="22" y2="15" />
      <path d="M13,10 Q17,10 17,15" strokeLinejoin="round" strokeLinecap="round" />
      <line x1="5" y1="2" x2="9" y2="2" strokeWidth="3" />
      <line x1="16" y1="2" x2="20" y2="2" strokeWidth="3" />
    </svg>
  )
}

// Warren truss bridge with piers
export function CivilEngineerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <line x1="1" y1="9" x2="23" y2="9" />
      <line x1="3" y1="18" x2="21" y2="18" />
      <line x1="3" y1="9" x2="3" y2="18" />
      <line x1="21" y1="9" x2="21" y2="18" />
      <line x1="12" y1="9" x2="12" y2="18" />
      <line x1="3" y1="18" x2="12" y2="9" />
      <line x1="12" y1="18" x2="21" y2="9" />
      <line x1="7.5" y1="18" x2="7.5" y2="22" />
      <line x1="16.5" y1="18" x2="16.5" y2="22" />
      <line x1="5" y1="22" x2="10" y2="22" />
      <line x1="14" y1="22" x2="19" y2="22" />
    </svg>
  )
}

// Rx symbol — R with leg + crossed x
export function PharmacistIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <line x1="6" y1="3" x2="6" y2="21" />
      <path d="M6,3 L13,3 Q16,3 16,8 Q16,13 13,13 L6,13" strokeLinejoin="round" strokeLinecap="round" />
      <line x1="12" y1="13" x2="17" y2="21" />
      <line x1="15" y1="16" x2="21" y2="22" />
      <line x1="21" y1="16" x2="15" y2="22" />
    </svg>
  )
}

// Blackboard on easel with equation lines
export function TeacherIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <rect x="1" y="2" width="22" height="14" />
      <line x1="6" y1="16" x2="4" y2="22" />
      <line x1="18" y1="16" x2="20" y2="22" />
      <line x1="6" y1="20" x2="18" y2="20" />
      {/* f(x) = on board */}
      <path d="M5,8 L7,5 L9,8" strokeLinejoin="round" strokeLinecap="round" />
      <line x1="6.8" y1="6.5" x2="8.2" y2="6.5" />
      <line x1="10.5" y1="7" x2="13.5" y2="7" />
      <line x1="10.5" y1="9" x2="13.5" y2="9" />
      <path d="M15,5 Q18,5 18,8 Q18,11 15,11" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// Ledger book — columns, rows, double sum line
export function AccountantIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <rect x="3" y="2" width="18" height="20" />
      <line x1="8" y1="2" x2="8" y2="22" />
      <line x1="15" y1="6" x2="15" y2="22" />
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="21" y2="14" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="8" y1="20" x2="21" y2="20" strokeWidth="2.5" />
      <line x1="10" y1="8" x2="13" y2="8" />
      <line x1="10" y1="12" x2="13" y2="12" />
      <line x1="10" y1="16" x2="13" y2="16" />
    </svg>
  )
}

// Org chart tree — top node → two child nodes
export function HRManagerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <rect x="9" y="2" width="6" height="5" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="6" y1="11" x2="18" y2="11" />
      <line x1="6" y1="11" x2="6" y2="14" />
      <line x1="18" y1="11" x2="18" y2="14" />
      <rect x="3" y="14" width="6" height="5" />
      <rect x="15" y="14" width="6" height="5" />
      <circle cx="6" cy="16.5" r="1.5" fill={color} stroke="none" />
      <circle cx="18" cy="16.5" r="1.5" fill={color} stroke="none" />
    </svg>
  )
}

// Bullseye target + arrow
export function SalesManagerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="13" r="9" />
      <circle cx="10" cy="13" r="6" />
      <circle cx="10" cy="13" r="3" />
      <line x1="16" y1="7" x2="10" y2="13" />
      <polyline points="12,5 17,6 16,11" />
    </svg>
  )
}

// Megaphone cone + sound waves
export function MarketingManagerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <path d="M3,9 L3,15 L13,20 L13,4 Z" strokeLinejoin="round" />
      <rect x="1" y="10" width="3" height="4" />
      <path d="M15,9 Q18,12 15,15" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M17,6.5 Q22,12 17,17.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// PCB frame with corner pads + lightning bolt
export function ElectricianIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <rect x="2" y="2" width="20" height="20" />
      <rect x="1" y="1" width="3" height="3" fill={color} stroke="none" />
      <rect x="20" y="1" width="3" height="3" fill={color} stroke="none" />
      <rect x="1" y="20" width="3" height="3" fill={color} stroke="none" />
      <rect x="20" y="20" width="3" height="3" fill={color} stroke="none" />
      <path d="M14,4 L9,13 L13,13 L10,20 L15,11 L11,11 Z" fill={color} stroke="none" />
    </svg>
  )
}

// Chef's knife — blade, bolster, handle with rivets
export function ChefIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      <path d="M10,20 L19,7 Q20.5,3.5 22,3 Q22,5.5 20,7 L20,20 Z" strokeLinejoin="round" />
      <rect x="2" y="18" width="9" height="4" />
      <line x1="11" y1="18" x2="11" y2="22" />
      <rect x="4" y="19.5" width="1.5" height="1.5" fill={color} stroke="none" />
      <rect x="7.5" y="19.5" width="1.5" height="1.5" fill={color} stroke="none" />
    </svg>
  )
}

// Neural network nodes + brain outline — AI/ML
export function AiMlEngineerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      {/* Outer brain-like oval */}
      <ellipse cx="12" cy="12" rx="9" ry="10" />
      {/* Neural nodes */}
      <rect x="5.5" y="6" width="2" height="2" fill={color} stroke="none" />
      <rect x="10.5" y="4" width="2" height="2" fill={color} stroke="none" />
      <rect x="15.5" y="6" width="2" height="2" fill={color} stroke="none" />
      <rect x="5.5" y="11" width="2" height="2" fill={color} stroke="none" />
      <rect x="10.5" y="11" width="2" height="2" fill={color} stroke="none" />
      <rect x="15.5" y="11" width="2" height="2" fill={color} stroke="none" />
      <rect x="10.5" y="17" width="2" height="2" fill={color} stroke="none" />
      {/* Connections */}
      <line x1="6.5" y1="7" x2="11.5" y2="5" />
      <line x1="11.5" y1="5" x2="16.5" y2="7" />
      <line x1="6.5" y1="8" x2="6.5" y2="12" />
      <line x1="11.5" y1="6" x2="11.5" y2="12" />
      <line x1="16.5" y1="8" x2="16.5" y2="12" />
      <line x1="6.5" y1="12" x2="11.5" y2="12" />
      <line x1="11.5" y1="12" x2="16.5" y2="12" />
      <line x1="11.5" y1="13" x2="11.5" y2="18" />
    </svg>
  )
}

// Cloud shape + server rack inside — Cloud Architect
export function CloudArchitectIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      {/* Cloud outline */}
      <path d="M5,14 Q2,14 2,11 Q2,8 5,8 Q5,5 8,4 Q11,3 13,5 Q15,3 17,5 Q20,5 21,8 Q23,8 22,11 Q22,14 19,14 Z" strokeLinejoin="round" strokeLinecap="round" />
      {/* Server rows inside cloud */}
      <rect x="7" y="9" width="10" height="2" />
      <rect x="7" y="12" width="10" height="2" />
      {/* Status dots */}
      <rect x="15" y="9.5" width="1" height="1" fill={color} stroke="none" />
      <rect x="15" y="12.5" width="1" height="1" fill={color} stroke="none" />
      {/* Down to ground */}
      <line x1="9" y1="14" x2="9" y2="19" />
      <line x1="15" y1="14" x2="15" y2="19" />
      <line x1="7" y1="19" x2="17" y2="19" />
    </svg>
  )
}

// Tooth cross-section outline — Dentist
export function DentistIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      {/* Tooth crown — two bumps at top */}
      <path d="M5,10 L5,6 Q5,3 7,3 Q9,3 9,5 Q9,3 11,2 Q13,2 13,4 Q13,2 15,2 Q17,3 17,5 Q17,3 19,3 Q21,3 21,6 L21,10 Q21,15 18,18 Q16,20 15,18 Q14,16 13,16 Q12,16 11,18 Q10,20 8,18 Q5,15 5,10 Z" strokeLinejoin="round" strokeLinecap="round" />
      {/* Root hint — center dividing line */}
      <line x1="13" y1="16" x2="13" y2="12" />
    </svg>
  )
}

// Figure in motion + body joint highlights — Physiotherapist
export function PhysiotherapistIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      {/* Head */}
      <circle cx="12" cy="3.5" r="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Spine/torso */}
      <line x1="12" y1="5.5" x2="12" y2="13" />
      {/* Arms outstretched with angle */}
      <line x1="12" y1="8" x2="6" y2="11" />
      <line x1="12" y1="8" x2="18" y2="6" />
      {/* Legs */}
      <line x1="12" y1="13" x2="8" y2="20" />
      <line x1="12" y1="13" x2="16" y2="20" />
      {/* Joint circles — shoulder, hip, knee */}
      <circle cx="9" cy="9.5" r="1.2" fill={color} stroke="none" />
      <circle cx="12" cy="13" r="1.2" fill={color} stroke="none" />
      <circle cx="10" cy="16.5" r="1.2" fill={color} stroke="none" />
    </svg>
  )
}

// Head profile + thought/speech wave — Psychologist
export function PsychologistIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      {/* Head silhouette */}
      <path d="M8,20 L8,15 Q4,13 4,9 Q4,3 12,3 Q20,3 20,9 Q20,13 16,15 L16,20 Z" strokeLinejoin="round" strokeLinecap="round" />
      {/* Brain waves inside */}
      <path d="M8,9 Q10,7 12,9 Q14,11 16,9" strokeLinejoin="round" strokeLinecap="round" />
      {/* Bottom border */}
      <line x1="8" y1="20" x2="16" y2="20" />
    </svg>
  )
}

// Sun + wind turbine blade + grid — Renewable Energy Engineer
export function RenewableEnergyEngineerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      {/* Sun */}
      <circle cx="6" cy="6" r="3" />
      <line x1="6" y1="1" x2="6" y2="2.5" />
      <line x1="6" y1="9.5" x2="6" y2="11" />
      <line x1="1" y1="6" x2="2.5" y2="6" />
      <line x1="9.5" y1="6" x2="11" y2="6" />
      <line x1="2.9" y1="2.9" x2="3.9" y2="3.9" />
      <line x1="8.1" y1="8.1" x2="9.1" y2="9.1" />
      {/* Wind turbine mast */}
      <line x1="17" y1="10" x2="17" y2="22" />
      {/* Three blades */}
      <path d="M17,10 L17,4" strokeLinejoin="round" />
      <path d="M17,10 L12,13" strokeLinejoin="round" />
      <path d="M17,10 L22,13" strokeLinejoin="round" />
      {/* Hub */}
      <rect x="15.5" y="8.5" width="3" height="3" fill={color} stroke="none" />
      {/* Base */}
      <line x1="13" y1="22" x2="21" y2="22" />
    </svg>
  )
}

// Aircraft side profile — Pilot
export function PilotIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      {/* Fuselage */}
      <path d="M2,12 Q4,10 8,10 L18,10 Q21,10 22,12 Q21,14 18,14 L8,14 Q4,14 2,12 Z" strokeLinejoin="round" strokeLinecap="round" />
      {/* Nose cone */}
      <path d="M18,10 Q22,11 22,12 Q22,13 18,14" strokeLinejoin="round" strokeLinecap="round" />
      {/* Main wing */}
      <path d="M10,10 L6,4 L14,10" strokeLinejoin="round" />
      {/* Tail wing */}
      <path d="M5,10 L3,6 L7,10" strokeLinejoin="round" />
      {/* Tail fin vertical */}
      <path d="M4,10 L4,7 L6,10" strokeLinejoin="round" />
      {/* Engine pod under wing */}
      <rect x="9" y="13" width="4" height="2" />
    </svg>
  )
}

// Pen tool + bezier curve — Graphic Designer
export function GraphicDesignerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      {/* Pen body */}
      <path d="M14,3 L19,3 L21,5 L21,10 L12,19 L5,19 L5,12 L14,3 Z" strokeLinejoin="miter" />
      {/* Pen tip */}
      <path d="M5,12 L3,21 L12,19" strokeLinejoin="round" strokeLinecap="round" />
      {/* Nib line */}
      <line x1="5" y1="19" x2="8" y2="16" />
      {/* Bezier anchor points */}
      <rect x="18" y="4" width="2" height="2" fill={color} stroke="none" />
      <rect x="10" y="10" width="2" height="2" fill={color} stroke="none" />
      {/* Curve */}
      <path d="M19,5 Q15,8 11,11" strokeDasharray="2 1.5" />
    </svg>
  )
}

// DNA helix + circuit — Biomedical Engineer
export function BiomedicalEngineerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      {/* Left helix strand */}
      <path d="M9,2 Q6,6 9,10 Q12,14 9,18 Q8,20 7,22" strokeLinejoin="round" strokeLinecap="round" />
      {/* Right helix strand */}
      <path d="M15,2 Q18,6 15,10 Q12,14 15,18 Q16,20 17,22" strokeLinejoin="round" strokeLinecap="round" />
      {/* Rungs */}
      <line x1="9.5" y1="4" x2="14.5" y2="4" />
      <line x1="8" y1="7.5" x2="16" y2="7.5" />
      <line x1="9.5" y1="11" x2="14.5" y2="11" />
      <line x1="8" y1="14.5" x2="16" y2="14.5" />
      <line x1="9.5" y1="18" x2="14.5" y2="18" />
    </svg>
  )
}

// Nodes connected by shipping route lines — Supply Chain Manager
export function SupplyChainManagerIcon({ size = 20, color = 'currentColor', className }: P) {
  return (
    <svg {...b(size, color)} className={className}>
      {/* Factory node top-left */}
      <rect x="1" y="2" width="5" height="5" />
      {/* Ship/port node top-right */}
      <rect x="18" y="2" width="5" height="5" />
      {/* Warehouse node bottom-center */}
      <rect x="9.5" y="17" width="5" height="5" />
      {/* Distribution center center */}
      <rect x="9.5" y="9" width="5" height="5" />
      {/* Routes */}
      <line x1="6" y1="4.5" x2="9.5" y2="11" />
      <line x1="18" y1="4.5" x2="14.5" y2="11" />
      <line x1="12" y1="14" x2="12" y2="17" />
      {/* Arrow heads on routes */}
      <polyline points="8.5,9.5 9.5,11 11,10.5" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points="15.5,9.5 14.5,11 13,10.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

const ICONS: Record<string, (p: P) => React.ReactElement | null> = {
  softwareEngineer:  SoftwareEngineerIcon,
  doctor:            DoctorIcon,
  nurse:             NurseIcon,
  dataScientist:     DataScientistIcon,
  productManager:    ProductManagerIcon,
  devOps:            DevOpsIcon,
  cybersecurity:     CybersecurityIcon,
  uxDesigner:        UXDesignerIcon,
  financialAnalyst:  FinancialAnalystIcon,
  lawyer:            LawyerIcon,
  architect:         ArchitectIcon,
  civilEngineer:     CivilEngineerIcon,
  pharmacist:        PharmacistIcon,
  teacher:           TeacherIcon,
  accountant:        AccountantIcon,
  hrManager:         HRManagerIcon,
  salesManager:      SalesManagerIcon,
  marketingManager:  MarketingManagerIcon,
  electrician:              ElectricianIcon,
  chef:                     ChefIcon,
  aiMlEngineer:             AiMlEngineerIcon,
  cloudArchitect:           CloudArchitectIcon,
  dentist:                  DentistIcon,
  physiotherapist:          PhysiotherapistIcon,
  psychologist:             PsychologistIcon,
  renewableEnergyEngineer:  RenewableEnergyEngineerIcon,
  pilot:                    PilotIcon,
  graphicDesigner:          GraphicDesignerIcon,
  biomedicalEngineer:       BiomedicalEngineerIcon,
  supplyChainManager:       SupplyChainManagerIcon,
}

export function JobRoleIcon({ roleKey, size = 20, color = 'currentColor', className }: P & { roleKey: string }) {
  const Icon = ICONS[roleKey]
  if (!Icon) return null
  return <Icon size={size} color={color} className={className} />
}
