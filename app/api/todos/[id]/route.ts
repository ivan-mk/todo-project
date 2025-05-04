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
// Helper to get user ID from session (App Router)
async function getUserIdFromSession(): Promise<string | null> {
  const sessionCookies = await cookies();
  const session = await getIronSession<CustomIronSession>(sessionCookies, sessionOptions);
  return session.user?.id || null;
}

// Updated route handler with Promise-based params typing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromSession();
  const id = (await params).id;

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const todo = await prisma.todos.findUnique({
      where: {
        id: id,
        userId: userId, // Ensure the user owns this todo
      },
    });

    if (!todo) {
      return NextResponse.json({ message: 'Todo not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error(`Error fetching todo ${id}:`, error);
    return NextResponse.json({ message: 'Error fetching todo' }, { status: 500 });
  }
}

// Updated PATCH handler with Promise-based params typing
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromSession();
  const id = (await params).id;

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, completed } = await request.json();

    // Basic validation
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      return NextResponse.json({ message: 'Title cannot be empty' }, { status: 400 });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
      return NextResponse.json({ message: 'Completed must be a boolean' }, { status: 400 });
    }

    const existingTodo = await prisma.todos.findFirst({
      where: { id: id, userId: userId }, // Verify ownership
    });

    if (!existingTodo) {
      return NextResponse.json({ message: 'Todo not found or access denied' }, { status: 404 });
    }

    const updatedTodo = await prisma.todos.update({
      where: {
        id: id,
      },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        completed: completed !== undefined ? completed : undefined,
      },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error(`Error updating todo ${id}:`, error);
    return NextResponse.json({ message: 'Error updating todo' }, { status: 500 });
  }
}

// Updated DELETE handler with Promise-based params typing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromSession();
  const id = (await params).id;

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existingTodo = await prisma.todos.findFirst({
      where: { id: id, userId: userId }, // Verify ownership
    });

    if (!existingTodo) {
      return NextResponse.json({ message: 'Todo not found or access denied' }, { status: 404 });
    }

    await prisma.todos.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Todo deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting todo ${id}:`, error);
    return NextResponse.json({ message: 'Error deleting todo' }, { status: 500 });
  }
}