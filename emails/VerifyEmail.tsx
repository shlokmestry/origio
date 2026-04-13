import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components';

export default function VerifyEmail({ confirmUrl }: { confirmUrl: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0a0a0f', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '32px', backgroundColor: '#13131a', borderRadius: '12px', border: '1px solid #222' }}>
          <Heading style={{ color: '#ffffff', fontSize: '24px', marginBottom: '8px' }}>
            Verify your Origio account
          </Heading>
          <Text style={{ color: '#aaaaaa', fontSize: '16px' }}>
            Welcome! Click the button below to verify your email and start finding where you belong.
          </Text>
          <Button
            href={confirmUrl}
            style={{ backgroundColor: '#6366f1', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block', marginTop: '24px', fontSize: '15px', fontWeight: 'bold' }}
          >
            Verify Email
          </Button>
          <Text style={{ color: '#555555', fontSize: '12px', marginTop: '32px' }}>
            If you didn't create an Origio account, you can safely ignore this email.
          </Text>
          <Text style={{ color: '#555555', fontSize: '12px' }}>origio.com</Text>
        </Container>
      </Body>
    </Html>
  );
}