import { NextResponse } from 'next/server';
import { getIronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '../../../../lib/session';
import { cookies } from 'next/headers';

// Define the type for the session object
interface CustomIronSession extends IronSessionData {
  user?: {
    id: string;
  };
}

export async function POST() {
  try {
    const sessionCookies = await cookies();
    const session = await getIronSession<CustomIronSession>(sessionCookies, sessionOptions);

    // Destroy the session
    session.destroy();

    // The session.destroy() method itself handles clearing the session data
    // and setting the cookie to expire immediately.
    // We just need to ensure the response headers reflect the cookie change,
    // which iron-session handles when used with Next.js App Router cookies().

    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json({ message: 'Internal Server Error during logout' }, { status: 500 });
  }
}
