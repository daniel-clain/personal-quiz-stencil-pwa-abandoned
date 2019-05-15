
import {Observable} from 'rxjs';
import firebaseApp from 'firebase/app'
import { User } from 'firebase';
import firebase from 'firebase';


export class AuthService{

  user$: Observable<User>
  private auth: firebaseApp.auth.Auth
  

  constructor(){
    this.auth = firebase.auth()
    this.user$ = Observable.create(observer => this.auth.onAuthStateChanged(observer))
  }

  login(){
    this.auth.signInWithPopup(new firebaseApp.auth.FacebookAuthProvider())
  }

  logout(){
    this.auth.signOut()
  }

}