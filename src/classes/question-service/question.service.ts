import DataService from "../data-service/data.service";
import IQuestion from "../../interfaces/question.interface";
import { ITag } from "../../interfaces/tag.interface";

export class QuestionService{

  constructor(private dataService: DataService){}


  getQuestionsByTag(tags?: ITag[]): IQuestion[]{
    const questions: IQuestion[] = this.dataService.getQuestions()
    if(!tags){
      return questions
    }
    return questions.filter(
      (question: IQuestion) => question.tags.some(
        (questionTag: ITag) => tags.some(
          (argumentTag: ITag) => questionTag.id == argumentTag.id
          )
        )
      )
  }
}