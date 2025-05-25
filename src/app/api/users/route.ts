import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb, User, getMaxActiveMissions } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data() as User;
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, username, valorantTag } = body;

    if (!email || !username) {
      return NextResponse.json({ error: 'Email and username are required' }, { status: 400 });
    }

    const now = new Date();
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const maxMissions = getMaxActiveMissions('free'); // Default to free tier

    const userData: User = {
      id: userId,
      clerkId: userId,
      email,
      username,
      valorantTag,
      // Initialize with free tier subscription
      subscription: {
        tier: 'free',
        status: 'active'
      },
      // Initialize mission limits
      missionLimits: {
        maxActiveMissions: maxMissions,
        availableSlots: maxMissions,
        lastRefresh: now,
        nextRefresh: nextRefresh
      },
      createdAt: now,
      updatedAt: now,
    };

    // Save user to Firestore
    await adminDb.collection('users').doc(userId).set(userData);

    console.log('✅ Created new user with subscription data:', userId, {
      tier: 'free',
      maxMissions,
      availableSlots: maxMissions
    });

    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, valorantTag } = body;

    // Get current user data to check if Riot ID is already set
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserData = userDoc.data() as User;

    // Prepare update data - only allow certain fields to be updated
    const updateData: Partial<User> = {
      updatedAt: new Date(),
    };

    // Allow username updates
    if (username) {
      updateData.username = username;
    }

    // Only allow valorantTag updates if Riot ID is not set
    // Once Riot ID is verified and linked, it becomes immutable
    if (valorantTag && !currentUserData.riotId) {
      updateData.valorantTag = valorantTag;
    } else if (valorantTag && currentUserData.riotId) {
      return NextResponse.json({
        error: 'Riot ID cannot be changed once verified. Contact support if you need to update it.'
      }, { status: 403 });
    }

    // Update user in Firestore
    await adminDb.collection('users').doc(userId).update(updateData);

    // Get updated user data
    const updatedUserDoc = await adminDb.collection('users').doc(userId).get();
    const userData = updatedUserDoc.data() as User;

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
