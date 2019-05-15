import DataService from './data.service'
import FirestoreDbService from '../firestore-db-service/firestore-db.service';
import CollectionNames from '../../types/collection-names';
import DataItem from '../../interfaces/data-item.interface';
import LocalDbService from '../local-db-service/local-db.service';
import CrudActions from '../../types/crud-actions';

class MockFirestoreDbService extends FirestoreDbService{
  addItem(dataItem: DataItem, collectionName: CollectionNames): Promise<any>{
    return Promise.resolve()
  }
}

const mockFirestoreDbService: MockFirestoreDbService = new MockFirestoreDbService()


class MockLocalDbService extends LocalDbService{
  updateItem(dataItem: DataItem, collectionName: CollectionNames, action: CrudActions): Promise<any>{
    return Promise.resolve()
  }
}

const mockLocalDbService: MockLocalDbService = new MockLocalDbService()

describe ('add()', () => {
  describe ('when connected to firestore', () => {
    const dataServiceInstance: DataService = new DataService(mockFirestoreDbService, mockLocalDbService, null, null)
    describe ('when adding a valid question', () => {
      dataServiceInstance.add(null, 'Questions')
      it ('should call firestoreDbService.addItem()', () => {
        
      });

      it ('should call localDbService.updateItem', () => {
        
      });
      it ('questions should be in inMemory Questions array', () => {
        
      });
    });
  });
  
});