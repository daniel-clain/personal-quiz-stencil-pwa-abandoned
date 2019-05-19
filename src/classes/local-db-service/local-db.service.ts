import CollectionNames from "../../global/types/collection-names";
import IDataItem from "../../global/interfaces/data-item.interface";
import ILocalDbService from "../../global/interfaces/local-db-service.interface";
import { Subject } from "rxjs";

export default class LocalDbService implements ILocalDbService{

  localDatabase: IDBDatabase
  dataUpdateSubject: Subject<CollectionNames> = new Subject()


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
        const tagsObjectStore: IDBObjectStore = localDb.createObjectStore('Tags', { keyPath: 'id' })
        tagsObjectStore.createIndex('id', 'id')
        tagsObjectStore.createIndex('value', 'value')
        tagsObjectStore.createIndex('dateLastUpdated', 'dateLastUpdated')
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

  setInitialDateLastConnectedToFirestoreField(openDbRequest: IDBOpenDBRequest){
    const emptyDateObj = {id: 'default', dateLastConnectedToFirestore: null}

    const request = openDbRequest.transaction
    .objectStore('Date Last Connected To Firestore')
    .add(emptyDateObj)

    request.onsuccess = (() => {
      console.log('empty dateLastConnectedToFirestoreField initialized')
    })
  } 

  
  getDateClientLastConnectedToFirestore(): Promise<Date>{
    const objectStore: IDBObjectStore = this.getObjectStore('Date Last Connected To Firestore')
    const request: IDBRequest = objectStore.get('default')
    return new Promise((resolve, reject) => {      
      request.onsuccess = ((event: any) => resolve(event.target.result.dateLastConnectedToFirestore))
      request.onerror = error => reject(error)
    }); 
  } 

  getData<T>(collectionName: CollectionNames): Promise<T>{
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const request: IDBRequest = objectStore.getAll()
    return new Promise((resolve, reject) => {
      request.onsuccess = ((event: any) => resolve(event.target.result))
      request.onerror = error => reject(error)
    }); 
  }

  async updateDateClientLastConnectedToFirestore(){
    const newDateObj = {id: 'default', dateLastConnectedToFirestore: new Date()}
    const objectStore: IDBObjectStore = this.getObjectStore('Date Last Connected To Firestore')
    const request: IDBRequest = objectStore.put(newDateObj)
    return this.requestResolver<void>(request)
  } 

  getNewData<T extends IDataItem>(collectionName: CollectionNames, dateClientLastConnectedToFirestore: Date): Promise<T[]>{
    if(dateClientLastConnectedToFirestore == null){
      return Promise.resolve([])
    }
    const keyRangeValue = IDBKeyRange.lowerBound(dateClientLastConnectedToFirestore, true);
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const dateLastUpdatedIndex = objectStore.index('dateLastUpdated');
    const request: IDBRequest = dateLastUpdatedIndex.openCursor(keyRangeValue)
    return new Promise((resolve, reject) => {      
      const returnDataArray: T[] = []
      request.onsuccess = (event: any) => {
        const cursor: IDBCursorWithValue = event.target.result;
        if(cursor) {
          const dataItem: T = cursor.value
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

  

  private getObjectStore(collectionName: CollectionNames): IDBObjectStore{
    return this.localDatabase
      .transaction([collectionName], 'readwrite')
      .objectStore(collectionName)
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
    .then(() => this.dataUpdateSubject.next(collectionName))
  }

  updateItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const request: IDBRequest = objectStore.put(data)
    return this.requestResolver<void>(request)
    .then(() => this.dataUpdateSubject.next(collectionName))
  }

  deleteItem<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    const objectStore: IDBObjectStore = this.getObjectStore(collectionName)
    const request: IDBRequest = objectStore.delete(data.id)
    return this.requestResolver<void>(request)
    .then(() => this.dataUpdateSubject.next(collectionName))
  }

  
  private requestResolver<T>(request: IDBRequest): Promise<T>{
    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => resolve(event.target.result)
      request.onerror = error => reject(error)
    });
  }


}