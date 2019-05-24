import IDataItem from "../../global/interfaces/data-item.interface";
import RemoteDbService from "../remote-db-service/remote-db.service";
import LocalDbService from "../local-db-service/local-db.service";
import FirestoreDocId from "../../global/types/firestore-doc-id.type";
import IConflictingDataItem from '../../global/interfaces/conflicting-data-item.interface';
import INonConflictingDataItems from '../../global/interfaces/non-conflicting-data-items.interface';
import CollectionNames from '../../global/enums/collection-names.enum';


export default class ReconcileDataService{

  constructor(private remoteDbService: RemoteDbService, private localDbService: LocalDbService,){}

  async synchronizeLocalAndRemoteData(): Promise<void>{
    const dateClientLastConnectedToRemoteDb: Date = await this.localDbService.getDateLastConnectedToRemoteDb()
    const collectionPromises: Promise<void>[] = []
    for(let key in CollectionNames){
      const collectionName: CollectionNames = CollectionNames[CollectionNames[key]]
      collectionPromises.push(
        Promise.all([
          this.localDbService.getUpdatedDataItemsSinceClientLastConnectedToRemoteDb(collectionName, dateClientLastConnectedToRemoteDb),
          this.remoteDbService.getUpdatedDataItemsSinceClientLastConnectedToRemoteDb(collectionName, dateClientLastConnectedToRemoteDb)
        ])
        .then(([localDataItems, remoteDataItems]) => {
          const conflictingDataItems: IConflictingDataItem[] = this.getConflictingDataItems(localDataItems, remoteDataItems)
          const nonConflictingDataItems: INonConflictingDataItems = this.getNonConflictingDataItems(localDataItems, remoteDataItems)
          return Promise.all([
            this.resolveConflictingDataItems(conflictingDataItems, collectionName),
            this.resolveNonConflictingDataItems(nonConflictingDataItems, collectionName)
          ])
        }).then(() => Promise.resolve())
      )
    }
      
    return Promise.all(collectionPromises)
    .then(() => this.localDbService.updateDateClientLastConnectedToFirestore())
    .then(() => console.log('all local and remote data has been synchronized'))
  }

  private getConflictingDataItems<T extends IDataItem>(localDataItems: T[], remoteDataItems: T[]): IConflictingDataItem[]{
    const conflictingDataItems: IConflictingDataItem[] = []
    localDataItems.forEach((localData: T) => {
      remoteDataItems.forEach((remoteData: T) => {
        if(remoteData.id == localData.id){
          conflictingDataItems.push({
            local: localData,
            remote: remoteData
          })
        }
      })
    })
    return conflictingDataItems
  }

  private getNonConflictingDataItems(localDataItems: IDataItem[], remoteDataItems: IDataItem[]): INonConflictingDataItems{
    const nonConflictingDataItems: INonConflictingDataItems = {
      local: [],
      remote: []
    }
    localDataItems.forEach((localData: IDataItem) => {
      if(!remoteDataItems.some((remoteData: IDataItem) => remoteData.id == localData.id)){
        nonConflictingDataItems.local.push(localData)
      }
    })
    
    remoteDataItems.forEach((remoteData: IDataItem) => {
      if(!localDataItems.some((localData: IDataItem) => localData.id == remoteData.id)){
        nonConflictingDataItems.remote.push(remoteData)
      }
    })
    return nonConflictingDataItems
  }

  private resolveConflictingDataItems(conflictingDataItems: IConflictingDataItem[], collectionName: CollectionNames){
    return Promise.all(conflictingDataItems.map((conflictingDataItem: IConflictingDataItem) => {
      const {local, remote} = conflictingDataItem
      if(local.dateLastUpdated > remote.dateLastUpdated){
        return this.remoteDbService.updateItem(local, collectionName)
      } 
      else {
        return this.localDbService.updateItem(remote, collectionName)
      }
    }))
  }

  private resolveNonConflictingDataItems(nonConflictingDataItems: INonConflictingDataItems, collectionName: CollectionNames){

    const dataAddedToLocalDbPromises: Promise<void>[] = nonConflictingDataItems.remote.map(
      (remoteDataItem: IDataItem) => {
        return this.localDbService.getDataById(remoteDataItem.id, collectionName)
        .then((localDataItem: IDataItem) => {
          if(localDataItem){
            console.log('replacing localDataItem with up to date remoteDataItem', localDataItem, remoteDataItem);
            this.localDbService.updateItem(remoteDataItem, collectionName)
          }
          else {
            console.log('remoteDataItem added since last connected, adding to local data', remoteDataItem);
            this.localDbService.addItem(remoteDataItem, collectionName)
          }
        })
      }
    )

    const dataAddedToFirestorePromises: Promise<void>[] = nonConflictingDataItems.local.map(
      (localDataItem: IDataItem) => {
        if(localDataItem.markedForDelete){
          if(!localDataItem.id.includes('temp')){
            this.remoteDbService.deleteItem(localDataItem, collectionName)
          }
          this.localDbService.deleteItem(localDataItem, collectionName)
        }else{
          if(localDataItem.id.includes('temp')){
            console.log('localDataItem added since last connected, adding to remote data', localDataItem);
            return this.remoteDbService.addItem({...localDataItem, id: null}, collectionName)
            .then((newId: FirestoreDocId) => {
              const oldItem: IDataItem = {...localDataItem}
              const updatedDataItem: IDataItem = {...localDataItem, id: newId}
              return this.localDbService.addItem(updatedDataItem, collectionName)
              .then(() => this.localDbService.deleteItem(oldItem, collectionName))
            })
          }
          else{  
            return this.remoteDbService.getDataById(localDataItem.id, collectionName)
            .then((remoteDataItem: IDataItem) => {
              if(remoteDataItem && remoteDataItem.dateLastUpdated){
                console.log('replacing remoteDataItem with up to date localDataItem', localDataItem, localDataItem);
                return this.remoteDbService.updateItem(localDataItem, collectionName)
              }
              else {
                throw 'this should not occur'
              }
            })
          }
        }
      }
    )
    return Promise.all([dataAddedToFirestorePromises, dataAddedToLocalDbPromises]).then(() => Promise.resolve())
  }



  
  
}