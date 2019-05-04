import IQuestion from '../../interfaces/question.interface';
import 'firebase/firestore'
import firebase, { User, firestore } from 'firebase';
import CollectionNames from '../../types/collection-names'
import ITag from '../../interfaces/tag.interface';
import { AuthService } from '../auth-service/auth.service';
import { Subject } from 'rxjs';
import DataItem from '../../interfaces/data-item.interface';
import ClientData from './../../interfaces/client-data.interface'

export default class DataService{

  private static singletonInstance: DataService
  private localDatabase: IDBDatabase
  connectionSubject: Subject<boolean> = new Subject()
  connected: boolean
  private _user: User
  private authService: AuthService
  firestore: firestore.Firestore

  constructor(){
    DataService.singletonInstance = this
    this.setup()
  }




  async setup(){

    this.getLocalDatabase()
    
    firebase.initializeApp(
      {
        apiKey: 'AIzaSyB4ffPYSF_0sgjQJXt-GcnE0ifTBof4yTI',
        authDomain: 'personalquiz-93810.firebaseapp.com',
        databaseURL: 'https://personalquiz-93810.firebaseio.com',
        projectId: 'personalquiz-93810',
        storageBucket: 'personalquiz-93810.appspot.com',
        messagingSenderId: '1066599785491'
      }
    )
    this.firestore = firebase.firestore()
    this.authService = AuthService.getSingletonInstance()
    this.authService.user$.subscribe(
      (user: User) => {
        this._user = user
        this.connectionSubject.next(!!user)
        if(!!user){
          this.onConnectionToFirestore()
        } 
      }
    )

  }

  onConnectionToFirestore(){
    this.reconcileFirestoreAndLocalData()
  }




  async reconcileFirestoreAndLocalData(){
      const firestoreQuestions: any = await this.getNewDataFromFirestore('Questions')
      console.log('firestoreQuestions :', firestoreQuestions);
      /* localData = getLocalData where localData.dateLastUpdated > localDb.dateLastConnectedToFirestore

      reconcileFirestoreAndLocalData()
      updateLocalDb()
      updateFirestore()
      updateDateClientLastConnectedToFirestore() */
  }


  get user(): Promise<User>{
    return new Promise((resolve) => {
      if(this._user){
        resolve(this._user)
      }
      else {
        const subscription = this.authService.user$.subscribe(
          (user: User) => {
            subscription.unsubscribe()
            this._user = user
            resolve(this._user)
          }
        )
      }
    });
  }

  async getNewDataFromLocalDb(): Promise<any>{

  }

  async getNewDataFromFirestore(collection: CollectionNames): Promise<any>{
    const dateClientLastConnectedToFirestore: Date = await this.getDataFromLocalDb('client', 'Client Data').then((data: ClientData) => data.dateClientLastConnectedToFirestore)
    console.log('dateLastConnectedToDB: ', dateClientLastConnectedToFirestore);

    const userDoc: firestore.DocumentReference = this.userCollection

    if(dateClientLastConnectedToFirestore){
      return userDoc.collection(collection).where('dateLastUpdated', '>', dateClientLastConnectedToFirestore).get()
      .then((snapshots: firestore.QuerySnapshot) => {
        console.log('query snapshots ', snapshots)
        return snapshots.docs.map((snapshot: firestore.QueryDocumentSnapshot) => {
          const question: IQuestion = {...snapshot.data(), id: snapshot.id}
          return snapshot.data()
        })
      })

    }
    else {
      return userDoc.collection('Questions').get()
      .then((snapshots: firestore.QuerySnapshot) => {
        console.log('all snapshots ', snapshots)
        return snapshots

      })
    }

  }

  updateLocalDbWithFirebaseData(){

  }

  get userCollection(): firestore.DocumentReference{
    if(!this._user) debugger;
    return this.firestore.collection('Users').doc(this._user.uid)
  }

