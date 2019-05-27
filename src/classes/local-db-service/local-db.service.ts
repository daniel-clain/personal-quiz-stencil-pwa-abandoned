

import ILocalDbService from "../../global/interfaces/local-db-service.interface";
import IDataItem from '../../global/interfaces/data-item.interface';
import { Subject } from "rxjs";
import CollectionNames from '../../global/enums/collection-names.enum';

export default class LocalDbService implements ILocalDbService{

  localDatabase: IDBDatabase
  dataUpdate$: Subject<CollectionNames> = new Subject()


  setup(): Promise<void>{
    return new Promise(resolve => {
      
      const request: IDBOpenDBRequest = indexedDB.open('Personal Quiz Data')
      request.onupgradeneeded = () => {
        const localDb = request.result
        const questionsObjectStore: IDBObjectStore = localDb.createObjectStore('Questions', { keyPath: 'id' })
        questionsObjectStore.createIndex('id', 'id')
        questionsObjectStore.createIndex('value', 'value')
        questionsObjectStore.createIndex('correctAnswer', 'correctAnswer')
        questionsObjectStore.createIndex('correctnessRating', 'correctnessRating')
        questionsObjectStore.createIndex('dateLastAsked', 'dateLastAsked')
        questionsObjectStore.createIndex('dateLastUpdated', 'dateLastUpdated')
        questionsObjectStore.createIndex('tags', 'tags')
        questionsObjectStore.createIndex('markedForDelete', 'markedForDelete')
        const tagsObjectStore: IDBObjectStore = localDb.createObjectStore('Tags', { keyPath: 'id' })
        tagsObjectStore.createIndex('id', 'id')
        tagsObjectStore.createIndex('value', 'value')
        tagsObjectStore.createIndex('dateLastUpdated', 'dateLastUpdated')
        tagsObjectStore.createIndex('markedForDelete', 'markedForDelete')
        const dateLastConnectedObjectStore: IDBObjectStore = localDb.createObjectStore('Date Last Connected To Firestore', { keyPath: 'id'});
        dateLastConnectedObjectStore.createIndex('dateLastConnectedToFirestore', 'dateLastConnectedToFirestore')
        this.setInitialDateLastConnectedToFirestoreField(request)
      }
      request.onsuccess = () => {
        this.localDatabase = request.result
        resolve()
      }
    });
  }    

  private setInitialDateLastConnectedToFirestoreField(openDbRequest: IDBOpenDBRequest){
    const emptyDateObj = {id: 'default', dateLastConnectedToFirestore: null}

    const request = openDbRequest.transaction
    .objectStore('Date Last Connected To Firestore')
    .add(emptyDateObj)

    request.onsuccess = (() => {
      console.log('empty dateLastConnectedToFirestoreField initialized')
    })
  } 

  async getUpdatedDataItemsSinceClientLastConnectedToRemoteDb(collectionName: CollectionNames, dateClientLastConnectedToRemoteDb: Date): Promise<IDataItem[]>{
    const keyRangeValue = IDBKeyRange.lowerBound(dateClientLastConnectedToRemoteDb, true);
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const dateLastUpdatedIndex = objectStore.index('dateLastUpdated');
    const request: IDBRequest = dateLastUpdatedIndex.openCursor(keyRangeValue)
    return new Promise((resolve, reject) => {      
      const returnDataArray: IDataItem[] = []
      request.onsuccess = (event: any) => {
        const cursor: IDBCursorWithValue = event.target.result;
        if(cursor) {
          const dataItem: IDataItem = cursor.value
          returnDataArray.push(dataItem)
          cursor.continue();
        }
        else{
          resolve(returnDataArray)
        }
      }
      request.onerror = error => reject(error)
    });
  }

  async hasNeverConnectedToRemoteDbBefore(): Promise<boolean> {
    const dateLastConnectedToRemoteDb: Date = await this.getDateLastConnectedToRemoteDb()
    return dateLastConnectedToRemoteDb == null
  }

