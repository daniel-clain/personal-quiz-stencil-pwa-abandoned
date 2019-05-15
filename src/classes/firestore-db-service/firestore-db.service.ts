import DataItem from "../../interfaces/data-item.interface";
import CollectionNames from "../../types/collection-names";
import { User, firestore } from "firebase";
import firebase from "firebase";
import { AuthService } from "../auth-service/auth.service";



export default class FirestoreDbService{

  private firestore: firestore.Firestore
  private authService: AuthService
  private _user: User
  
  constructor(){
    this.setup()
  }

  setup(){
    
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

    this.authService.user$.subscribe(
      (user: User) => this._user = user
    )
    
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

  
  getUserCollection(): firestore.DocumentReference{
    if(!this._user) debugger;
    return this.firestore.collection('Users').doc(this._user.uid)
  }
  

  async addItem(data: DataItem, collectionName: CollectionNames): Promise<string>{
    const user: User = await this.user
    const collection: firestore.CollectionReference = await this.firestore.collection('Users').doc(user.uid).collection(collectionName)
    const documentReference: firestore.DocumentReference = await collection.add(data)
    data.id = documentReference.id
    this.updateItem(data, collectionName)
    return Promise.resolve(data.id)
  }

  

  async updateItem(data: DataItem, collectionName: CollectionNames): Promise<any>{
    const user: User = await this.user
    const collection: firestore.CollectionReference = await this.firestore.collection('Users').doc(user.uid).collection(collectionName)
    return collection.doc(data.id).update(data)
  }


  async deleteItem(id: string, collectionName: CollectionNames): Promise<any>{
    const user: User = await this.user
    const collection: firestore.CollectionReference = await this.firestore.collection('Users').doc(user.uid).collection(collectionName)
    return collection.doc(id).delete()
  }

  async getNewData(collection: CollectionNames, dateClientLastConnectedToFirestore: Date): Promise<any[]>{

    const userDoc: firestore.DocumentReference = this.getUserCollection()

    return userDoc.collection(collection).where('dateLastUpdated', '>', dateClientLastConnectedToFirestore).get()
    .then((snapshots: firestore.QuerySnapshot) => {
      return snapshots.docs.map((snapshot: firestore.QueryDocumentSnapshot) => {
        const data = {...snapshot.data(), id: snapshot.id}
        return data
      })
    })

  }

  async getAllData(collection: CollectionNames): Promise<any>{
    const userDoc: firestore.DocumentReference = this.getUserCollection()
    return userDoc.collection(collection).get()
    .then((snapshots: firestore.QuerySnapshot) => {
      return snapshots.docs.map((snapshot: firestore.QueryDocumentSnapshot) => {
        const data = {...snapshot.data(), id: snapshot.id}
        return data
      })
    })
  }

  
}