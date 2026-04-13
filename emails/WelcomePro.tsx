import { Html, Head, Body, Container, Heading, Text, Hr } from '@react-email/components';

export default function WelcomePro({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0a0a0f', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '32px', backgroundColor: '#13131a', borderRadius: '12px', border: '1px solid #222' }}>
          <Heading style={{ color: '#ffffff', fontSize: '24px', marginBottom: '8px' }}>
            Welcome to Origio Pro ✨
          </Heading>
          <Text style={{ color: '#aaaaaa', fontSize: '16px' }}>
            Hey {name}, you're now a Pro member. Here's what you've unlocked:
          </Text>
          <Hr style={{ borderColor: '#222222', margin: '24px 0' }} />
          <Text style={{ color: '#ffffff', fontSize: '15px', margin: '8px 0' }}>🌍 Unlimited country saves</Text>
          <Text style={{ color: '#ffffff', fontSize: '15px', margin: '8px 0' }}>📄 Full PDF relocation reports</Text>
          <Text style={{ color: '#ffffff', fontSize: '15px', margin: '8px 0' }}>💰 Advanced salary comparisons across 20 roles</Text>
          <Text style={{ color: '#ffffff', fontSize: '15px', margin: '8px 0' }}>⚡ Priority access to new features</Text>
          <Hr style={{ borderColor: '#222222', margin: '24px 0' }} />
          <Text style={{ color: '#aaaaaa', fontSize: '14px' }}>
            Head to origio.com and start exploring — your Pro features are live now.
          </Text>
          <Text style={{ color: '#555555', fontSize: '12px', marginTop: '32px' }}>origio.com · Dublin, Ireland</Text>
        </Container>
      </Body>
    </Html>
  );
}