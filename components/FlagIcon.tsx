interface FlagIconProps {
  code: string        // ISO 3166-1 alpha-2 country code e.g. "fr"
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function FlagIcon({ code, size = 'md', className }: FlagIconProps) {
  const sizes = { sm: { width: 20, height: 15 }, md: { width: 32, height: 24 }, lg: { width: 48, height: 36 }, xl: { width: 80, height: 60 } }
  const { width, height } = sizes[size]
  return (
    <span
      className={`fi fi-${code.toLowerCase()} ${className ?? ''}`}
      style={{ width, height, borderRadius: 3, display: 'inline-block', backgroundSize: 'cover', flexShrink: 0 }}
      role="img"
      aria-label={`${code} flag`}
    />
  )
}
