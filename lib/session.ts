import type { SessionOptions } from 'iron-session'; // Correct type name

// IMPORTANT: Replace this with a strong secret password stored securely in environment variables!
// Generate a good secret using: openssl rand -base64 32
const IRON_SESSION_PASSWORD = process.env.IRON_SESSION_PASSWORD || 'complex_password_at_least_32_characters_long_replace_me';

if (process.env.NODE_ENV === 'production' && IRON_SESSION_PASSWORD === 'complex_password_at_least_32_characters_long_replace_me') {
  console.warn(
    '*** WARNING: Using default IRON_SESSION_PASSWORD in production is insecure! Please set a strong secret in your environment variables. ***'
  );
}

export const sessionOptions: SessionOptions = { // Use correct type
  password: IRON_SESSION_PASSWORD,
  cookieName: 'myapp-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    // maxAge: undefined, // default: session cookie, expires when browser closes
  },
};

// Define the shape of the data stored in the session
// Adjust this based on what you need to store (e.g., user ID, role)
declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: string;
      // Add other non-sensitive user data if needed (e.g., email, role)
      // Avoid storing sensitive data like passwords here.
    };
  }
}

