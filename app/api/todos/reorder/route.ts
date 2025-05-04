import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getIronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '../../../../lib/session';
import { cookies } from 'next/headers';

// Define the type for the session object
interface CustomIronSession extends IronSessionData {
  user?: {
    id: string;
  };
}

// Helper to get user ID from session
async function getUserIdFromSession(): Promise<string | null> {
  const sessionCookies = await cookies();
  const session = await getIronSession<CustomIronSession>(sessionCookies, sessionOptions);
  return session.user?.id || null;
}

// PATCH endpoint to handle reordering of todos
export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { todos } = await request.json();
    
    if (!Array.isArray(todos) || todos.length === 0) {
      return NextResponse.json({ message: 'Invalid todos array' }, { status: 400 });
    }

    // Verify all todos belong to the current user
    const todoIds = todos.map(todo => todo.id);
    const userTodos = await prisma.todos.findMany({
      where: { 
        id: { in: todoIds },
        userId
      },
      select: { id: true }
    });

    if (userTodos.length !== todoIds.length) {
      return NextResponse.json({ message: 'Access denied to one or more todos' }, { status: 403 });
    }

    // Update the order of each todo - use reverse index to maintain descending order
    // Since we fetch in descending order, the highest value should be first in the list
    const totalTodos = todos.length;
    const updates = todos.map((todo, index) => 
      prisma.todos.update({
        where: { id: todo.id },
        data: { order: totalTodos - index - 1 + 1000 } // Start from a high number to avoid conflicts
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ message: 'Todos reordered successfully' });
  } catch (error) {
    console.error('Error reordering todos:', error);
    return NextResponse.json({ message: 'Error reordering todos' }, { status: 500 });
  }
}