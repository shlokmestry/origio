import { Html, Head, Body, Container, Text, Hr, Section } from '@react-email/components';

interface CityRow {
  name: string
  country: string
  total: number
  currency: string
  sym: string
}

interface Props {
  cities: CityRow[]
  shareUrl: string
}

export default function CityComparison({ cities, shareUrl }: Props) {
  const cheapest = [...cities].sort((a, b) => a.total - b.total)[0]
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0a0a0a', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '40px 32px', backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
          <Text style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555550', margin: '0 0 24px', fontFamily: 'sans-serif' }}>
            ORIGIO · City Comparison
          </Text>
          <Text style={{ fontSize: 26, fontWeight: 900, color: '#f0f0e8', margin: '0 0 12px', lineHeight: '1.1', fontFamily: 'sans-serif' }}>
            Your city cost breakdown.
          </Text>
          <Text style={{ fontSize: 14, color: '#666660', margin: '0 0 28px', lineHeight: '1.6', fontFamily: 'sans-serif' }}>
            Here&apos;s the monthly cost comparison you built, saved so you can reference it later.
          </Text>
          <Hr style={{ borderColor: '#2a2a2a', margin: '0 0 24px' }} />

          {cities.map((city, i) => (
            <Section key={i} style={{ marginBottom: '16px', padding: '16px 20px', backgroundColor: '#1a1a1a', borderLeft: city.name === cheapest.name ? '3px solid #00ffd5' : '3px solid #2a2a2a' }}>
              <Text style={{ fontSize: 13, fontWeight: 700, color: '#f0f0e8', margin: '0 0 4px', fontFamily: 'sans-serif' }}>
                {city.name} · {city.country}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: 900, color: city.name === cheapest.name ? '#00ffd5' : '#f0b07a', margin: 0, fontFamily: 'sans-serif' }}>
                {city.sym}{Math.round(city.total).toLocaleString()} <span style={{ fontSize: 13, fontWeight: 400, color: '#555550' }}>/mo</span>
              </Text>
              {city.name === cheapest.name && cities.length > 1 && (
                <Text style={{ fontSize: 11, color: '#00ffd5', margin: '4px 0 0', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                  ↓ Best deal
                </Text>
              )}
            </Section>
          ))}

          <Hr style={{ borderColor: '#2a2a2a', margin: '24px 0' }} />
          <a
            href={shareUrl}
            style={{
              display: 'inline-block',
              background: '#00ffd5',
              color: '#0a0a0a',
              fontWeight: 800,
              fontSize: '12px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '14px 28px',
              textDecoration: 'none',
              fontFamily: 'sans-serif',
            }}
          >
            View comparison &rarr;
          </a>
          <Text style={{ fontSize: 12, color: '#444440', marginTop: '32px', lineHeight: '1.6', fontFamily: 'sans-serif' }}>
            All costs are estimates for a single person. Rent is 1BR city centre. Numbers shown in {cities[0]?.currency?.toUpperCase() ?? 'EUR'}.
          </Text>
          <Text style={{ fontSize: 11, color: '#333330', marginTop: '24px', fontFamily: 'sans-serif' }}>
            findorigio.com &middot; Dublin, Ireland
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
