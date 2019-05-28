
import {Observable} from 'rxjs';
import { User } from 'firebase';
import firebase from "firebase/app";
import "firebase/auth";
import { IAuthService } from '../../global/interfaces/auth-service.interface';

export class AuthService implements IAuthService{

  user$: Observable<User>
  private auth: firebase.auth.Auth

  constructor(){
    this.setup()
  }

  setup(){    
    this.auth = firebase.auth()
    this.user$ = Observable.create(observer => this.auth.onAuthStateChanged(observer))
  }

  login(){
    this.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
  }

  logout(){
    this.auth.signOut()
  }

}
