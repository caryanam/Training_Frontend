const crypto = require('crypto');

function verifyJWT(token, secret) {
  const [header, payload, signature] = token.split('.');
  const data = header + '.' + payload;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  
  return expectedSignature === signature;
}

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZXZrZXkiLCJzdWIiOiJmYWNfNF9wcmF0aWtzaGFAZ21haWwuY29tIiwiaWF0IjoxNzg5MjAyNDM5LCJuYmYiOjE3ODkyMDI0MzksImV4cCI6MTc4OTIwNjAzOSwibmFtZSI6IlByYXRpa3NoYSBTaGl0b2xlICIsIm1ldGFkYXRhIjoie1wicm9sZVwiOlwiRkFDVUxUWVwiLFwidXNlcklkXCI6NCxcImVtYWlsXCI6XCJwcmF0aWtzaGFAZ21haWwuY29tXCJ9IiwidmlkZW8iOnsiY2FuU3Vic2NyaWJlIjp0cnVlLCJyb29tSm9pbiI6dHJ1ZSwiY2FuUHVibGlzaERhdGEiOnRydWUsInJvb21BZG1pbiI6dHJ1ZSwiY2FuUHVibGlzaCI6dHJ1ZSwicm9vbSI6InJvb20tbGVjdHVyZS0yMy0xNzg5MjAyNDM5NzM1IiwiY2FuUHVibGlzaFNvdXJjZXMiOlsiY2FtZXJhIiwibWljcm9waG9uZSIsInNjcmVlbl9zaGFyZSIsInNjcmVlbl9zaGFyZV9hdWRpbyJdfX0.9v1mQIjb4IH2xDO7Iz1Zyfho6JI9LbPADTZdn_riqp4';

console.log('Using my-super-secret-key-for-livekit-2026:', verifyJWT(token, 'my-super-secret-key-for-livekit-2026'));
console.log('Using secret:', verifyJWT(token, 'secret'));
