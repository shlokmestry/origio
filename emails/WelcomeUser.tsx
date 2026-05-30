import { Html, Head, Body, Container, Text, Hr } from '@react-email/components';

export default function WelcomeUser({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0a0a0a', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '40px 32px', backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
          <Text style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555550', margin: '0 0 24px', fontFamily: 'sans-serif' }}>
            ORIGIO
          </Text>
          <Text style={{ fontSize: 28, fontWeight: 900, color: '#f0f0e8', margin: '0 0 12px', lineHeight: '1.1', fontFamily: 'sans-serif' }}>
            Welcome{name ? `, ${name}` : ''}.
          </Text>
          <Text style={{ fontSize: 15, color: '#666660', margin: '0 0 32px', lineHeight: '1.6', fontFamily: 'sans-serif' }}>
            Your account is ready. Answer a few questions and we'll match you to the best countries for your situation.
          </Text>
          <Hr style={{ borderColor: '#2a2a2a', margin: '0 0 28px' }} />
          <a
            href="https://findorigio.com/wizard"
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
            Find my country &rarr;
          </a>
          <Text style={{ fontSize: 11, color: '#333330', marginTop: '40px', fontFamily: 'sans-serif' }}>
            findorigio.com &middot; Dublin, Ireland
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
