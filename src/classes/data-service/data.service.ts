
import { User } from 'firebase';
import CollectionNames from '../../global/types/collection-names'
import { AuthService } from '../auth-service/auth.service';
import { Subject, Observable, Subscriber, Subscription } from 'rxjs';
import IDataItem from '../../global/interfaces/data-item.interface';
import LocalDbService from '../local-db-service/local-db.service';
import FirestoreDbService from '../firestore-db-service/firestore-db.service';
import ITag from '../../global/interfaces/tag.interface';
import IQuestion from '../../global/interfaces/question.interface';
import ReconcileDataService from './reconcile-data.service';
import IInMemoryData from '../../global/interfaces/in-memory-data.interface';


export class DataService{

  connectionSubject: Subject<boolean> = new Subject()
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
   private firestoreDbService: FirestoreDbService,
   private localDbService: LocalDbService,
   private reconcileDataService: ReconcileDataService,
   private authService: AuthService
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

  async setup(){
    await this.firestoreDbService.setup()
    await this.localDbService.setup()
    
    this.setupDataObservables()
  }

  private setupDataObservables(){
    this.localDbService.dataUpdateSubject.subscribe((collectionName: CollectionNames) => {
      switch(collectionName){
        case 'Questions' : {
          this.localDbService.getData<IQuestion[]>('Questions')
          .then((questions: IQuestion[]) => this.questionUpdates$.next(questions))          
        }; break
        case 'Tags' : {
          this.localDbService.getData<ITag[]>('Tags')
          .then((tags: ITag[]) => this.tagUpdates$.next(tags))          
        }; break
      }
    })

    this.localDbService.getData<IQuestion[]>('Questions')
    .then((questions: IQuestion[]) => {
      this.inMemory['Questions'] = questions
      this.questionUpdates$.next(this.inMemory['Questions'])
    })
    
    this.localDbService.getData<ITag[]>('Tags')
    .then((tags: ITag[]) => {
      this.inMemory['Tags'] = tags
      this.tagUpdates$.next(this.inMemory['Tags'])
    })

    this.authService.user$.subscribe(
      (user: User) => {
        this.connectionSubject.next(!!user)
        if(!!user){
          this.connected = true
          this.onConnectionToFirestore()
        } else {
          this.connected = false
        }
      }
    )
  }


  private onConnectionToFirestore(){    
    this.reconcileDataService.reconcileDataSinceLasteConnectedDate()
    .then(() => console.log('all data has been reconciled'))   
  }


  async add<T extends IDataItem>(data: T, collectionName: CollectionNames): Promise<void>{
    data.dateLastUpdated = new Date()
    let newId
    let tempId
    if(this.connected){
      newId = await this.firestoreDbService.addItem<T>(data, collectionName)
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
      this.firestoreDbService.updateItem(data, collectionName)
      this.localDbService.updateDateClientLastConnectedToFirestore()
    }
    return this.localDbService.updateItem(data, collectionName)
  }

  async delete(data: IDataItem, collectionName: CollectionNames): Promise<void>{
    const promiseArray: Promise<void>[] = []
    if(this.connected){
      promiseArray.push(this.firestoreDbService.deleteItem(data, collectionName))
      promiseArray.push(this.localDbService.updateDateClientLastConnectedToFirestore())
      promiseArray.push(this.localDbService.deleteItem(data, collectionName)) 
    }  
    else {
      promiseArray.push(this.localDbService.markItemForDelete(data, collectionName)) 
    }
    
    return Promise.all(promiseArray).then(() => Promise.resolve())
  }


}
