import { Html, Head, Body, Container, Heading, Text, Hr } from '@react-email/components';

export default function WelcomeUser({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0a0a0a', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '40px 32px', backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
          <Text style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555550', margin: '0 0 24px' }}>
            ORIGIO
          </Text>
          <Heading style={{ color: '#f0f0e8', fontSize: '28px', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.1 }}>
            Welcome{name ? `, ${name}` : ''}.
          </Heading>
          <Text style={{ color: '#666660', fontSize: '15px', margin: '0 0 32px', lineHeight: 1.6 }}>
            Your account is ready. Start the wizard to find your best country match in under 3 minutes.
          </Text>
          <Hr style={{ borderColor: '#2a2a2a', margin: '0 0 28px' }} />
          <Text style={{ color: '#f0f0e8', fontSize: '14px', margin: '0 0 12px' }}>
            What you can do:
          </Text>
          <Text style={{ color: '#888880', fontSize: '14px', margin: '6px 0', lineHeight: 1.6 }}>
            → Run the country wizard and get matched to your top destinations
          </Text>
          <Text style={{ color: '#888880', fontSize: '14px', margin: '6px 0', lineHeight: 1.6 }}>
            → Browse 100+ cities with cost-of-living and quality-of-life data
          </Text>
          <Text style={{ color: '#888880', fontSize: '14px', margin: '6px 0', lineHeight: 1.6 }}>
            → Compare salary after tax across countries for your role
          </Text>
          <Hr style={{ borderColor: '#2a2a2a', margin: '28px 0' }} />
          <a href="https://findorigio.com/wizard" style={{ display: 'inline-block', background: '#00ffd5', color: '#0a0a0a', fontWeight: 800, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px 28px', textDecoration: 'none' }}>
            Find my country →
          </a>
          <Text style={{ color: '#333330', fontSize: '11px', marginTop: '32px' }}>
            findorigio.com · Dublin, Ireland
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
