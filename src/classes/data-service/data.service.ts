import IQuestion from '../../interfaces/question.interface';
import 'firebase/firestore'
import firebase from 'firebase';
import CollectionNames from '../../types/collection-names'
import { Observable, of } from 'rxjs';

export default class DataService{

  private static singletonInstance: DataService
  private localDatabase: IDBDatabase

  private firebaseConfig = {
    apiKey: "AIzaSyB4ffPYSF_0sgjQJXt-GcnE0ifTBof4yTI",
    authDomain: "personalquiz-93810.firebaseapp.com",
    databaseURL: "https://personalquiz-93810.firebaseio.com",
    projectId: "personalquiz-93810",
    storageBucket: "personalquiz-93810.appspot.com",
    messagingSenderId: "1066599785491"
  }

  constructor(){
    firebase.initializeApp(this.firebaseConfig)
    const request = indexedDB.open('Personal Quiz Data')
      request.onupgradeneeded = () => {
        console.log('upgrade is called');
        request.result.createObjectStore("Questions", { keyPath: "id" });
        request.result.createObjectStore("Tags", { keyPath: "id" });
      }
      request.onsuccess = () => {
        this.localDatabase = request.result
      }
  }

  


  
  getQuestions(): Observable<IQuestion[]>{
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
    return of(questions)
  }


  public static getSingletonInstance(): DataService {
    if(!this.singletonInstance){
      this.singletonInstance = new DataService()
    }
    return this.singletonInstance
  }

  add(data: any, collection: CollectionNames){
    data.id = '123'
    const request: IDBRequest = this.localDatabase
    .transaction([collection], 'readwrite')
    .objectStore(collection)
    .add(data)

    request
    .onsuccess = (e => console.log('success: ', e))
    
  }


/*   update(data: any, collection: CollectionNames){
    
  }


  delete(data: any, collection: CollectionNames){
    
  } */


}
