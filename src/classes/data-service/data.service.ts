
import { User} from 'firebase';
import { Subject, Observable, Subscriber, Subscription } from 'rxjs';
import IDataItem from '../../global/interfaces/data-item.interface';
import ITag from '../../global/interfaces/tag.interface';
import IQuestion from '../../global/interfaces/question.interface';
import IInMemoryData from '../../global/interfaces/in-memory-data.interface';
import CollectionNames from '../../global/enums/collection-names.enum'
import IRemoteDbService from '../../global/interfaces/remote-db-service.interface';
import ILocalDbService from '../../global/interfaces/local-db-service.interface';
import { IAuthService } from '../../global/interfaces/auth-service.interface';
import IReconcileDataService from '../../global/interfaces/reconcile-data-service.interface';


export class DataService{

  private connected: boolean
  private questions: IQuestion[] = []
  private tags: ITag[] = []

  inMemory: IInMemoryData = {
    'Questions': this.questions,
    'Tags': this.tags
  }
  
  tags$: Observable<ITag[]>
  tagsDataSubscription: Subscription;
  tagUpdates$: Subject<ITag[]> = new Subject(); 

  questions$: Observable<IQuestion[]>
  questionsDataSubscription: Subscription;
  questionUpdates$: Subject<IQuestion[]> = new Subject();


  constructor(     
   private remoteDbService: IRemoteDbService,
   private localDbService: ILocalDbService,
   private reconcileDataService: IReconcileDataService,
   private authService: IAuthService
  ){
    
    this.questions$ = new Observable((subscriber: Subscriber<IQuestion[]>) => {
      if (this.inMemory['Questions']) {
        subscriber.next(this.inMemory['Questions']);
      }
      this.questionUpdates$.subscribe((updatedQuestions: IQuestion[]) => {
        this.inMemory['Questions'] = updatedQuestions
        subscriber.next(updatedQuestions);
      });
    })
    this.tags$ = new Observable((subscriber: Subscriber<ITag[]>) => {
      if (this.inMemory['Tags']) {
        subscriber.next(this.inMemory['Tags']);
      }
      this.tagUpdates$.subscribe((updatedTags: ITag[]) => {
        this.inMemory['Tags'] = updatedTags
        subscriber.next(updatedTags);
      });
    })
  }

  setup(): Promise<void>{
    return this.localDbService.setup()
    .then(() => {      
      this.setupDataObservables()
      return this.getInitialData()
    })
  }


  private setupDataObservables(){
    this.localDbService.dataUpdate$.subscribe((collectionName: CollectionNames) => {
      switch(collectionName){
        case 'Questions' : {
          this.localDbService.getData(CollectionNames['Questions'])
          .then((questions: IQuestion[]) => this.questionUpdates$.next(questions))          
        }; break
        case 'Tags' : {
          this.localDbService.getData(CollectionNames['Tags'])
          .then((tags: ITag[]) => this.tagUpdates$.next(tags))          
        }; break
      }
    })


    this.authService.user$.subscribe((user: User) => {
      this.connected = !!user
      if(this.connected) this.onConnectionToRemoteDb()
    })
  }

  private getInitialData(): Promise<void>{
    return Promise.all([
      this.localDbService.getData(CollectionNames['Questions'])
      .then((questions: IQuestion[]) => this.questionUpdates$.next(questions)),    
      this.localDbService.getData(CollectionNames['Tags'])
      .then((tags: ITag[]) => this.tagUpdates$.next(tags))
    ]).then(() => {})
  }
  private onConnectionToRemoteDb(){
    this.reconcileDataService.synchronizeRemoteAndLocalDataSinceLastConnected()
    if(this.overAMonthSinceLastConnectedToRemoteDb()){
      this.reconcileDataService.synchronizeRemoteAndLocalDataBeforeLastConnected()
    }
  }
  
  overAMonthSinceLastConnectedToRemoteDb():boolean{return}


  /* private addEverythingFromRemoteDbToLocalDb(): Promise<void>{
    const deletePromises: Promise<any>[] = []
    const addPromises: Promise<any>[] = []
    for(let key in CollectionNames){
      const collectionName: CollectionNames = CollectionNames[CollectionNames[key]]
      deletePromises.push(this.localDbService.deleteAll(collectionName))
      addPromises.push(
        this.remoteDbService.getUpdatedDataItemsSinceClientLastConnectedToRemoteDb(collectionName, null)
        .then((dataItems: IDataItem[]) => Promise.all(
          dataItems.map((dataItem: IDataItem) => this.localDbService.addItem(dataItem, collectionName))
        ))
      )
    }
    return Promise.all(deletePromises)
    .then(() => Promise.all(addPromises))
    .then(() => this.localDbService.updateDateClientLastConnectedToFirestore())
    .then(() => console.log('all local data has been overwritten with remote data'))
  } */



  async add<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    data.dateLastUpdated = new Date
    let newId
    let tempId
    if(this.connected){
      newId = await this.remoteDbService.addItem<T>(data, collectionName)
      this.localDbService.updateDateClientLastConnectedToFirestore()
    } else {
      tempId = `temp${new Date().getTime().toString()}`
    }
    const localDbId = this.connected ? newId : tempId
    data.id = localDbId
    return this.localDbService.addItem<T>(data, collectionName)      
  }


  async update(data: IDataItem, collectionName: CollectionNames): Promise<void>{
    data.dateLastUpdated = new Date()
    if(this.connected){
      this.remoteDbService.updateItem(data, collectionName)
      this.localDbService.updateDateClientLastConnectedToFirestore()
    }
    return this.localDbService.updateItem(data, collectionName)
  }

  async delete(data: IDataItem, collectionName: CollectionNames): Promise<void>{
    data.dateLastUpdated = new Date()
    return this.localDbService.markItemForDelete(data, collectionName)
  }


}
