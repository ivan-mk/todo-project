import TodoList from "@/components/TodoList";
import { getIronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '../lib/session';
import { cookies } from 'next/headers'; // Import cookies
import { PrismaClient } from './generated/prisma'; // Import Prisma Client from the generated location

const prisma = new PrismaClient();

// Define the type for the session object
interface CustomIronSession extends IronSessionData {
  user?: {
    id: string;
  };
}

async function fetchTodosForUser(userId: string) {
  try {
    const todos = await prisma.todos.findMany({
      where: { userId: userId },
    });
    return todos;
  } catch (error) {
    console.error("Error fetching todos:", error);
    return []; // Return empty array on error
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}

export default async function Home() { // Make the component async
  const session = await getIronSession<CustomIronSession>(await cookies(), sessionOptions);
  let todoss:any = [];

  if (session.user) {
    // Fetch todos only if the user is logged in
    todoss = await fetchTodosForUser(session.user.id);
  }

  // Pass todos as a prop to TodoList
  return (
    <main className="flex min-h-screen flex-col items-center justify-start">
      <div className="w-full max-w-xl mx-auto"> {/* Increased max width and removed extra padding */}
        <TodoList initialTodos={todoss} />
      </div>
    </main>
  );
}
