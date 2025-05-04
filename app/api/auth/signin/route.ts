import { NextResponse, NextRequest } from 'next/server';
// Correct the import path for PrismaClient
import { PrismaClient } from '../../../generated/prisma'; // Adjusted path
import bcrypt from 'bcryptjs';
import { getIronSession, IronSession, IronSessionData } from 'iron-session'; // Import IronSession type
import { sessionOptions } from '../../../../lib/session'; // Corrected path and import IronSessionData
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Define the type for the session object
interface CustomIronSession extends IronSessionData {
  user?: {
    id: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Pass cookies function directly
    const sessionCookies = await cookies();
    const session = await getIronSession<CustomIronSession>(sessionCookies, sessionOptions);
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // --- Iron Session Logic --- 
    session.user = {
      id: user.id,
    };
    await session.save(); // Save the session data, sets the cookie via headers
    // --- End Iron Session Logic ---

    const { password_hash: _, ...userWithoutPassword } = user;

    // Return response - cookie is set automatically by session.save()
    return NextResponse.json({ user: userWithoutPassword, message: 'Sign in successful' }, { status: 200 });

  } catch (error) {
    console.error('Signin Error:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}