import { NextResponse, NextRequest } from 'next/server'; // Use NextRequest

import { prisma } from '../../../lib/prisma'; // Import the singleton instance
import { getIronSession, IronSessionData } from 'iron-session'; // Use getIronSession
import { sessionOptions } from '../../../lib/session'; // Corrected path
import { cookies } from 'next/headers'; // Import cookies

// Define the type for the session object
interface CustomIronSession extends IronSessionData {
  user?: {
    id: string;
  };
}

// Helper to get user ID from session (App Router)
async function getUserIdFromSession(): Promise<string | null> {
  const sessionCookies = await cookies();
  const session = await getIronSession<CustomIronSession>(sessionCookies, sessionOptions);
  return session.user?.id || null;
}

// No wrapper needed
export async function GET(request: NextRequest) { // Use NextRequest
  try {
    const sessionCookies = await cookies();
    const session = await getIronSession<CustomIronSession>(sessionCookies, sessionOptions);

    // Check if the user is logged in
    if (!session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const todos = await prisma.todos.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'desc' },
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ message: 'Failed to load todos. Please try again later.' }, { status: 500 });
  }
}

// No wrapper needed
export async function POST(request: NextRequest) { // Use NextRequest
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title } = await request.json();

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    // Get the highest order value for this user's todos
    const highestOrder = await prisma.todos.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    // Set the new order to be one more than the highest, or 0 if no todos exist yet
    const newOrder = (highestOrder?.order ?? -1) + 1;

    const newTodo = await prisma.todos.create({
      data: {
        title: title.trim(),
        userId: userId,
        order: newOrder,
      },
    });
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ message: 'Error creating todo' }, { status: 500 });
  }
}