import ReconcileDataService from "./reconcile-data.service";
import IDataItem from "../../global/interfaces/data-item.interface";
import IQuestion from "../../global/interfaces/question.interface";
import RemoteDbService from "../remote-db-service/remote-db.service";
import LocalDbService from "../local-db-service/local-db.service";
import CollectionNames from '../../global/enums/collection-names.enum';

class MockFirestoreDbService extends RemoteDbService{
  setup(): Promise<void>{return Promise.resolve()}
  addItem(): Promise<any>{
    return Promise.resolve('new id')
  }
}

const mockFirestoreDbService: MockFirestoreDbService = new MockFirestoreDbService(null)


class MockLocalDbService extends LocalDbService{
  setup(): Promise<void>{return Promise.resolve()}
  updateItem(): Promise<any>{
    return Promise.resolve()
  }
}

const mockLocalDbService: MockLocalDbService = new MockLocalDbService()

describe ('reconcileData()', () => {
  const reconcileDataService = new ReconcileDataService(mockFirestoreDbService, mockLocalDbService)

  describe ('when firestore returns 1 question and local db returns none', () => {
    const firestoreQuestion: IQuestion = {
      id: 'remote data',
      dateLastUpdated: new Date("2019-01-20"),
      value: null,
      correctAnswer: null,
      correctnessRating: null,
      dateLastAsked: null,
      tags: []
    }
    mockFirestoreDbService.getUpdatedDataItemsSinceClientLastConnectedToRemoteDb = (collection: CollectionNames, dateClientLastConnectedToFirestore: Date): Promise<IDataItem[]> => {
      dateClientLastConnectedToFirestore
      if(collection == 'Questions'){
        return Promise.resolve([firestoreQuestion as any])
      }
      else {
        return Promise.resolve([])
      }
    }
    test('should call getNewData in remoteDbService with collection name Questions and dateClientLastConnectedToFirestore 2019-01-15', () => {
      const getNewDataSpy = spyOn(mockFirestoreDbService, 'getUpdatedDataItemsSinceClientLastConnectedToRemoteDb')
      reconcileDataService.synchronizeLocalAndRemoteData()
      expect(getNewDataSpy).toBeCalledWith('Questions', new Date("2019-01-15"))

    })


  });



  /* describe ('when local data has 1 item and remote is 0', () => {
    
    const localDataItem: IDataItem = {
      id: '1',
      dateLastUpdated: new Date(),
      value: 'local data'
    }
    const localData: IDataItem[] = [localDataItem]
    const remoteData: IDataItem[] = []
    reconcileDataService.reconcileData(localData, remoteData)

    it ('should return an object where updates for remote is the one in local', () => {
      expect(response.updatesForRemote.length).toBe(1)
      expect(response.updatesForRemote[0]).toBe(localDataItem)
    })
    it ('should return an object where updates for local is empty', () => {
      expect(response.updatesForLocal.length).toBe(0)
    })


  })

  describe ('when remote data has 2 items and local is 0', () => {
    const remoteDataItem1: IDataItem = {
      id: '1',
      dateLastUpdated: new Date(),
      value: 'remote data 1'
    }
    const remoteDataItem2: IDataItem = {
      id: '2',
      dateLastUpdated: new Date(),
      value: 'remote data 2'
    }
    const localData: IDataItem[] = []
    const remoteData: IDataItem[] = [remoteDataItem1, remoteDataItem2]
    const response: UpdatesObject = reconcileDataService.reconcileData(localData, remoteData)

    it ('should return an object where updates for local is the 2 in remote', () => {
      expect(response.updatesForLocal.length).toBe(2)
      const remoteDataItem1InUpdatesForLocal = response.updatesForLocal.some(dataItem => dataItem.id == remoteDataItem1.id)
      const remoteDataItem2InUpdatesForLocal = response.updatesForLocal.some(dataItem => dataItem.id == remoteDataItem2.id)
      expect(remoteDataItem1InUpdatesForLocal).toBe(true)
      expect(remoteDataItem2InUpdatesForLocal).toBe(true)
    })
    
    it ('should return an object where updates for remote is empty', () => {
      expect(response.updatesForRemote.length).toBe(0)
    })
  })

  describe ('when both remote and local have 1 data item but they have different ids', () => {
    const remoteDataItem: IDataItem = {
      id: 'a',
      dateLastUpdated: new Date(),
      value: 'remote data'
    }
    const localDataItem: IDataItem = {
      id: 'z',
      dateLastUpdated: new Date(),
      value: 'local data'
    }
    const localData: IDataItem[] = [localDataItem]
    const remoteData: IDataItem[] = [remoteDataItem]
    const response: UpdatesObject = reconcileDataService.reconcileData(localData, remoteData)

    it ('should return an object where updates for local is the remote data item', () => {
      expect(response.updatesForLocal.length).toBe(1)
      expect(response.updatesForLocal[0]).toBe(remoteDataItem)
    })
    it ('should return an object where updates for remote is the local data item', () => {
      expect(response.updatesForRemote.length).toBe(1)
      expect(response.updatesForRemote[0]).toBe(localDataItem)
    })
  })

  describe ('when remote and local have 1 data item that is a question and they have the same id', () => {
    describe ('when local question has a more recent last updated date that remote question', () => {
      const remoteDataItem: IQuestion = {
        id: 'same-ID',
        dateLastUpdated: new Date("2019-01-20"),
        value: 'remote data',
        correctAnswer: null,
        correctnessRating: 5,
        dateLastAsked: null,
        tags: []
      }
      const localDataItem: IQuestion = {
        id: 'same-ID',
        dateLastUpdated: new Date("2019-01-25"),
        value: 'local data',
        correctAnswer: null,
        correctnessRating: 5,
        dateLastAsked: null,
        tags: []
      }
      const localData: IDataItem[] = [localDataItem]
      const remoteData: IDataItem[] = [remoteDataItem]
      const response: UpdatesObject = reconcileDataService.reconcileData(localData, remoteData)
      it('remote data item should be update local data', () => {
        expect(response.updatesForRemote.length).toBe(1)
        expect(response.updatesForRemote[0]).toBe(localDataItem)
        
        expect(response.updatesForLocal.length).toBe(0)
        
      })
    })
    describe ('when remote question has a more recent last updated date that local question', () => {
      const remoteDataItem: IDataItem = {
        id: 'same-ID',
        dateLastUpdated: new Date("2019-03-15"),
        value: 'remote data'
      }
      const localDataItem: IDataItem = {
        id: 'same-ID',
        dateLastUpdated: new Date("2019-03-05"),
        value: 'local data'
      }
      const localData: IDataItem[] = [localDataItem]
      const remoteData: IDataItem[] = [remoteDataItem]
      const response: UpdatesObject = reconcileDataService.reconcileData(localData, remoteData)
      it('remote data item should be update local data', () => {
        expect(response.updatesForLocal.length).toBe(1)
        expect(response.updatesForLocal[0]).toBe(remoteDataItem)
        
        expect(response.updatesForRemote.length).toBe(0)
        
      })
    })
  }) */
})