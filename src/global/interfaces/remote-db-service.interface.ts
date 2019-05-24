import FirestoreDocId from "../types/firestore-doc-id.type";
import IDataItem from "./data-item.interface";
import { firestore } from "firebase";
import CollectionNames from '../enums/collection-names.enum';


export default interface IRemoteDbService{
  setup()
  getUserCollection(): firestore.DocumentReference
  addItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<FirestoreDocId>
  updateItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>
  deleteItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>
  getUpdatedDataItemsSinceClientLastConnectedToRemoteDb(collectionName: CollectionNames, dateClientLastConnectedToFirestore: Date): Promise<IDataItem[]>
  getDataById<T extends IDataItem>(id: string, collectionName: CollectionNames): Promise<T>
}