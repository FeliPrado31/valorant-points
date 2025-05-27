import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  adminDb, 
  Mission, 
  User, 
  getSubscriptionTier, 
  getMaxActiveMissions, 
  shouldRefreshDailyMissions,
  generateDailyMissionSelection
} from '@/lib/firebase-admin';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user document
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let userData = userDoc.data() as User;

    // Initialize subscription data if missing
    if (!userData.subscription || !userData.missionLimits) {
      console.log('🔧 Initializing subscription data for daily missions:', userId);

      const now = new Date();
      const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const maxMissions = getMaxActiveMissions('free');

      const initializationData = {
        'subscription.tier': 'free',
        'subscription.status': 'active',
        'missionLimits.maxActiveMissions': maxMissions,
        'missionLimits.availableSlots': maxMissions,
        'missionLimits.lastRefresh': now,
        'missionLimits.nextRefresh': nextRefresh,
        updatedAt: now
      };

      await adminDb.collection('users').doc(userId).update(initializationData);
      
      // Refresh user data
      const updatedUserDoc = await adminDb.collection('users').doc(userId).get();
      userData = updatedUserDoc.data() as User;
    }

    const currentTier = getSubscriptionTier(userData as unknown as Record<string, unknown>);
    const maxMissions = getMaxActiveMissions(currentTier);

    // Get all active missions
    const missionsSnapshot = await adminDb
      .collection('missions')
      .where('isActive', '==', true)
      .orderBy('difficulty')
      .orderBy('createdAt', 'desc')
      .get();

    const allMissions = missionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Mission[];

    // Check if daily missions need refresh
    const needsRefresh = shouldRefreshDailyMissions(userData as unknown as Record<string, unknown>);
    let selectedMissionIds = userData.dailyMissions?.selectedMissionIds || [];

    if (needsRefresh || selectedMissionIds.length === 0) {
      console.log('🔄 Refreshing daily missions for user:', userId, {
        tier: currentTier,
        maxMissions,
        totalAvailable: allMissions.length
      });

      // Generate new daily mission selection
      selectedMissionIds = generateDailyMissionSelection(allMissions, userId, maxMissions);

      const now = new Date();
      const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Update user document with new daily mission selection
      await adminDb.collection('users').doc(userId).update({
        'dailyMissions.selectedMissionIds': selectedMissionIds,
        'dailyMissions.lastRefresh': now,
        'dailyMissions.nextRefresh': nextRefresh,
        updatedAt: now
      });

      console.log('✅ Daily missions refreshed:', {
        userId,
        selectedCount: selectedMissionIds.length,
        nextRefresh: nextRefresh.toISOString()
      });
    }

    // Filter missions to only include selected daily missions
    const dailyMissions = allMissions.filter(mission => 
      selectedMissionIds.includes(mission.id)
    );

    // Sort missions to maintain consistent order (by difficulty, then by creation date)
    dailyMissions.sort((a, b) => {
      const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
      const aDiff = difficultyOrder[a.difficulty];
      const bDiff = difficultyOrder[b.difficulty];
      
      if (aDiff !== bDiff) {
        return aDiff - bDiff;
      }
      
      // If same difficulty, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    console.log('📋 Daily missions served:', {
      userId,
      tier: currentTier,
      maxMissions,
      selectedCount: dailyMissions.length,
      missionTitles: dailyMissions.map(m => m.title)
    });

    return NextResponse.json({
      missions: dailyMissions,
      tier: currentTier,
      maxMissions,
      nextRefresh: userData.dailyMissions?.nextRefresh,
      isLimited: true // Indicates this is a subscription-limited selection
    });
  } catch (error) {
    console.error('Error fetching daily missions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
