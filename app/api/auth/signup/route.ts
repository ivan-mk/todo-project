import { NextResponse } from 'next/server';
// Correct the import path to the generated client location
import { PrismaClient } from '../../../generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    // Basic validation
    if (!email || !password || !fullName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 }); // 409 Conflict
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Create user
    const newUser = await prisma.users.create({
      data: {
        full_name: fullName,
        email,
        password_hash: hashedPassword,
      },
    });

    // Don't send the password back, even hashed
    const { password_hash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ user: userWithoutPassword, message: 'User created successfully' }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Signup Error:', error);
    // Type guard for error object
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}