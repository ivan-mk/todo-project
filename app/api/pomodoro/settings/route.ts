import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(req: NextRequest) {
  const session = await getIronSession<CustomIronSession>(await cookies() , sessionOptions);
  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  let settings = await prisma.pomodoroSettings.findUnique({ where: { userId } });
  if (!settings) {
    // Create default settings if not exist
    settings = await prisma.pomodoroSettings.create({
      data: { userId },
    });
  }
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const session = await getIronSession<CustomIronSession>(await cookies(), sessionOptions);
  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const data = await req.json();
  // Only allow updating specific fields
  const allowedFields = [
    'pomodoroDuration',
    'breakDuration',
    'longBreakDuration',
    'longBreakInterval',
    'enableLongBreak',
    'notificationSound',
    'mute',
  ];
  const updateData: any = {};
  for (const key of allowedFields) {
    if (key in data) updateData[key] = data[key];
  }
  const settings = await prisma.pomodoroSettings.upsert({
    where: { userId },
    update: updateData,
    create: { userId, ...updateData },
  });
  return NextResponse.json(settings);
}
