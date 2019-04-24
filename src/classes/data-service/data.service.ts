import IQuestion from '../../interfaces/question.interface';
import { Observable } from 'rxjs'
import firebaseApp from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import { FirebaseFirestore  } from '@firebase/firestore-types'

export default class DataService{

  private static singletonInstance: DataService

  private firebaseConfig = {
    apiKey: "AIzaSyB4ffPYSF_0sgjQJXt-GcnE0ifTBof4yTI",
    authDomain: "personalquiz-93810.firebaseapp.com",
    databaseURL: "https://personalquiz-93810.firebaseio.com",
    projectId: "personalquiz-93810",
    storageBucket: "personalquiz-93810.appspot.com",
    messagingSenderId: "1066599785491"
  }

  private firestore: FirebaseFirestore
  private auth: firebase.auth.Auth

  connected: Observable<boolean>

  constructor(){
    console.log('doing', firebaseApp);
    const firebase = firebaseApp.initializeApp(this.firebaseConfig)

    console.log('firebase', firebase);


    this.firestore = firebase.firestore()
    console.log(this.firestore);

    this.auth = firebase.auth()
    console.log('auth: ', this.auth);

    this.showSignIn()
    
    


  }

  showSignIn(){
    this.auth.signInWithPopup(new firebaseApp.auth.FacebookAuthProvider())

  }

  
  getQuestions(): IQuestion[]{
    const questions: IQuestion[] =  [
      {
        id: 'x',
        value: 'x',
        correctAnswer: 'x',
        correctnessRating: 5,
        dateLastAsked: new Date(),
        dateLastUpdated: new Date(),
        tags: []
      }
    ]
    return questions
  }


  public static getSingletonInstance(): DataService {
    if(!this.singletonInstance){
      this.singletonInstance = new DataService()
    }
    return this.singletonInstance
  }


}
