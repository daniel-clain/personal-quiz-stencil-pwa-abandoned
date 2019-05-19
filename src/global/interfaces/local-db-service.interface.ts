
import IDataItem from "./data-item.interface";
import CollectionNames from "../types/collection-names";


export default interface ILocalDbService{
  setup()
  addItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>
  updateItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>
  deleteItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>
  getNewData<T extends IDataItem>(collectionName: CollectionNames, dateClientLastConnectedToFirestore: Date): Promise<T[]>
  getDataById<T extends IDataItem>(id: string, collectionName: CollectionNames): Promise<T>
  setInitialDateLastConnectedToFirestoreField(openDbRequest: IDBOpenDBRequest)
}