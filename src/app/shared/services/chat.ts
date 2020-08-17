import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase';
import { AuthService } from './auth';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  collectionName = 'Messages';
  constructor(private firestore: FirebaseService, private auth: AuthService) {}

  async send(message) {
    const user = await this.auth.user$.pipe(take(1)).toPromise();
    if (user) {
      return this.firestore
        .add(this.collectionName, {
          displayName: user.displayName,
          photoURL: user.photoURL,
          text: message,
          uid: user.uid,
        })
        .toPromise();
    }
  }
  get(): Observable<any> {
    return this.firestore.load(this.collectionName);
  }
}
