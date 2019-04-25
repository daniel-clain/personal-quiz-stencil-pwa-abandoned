import {Observable, of} from 'rxjs';
import DataService from "../data-service/data.service";
import ITag from '../../interfaces/tag.interface';

export class TagService {
  private static singletonInstance: TagService
  tags$: Observable<ITag[]>

  constructor(private dataService: DataService){
    this.tags$ = of([{id: '123', name: 'doink'}])
  }


  public static getSingletonInstance(): TagService {
    if(!this.singletonInstance){
      const dataService: DataService = DataService.getSingletonInstance()
      this.singletonInstance = new TagService(dataService)
    }
    return this.singletonInstance
  }

  add(tag: ITag){
    console.log('this.dataService :', this.dataService);
    console.log('add tag :', tag)
    this.dataService.add(tag, 'Tags')

  }

  update(tag: ITag){
    console.log('update tag :', tag);

  }

  delete(tag: ITag){
    console.log('delete tag :', tag);

  }
}