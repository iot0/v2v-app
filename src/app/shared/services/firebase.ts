/// <reference types="firebase" />

import { Injectable, Inject } from '@angular/core';
import { Observable, from, combineLatest } from 'rxjs';
import { map, mergeMap, shareReplay, catchError } from 'rxjs/operators';
import { FIREBASE_CONFIG, FirebaseConfig } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  init$: Observable<{ app: firebase.app.App; firebase: any }>;
  messaging$: Observable<firebase.messaging.Messaging>;

  constructor(@Inject(FIREBASE_CONFIG) private config: FirebaseConfig) {
    this.init$ = this.init();
    this.messaging$ = this.initMessaging();
  }

  private init(): Observable<{ app: firebase.app.App; firebase: any }> {
    const app$ = from(import('firebase/app'));
    const auth$ = from(import('firebase/auth'));
    const firestore$ = from(import('firebase/firestore'));

    return combineLatest(app$, auth$, firestore$).pipe(
      map(([firebase, auth]) => {
        const app = firebase.apps[0] || firebase.initializeApp(this.config);
        return { firebase, app };
      }),
      shareReplay(1)
    );
  }

  private initMessaging(): Observable<firebase.messaging.Messaging> {
    const messaging$ = from(import('firebase/messaging'));

    return combineLatest(this.init$, messaging$).pipe(
      map(([{ app, firebase }]) => {
        console.count('[initMessaging] loaded');
        const messaging = app.messaging();
        // const messaging = firebase.messaging();
        // messaging.usePublicVapidKey(FIREBASE_CONFIG.vapidKey);
        return messaging;
      }),
      shareReplay(1)
    );
  }

  notifications$: Observable<any> = combineLatest(this.init$).pipe(
    map(([{ app, firebase }]) => {
      console.count('[initMessaging] loaded');
      // const messaging = app.messaging();
      const messaging = firebase.notifications();
      return messaging;
    }),
    shareReplay(1)
  );

  set(collectionName, docId, data) {
    const timestamp = new Date().getTime();
    return this.init$.pipe(
      mergeMap(({ app }) => {
        const ref = app.firestore().collection(collectionName).doc(docId);

        return ref.set(
          {
            ...data,
            updatedAt: timestamp,
          },
          { merge: true }
        );
      })
    );
  }
  getDocument(collectionName: string, docId: string): Observable<any> {
    return this.init$.pipe(
      mergeMap(({ app }) => {
        const ref = app.firestore().collection(collectionName).doc(docId);

        return this.doc$(ref);
      })
    );
  }
  col$(ref) {
    return new Observable((obs) => {
      let unsubscribe = ref.onSnapshot(
        function (querySnapshot) {
          let datas = [];
          querySnapshot.forEach((x) => {
            datas.push({ id: x.id, ...x.data() });
          });
          obs.next(datas);
        },
        function (error) {
          obs.error(error);
        }
      );
      return unsubscribe;
    });
  }
  doc$(ref) {
    return new Observable((obs) => {
      let unsubscribe = ref.onSnapshot(
        function (doc) {
          let data = null;
          if (doc.exists) {
            data = { id: doc.id, ...doc.data() };
          }
          obs.next(data);
        },
        function (error) {
          obs.error(error);
        }
      );
      return unsubscribe;
    });
  }
  add(collectionName, data) {
    const timestamp = new Date().getTime();
    return this.init$.pipe(
      mergeMap(({ app }) => {
        const ref = app.firestore().collection(collectionName);
        return ref.add({
          ...data,
          updatedAt: timestamp,
          createdAt: timestamp,
        });
      })
    );
  }
  load(
    collectionName: string,
    applyCondition?: (
      ref: firebase.firestore.CollectionReference<
        firebase.firestore.DocumentData
      >
    ) => firebase.firestore.Query<firebase.firestore.DocumentData>
  ) {
    return this.init$.pipe(
      mergeMap(({ app }) => {
        const ref = app.firestore().collection(collectionName);

        return this.col$(applyCondition ? applyCondition(ref) : ref);
      })
    );
  }
}
