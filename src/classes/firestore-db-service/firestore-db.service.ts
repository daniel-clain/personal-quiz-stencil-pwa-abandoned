import IDataItem from "../../global/interfaces/data-item.interface";
import CollectionNames from "../../global/types/collection-names";
import { User, firestore } from "firebase";
import firebase from "firebase/app";
import 'firebase/firestore'
import { AuthService } from "../auth-service/auth.service";
import IFirestoreDbService from "../../global/interfaces/firestore-db-service.interface";
import FirestoreDocId from "../../global/types/firestore-doc-id.type";



export default class FirestoreDbService implements IFirestoreDbService{

  private firestore: firestore.Firestore
  
  private _user: User
  
  constructor(private authService: AuthService){
    this.setup()
  }

  setup(): Promise<void>{
    
    
    this.firestore = firebase.firestore()

    this.authService.user$.subscribe(
      (user: User) => this._user = user
    )
    return Promise.resolve()
    
  }

  getUserCollection(): firestore.DocumentReference{
    if(!this._user) debugger;
    return this.firestore.collection('Users').doc(this._user.uid)
  }

  
  async getDataById<T extends IDataItem>(id: string, collectionName: CollectionNames): Promise<T> {
    const collection: firestore.CollectionReference = await this.getUserCollection().collection(collectionName)
    return collection.doc(id).get()
    .then((documentSnapshot: firestore.DocumentSnapshot) => {
      return {...documentSnapshot.data(), id: documentSnapshot.id} as T
    })
  }

  async addItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<FirestoreDocId>{
    const collection: firestore.CollectionReference = await this.getUserCollection().collection(collectionName)
    const documentReference: firestore.DocumentReference = await collection.add(data)
    const id: FirestoreDocId = documentReference.id
    data.id = id
    this.updateItem<T>(data, collectionName)
    return Promise.resolve(id)
  }

  async updateItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    const collection: firestore.CollectionReference = await this.getUserCollection().collection(collectionName)
    return collection.doc(data.id).update(data)
  }

  async deleteItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    const collection: firestore.CollectionReference = await this.getUserCollection().collection(collectionName)
    return collection.doc(data.id).delete()
  }

  async getNewData<T extends IDataItem>(collection: CollectionNames, dateClientLastConnectedToFirestore: Date): Promise<T[]>{

    const dataCollection: firestore.CollectionReference  = this.getUserCollection().collection(collection)
    let queryPromise: Promise<firestore.QuerySnapshot>
    if(dateClientLastConnectedToFirestore != null){
      queryPromise = dataCollection.where('dateLastUpdated', '>', dateClientLastConnectedToFirestore).get()
    } else {
      queryPromise = dataCollection.get()
    }
    return queryPromise
    .then((querySnapshot: firestore.QuerySnapshot) => querySnapshot.docs)
    .then((queryDocumentSnapshot: firestore.QueryDocumentSnapshot[]) => {
      return queryDocumentSnapshot.map((snapshot: firestore.QueryDocumentSnapshot) => {
        return {...snapshot.data(), id: snapshot.id} as T
      })
    })


  }
  
}
