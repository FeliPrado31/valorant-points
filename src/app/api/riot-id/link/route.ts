import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb, User } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { playerData, username } = body;

    if (!playerData || !username) {
      return NextResponse.json({ error: 'Player data and username are required' }, { status: 400 });
    }

    // Double-check that this Riot ID isn't already linked to another user
    const existingUserSnapshot = await adminDb
      .collection('users')
      .where('riotId.puuid', '==', playerData.puuid)
      .get();

    if (!existingUserSnapshot.empty) {
      const existingUser = existingUserSnapshot.docs[0];
      if (existingUser.id !== userId) {
        return NextResponse.json({ 
          error: 'This Riot ID is already linked to another account' 
        }, { status: 409 });
      }
    }

    // Check if user already exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      // Update existing user with Riot ID data
      const updateData = {
        username,
        valorantTag: `${playerData.name}#${playerData.tag}`,
        riotId: playerData,
        updatedAt: new Date(),
      };

      await adminDb.collection('users').doc(userId).update(updateData);
      
      // Get updated user data
      const updatedUserDoc = await adminDb.collection('users').doc(userId).get();
      const userData = updatedUserDoc.data() as User;
      
      return NextResponse.json(userData);
    } else {
      // Create new user with Riot ID data
      const userData: User = {
        id: userId,
        clerkId: userId,
        email: '', // Will be populated from Clerk if needed
        username,
        valorantTag: `${playerData.name}#${playerData.tag}`,
        riotId: playerData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await adminDb.collection('users').doc(userId).set(userData);
      return NextResponse.json(userData, { status: 201 });
    }
  } catch (error) {
    console.error('Error linking Riot ID:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