  async hasNoDataChangesInOverAMonth(): Promise<boolean> {
    const collectionPromises: Promise<IDataItem[]>[] = []
    for(let key in CollectionNames){
      const collectionName: CollectionNames = CollectionNames[CollectionNames[key]]
      const objectStore: IDBObjectStore = this.getObjectStore(collectionName)      
      const request: IDBRequest = objectStore.getAll()
      
      collectionPromises.push(this.requestResolver<IDataItem[]>(request))
    }
    return Promise.all(collectionPromises)
    .then(promiseResponses => {
      const combinedDataItems: IDataItem[] = promiseResponses.reduce((combined: any[], promiseResponse: IDataItem[]) => combined.concat(promiseResponse), [])
      const allDataItemsAreOveAMonthOld = combinedDataItems.reduce(
        (allDataItemsAreOveAMonthOld: boolean, dataItem: IDataItem) => {
          const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1))//getDateOneMonthAgo()
          if(dataItem.dateLastUpdated > oneMonthAgo){
            allDataItemsAreOveAMonthOld = false
          }
          return allDataItemsAreOveAMonthOld
        }, true)
      /* 
      return dateLastConnectedToRemoteDb == null || dateLastConnectedToRemoteDb < oneMonthAgo */
      return allDataItemsAreOveAMonthOld
    })
  }

  async hasConnectedToRemoteWithinTheLastMonth(): Promise<boolean> {
    const dateLastConnectedToRemoteDb: Date = await this.getDateLastConnectedToRemoteDb()
    const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1))//getDateOneMonthAgo()
    if(dateLastConnectedToRemoteDb == null){
      return false
    }
    return dateLastConnectedToRemoteDb > oneMonthAgo
  }


  
  getDateLastConnectedToRemoteDb(): Promise<Date>{
    const request: IDBRequest = this.localDatabase
    .transaction(['Date Last Connected To Firestore'], 'readwrite')
    .objectStore('Date Last Connected To Firestore').get('default')
    return new Promise((resolve, reject) => {      
      request.onsuccess = ((event: any) => resolve(event.target.result.dateLastConnectedToFirestore))
      request.onerror = error => reject(error)
    }); 
  } 

  getData<T>(collectionName: CollectionNames): Promise<T>{
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const request: IDBRequest = objectStore.getAll()
    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        const filteredData: T = event.target.result.filter(dataItem => !dataItem.markedForDelete)
        resolve(filteredData)
      }
      request.onerror = error => reject(error)
    });
  }

  async updateDateClientLastConnectedToFirestore(){
    const newDateObj = {id: 'default', dateLastConnectedToFirestore: new Date()}
    const request: IDBRequest = this.localDatabase
    .transaction(['Date Last Connected To Firestore'], 'readwrite')
    .objectStore('Date Last Connected To Firestore').put(newDateObj)
    return this.requestResolver<void>(request)
  }
  

  private getObjectStore(collectionName: CollectionNames): IDBObjectStore{
    return this.localDatabase
      .transaction([collectionName.toString()], 'readwrite')
      .objectStore(collectionName.toString())
  }

  getDataMarkedForDelete(collectionName: CollectionNames): Promise<any[]>{
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const request: IDBRequest = objectStore.getAll()
    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => resolve(event.target.result.filter((dataItem: any) => dataItem.markedForDelete))
      request.onerror = error => reject(error)
    })
  }

  deleteAll(collectionName: CollectionNames){
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const range: IDBKeyRange = IDBKeyRange.lowerBound('', true)
    const request: IDBRequest = objectStore.delete(range)
    return this.requestResolver(request)
  }

  
  getDataById<T extends IDataItem>(id: string, collectionName: CollectionNames): Promise<T> {
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const request: IDBRequest = objectStore.get(id)
    return this.requestResolver<T>(request)
  }

  addItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const request: IDBRequest = objectStore.add(data)
    return this.requestResolver<void>(request)
    .then(() => this.dataUpdate$.next(collectionName))
  }

  updateItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const request: IDBRequest = objectStore.put(data)
    return this.requestResolver<void>(request)
    .then(() => this.dataUpdate$.next(collectionName))
  }

  deleteItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const request: IDBRequest = objectStore.delete(data.id)
    return this.requestResolver<void>(request)
    .then(() => this.dataUpdate$.next(collectionName))
  }

  markItemForDelete<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const updatedItem = {...data, markedForDelete: true}
    const request: IDBRequest = objectStore.put(updatedItem)
    return this.requestResolver<void>(request)
    .then(() => this.dataUpdate$.next(collectionName))
  }

  
  private requestResolver<T>(request: IDBRequest): Promise<T>{
    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => resolve(event.target.result)
      request.onerror = error => reject(error)
    });
  }


}