  async getDataFromLocalDb(id: string, collectionName: CollectionNames): Promise<any>{
    const localDatabase: IDBDatabase = await this.getLocalDatabase()

    const request: IDBRequest = localDatabase
      .transaction([collectionName], 'readwrite')
      .objectStore(collectionName)
      .get(id)

    return new Promise((resolve, reject) => {
      request.onsuccess = ((event: Event) => {
        const request: any = event.target
        const result: any = request.result
        console.log(id)
        resolve(result)
      })
      request.onerror = error => reject(error)
    });

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

  updateDateClientLastConnectedToFirestore(){
    const updatedClientData: ClientData = {
      id: 'client',
      dateClientLastConnectedToFirestore: new Date()
    }
    this.updateItemInLocalDB(updatedClientData, 'Client Data')

  }

  async addItemInLocalDB(data: any, collectionName: CollectionNames): Promise<any>{
    if(!data.id) debugger
    const localDatabase: IDBDatabase = await this.getLocalDatabase()

    const request: IDBRequest = localDatabase
      .transaction([collectionName], 'readwrite')
      .objectStore(collectionName)
      .add(data)

    return new Promise((resolve, reject) => {
      request.onsuccess = ((event: Event) => {
        const request: any = event.target
        const result: any = request.result
        console.log(`updated ${collectionName} with ${data}`)
        resolve(result)
      })
      request.onerror = error => reject(error)
    });
  }

  async updateItemInLocalDB(data: any, collectionName: CollectionNames): Promise<any>{
    const localDatabase: IDBDatabase = await this.getLocalDatabase()

    const request: IDBRequest = localDatabase
      .transaction([collectionName], 'readwrite')
      .objectStore(collectionName)
      .put(data)

    return new Promise((resolve, reject) => {
      request.onsuccess = ((event: Event) => {
        const request: any = event.target
        const data: any = request.result
        console.log(`updated ${collectionName} with ${data}`)
        resolve(data)
      })
      request.onerror = error => reject(error)
    });
  }

  async deleteItemInLocalDB(id: string, collectionName: CollectionNames): Promise<any>{
    const localDatabase: IDBDatabase = await this.getLocalDatabase()

    const request: IDBRequest = localDatabase
      .transaction([collectionName], 'readwrite')
      .objectStore(collectionName)
      .delete(id)

    return new Promise((resolve, reject) => {
      request.onsuccess = (() => {
        console.log(`deleted ${collectionName} ${id}`)
        resolve()
      })
      request.onerror = error => reject(error)
    });
  }

  async addItemInFirestore(data: DataItem, collectionName: CollectionNames): Promise<string>{
    const user: User = await this.user
    const collection: firestore.CollectionReference = await this.firestore.collection('Users').doc(user.uid).collection(collectionName)
    const documentReference: firestore.DocumentReference = await collection.add(data)
    data.id = documentReference.id
    this.updateItemInFirestore(data, collectionName)
    return Promise.resolve(data.id)
  }

  async updateItemInFirestore(data: DataItem, collectionName: CollectionNames): Promise<any>{
    const user: User = await this.user
    const collection: firestore.CollectionReference = await this.firestore.collection('Users').doc(user.uid).collection(collectionName)
    return collection.doc(data.id).update(data)
  }


  async deleteItemInFirestore(id: string, collectionName: CollectionNames): Promise<any>{
    const user: User = await this.user
    const collection: firestore.CollectionReference = await this.firestore.collection('Users').doc(user.uid).collection(collectionName)
    return collection.doc(id).delete()
  }
  
  async add(data: DataItem, collectionName: CollectionNames): Promise<any>{
    data.dateLastUpdated = new Date()
    let newId
    let tempId
    if(this.connected){
      newId = await this.addItemInFirestore(data, collectionName)
      this.updateDateClientLastConnectedToFirestore()
    } else {
      tempId = `temp${new Date().getTime().toString()}`
    }
    const localDbId = this.connected ? newId : tempId
    data.id = localDbId
    return this.addItemInLocalDB(data, collectionName)
    
  }


  async update(data: DataItem, collectionName: CollectionNames){
    data.dateLastUpdated = new Date()
    if(this.connected){
      this.updateItemInFirestore(data, collectionName)
      this.updateDateClientLastConnectedToFirestore()
    }

    this.updateItemInLocalDB(data, collectionName)
    
  }

  async delete(data: DataItem, collectionName: CollectionNames){
    if(this.connected){
      this.deleteItemInFirestore(data.id, collectionName)
      this.updateDateClientLastConnectedToFirestore()
    }

    this.deleteItemInLocalDB(data.id, collectionName)
    
  }




  getLocalDatabase(): Promise<IDBDatabase>{
    if(this.localDatabase){
      return Promise.resolve(this.localDatabase)
    }
    else {
      return new Promise((resolve) => {
        const request:IDBOpenDBRequest = indexedDB.open('Personal Quiz Data')
        request.onupgradeneeded = () => {
          request.result.createObjectStore('Questions', { keyPath: 'id' });
          request.result.createObjectStore('Tags', { keyPath: 'id' });
          request.result.createObjectStore('Client Data', { keyPath: 'id' });

          const emptyClientData: ClientData = {
            id: 'client',
            dateClientLastConnectedToFirestore: null
          }

          const request2 = request.transaction
          .objectStore('Client Data')
          .add(emptyClientData)

          request2.onsuccess = (() => {
            console.log('empty client data obj initialized')
          })

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
