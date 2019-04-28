import IQuestion from '../../interfaces/question.interface';
import 'firebase/firestore'
import firebase, { User, firestore } from 'firebase';
import CollectionNames from '../../types/collection-names'
import ITag from '../../interfaces/tag.interface';
import { AuthService } from '../auth-service/auth.service';

export default class DataService{

  private static singletonInstance: DataService
  private localDatabase: IDBDatabase
  private firebaseUser: User
  private authService: AuthService
  firestore: firestore.Firestore

  constructor(){
    DataService.singletonInstance = this
    this.setup()
  }


  setup(){
    firebase.initializeApp(
      {
        apiKey: "AIzaSyB4ffPYSF_0sgjQJXt-GcnE0ifTBof4yTI",
        authDomain: "personalquiz-93810.firebaseapp.com",
        databaseURL: "https://personalquiz-93810.firebaseio.com",
        projectId: "personalquiz-93810",
        storageBucket: "personalquiz-93810.appspot.com",
        messagingSenderId: "1066599785491"
      }
    )
    this.firestore = firebase.firestore()
    this.authService = AuthService.getSingletonInstance()
    this.authService.user$.subscribe(
      (user: User) => this.firebaseUser = user
    )
    this.getLocalDatabase()

  }

  async getQuestions(): Promise<IQuestion[]>{
    const localDatabase: IDBDatabase = await this.getLocalDatabase()
    return new Promise((resolve) => {
      localDatabase
      .transaction(['Questions'], 'readwrite')
      .objectStore('Questions')
      .getAll()
      .onsuccess = ((event: Event) => {
        const request: any = event.target
        const questions: IQuestion[] = request.result
        console.log(questions)
        resolve(questions)
      })
    }); 
  }

  async getTags(): Promise<ITag[]>{
    const localDatabase: IDBDatabase = await this.getLocalDatabase()
    return new Promise((resolve) => {
      localDatabase
      .transaction(['Tags'], 'readwrite')
      .objectStore('Tags')
      .getAll()
      .onsuccess = ((event: Event) => {
        const request: any = event.target
        const tags: ITag[] = request.result
        console.log(tags)
        resolve(tags)
      })
    })
  
  }
  
  async add(data: any, collectionName: CollectionNames){
    data.id = `temp${new Date().getTime().toString()}`
    data.dateLastUpdated = new Date()
    const subscription = this.authService.user$.subscribe(
      async (user: User) => {
        subscription.unsubscribe()
        if(user){
          const collection: firestore.CollectionReference = await this.firestore.collection('Users').doc(user.uid).collection(collectionName)
          const documentReference: firestore.DocumentReference = await collection.add(data)
          data.id = documentReference.id
          collection.doc(data.id).update(data)
        }


        const localDatabase: IDBDatabase = await this.getLocalDatabase()
        return new Promise((resolve) => {
          localDatabase
          .transaction([collectionName], 'readwrite')
          .objectStore(collectionName)
          .add(data)
          .onsuccess = (e => {
            console.log('success: ', e) 
            resolve('success')
          })
        })
      }
    )
    
  }

  async update(data: any, collectionName: CollectionNames){
   
    
  }

  async delete(data: any, collectionName: CollectionNames){
   
    
  }




  getLocalDatabase(): Promise<IDBDatabase>{
    if(this.localDatabase){
      return Promise.resolve(this.localDatabase)
    }
    else {
      return new Promise((resolve) => {
        const request = indexedDB.open('Personal Quiz Data')
        request.onupgradeneeded = () => {
          request.result.createObjectStore("Questions", { keyPath: "id" });
          request.result.createObjectStore("Tags", { keyPath: "id" });
        }
        request.onsuccess = () => {
          this.localDatabase = request.result
          resolve(this.localDatabase)
        }
      });
    }
    
  }


  public static getSingletonInstance(): DataService {
    if(!this.singletonInstance){
      new DataService()
    }
    return this.singletonInstance
  }


}
