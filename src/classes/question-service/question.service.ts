
import IQuestion from "../../global/interfaces/question.interface";
import ITag from "../../global/interfaces/tag.interface";
import { CorrectnessRatings } from "../../global/types/correctness-rating";
import { DataService } from '../data-service/data.service';

export class QuestionService {
  private dataService: DataService

  constructor(dataService: DataService) {
    this.dataService = dataService
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

