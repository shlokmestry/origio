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
  electrician:       ElectricianIcon,
  chef:              ChefIcon,
}

export function JobRoleIcon({ roleKey, size = 20, color = 'currentColor', className }: P & { roleKey: string }) {
  const Icon = ICONS[roleKey]
  if (!Icon) return null
  return <Icon size={size} color={color} className={className} />
}
