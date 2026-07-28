import { db, doc, setDoc } from '../lib/firebase';

export interface AuthEventPayload {
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  eventType: 'login_success' | 'login_failure' | 'signup' | 'password_reset_requested' | 'logout';
  status?: 'success' | 'failed' | 'pending';
  details?: string;
}

export interface AuthLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  eventType: 'login_success' | 'login_failure' | 'signup' | 'password_reset_requested' | 'logout';
  status: 'success' | 'failed' | 'pending';
  details?: string;
  timestamp: string;
  userAgent?: string;
}

/**
 * Helper function to log user authentication events and login timestamps to Firestore,
 * allowing the Super Admin to monitor login progress for all users.
 */
export const logAuthEvent = async (payload: AuthEventPayload): Promise<void> => {
  try {
    const timestamp = new Date().toISOString();
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logRef = doc(db, 'auth_logs', logId);

    const logData: AuthLog = {
      id: logId,
      userId: payload.userId || 'anonymous',
      userEmail: payload.userEmail || '',
      userName: payload.userName || '',
      userRole: payload.userRole || 'guest',
      eventType: payload.eventType,
      status: payload.status || 'success',
      details: payload.details || '',
      timestamp,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    };

    await setDoc(logRef, logData);

    // If login was successful and we have a valid userId, update lastLoginAt on the user's document
    if (payload.userId && payload.userId !== 'anonymous' && payload.eventType === 'login_success') {
      try {
        const userRef = doc(db, 'users', payload.userId);
        await setDoc(userRef, { 
          lastLoginAt: timestamp,
          lastActiveAt: timestamp,
        }, { merge: true });
      } catch (err) {
        console.warn('Could not update user lastLoginAt timestamp:', err);
      }
    }
  } catch (err) {
    console.error('Failed to record auth event log to Firestore:', err);
  }
};
