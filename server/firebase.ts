import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

// console.log("Loaded ENV Variables:");
// console.log("VITE_FIREBASE_PROJECT_ID:", process.env.VITE_FIREBASE_PROJECT_ID);
// console.log("VITE_FIREBASE_PRIVATE_KEY:", process.env.VITE_FIREBASE_PRIVATE_KEY ? "Loaded" : "Missing");
// console.log("VITE_FIREBASE_CLIENT_EMAIL:", process.env.VITE_FIREBASE_CLIENT_EMAIL);

// Add more robust error handling for Firebase configuration
const requiredEnvVars = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY,
  clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing Firebase configuration: ${missingVars.join(', ')}. Ensure all Firebase environment variables are set.`);
}

let firestoreDb;

try {
  const app = initializeApp({
    credential: cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
    }),
  });

  firestoreDb = getFirestore(app);
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw error;
}

export const db = firestoreDb;