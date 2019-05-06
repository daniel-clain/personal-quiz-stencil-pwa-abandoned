import DataService from "../data-service/data.service";
import IQuestion from "../../interfaces/question.interface";
import ITag from "../../interfaces/tag.interface";
import { CorrectnessRatings } from "../../types/correctness-rating";
import { Observable } from "rxjs";

export class QuestionService {
  private static singletonInstance: QuestionService;
  questions$: Observable<IQuestion[]>;

  constructor(private dataService: DataService) {
    QuestionService.singletonInstance = this
  }


  getQuestionsByTag(tags?: ITag[]): Promise<IQuestion[]> {
    return new Promise(resolve => {
      const questions: IQuestion[] = this.dataService.inMemory['Questions']
      if (!tags) {
        resolve(questions)
      }
      resolve(questions.filter((question: IQuestion) => question.tags.some((questionTag: ITag) => tags.some((argumentTag: ITag) => questionTag.id == argumentTag.id))))
    })
  }


  public static getSingletonInstance(): QuestionService {
    if (!this.singletonInstance) {
      const dataService: DataService = DataService.getSingletonInstance();
      new QuestionService(dataService);
    }
    return this.singletonInstance;
  }

  updateCorrectnessRating(question: IQuestion, correctnessRating: CorrectnessRatings) {
    let qcr = question.correctnessRating || 2;

    switch (correctnessRating) {
      case 'Correct':
        {
          qcr >= 9 ? qcr = 10 : qcr++;
        }
        ;
        break;
      case 'Almost':
        {
          qcr >= 9.5 ? qcr = 10 : qcr += 0.5;
        }
        ;
        break;
      case 'Kinda':
        {
          qcr <= 0.5 ? qcr = 0 : qcr -= 0.5;
        }
        ;
        break;
      case 'Incorrect':
        {
          qcr <= 1 ? qcr = 0 : qcr--;
        }
        ;
        break;
    }

    question.correctnessRating = qcr
    question.dateLastAsked = new Date()
    this.dataService.update(question, 'Questions');
  }
}

