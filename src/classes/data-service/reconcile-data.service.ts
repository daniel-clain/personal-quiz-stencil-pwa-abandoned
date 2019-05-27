import IDataItem from "../../global/interfaces/data-item.interface";
import RemoteDbService from "../remote-db-service/remote-db.service";
import LocalDbService from "../local-db-service/local-db.service";
import FirestoreDocId from "../../global/types/firestore-doc-id.type";
import IConflictingDataItem from '../../global/interfaces/conflicting-data-item.interface';
import INonConflictingDataItems from '../../global/interfaces/non-conflicting-data-items.interface';
import CollectionNames from '../../global/enums/collection-names.enum';
import firebase from "firebase";
import getDateOneMonthAgo from "../../global/helper-functions/getDateOneMonthAgo";


export default class ReconcileDataService{

  constructor(private remoteDbService: RemoteDbService, private localDbService: LocalDbService,){}


  synchronizeRemoteAndLocalDataBeforeLastConnected(): Promise<void>{
    let collectionPromises: Promise<void>[] = []
    
    for(let key in CollectionNames){
      const collectionName: CollectionNames = CollectionNames[CollectionNames[key]]
      collectionPromises.push(      
        this.localDbService.allDataThatHasntBeenUpdatedSinceLastConnected(collectionName)
        .then((localDataItems: IDataItem[]) => 
          Promise.all(localDataItems.map(async (localDataItem: IDataItem): Promise<void> => 
            this.remoteDbService.getDataById(localDataItem.id, collectionName)
            .then((reomoteDataItem: IDataItem) => {
              if(!reomoteDataItem){
                const msg = 'this data items exists in local but not in remote, the only way this could be possible is if it was marked for delete and expired by another client, or if the data in the remote db was manually delete. investigate this and determine the cause. for now local item will be deleted'
                console.log(msg, localDataItem);
                alert(msg)
                return this.localDbService.deleteItem(localDataItem, collectionName)
              }
              else{
                const conflictingDataItem: IConflictingDataItem = {
                  local: localDataItem,
                  remote: reomoteDataItem
                }
                return this.resolveConflictingDataItems([conflictingDataItem], collectionName)
              }   
            })
          )).then(() => Promise.resolve())
        )
      )
    }    
    return Promise.all(collectionPromises).then(() => this.deleteExpiredDataItemsMarkedForDelete())
  }
  


  async synchronizeRemoteAndLocalDataSinceLastConnected(): Promise<void>{
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

  
  private async deleteExpiredDataItemsMarkedForDelete(): Promise<void>{
    const collectionPromises: Promise<any>[] = []
    for(let key in CollectionNames){
      const collectionName: CollectionNames = CollectionNames[CollectionNames[key]]
      const dataItemsMarkedForDelete: any[] = await this.localDbService.getDataMarkedForDelete(collectionName)
      const expiredDataItems: IDataItem[] = dataItemsMarkedForDelete.filter((dataItem: any) => {
        const convertedOneMonthAgo: firebase.firestore.Timestamp = firebase.firestore.Timestamp.fromDate(getDateOneMonthAgo())
        const x: firebase.firestore.Timestamp = dataItem.dateLastUpdated
        const itemLastUpdateDate: firebase.firestore.Timestamp =  new firebase.firestore.Timestamp(x.seconds, x.nanoseconds)
        return itemLastUpdateDate < convertedOneMonthAgo
      })
      collectionPromises.push(Promise.all(        
        expiredDataItems.map((dataItem: IDataItem) => Promise.all([
          this.localDbService.deleteItem(dataItem, collectionName),
          this.remoteDbService.deleteItem(dataItem, collectionName)
        ]))
      ))
    }
    return Promise.all(collectionPromises)
    .then((promiseResponses) => promiseResponses.reduce((combined: any[], promiseResponse: IDataItem[]) => combined.concat(promiseResponse), []))
    .then(itemsDeleted => console.log('number of expired items deleted: ',itemsDeleted.length))
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
    })).then(() => Promise.resolve())
  }

  private resolveNonConflictingDataItems(nonConflictingDataItems: INonConflictingDataItems, collectionName: CollectionNames){

    const dataAddedToLocalDbPromises: Promise<void>[] = 
    nonConflictingDataItems.remote.map(
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

    const dataAddedToFirestorePromises: Promise<void>[] = 
    nonConflictingDataItems.local.map(
      (localDataItem: IDataItem) => {
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
              console.log('replacing remoteDataItem with up to date localDataItem', remoteDataItem, localDataItem);
              return this.remoteDbService.updateItem(localDataItem, collectionName)
            }
            else {
              throw 'this should not occur'
            }
          })
        }
      }
    )
    return Promise.all([dataAddedToFirestorePromises, dataAddedToLocalDbPromises]).then(() => Promise.resolve())
  }



  
  
}