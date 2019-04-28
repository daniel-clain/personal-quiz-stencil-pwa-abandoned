import DataService from "../data-service/data.service";
import IQuestion from "../../interfaces/question.interface";
import ITag from "../../interfaces/tag.interface";
import { CorrectnessRatings } from "../../types/correctness-rating";

export class QuestionService{

  private static singletonInstance: QuestionService
  questions: IQuestion[]

  constructor(private dataService: DataService){
    QuestionService.singletonInstance = this
  }
  


  getQuestionsByTag(tags?: ITag[]): Promise<IQuestion[]>{
    return new Promise((resolve) => {
      this.dataService.getQuestions().then(
      (questions: IQuestion[]) => {
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
      new QuestionService(dataService)
    }
    return this.singletonInstance
  }

  
  getQuestions(): Promise<IQuestion[]>{
    return this.dataService.getQuestions()
  }


  
  add(question: IQuestion){
    console.log('this.dataService :', this.dataService);
    console.log('add question :', question)
    this.dataService.add(question, 'Questions')

  }

  update(question: IQuestion){
    this.dataService.update(question, 'Questions')

  }

  delete(question: IQuestion){
    this.dataService.delete(question, 'Questions')

  }

  updateCorrectnessRating(question: IQuestion, correctnessRating: CorrectnessRatings){
    let qcr = question.correctnessRating
    switch(correctnessRating){
      case 'Correct' : {
        qcr >=9 ? qcr = 10 : qcr ++
      }; break
      case 'Close' : {
        qcr >=9.5 ? qcr = 10 : qcr += 0.5
      }; break
      case 'Kinda' : {
        qcr <=0.5 ? qcr = 0 : qcr -= 0.5
      }; break
      case 'Incorrect' : {
        qcr <=1 ? qcr = 0 : qcr --
      }; break
    }
    this.update(question)
  }
  
}