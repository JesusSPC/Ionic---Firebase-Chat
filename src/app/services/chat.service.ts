import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface User {
  uid: string;
  email: string;
}

export interface Message {
  createdAt: firebase.firestore.FieldValue;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  currentUser: User = null;

  constructor(
    private aFAuth: AngularFireAuth,
    private aFStore: AngularFirestore
  ) {
    this.aFAuth.onAuthStateChanged(user => {
      console.log('Changed: ', user);
      this.currentUser = user;
    });
  }

  async signUp({ email, password }) {
    const credentials = await this.aFAuth.createUserWithEmailAndPassword(
      email,
      password
    );

    console.log('Result: ', credentials);
    const uid = credentials.user.uid;

    return this.aFStore.doc(
      `users/${uid}`
    ).set({
      uid,
      email: credentials.user.email
    });
  }

  signIn({ email, password }) {
    return this.aFAuth.signInWithEmailAndPassword(email, password);
  }

  signOut() {
    return this.aFAuth.signOut();
  }

  addChatMessage(msg: string) {
    return this.aFStore.collection('messages').add({
      msg,
      from: this.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  getChatMessages() {
    let users = [];

    return this.getUsers().pipe(
      switchMap(res => {
        users = res;
        console.log('all users: ', users);
        return this.aFStore.collection('messages', ref => ref.orderBy('createdAt')).valueChanges({idField: 'id'}) as Observable<Message[]>;
      }),
      map(messages => {
        for (const m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser.uid === m.from;
        }
        console.log('all messages: ', messages);
        return messages;
      })
    );
  }

  getUsers() {
    return this.aFStore.collection('users').valueChanges({ idField: 'uid' }) as Observable<User[]>;
  }

  getUserForMsg(msgFromId, users: User[]): string {
    for (const user of users) {
      if (user.uid === msgFromId) {
        return user.email;
      }
    }
    return 'Deleted';
  }
}
