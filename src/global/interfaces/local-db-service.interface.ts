
import IDataItem from "./data-item.interface";
import CollectionNames from '../enums/collection-names.enum';
import { Subject } from 'rxjs';


export default interface ILocalDbService{
  setup(): Promise<void>
  dataUpdate$: Subject<CollectionNames>
  addItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>
  updateItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>
  deleteItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>
  getDataById<T extends IDataItem>(id: string, collectionName: CollectionNames): Promise<T>
  getUpdatedDataItemsSinceClientLastConnectedToRemoteDb(collectionName: CollectionNames, dateClientLastConnectedToRemoteDb: Date)
  hasNeverConnectedToRemoteDbBefore(): Promise<boolean>
}