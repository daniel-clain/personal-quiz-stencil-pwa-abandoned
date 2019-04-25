
import {Observable} from 'rxjs';
import firebaseApp from 'firebase/app'
import { User } from 'firebase';
import firebase from 'firebase';
import DataService from '../data-service/data.service';


export class AuthService{

  user$: Observable<User>
  private auth: firebaseApp.auth.Auth
  

  private static singletonInstance: AuthService

  constructor(){
    this.auth = firebase.auth()
    this.user$ = Observable.create(observer => this.auth.onAuthStateChanged(observer))
  }

  public static getSingletonInstance(): AuthService {
    if(!this.singletonInstance){
      DataService.getSingletonInstance()
      this.singletonInstance = new AuthService()
    }
    return this.singletonInstance
  }


  login(){
    this.auth.signInWithPopup(new firebaseApp.auth.FacebookAuthProvider())

  }

  logout(){
    this.auth.signOut()
  }

}