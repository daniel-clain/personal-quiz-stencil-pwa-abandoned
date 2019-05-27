import IDataItem from "../../global/interfaces/data-item.interface";
import { User, firestore } from "firebase";
import firebase from "firebase/app";
import 'firebase/firestore'
import { AuthService } from "../auth-service/auth.service";
import IRemoteDbService from "../../global/interfaces/remote-db-service.interface";
import FirestoreDocId from "../../global/types/firestore-doc-id.type";
import CollectionNames from '../../global/enums/collection-names.enum';



export default class RemoteDbService implements IRemoteDbService{

  private firestore: firestore.Firestore
  private user: User
  
  constructor(private authService: AuthService){
    this.setup()
  }

  setup(){
    this.firestore = firebase.firestore()
    this.authService.user$.subscribe(
      (user: User) => this.user = user
    )
  }

  getUserCollection(): firestore.DocumentReference{
    return this.firestore.collection('Users').doc(this.user.uid)
  }

  getUpdatedDataItemsSinceClientLastConnectedToRemoteDb(collectionName: CollectionNames, dateClientLastConnectedToFirestore: Date): Promise<IDataItem[]>{
    const dataCollection: firestore.CollectionReference  = this.getUserCollection().collection(collectionName.toString())
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
        const data = snapshot.data()
        data.dateLastUpdated = data.dateLastUpdated.toDate()
        if(collectionName == 'Questions' && data.dateLastAsked){
          data.dateLastUpdated = data.dateLastAsked.toDate()
        }
        return {...data, id: snapshot.id} as IDataItem
      })
    })
  }

  
  async getDataById<T extends IDataItem>(id: string, collectionName: CollectionNames): Promise<T> {
    const collection: firestore.CollectionReference = await this.getUserCollection().collection(collectionName.toString())
    return collection.doc(id).get()
    .then((documentSnapshot: firestore.DocumentSnapshot) => {
      const data = documentSnapshot.data()
      if(!data.dateLastUpdated){
        const msg = 'got data by id but returned document had no dateLastUpdated field, returning null'
        console.log(msg, data, documentSnapshot.id);
        alert(msg)
        return null
      }
      data.dateLastUpdated = data.dateLastUpdated.toDate()
      if(collectionName == 'Questions' && data.dateLastAsked){
        data.dateLastUpdated = data.dateLastAsked.toDate()
      }
      return {...data, id: documentSnapshot.id} as T
    })
  }

  async addItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<FirestoreDocId>{
    const collection: firestore.CollectionReference = await this.getUserCollection().collection(collectionName.toString())
    const documentReference: firestore.DocumentReference = await collection.add(data)
    const id: FirestoreDocId = documentReference.id
    data.id = id
    this.updateItem<T>(data, collectionName)
    return Promise.resolve(id)
  }

  async updateItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    const collection: firestore.CollectionReference = await this.getUserCollection().collection(collectionName.toString())
    return collection.doc(data.id).update(data)
  }

  async deleteItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    const collection: firestore.CollectionReference = await this.getUserCollection().collection(collectionName.toString())
    return collection.doc(data.id).delete()
  }

  
}
