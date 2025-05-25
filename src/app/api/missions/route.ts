import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb, Mission } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active missions
    const missionsSnapshot = await adminDb
      .collection('missions')
      .where('isActive', '==', true)
      .orderBy('difficulty')
      .orderBy('createdAt', 'desc')
      .get();

    const missions = missionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Mission[];

    return NextResponse.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
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
    const { title, description, type, target, reward, difficulty } = body;

    if (!title || !description || !type || !target || !reward || !difficulty) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const missionData: Omit<Mission, 'id'> = {
      title,
      description,
      type,
      target: Number(target),
      reward: Number(reward),
      difficulty,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create mission in Firestore
    const missionRef = await adminDb.collection('missions').add(missionData);
    
    const mission: Mission = {
      id: missionRef.id,
      ...missionData,
    };

    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    console.error('Error creating mission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
