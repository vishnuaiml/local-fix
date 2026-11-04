/**
 * LocalFix: Firebase Firestore Integration Layer
 * Compliant with Firebase Integration Skill:
 * - Connection Validation (testConnection)
 * - Strict Error Handling (handleFirestoreError conforming to FirestoreErrorInfo)
 * - Realtime Listeners & Document Operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocFromServer,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './firebase.ts';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. Connection Validation as mandated by Firebase Skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[LocalFix Firestore] Client is offline or database initializing.');
      return false;
    }
    // Permissions error or non-existent doc is expected on test/connection and indicates active connection
    return true;
  }
}

// Fire connection test safely on module load
testConnection().catch(() => {});

// 2. User Profile Synchronization
export async function syncUserToFirestore(userData: {
  uid: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber?: string;
  department?: string;
}): Promise<void> {
  const userPath = `users/${userData.uid}`;
  try {
    await setDoc(
      doc(db, 'users', userData.uid),
      {
        uid: userData.uid,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        phoneNumber: userData.phoneNumber || '',
        accountStatus: 'active',
        department: userData.department || null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }
}

// 3. Providers Querying
export async function fetchApprovedProvidersFromFirestore() {
  const path = 'providers';
  try {
    const q = query(collection(db, path), where('verificationStatus', '==', 'approved'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// 4. Bookings Realtime Listener
export function subscribeToUserBookings(
  userId: string,
  userRole: 'customer' | 'provider',
  onUpdate: (bookings: any[]) => void,
  onError?: (err: any) => void
) {
  const path = 'bookings';
  const fieldName = userRole === 'customer' ? 'customerId' : 'providerId';
  const q = query(collection(db, path), where(fieldName, '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onUpdate(bookings);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
      onError?.(err);
    }
  );
}
