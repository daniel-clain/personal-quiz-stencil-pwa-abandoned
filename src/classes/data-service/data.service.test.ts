import { DataService } from './data.service'
import RemoteDbService from '../remote-db-service/remote-db.service';
import LocalDbService from '../local-db-service/local-db.service';
import IQuestion from '../../global/interfaces/question.interface';
import { AuthService } from '../auth-service/auth.service';
import { of } from 'rxjs';
import { User } from 'firebase';
import ReconcileDataService from './reconcile-data.service';
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
  addItem(): Promise<any>{
    return Promise.resolve()
  }
}

const mockLocalDbService: MockLocalDbService = new MockLocalDbService()


class MockAuthService extends AuthService{
  setup(){}
  user$ = of({uid: '123'} as User)
}

const mockAuthService: MockAuthService = new MockAuthService()


class MockReconcileDataService extends ReconcileDataService{
  reconcileDataSinceLasteConnectedDate(): Promise<void>{
    return Promise.resolve()
  }
  
}

const mockReconcileDataService: MockReconcileDataService = new MockReconcileDataService(mockFirestoreDbService, mockLocalDbService)

describe ('add()', () => {
  describe ('when connected to firestore', () => {
    const dataServiceInstance: DataService = new DataService(mockFirestoreDbService, mockLocalDbService, mockReconcileDataService, mockAuthService)

    describe ('when adding a valid question', async () => {
      const testQuestion: IQuestion = {
        value: 'test question',
        dateLastAsked: null,
        dateLastUpdated: null,
        correctAnswer: null,
        id: null,
        tags: [],
        correctnessRating: null
      }
      const firebasedReturnedId = 'new id'
      const firestoreDbAddMockFunc = jest.fn()
      firestoreDbAddMockFunc.mockResolvedValue(Promise.resolve(firebasedReturnedId))
      mockFirestoreDbService.addItem = firestoreDbAddMockFunc

       
      const localDbAddMockFunc = jest.fn()
      localDbAddMockFunc.mockResolvedValue(Promise.resolve())
      mockLocalDbService.addItem = localDbAddMockFunc
     
      dataServiceInstance.add(testQuestion, CollectionNames['Questions'])
      

      it ('should call remoteDbService.addItem()', () => {
        expect(firestoreDbAddMockFunc).toHaveBeenCalledWith(testQuestion, 'Questions')
      });

      it ('should call localDbService.addItem() where dataItem.id should not be undefined', () => {         
        expect(localDbAddMockFunc).toHaveBeenCalledWith(testQuestion, 'Questions') 
        expect(testQuestion.id).toEqual(firebasedReturnedId)
      });
      it ('questions should be in inMemory Questions array', () => {
        
      });
    });
  });
  
});