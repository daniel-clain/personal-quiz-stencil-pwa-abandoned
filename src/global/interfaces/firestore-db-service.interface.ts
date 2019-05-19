import FirestoreDocId from "../types/firestore-doc-id.type";
import IDataItem from "./data-item.interface";
import CollectionNames from "../types/collection-names";
import { firestore } from "firebase";


export default interface IFirestoreDbService{
  setup()
  getUserCollection(): firestore.DocumentReference
  addItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<FirestoreDocId>
  updateItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>
  deleteItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>
  getNewData<T extends IDataItem>(collectionName: CollectionNames, dateClientLastConnectedToFirestore: Date): Promise<T[]>
  getDataById<T extends IDataItem>(id: string, collectionName: CollectionNames): Promise<T>
}