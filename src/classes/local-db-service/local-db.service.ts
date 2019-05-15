import CollectionNames from "../../types/collection-names";
import ClientData from '../../interfaces/client-data.interface'
import DataItem from "../../interfaces/data-item.interface";
import CrudActions from "../../types/crud-actions";

export default class LocalDbService{

  localDatabase: IDBDatabase
  
  async getDataById(id: string, collectionName: CollectionNames): Promise<any>{
    const localDatabase: IDBDatabase = await this.getLocalDatabase()

    const request: IDBRequest = localDatabase
      .transaction([collectionName], 'readwrite')
      .objectStore(collectionName)
      .get(id)

    return new Promise((resolve, reject) => {
      request.onsuccess = ((event: Event) => {
        const request: any = event.target
        const result: any = request.result
        resolve(result)
      })
      request.onerror = error => reject(error)
    });
  }

  async getData(collectionName: CollectionNames): Promise<any[]>{
    const localDatabase: IDBDatabase = await this.getLocalDatabase()
    return new Promise((resolve) => {
      localDatabase
      .transaction([collectionName], 'readwrite')
      .objectStore(collectionName)
      .getAll()
      .onsuccess = ((event: any) => resolve(event.target.result))
    }); 
  }


  updateDateClientLastConnectedToFirestore(){
    const updatedClientData: ClientData = {
      id: 'client',
      value: 'last connected to firebase',
      dateLastUpdated: new Date(),
    }
    this.updateItem(updatedClientData, 'Client Data', 'update')

  }

  async updateItemWithNewId(data: DataItem, collectionName: CollectionNames, oldId: string): Promise<any>{
    if(!data.id) debugger
    const localDatabase: IDBDatabase = await this.getLocalDatabase()

    const objectStore: IDBObjectStore = localDatabase
      .transaction([collectionName], 'readwrite')
      .objectStore(collectionName)

    let request: IDBRequest = objectStore.put(data, oldId)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log(`update for ${collectionName} ${data.value}`, data);
        resolve()
      }
      request.onerror = error => reject(error)
    });
  }


  async updateItem(data: DataItem, collectionName: CollectionNames, action: CrudActions): Promise<any>{
    if(!data.id) debugger
    const localDatabase: IDBDatabase = await this.getLocalDatabase()

    const objectStore: IDBObjectStore = localDatabase
      .transaction([collectionName], 'readwrite')
      .objectStore(collectionName)

    let request: IDBRequest
    switch(action){
      case 'add' : request = objectStore.add(data); break;
      case 'update' : request = objectStore.put(data); break;
      case 'delete' : request = objectStore.delete(data.id); break;
    }

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log(`${action} for ${collectionName} ${data.value}`, data);
        resolve()
      }
      request.onerror = error => reject(error)
    });
  }

  
  getLocalDatabase(): Promise<IDBDatabase>{
    if(this.localDatabase){
      return Promise.resolve(this.localDatabase)
    }
    else {
      return new Promise((resolve) => {
        const request: IDBOpenDBRequest = indexedDB.open('Personal Quiz Data')
        request.onupgradeneeded = () => {
          request.result.createObjectStore('Questions', { keyPath: 'id' });
          request.result.createObjectStore('Tags', { keyPath: 'id' });
          request.result.createObjectStore('Client Data', { keyPath: 'id' });

          const emptyClientData: ClientData = {
            id: 'client',
            value: 'last connected to firebase',
            dateLastUpdated: null
          }

          const request2 = request.transaction
          .objectStore('Client Data')
          .add(emptyClientData)

          request2.onsuccess = (() => {
            console.log('empty client data obj initialized')
          })

        }
        request.onsuccess = () => {
          this.localDatabase = request.result
          resolve(this.localDatabase)
        }
      });
    }    
  }
  

  async getNewData(collection: CollectionNames, dateClientLastConnectedToFirestore: Date): Promise<any[]>{
    const localDatabase: IDBDatabase = await this.getLocalDatabase()

    const tx: IDBTransaction = localDatabase.transaction([collection], 'readwrite')
    const objectStore: IDBObjectStore = tx.objectStore(collection)
    const request: IDBRequest = objectStore.getAll()

    return new Promise(resolve => {      
      request.onsuccess = (event: any) => {
        // fix this to only get items after last connected date 
        dateClientLastConnectedToFirestore
        return resolve(event.target.result)
      }      
    })
  }

  async addDataToCollection(dataItems: DataItem[], collection: CollectionNames){
    const localDatabase: IDBDatabase = await this.getLocalDatabase()

    const tx: IDBTransaction = localDatabase.transaction([collection], 'readwrite')

    dataItems.forEach((dataItem: DataItem) => {
      tx.objectStore(collection).add(dataItem)
    })

    tx.oncomplete = () => {
      return Promise.resolve()
    }
  }


}