
import DataService from "../data-service/data.service";
import ITag from '../../interfaces/tag.interface';

export class TagService {
  private static singletonInstance: TagService

  constructor(private dataService: DataService){
    TagService.singletonInstance = this
  }
  


  public static getSingletonInstance(): TagService {
    if(!this.singletonInstance){
      const dataService: DataService = DataService.getSingletonInstance()
      new TagService(dataService)
    }
    return this.singletonInstance
  }

  getTags(): Promise<ITag[]>{
    return this.dataService.getTags()
  }

  add(tag: ITag){
    console.log('this.dataService :', this.dataService);
    console.log('add tag :', tag)
    this.dataService.add(tag, 'Tags')

  }

  update(tag: ITag){
    this.dataService.update(tag, 'Tags')

  }

  delete(tag: ITag){
    this.dataService.delete(tag, 'Tags')

  }

}