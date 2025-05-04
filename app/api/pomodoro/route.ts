import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getIronSession, IronSessionData } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '../../../lib/session';

// Default times (in seconds)
const DEFAULT_WORK_TIME = 25 * 60; // 25 minutes
const DEFAULT_REST_TIME = 5 * 60;  // 5 minutes
const DEFAULT_LONG_BREAK_TIME = 15 * 60; // 15 minutes

// Helper function to get or create Pomodoro state
// Only call this when we know the user is authenticated
async function getOrCreatePomodoro(userId: string) {
  let pomodoro = await prisma.pomodoro.findUnique({
    where: { userId },
  });

  if (!pomodoro) {
    pomodoro = await prisma.pomodoro.create({
      data: {
        userId,
        isRunning: false,
        isResting: false,
        isLongBreak: false,
        completedPomodoros: 0,
        startTime: null,
        remainingTime: DEFAULT_WORK_TIME, // Initialize with DEFAULT_WORK_TIME
      },
    });
  }
  // Ensure remainingTime is not null if not running
  if (!pomodoro.isRunning && pomodoro.remainingTime === null) {
     pomodoro.remainingTime = pomodoro.isResting ? 
      (pomodoro.isLongBreak ? DEFAULT_LONG_BREAK_TIME : DEFAULT_REST_TIME) : 
      DEFAULT_WORK_TIME;
  }

  return pomodoro;
}

// Check user authentication and return userId or null
async function authenticateUser() {
  const session = await getIronSession<{ user?: { id: string } }>(
    await cookies(),
    sessionOptions
  );
  return session.user?.id || null;
}

// Helper function to get user's settings
async function getUserSettings(userId: string) {
  let settings = await prisma.pomodoroSettings.findUnique({ where: { userId } });
  
  if (!settings) {
    // Create default settings if not exist
    settings = await prisma.pomodoroSettings.create({
      data: { userId },
    });
  }
  
  return {
    pomodoroDuration: settings.pomodoroDuration ?? 25,
    breakDuration: settings.breakDuration ?? 5,
    longBreakDuration: settings.longBreakDuration ?? 15,
    enableLongBreak: settings.enableLongBreak ?? true,
    longBreakInterval: settings.longBreakInterval ?? 4
  };
}

// GET: Retrieve the current Pomodoro state with calculated timeLeft
export async function GET() {
  // Check authentication first before any database operations
  const userId = await authenticateUser();

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const pomodoro = await getOrCreatePomodoro(userId);
    const settings = await getUserSettings(userId);
    
    const workTime = settings.pomodoroDuration * 60;
    const restTime = settings.breakDuration * 60;
    const longBreakTime = settings.longBreakDuration * 60;

    // Use the appropriate rest time based on isLongBreak flag
    const currentRestTime = pomodoro.isLongBreak ? longBreakTime : restTime;
    
    let timeLeft = pomodoro.remainingTime ?? (pomodoro.isResting ? currentRestTime : workTime);

    if (pomodoro.isRunning && pomodoro.startTime) {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - pomodoro.startTime.getTime()) / 1000);
      const initialTime = pomodoro.isResting ? currentRestTime : workTime;
      timeLeft = Math.max(0, initialTime - elapsedSeconds);
    } else if (!pomodoro.isRunning && pomodoro.remainingTime !== null) {
      timeLeft = pomodoro.remainingTime;
    }

    return NextResponse.json({ 
      ...pomodoro, 
      timeLeft,
      // Include settings that affect UI
      enableLongBreak: settings.enableLongBreak,
      longBreakInterval: settings.longBreakInterval
    });
  } catch (error) {
    console.error("Error fetching pomodoro state:", error);
    return NextResponse.json({ error: 'Failed to fetch Pomodoro state' }, { status: 500 });
  }
}

