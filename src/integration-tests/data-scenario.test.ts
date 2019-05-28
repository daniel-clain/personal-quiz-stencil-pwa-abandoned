
import { DataService } from "../classes/data-service/data.service";
import { User } from "firebase";
import { Subject } from "rxjs";
import CollectionNames from "../global/enums/collection-names.enum";
import IDataItem from "../global/interfaces/data-item.interface";
import { IAuthService } from "../global/interfaces/auth-service.interface";
import IRemoteDbService from "../global/interfaces/remote-db-service.interface";
import ILocalDbService from "../global/interfaces/local-db-service.interface";
import 'firebase'
import IReconcileDataService from "../global/interfaces/reconcile-data-service.interface";

const connected$: Subject<User> = new Subject()

class MockAuthService implements IAuthService{
  login() {}
  logout() {}
  setup(){}
  user$ = connected$
}
const mockAuthService = new MockAuthService()

class MockRemoteDbService implements IRemoteDbService{
  constructor(_authService: IAuthService){}
  setup() {}
  getUserCollection(): firebase.firestore.DocumentReference {return}
  addItem<T extends IDataItem>(_data: T, _collectionName: CollectionNames): Promise<string> {return Promise.resolve('')}
  updateItem<T extends IDataItem>(_data: T, _collectionName: CollectionNames): Promise<void> {return Promise.resolve()}
  deleteItem<T extends IDataItem>(_data: T, _collectionName: CollectionNames): Promise<void> {return Promise.resolve()}
  getUpdatedDataItemsSinceClientLastConnectedToRemoteDb(_collectionName: CollectionNames, _dateClientLastConnectedToFirestore: Date): Promise<IDataItem[]> {return Promise.resolve([])}
  getDataById<T extends IDataItem>(_id: string, _collectionName: CollectionNames): Promise<T> {return Promise.resolve({} as T)}
}
const mockRemoteDbService = new MockRemoteDbService(mockAuthService)


let localDbSetupResolveFn = jest.fn().mockResolvedValue(null)
let localDbGetDataResolveFn = jest.fn().mockResolvedValue([])
class MockLocalDbService implements ILocalDbService{
  getDataMarkedForDelete(_collectionName: CollectionNames): Promise<any[]> {return Promise.resolve([])}
  getDateLastConnectedToRemoteDb(): Promise<Date> {return Promise.resolve({} as Date)}
  allDataThatHasntBeenUpdatedSinceLastConnected(_collectionName: CollectionNames): Promise<IDataItem[]> {return Promise.resolve([])}
  dataUpdate$: Subject<CollectionNames>;
  addItem<T extends IDataItem>(_data: T, _collectionName: CollectionNames): Promise<void> {return Promise.resolve()}
  updateItem<T extends IDataItem>(_data: T, _collectionName: CollectionNames): Promise<void> {return Promise.resolve()}
  deleteItem<T extends IDataItem>(_data: T, _collectionName: CollectionNames): Promise<void> {return Promise.resolve()}
  getDataById<T extends IDataItem>(_id: string, _collectionName: CollectionNames): Promise<T> {return Promise.resolve({} as T)}
  getUpdatedDataItemsSinceClientLastConnectedToRemoteDb(_collectionName: CollectionNames, _dateClientLastConnectedToRemoteDb: Date): Promise<IDataItem[]> {return Promise.resolve([])}
  hasNeverConnectedToRemoteDbBefore(): Promise<boolean> {return Promise.resolve(false)}
  updateDateClientLastConnectedToFirestore(): Promise<void> {return Promise.resolve()}
  markItemForDelete<T extends IDataItem>(_data: T, _collectionName: CollectionNames): Promise<void> {return Promise.resolve()}
  setup(): Promise<void>{return localDbSetupResolveFn()}
  getData(_collectionName: CollectionNames): Promise<IDataItem[]>{return localDbGetDataResolveFn()}

}
const mockLocalDbService = new MockLocalDbService()

class MockReconcileDataService implements IReconcileDataService{
  constructor(_remoteDbService: IRemoteDbService, _localDbService: ILocalDbService){}
  synchronizeRemoteAndLocalDataBeforeLastConnected(): Promise<void> {return Promise.resolve()}
  synchronizeRemoteAndLocalDataSinceLastConnected(): Promise<void> {return Promise.resolve()}


}
const reconcileDataService = new MockReconcileDataService(mockRemoteDbService, mockLocalDbService)


let dataService

describe ('when data service is instanciated', () => {
  test('should call functions', async () => {
    
    dataService = new DataService(mockRemoteDbService, mockLocalDbService, reconcileDataService, mockAuthService)
    expect.assertions(2);
    return dataService.setup()
    .then(() => {
      expect(localDbSetupResolveFn).toHaveBeenCalled()
      expect(localDbGetDataResolveFn).toHaveBeenCalledTimes(2)
    })
  })
});

xtest('', () => {
  const spy = spyOn(reconcileDataService, 'synchronizeRemoteAndLocalDataSinceLastConnected')
  connected$.next({} as User)
  expect(spy).toHaveBeenCalled()

})

