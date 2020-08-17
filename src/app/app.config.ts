import { InjectionToken } from '@angular/core';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const FIREBASE_CONFIG = new InjectionToken<FirebaseConfig>(
  'firebase.config'
);