// POST: Handle timer actions (start, pause, reset, skip, finish)
export async function POST(request: Request) {
  // Check authentication first before parsing request body or doing database operations
  const userId = await authenticateUser();
  
  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { 
      action, 
      pomodoroDuration = 25, 
      breakDuration = 5, 
      longBreakDuration = 15,
      isLongBreak = false,
      completedPomodoros = 0
    } = body;
    
    const currentPomodoro = await getOrCreatePomodoro(userId);
    const settings = await getUserSettings(userId);
    
    let updateData: any = {};
    const now = new Date();

    // Convert minutes to seconds
    const workTime = pomodoroDuration * 60;
    const restTime = breakDuration * 60;
    const longBreakTime = longBreakDuration * 60;
    
    // Use longBreakTime if isLongBreak is true
    const currentRestTime = isLongBreak ? longBreakTime : restTime;

    switch (action) {
      case 'toggle':
        if (currentPomodoro.isRunning) {
          // If timer is running, pause it
          let elapsedSeconds = 0;
          
          if (currentPomodoro.startTime) {
            elapsedSeconds = Math.floor((now.getTime() - currentPomodoro.startTime.getTime()) / 1000);
          }
          
          const initialTime = currentPomodoro.isResting ? 
            (currentPomodoro.isLongBreak ? longBreakTime : restTime) : 
            workTime;
            
          const remainingTime = Math.max(0, initialTime - elapsedSeconds);
          
          updateData = {
            isRunning: false,
            startTime: null,
            remainingTime: remainingTime,
          };
        } else {
          // If timer is paused, start it
          const initialTime = currentPomodoro.isResting ? 
            (currentPomodoro.isLongBreak ? longBreakTime : restTime) : 
            workTime;
            
          const remainingTime = currentPomodoro.remainingTime !== null ? 
            currentPomodoro.remainingTime : 
            initialTime;
            
          const pseudoStartTime = new Date(now.getTime() - (initialTime - remainingTime) * 1000);
          
          updateData = {
            isRunning: true,
            startTime: pseudoStartTime,
            remainingTime: null,
          };
        }
        break;
      case 'reset':
        updateData = {
          isRunning: false,
          isResting: false,
          isLongBreak: false,
          completedPomodoros: 0,
          startTime: null,
          remainingTime: workTime,
        };
        break;
      case 'skip':
        const newIsResting = !currentPomodoro.isResting;
        let newIsLongBreak = currentPomodoro.isLongBreak;
        let newCompletedPomodoros = currentPomodoro.completedPomodoros;
        
        // If switching from work to rest, check if long break is due
        if (!currentPomodoro.isResting && newIsResting) {
          newCompletedPomodoros += 1;
          
          // Debug log for issue diagnosis
          console.log(`Skip: completedPomodoros=${newCompletedPomodoros}, interval=${settings.longBreakInterval}, enableLongBreak=${settings.enableLongBreak}`);
          
          // Check if long break is due based on settings
          if (settings.enableLongBreak && newCompletedPomodoros % settings.longBreakInterval === 0) {
            newIsLongBreak = true;
          } else {
            newIsLongBreak = false;
          }
        } 
        // If switching from rest to work, reset long break flag
        else if (currentPomodoro.isResting && !newIsResting) {
          newIsLongBreak = false;
        }
        
        updateData = {
          isRunning: false,
          isResting: newIsResting,
          isLongBreak: newIsLongBreak,
          completedPomodoros: newCompletedPomodoros,
          startTime: null,
          remainingTime: newIsResting ? 
            (newIsLongBreak ? longBreakTime : restTime) : 
            workTime,
        };
        break;
      case 'finish':
        let nextIsResting = !currentPomodoro.isResting;
        let nextIsLongBreak = currentPomodoro.isLongBreak;
        let nextCompletedPomodoros = currentPomodoro.completedPomodoros;
        
        // If finishing a work session, increment completed count and check for long break
        if (!currentPomodoro.isResting) {
          nextCompletedPomodoros += 1;
          
          // Debug log for issue diagnosis
          console.log(`Finish: completedPomodoros=${nextCompletedPomodoros}, interval=${settings.longBreakInterval}, enableLongBreak=${settings.enableLongBreak}`);
          
          // Check if long break is due
          if (settings.enableLongBreak && nextCompletedPomodoros % settings.longBreakInterval === 0) {
            nextIsLongBreak = true;
          } else {
            nextIsLongBreak = false;
          }
        } 
        // If finishing a rest session, reset long break flag
        else {
          nextIsLongBreak = false;
        }
        
        updateData = {
          isRunning: false,
          isResting: nextIsResting,
          isLongBreak: nextIsLongBreak,
          completedPomodoros: nextCompletedPomodoros,
          startTime: null,
          remainingTime: nextIsResting ? 
            (nextIsLongBreak ? longBreakTime : restTime) : 
            workTime,
        };
        break;
      default:
        console.error(`Unknown pomodoro action: ${action}`);
        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }

    const updatedPomodoro = await prisma.pomodoro.update({
      where: { userId },
      data: updateData,
    });

    // Calculate time left for response
    let timeLeft = updatedPomodoro.remainingTime ?? 
      (updatedPomodoro.isResting ? 
        (updatedPomodoro.isLongBreak ? longBreakTime : restTime) : 
        workTime);
    
    if (updatedPomodoro.isRunning && updatedPomodoro.startTime) {
      const elapsedSeconds = Math.floor((now.getTime() - updatedPomodoro.startTime.getTime()) / 1000);
      const initialTime = updatedPomodoro.isResting ? 
        (updatedPomodoro.isLongBreak ? longBreakTime : restTime) : 
        workTime;
        
      timeLeft = Math.max(0, initialTime - elapsedSeconds);
    }

    return NextResponse.json({ 
      ...updatedPomodoro, 
      timeLeft,
      // Include settings that affect UI
      enableLongBreak: settings.enableLongBreak,
      longBreakInterval: settings.longBreakInterval
    });
  } catch (error) {
    console.error("Error updating pomodoro state:", error);
    return NextResponse.json({ error: 'Failed to update Pomodoro state' }, { status: 500 });
  }
}