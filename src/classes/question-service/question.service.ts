import DataService from "../data-service/data.service";
import IQuestion from "../../interfaces/question.interface";
import ITag from "../../interfaces/tag.interface";
import { Observable } from "rxjs";

export class QuestionService{

  private static singletonInstance: QuestionService
  questions$: Observable<IQuestion[]>

  constructor(private dataService: DataService){
    this.questions$ = dataService.getQuestions()
  }
  


  getQuestionsByTag(tags?: ITag[]): Promise<IQuestion[]>{
    return new Promise((resolve) => {
      const subscription = this.dataService.getQuestions().subscribe(
      (questions: IQuestion[]) => {
        subscription.unsubscribe()
        if(!tags){
          resolve(questions)
        }
        resolve(questions.filter(
          (question: IQuestion) => question.tags.some(
            (questionTag: ITag) => tags.some(
              (argumentTag: ITag) => questionTag.id == argumentTag.id
              )
            )
          )
        )
      })
    });
    
  }

  public static getSingletonInstance(): QuestionService {
    if(!this.singletonInstance){
      const dataService: DataService = DataService.getSingletonInstance()
      this.singletonInstance = new QuestionService(dataService)
    }
    return this.singletonInstance
  }

  
  add(question: IQuestion){
    console.log('this.dataService :', this.dataService);
    console.log('add question :', question)
    this.dataService.add(question, 'Questions')

  }

  update(question: IQuestion){
    console.log('update question :', question);

  }

  delete(question: IQuestion){
    console.log('delete question :', question);

  }
  
}