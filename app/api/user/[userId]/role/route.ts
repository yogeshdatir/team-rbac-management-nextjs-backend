import { checkUserPermission, getCurrentUser } from '@/app/api/lib/auth';
import { prisma } from '@/app/api/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Role } from '../../../types/index';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await context.params;
    const currentUser = await getCurrentUser();

    if (!currentUser || !checkUserPermission(currentUser, Role.ADMIN)) {
      return NextResponse.json(
        {
          error: 'You are not authorized to assign team',
        },
        { status: 401 },
      );
    }

    // Prevent users from changing their own role
    if (userId === currentUser.id) {
      return NextResponse.json(
        {
          error: 'You can not change your own role',
        },
        { status: 401 },
      );
    }

    const { role } = await request.json().catch(() => ({}));

    // Validate role
    const validateRoles = [Role.USER, Role.MANAGER];

    if (!role || !validateRoles.includes(role)) {
      return NextResponse.json(
        {
          error: 'Invalid role',
        },
        { status: 404 },
      );
    }

    // Update user's team assignment
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: `User role updated to ${role} successfully`,
    });
  } catch (error) {
    console.error('Role assignment error: ', error);
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      return NextResponse.json(
        {
          error: 'User Not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error, Something went wrong!',
      },
      { status: 500 },
    );
  }
}
