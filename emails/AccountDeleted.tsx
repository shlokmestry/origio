import { Html, Head, Body, Container, Heading, Text } from '@react-email/components';

export default function AccountDeleted({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0a0a0f', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '32px', backgroundColor: '#13131a', borderRadius: '12px', border: '1px solid #222' }}>
          <Heading style={{ color: '#ffffff', fontSize: '24px', marginBottom: '8px' }}>
            Account Deleted
          </Heading>
          <Text style={{ color: '#aaaaaa', fontSize: '16px' }}>
            Hey {name}, your Origio account has been permanently deleted and all your data has been removed.
          </Text>
          <Text style={{ color: '#aaaaaa', fontSize: '16px' }}>
            If this was a mistake, you're welcome to create a new account at any time.
          </Text>
          <Text style={{ color: '#555555', fontSize: '12px', marginTop: '32px' }}>origio.com</Text>
        </Container>
      </Body>
    </Html>
  );
}