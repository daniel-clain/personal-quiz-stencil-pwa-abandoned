import IDataItem from "../../global/interfaces/data-item.interface";
import FirestoreDbService from "../firestore-db-service/firestore-db.service";
import LocalDbService from "../local-db-service/local-db.service";
import CollectionNames from "../../global/types/collection-names";
import IQuestion from "../../global/interfaces/question.interface";
import ITag from "../../global/interfaces/tag.interface";
import FirestoreDocId from "../../global/types/firestore-doc-id.type";

export default class ReconcileDataService{

  constructor(private firestoreDbService: FirestoreDbService, private localDbService: LocalDbService,){}

  async reconcileDataSinceLasteConnectedDate(): Promise<void>{

    const dateClientLastConnectedToFirestore: Date = await this.localDbService.getDateClientLastConnectedToFirestore()
    const firestoreQuestions: IQuestion[] = await this.firestoreDbService.getNewData<IQuestion>('Questions', dateClientLastConnectedToFirestore)
    const localQuestions: IQuestion[] = await this.localDbService.getNewData<IQuestion>('Questions', dateClientLastConnectedToFirestore)    
    const firestoreTags: ITag[] = await this.firestoreDbService.getNewData<ITag>('Tags', dateClientLastConnectedToFirestore)    
    const localTags: ITag[] = await this.localDbService.getNewData<ITag>('Tags', dateClientLastConnectedToFirestore)

    return Promise.all([
      this.reconcileData<IQuestion>(localQuestions, firestoreQuestions, 'Questions'),
      this.reconcileData<ITag>(localTags, firestoreTags, 'Tags'),
      this.resolveConflictingRemoteAndLocalDataItems<IQuestion>(localQuestions, firestoreQuestions, 'Questions'),
      this.resolveConflictingRemoteAndLocalDataItems(localTags, firestoreTags, 'Tags'),
    ]).then(() => this.localDbService.updateDateClientLastConnectedToFirestore())
  }

  
  reconcileData<T extends IDataItem>(localDataSinceLastConnected: T[], remoteDataSinceLastConnected: T[], collectionName: CollectionNames): Promise<void>{

    const nonConflictingLocalDataItems: T[] = localDataSinceLastConnected.filter(
      (localData: T) => !remoteDataSinceLastConnected.some((remoteData: T) => remoteData.id == localData.id)
    )
    console.log(`${collectionName} updated in local since last connected: `, nonConflictingLocalDataItems);
    
    const nonConflictingRemoteDataItems: T[] = remoteDataSinceLastConnected.filter(
        (remoteData: T) => !localDataSinceLastConnected.some((localData: T) => localData.id == remoteData.id)
    )
    console.log(`${collectionName} updated in remote since last connected: `, nonConflictingRemoteDataItems);

    const dataAddedToLocalDbPromises: Promise<void>[] = nonConflictingRemoteDataItems.map(
      (remoteDataItem: T) => {
        return this.localDbService.getDataById(remoteDataItem.id, collectionName)
        .then((localDataItem: T) => {
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

    const dataAddedToFirestorePromises: Promise<void>[] = nonConflictingLocalDataItems.map(
      (localDataItem: T) => {
        if(localDataItem.markedForDelete){
          if(!localDataItem.id.includes('temp')){
            this.firestoreDbService.deleteItem(localDataItem, collectionName)
          }
          this.localDbService.deleteItem(localDataItem, collectionName)
        }else{
          if(localDataItem.id.includes('temp')){
            console.log('localDataItem added since last connected, adding to remote data', localDataItem);
            return this.firestoreDbService.addItem({...localDataItem, id: null}, collectionName)
            .then((newId: FirestoreDocId) => {
              const oldItem: T = {...localDataItem}
              const updatedDataItem: T = {...localDataItem, id: newId}
              return this.localDbService.addItem(updatedDataItem, collectionName)
              .then(() => this.localDbService.deleteItem(oldItem, collectionName))
            })
          }
          else{  
            return this.firestoreDbService.getDataById(localDataItem.id, collectionName)
            .then((remoteDataItem: T) => {
              if(remoteDataItem && remoteDataItem.dateLastUpdated){
                console.log('replacing remoteDataItem with up to date localDataItem', localDataItem, localDataItem);
                return this.firestoreDbService.updateItem(localDataItem, collectionName)
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

  private resolveConflictingRemoteAndLocalDataItems<T extends IDataItem>(localDataSinceLastConnected: T[], remoteDataSinceLastConnected: T[], collectionName: CollectionNames){
    let updatesForLocal: T[] = []
    let updatesForRemote: T[] = []
    localDataSinceLastConnected.forEach(
      (localData: T) => {
        remoteDataSinceLastConnected.forEach((remoteData: T) => {
          if(remoteData.id == localData.id){
            if(localData.dateLastUpdated > remoteData.dateLastUpdated){
              updatesForRemote.push(localData)
            } 
            else {
              updatesForLocal.push(remoteData)
            }
          }
        })
      }
    )
    const updatesForRemotePromises: Promise<void> [] = updatesForRemote.map(
      (dataItem: T) => this.firestoreDbService.updateItem(dataItem, collectionName))

    const updatesForLocalPromises: Promise<void> [] = updatesForLocal.map(
      (dataItem: T) => this.localDbService.updateItem(dataItem, collectionName))

    return Promise.all([updatesForLocalPromises, updatesForRemotePromises]).then(() => Promise.resolve())
  }
  
}