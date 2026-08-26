import { Html, Head, Body, Container, Text, Hr } from '@react-email/components';

interface TopCountry {
  slug: string;
  name: string;
  flagEmoji: string;
  matchPercent: number;
}

export default function ReengagementNudge({ name, topCountry, unsubscribeUrl }: { name: string; topCountry: TopCountry; unsubscribeUrl: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0a0a0a', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '40px 32px', backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
          <Text style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555550', margin: '0 0 24px', fontFamily: 'sans-serif' }}>
            ORIGIO
          </Text>
          <Text style={{ fontSize: 26, fontWeight: 900, color: '#f0f0e8', margin: '0 0 12px', lineHeight: '1.2', fontFamily: 'sans-serif' }}>
            Still thinking about {topCountry.flagEmoji} {topCountry.name}{name ? `, ${name}` : ''}?
          </Text>
          <Text style={{ fontSize: 15, color: '#666660', margin: '0 0 28px', lineHeight: '1.6', fontFamily: 'sans-serif' }}>
            It was your top match at {topCountry.matchPercent}%. Salaries, rent, and visa rules shift often —
            worth a second look before you decide.
          </Text>
          <div style={{ background: '#0a0a0a', border: '1px solid #2a2a2a', padding: '20px 24px', marginBottom: '28px' }}>
            <Text style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#00ffd5', margin: '0 0 6px', fontFamily: 'sans-serif' }}>
              Your top match
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 800, color: '#f0f0e8', margin: 0, fontFamily: 'sans-serif' }}>
              {topCountry.flagEmoji} {topCountry.name} — {topCountry.matchPercent}% match
            </Text>
          </div>
          <Hr style={{ borderColor: '#2a2a2a', margin: '0 0 28px' }} />
          <a
            href={`https://findorigio.com/country/${topCountry.slug}`}
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
            See what&apos;s new &rarr;
          </a>
          <Text style={{ fontSize: 11, color: '#333330', marginTop: '40px', fontFamily: 'sans-serif' }}>
            findorigio.com &middot; Dublin, Ireland
            <br />
            <a href={unsubscribeUrl} style={{ color: '#555550' }}>Unsubscribe from these emails</a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
